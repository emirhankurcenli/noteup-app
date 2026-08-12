import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';


export const shareNoteImage = async (note, setToast) => {
  if (!note) return;

  setToast?.({ title: "🎨 Görseller Hazırlanıyor...", msg: "Not sayfaları oluşturuluyor." });

  const scale = 3;
  const pageW = 600;
  const pageH = 800;
  const paddingX = 45;
  const maxWidth = pageW - (paddingX * 2);

  const pages = [];

  const createNewPage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pageW * scale;
    canvas.height = pageH * scale;
    const ctx = canvas.getContext('2d');

    ctx.scale(scale, scale);

    // Page Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageW, pageH);

    // Subtle header divider
    ctx.fillStyle = '#64748B';
    ctx.font = "bold 14px 'Segoe UI', -apple-system, sans-serif";
    ctx.fillText("NoteUp", paddingX, 36);

    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX, 48);
    ctx.lineTo(pageW - paddingX, 48);
    ctx.stroke();

    const pageNum = pages.length + 1;

    // Muted footer
    ctx.font = "12px 'Segoe UI', -apple-system, sans-serif";
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Sayfa ${pageNum}`, pageW - paddingX - 45, pageH - 25);

    const newPageObj = { canvas, ctx, currentY: 80 };
    pages.push(newPageObj);
    return newPageObj;
  };

  let currentPage = createNewPage();

  // Draw Title & Date (First Page Only)
  currentPage.ctx.fillStyle = '#0F172A';
  currentPage.ctx.font = "bold 28px 'Segoe UI', -apple-system, sans-serif";

  // Wrap title
  const titleWords = (note.title || 'Yeni Not').split(' ');
  let titleLine = '';
  let titleY = 90;
  for (let n = 0; n < titleWords.length; n++) {
    let testLine = titleLine + titleWords[n] + ' ';
    let metrics = currentPage.ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      currentPage.ctx.fillText(titleLine, paddingX, titleY);
      titleLine = titleWords[n] + ' ';
      titleY += 34;
    } else {
      titleLine = testLine;
    }
  }
  currentPage.ctx.fillText(titleLine, paddingX, titleY);

  currentPage.ctx.fillStyle = '#64748B';
  currentPage.ctx.font = "12px 'Segoe UI', -apple-system, sans-serif";
  const dateStr = new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString();
  currentPage.ctx.fillText(dateStr, paddingX, titleY + 22);

  currentPage.ctx.strokeStyle = '#E2E8F0';
  currentPage.ctx.beginPath();
  currentPage.ctx.moveTo(paddingX, titleY + 35);
  currentPage.ctx.lineTo(pageW - paddingX, titleY + 35);
  currentPage.ctx.stroke();

  currentPage.currentY = titleY + 65;

  const ensureSpace = (neededHeight) => {
    if (currentPage.currentY + neededHeight > pageH - 60) {
      currentPage = createNewPage();
    }
  };

  const wrapTextOnPage = (text, fontSize, color, isBold = false) => {
    currentPage.ctx.fillStyle = color;
    currentPage.ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px 'Segoe UI', -apple-system, sans-serif`;

    const words = text.split(' ');
    let line = '';
    const lineHeight = fontSize + 8;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = currentPage.ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ensureSpace(lineHeight);
        currentPage.ctx.fillText(line, paddingX, currentPage.currentY);
        line = words[n] + ' ';
        currentPage.currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ensureSpace(lineHeight);
    currentPage.ctx.fillText(line, paddingX, currentPage.currentY);
    currentPage.currentY += lineHeight + 10;
  };

  const stripHtmlToLines = (htmlStr) => {
    if (!htmlStr) return [];
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr.replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/p>/gi, '\n');
    const clean = temp.innerText || temp.textContent || '';
    return clean.split('\n');
  };

  const blocks = note.blocks || [];
  blocks.forEach(block => {
    if (block.type === 'text') {
      const paragraphs = stripHtmlToLines(block.content || '');
      paragraphs.forEach(p => {
        if (p.trim() === '') {
          currentPage.currentY += 12;
        } else {
          wrapTextOnPage(p, 18, '#334155');
        }
      });
    } else if (block.type === 'todo') {
      ensureSpace(28);
      const ctx = currentPage.ctx;
      ctx.strokeStyle = block.completed ? '#10B981' : '#64748B';
      ctx.fillStyle = block.completed ? '#10B981' : 'transparent';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(paddingX, currentPage.currentY - 15, 18, 18, 4);
      ctx.stroke();
      if (block.completed) {
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(paddingX + 4, currentPage.currentY - 6);
        ctx.lineTo(paddingX + 8, currentPage.currentY - 2);
        ctx.lineTo(paddingX + 14, currentPage.currentY - 10);
        ctx.stroke();
      }

      ctx.fillStyle = block.completed ? '#94A3B8' : '#1E293B';
      ctx.font = "16px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText(block.text || 'Görev', paddingX + 28, currentPage.currentY - 1);
      currentPage.currentY += 28;
    } else if (block.type === 'debt') {
      ensureSpace(40);
      const ctx = currentPage.ctx;
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(paddingX, currentPage.currentY - 16, maxWidth, 32, 6);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      ctx.fillStyle = '#E8501A';
      ctx.font = "bold 15px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText("Borç / Alacak Takibi", paddingX + 12, currentPage.currentY + 5);
      currentPage.currentY += 32;

      (block.items || []).forEach(item => {
        ensureSpace(28);
        ctx.fillStyle = '#334155';
        ctx.font = "15px 'Segoe UI', -apple-system, sans-serif";
        ctx.fillText(item.name || 'Borç/Alacak', paddingX + 12, currentPage.currentY);

        const isNegative = item.amount < 0;
        ctx.fillStyle = isNegative ? '#EF4444' : '#10B981';
        ctx.font = "bold 15px 'Segoe UI', -apple-system, sans-serif";
        const amountText = `${isNegative ? '' : '+'}${item.amount}`;
        ctx.fillText(amountText, pageW - paddingX - 90, currentPage.currentY);
        currentPage.currentY += 26;
      });
      currentPage.currentY += 10;
    } else if (block.type === 'split') {
      ensureSpace(40);
      const ctx = currentPage.ctx;
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(paddingX, currentPage.currentY - 16, maxWidth, 32, 6);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      ctx.fillStyle = '#6366F1';
      ctx.font = "bold 15px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText("Hesap Bölüştürme", paddingX + 12, currentPage.currentY + 5);
      currentPage.currentY += 32;

      (block.expenses || []).forEach(exp => {
        ensureSpace(28);
        ctx.fillStyle = '#334155';
        ctx.font = "15px 'Segoe UI', -apple-system, sans-serif";
        ctx.fillText(exp.description || 'Gider', paddingX + 12, currentPage.currentY);
        ctx.fillStyle = '#0F172A';
        ctx.font = "bold 14px 'Segoe UI', -apple-system, sans-serif";
        ctx.fillText(`${exp.amount} (${exp.paidBy})`, pageW - paddingX - 180, currentPage.currentY);
        currentPage.currentY += 26;
      });
      currentPage.currentY += 10;
    } else if (block.type === 'password') {
      ensureSpace(70);
      const ctx = currentPage.ctx;
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(paddingX, currentPage.currentY - 16, maxWidth, 56, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = "bold 15px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText(`Şifrelerim: ${block.title || 'Hesap'}`, paddingX + 12, currentPage.currentY + 8);
      ctx.fillStyle = '#64748B';
      ctx.font = "13px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText(`Kullanıcı: ${block.username || '-'}`, paddingX + 12, currentPage.currentY + 28);
      currentPage.currentY += 65;
    } else if (block.type === 'parking') {
      ensureSpace(70);
      const ctx = currentPage.ctx;
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(paddingX, currentPage.currentY - 16, maxWidth, 56, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = "bold 15px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText("Arabam Nerede", paddingX + 12, currentPage.currentY + 8);
      ctx.fillStyle = '#64748B';
      ctx.font = "13px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText(`Kat: ${block.floor || '-'} / Konum: ${block.slot || '-'}`, paddingX + 12, currentPage.currentY + 28);
      currentPage.currentY += 65;
    } else if (block.type === 'bill') {
      ensureSpace(75);
      const ctx = currentPage.ctx;
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(paddingX, currentPage.currentY - 16, maxWidth, 62, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = "bold 15px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText(`Fatura: ${block.name || 'Fatura'}`, paddingX + 12, currentPage.currentY + 8);
      ctx.fillStyle = '#64748B';
      ctx.font = "13px 'Segoe UI', -apple-system, sans-serif";
      ctx.fillText(`Her ayın ${block.day}. günü saat ${block.time}'da - ${block.mode === 'alarm' ? 'Alarm' : 'Bildirim'}`, paddingX + 12, currentPage.currentY + 26);
      if (block.nextPaymentTime) {
        ctx.fillStyle = '#6366F1';
        ctx.font = "bold 11px 'Segoe UI', -apple-system, sans-serif";
        ctx.fillText(`Sonraki Ödeme: ${new Date(block.nextPaymentTime).toLocaleDateString()}`, paddingX + 12, currentPage.currentY + 41);
      }
      currentPage.currentY += 72;
    } else if (block.type === 'image') {
      ensureSpace(45);
      wrapTextOnPage(`[Görsel Ek: ${block.name || 'Görsel'}]`, 14, '#94A3B8');
    } else if (block.type === 'audio') {
      ensureSpace(45);
      wrapTextOnPage(`[Ses Kaydı: ${block.name || 'Ses'}]`, 14, '#94A3B8');
    }
  });

  const base64Files = [];
  const filesToShare = [];
  const nativeFileUris = [];

  for (let i = 0; i < pages.length; i++) {
    const dataUrl = pages[i].canvas.toDataURL('image/jpeg', 0.98);
    base64Files.push(dataUrl);

    const blob = await new Promise(resolve => pages[i].canvas.toBlob(resolve, 'image/jpeg', 0.98));
    const file = new File([blob], `${note.title || 'not'}_sayfa_${i+1}.jpg`, { type: 'image/jpeg' });
    filesToShare.push(file);

    if (Capacitor.isNativePlatform()) {
      try {
        const rawBase64 = dataUrl.split(',')[1];
        const tempFilename = `NoteUp_${note.id || 'temp'}_page_${i + 1}.jpg`;

        const writeResult = await Filesystem.writeFile({
          path: tempFilename,
          data: rawBase64,
          directory: Directory.Cache
        });

        nativeFileUris.push(writeResult.uri);
      } catch (fsErr) {
        console.error("Temp file write error:", fsErr);
      }
    }
  }

  try {
    if (Capacitor.isNativePlatform()) {
      if (nativeFileUris.length > 0) {
        await Share.share({
          title: note.title || 'NoteUp Notu',
          files: nativeFileUris
        });
      }
    } else {
      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          files: filesToShare,
          title: note.title || 'NoteUp Notu'
        });
      } else {
        for (let i = 0; i < pages.length; i++) {
          const link = document.createElement('a');
          link.download = `${note.title || 'not'}_sayfa_${i+1}.jpg`;
          link.href = base64Files[i];
          link.click();
        }
        setToast?.({ title: "📥 İndirildi", msg: "Not sayfaları cihaza indirildi." });
      }
    }
  } catch (err) {
    console.log("Sharing cancelled or failed:", err);
  } finally {
    if (Capacitor.isNativePlatform() && nativeFileUris.length > 0) {
      // 10 saniye bekleyip sil (hedef uygulama WhatsApp/Mail'in dosyayı okuyabilmesi için)
      setTimeout(async () => {
        for (let i = 0; i < pages.length; i++) {
          try {
            const tempFilename = `NoteUp_${note.id || 'temp'}_page_${i + 1}.jpg`;
            await Filesystem.deleteFile({
              path: tempFilename,
              directory: Directory.Cache
            });
          } catch (delErr) {
            console.log("Temp file cleanup ignored:", delErr);
          }
        }
      }, 10000);
    }
  }
};
