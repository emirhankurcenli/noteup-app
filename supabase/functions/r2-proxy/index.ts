// supabase/functions/r2-proxy/index.ts
// Cloudflare R2 dosya upload/delete proxy'si.
// R2 Bearer token asla client'a gitmez — Supabase Secret olarak saklanır.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Kullanıcı JWT doğrulama ──────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Yetkisiz erişim: Authorization header gerekli.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // JWT'yi doğrula ve kullanıcıyı al
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz oturum. Lütfen tekrar giriş yapın.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 2. R2 Gizli Anahtarlarını Supabase Secret'tan al ────────────────────
    const r2WorkerUrl = Deno.env.get('R2_WORKER_URL');
    const r2BearerToken = Deno.env.get('R2_BEARER_TOKEN');

    if (!r2WorkerUrl || !r2BearerToken) {
      console.error('[r2-proxy] R2_WORKER_URL veya R2_BEARER_TOKEN secret eksik!');
      return new Response(
        JSON.stringify({ error: 'Sunucu yapılandırma hatası.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authTokenHeader = r2BearerToken.startsWith('Bearer ')
      ? r2BearerToken
      : `Bearer ${r2BearerToken}`;

    const userId = user.id.replace(/-/g, '_');

    // ── 3. UPLOAD (POST) ─────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const url = new URL(req.url);
      const rawFilename = url.searchParams.get('filename') || '';

      // GÜVENLİK: Kullanıcı sadece kendi klasörüne yükleyebilir
      const allowedPrefix = `users/${userId}/`;
      const safeFilename = rawFilename.startsWith(allowedPrefix)
        ? rawFilename
        : `${allowedPrefix}${rawFilename.replace(/^.*users\/[^/]+\//, '')}`;

      // Path traversal koruması
      if (safeFilename.includes('..') || safeFilename.includes('//')) {
        return new Response(
          JSON.stringify({ error: 'Geçersiz dosya yolu.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const uploadUrl = `${r2WorkerUrl}?filename=${encodeURIComponent(safeFilename)}`;
      const fileBlob = await req.blob();

      const r2Response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Authorization': authTokenHeader },
        body: fileBlob,
      });

      if (!r2Response.ok) {
        const errText = await r2Response.text();
        console.error('[r2-proxy] Upload hatası:', r2Response.status, errText);
        return new Response(
          JSON.stringify({ error: 'Dosya yükleme başarısız.' }),
          { status: r2Response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await r2Response.json();
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 4. DELETE ────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const rawFilename = url.searchParams.get('filename') || '';

      if (!rawFilename) {
        return new Response(
          JSON.stringify({ error: 'filename parametresi gerekli.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // GÜVENLİK: Kullanıcı yalnızca kendi klasöründeki dosyaları silebilir
      const allowedPrefix = `users/${userId}/`;
      if (!rawFilename.startsWith(allowedPrefix)) {
        console.warn(`[r2-proxy] Yetkisiz silme girişimi: user=${user.id}, file=${rawFilename}`);
        return new Response(
          JSON.stringify({ error: 'Bu dosyayı silme yetkiniz yok.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Path traversal koruması
      if (rawFilename.includes('..') || rawFilename.includes('//')) {
        return new Response(
          JSON.stringify({ error: 'Geçersiz dosya yolu.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const deleteUrl = `${r2WorkerUrl}?filename=${encodeURIComponent(rawFilename)}`;

      const r2Response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Authorization': authTokenHeader },
      });

      if (!r2Response.ok) {
        console.error(`[r2-proxy] Silme hatası: ${rawFilename}, status: ${r2Response.status}`);
        return new Response(
          JSON.stringify({ error: 'Dosya silinemedi.' }),
          { status: r2Response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Desteklenmeyen metod.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[r2-proxy] Beklenmeyen hata:', err);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
