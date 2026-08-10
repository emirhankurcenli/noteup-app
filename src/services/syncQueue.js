import { supabase } from "../supabaseClient";
import { STORAGE_KEYS } from "../constants/storageKeys";

/**
 * Offline Sync Queue & Conflict Resolution Manager
 *
 * Veri Senkronizasyonu ve Resilience katmanı:
 * 1. İnternet yoksa yapılan Supabase işlemlerini kuyruğa alır (Sync Queue).
 * 2. Cihaz tekrar online olduğunda kuyruktaki mutasyonları sırayla sunucuya iletir.
 * 3. Sunucu ve istemci arasındaki zaman damgalarını (updated_at) karşılaştırarak
 *    çakışmaları (Conflict Resolution) yönetir.
 */

class SyncQueueManager {
  constructor() {
    this.isFlushing = false;
    this.listeners = new Set();

    // Auto-listen to network state changes in browser/Webview
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 Network online detected. Processing sync queue...");
        this.flushQueue();
      });
    }
  }

  // --- QUEUE PERSISTENCE ---

  getQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error reading sync queue from localStorage:", e);
      return [];
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      this.notifyListeners(queue.length);
    } catch (e) {
      console.error("Error saving sync queue to localStorage:", e);
    }
  }

  /**
   * Kuyruğa yeni bir senkronizasyon görevi ekler
   * @param {Object} item - { table: 'notes'|'folders'|'reminders', action: 'upsert'|'delete', payload: Object|Array, timestamp: number }
   */
  enqueue(table, action, payload) {
    const queue = this.getQueue();

    // Eğer aynı nesne (id) için bekleyen bir işlem varsa güncelle/birleştir
    const id = payload.id;
    if (id) {
      const existingIdx = queue.findIndex(
        (q) => q.table === table && q.payload?.id === id,
      );
      if (existingIdx !== -1) {
        queue[existingIdx] = {
          table,
          action,
          payload,
          timestamp: Date.now(),
          retries: 0,
        };
        this.saveQueue(queue);
        this.flushQueue();
        return;
      }
    }

    queue.push({
      id:
        "sync-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      table,
      action,
      payload,
      timestamp: Date.now(),
      retries: 0,
    });

    this.saveQueue(queue);

    // Eğer internet varsa hemen denemeyi başlat
    if (navigator.onLine) {
      this.flushQueue();
    }
  }

  // --- CONFLICT RESOLUTION ---

  /**
   * Notlar veya diğer tablolar için zaman damgası çakışma kontrolü (Last-Write-Wins / Conflict Check)
   */
  async resolveConflictAndUpsert(table, payload) {
    const items = Array.isArray(payload) ? payload : [payload];
    const resolvedItems = [];

    for (const item of items) {
      if (!item.id || !item.user_id) {
        resolvedItems.push(item);
        continue;
      }

      try {
        // Sunucudaki mevcut kaydın son güncellenme tarihini al
        const { data: serverRecord, error } = await supabase
          .from(table)
          .select("updated_at")
          .eq("id", item.id)
          .maybeSingle();

        if (!error && serverRecord && serverRecord.updated_at) {
          const serverTime = new Date(serverRecord.updated_at).getTime();
          const clientTime = new Date(item.updated_at || Date.now()).getTime();

          // Eğer sunucudaki kayıt istemcidekinden yeniyse (örneğin başka cihazdan güncellendiyse),
          // Sunucudakini korumak için istemci yazmasını atla.
          if (serverTime > clientTime + 1000) {
            console.warn(
              `[Sync Conflict] Server record for ${table}/${item.id} is newer than client record. Skipping overwrite.`,
            );
            continue;
          }
        }
      } catch (err) {
        console.warn(
          `[Sync Conflict Check Warning] Couldn't fetch remote record for ${item.id}, proceeding with local write:`,
          err,
        );
      }

      resolvedItems.push(item);
    }

    if (resolvedItems.length === 0) return { success: true, skipped: true };

    const { error } = await supabase.from(table).upsert(resolvedItems);

    if (error) throw error;
    return { success: true };
  }

  // --- FLUSH / PROCESS QUEUE ---

  async flushQueue() {
    if (this.isFlushing || !navigator.onLine) return;

    let queue = this.getQueue();
    if (queue.length === 0) return;

    this.isFlushing = true;
    console.log(`🔄 Flushing ${queue.length} pending sync items...`);

    const remainingQueue = [];

    for (const task of queue) {
      try {
        if (task.action === "upsert") {
          await this.resolveConflictAndUpsert(task.table, task.payload);
        } else if (task.action === "delete") {
          const id = task.payload?.id || task.payload;
          const { error } = await supabase
            .from(task.table)
            .delete()
            .eq("id", id);

          if (error) throw error;
        }
      } catch (err) {
        console.error(
          `❌ Failed to sync task ${task.id} (${task.table}/${task.action}):`,
          err,
        );
        task.retries = (task.retries || 0) + 1;

        // 5 kereden fazla hata alan görevleri kuyruktan çıkar (koruma)
        if (task.retries < 5) {
          remainingQueue.push(task);
        } else {
          console.error(
            `💥 Abandoning task ${task.id} after 5 failed retries.`,
          );
        }
      }
    }

    this.saveQueue(remainingQueue);
    this.isFlushing = false;

    // İşlenmeyen görev varsa ve internet devam ediyorsa kısa süre sonra tekrar dene
    if (remainingQueue.length > 0 && navigator.onLine) {
      setTimeout(() => this.flushQueue(), 5000);
    }
  }

  // --- LISTENERS ---
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(count) {
    this.listeners.forEach((cb) => cb(count));
  }
}

export const syncQueue = new SyncQueueManager();
export default syncQueue;
