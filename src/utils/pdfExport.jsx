import React from 'react';
import { jsPDF } from "jspdf";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export const exportNoteAsPDF = async (note, userPlan, setToast, setShowPaywall, lang = "tr", setConfirmDialog) => {
  // 1. Ultra Plan Validation
  if (userPlan !== 'ultra' && userPlan !== 'vip') {
    setToast({
      title: lang === 'tr' ? "👑 NoteUp Ultra Özelliği" : "👑 NoteUp Ultra Feature",
      msg: lang === 'tr' 
        ? "Notlarınızı PDF olarak indirmek veya paylaşmak için Ultra plana geçiş yapın!" 
        : "Upgrade to Ultra plan to export or share your notes as PDF!"
    });
    if (typeof setShowPaywall === 'function') setShowPaywall(true);
    return;
  }

  const generatePDFDoc = () => {
    const doc = new jsPDF();
    
    // Add premium header / brand styling
    doc.setFillColor(79, 70, 229); // Premium Indigo brand color
    doc.rect(0, 0, 210, 15, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("NOTEUP - PREMIUM NOTE EXPORT", 15, 10);
    
    // Title
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    const titleText = note.title || (lang === 'tr' ? 'Başlıksız Not' : 'Untitled Note');
    doc.text(titleText, 15, 30);
    
    // Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);
    
    // Content Layout
    let y = 45;
    doc.setFont("Helvetica", "normal");
    
    const blocks = note.blocks || [];
    blocks.forEach((block) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const type = block.type || 'text';
      
      if (type === 'text') {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(51, 65, 85); // slate-700
        const contentText = block.content || '';
        const splitText = doc.splitTextToSize(contentText, 180);
        
        splitText.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 15, y);
          y += 7;
        });
        y += 4;
      } 
      else if (type === 'todo') {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(16, 185, 129); // green-500
        doc.text(" YAPILACAKLAR LISTESI", 15, y);
        y += 8;
        
        const items = block.items || [];
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        
        items.forEach(item => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const checkSymbol = item.completed ? "[X]  " : "[ ]  ";
          const itemText = checkSymbol + (item.title || '');
          const splitItemText = doc.splitTextToSize(itemText, 180);
          
          splitItemText.forEach(line => {
            doc.text(line, 15, y);
            y += 6;
          });
        });
        y += 6;
      }
      else if (type === 'debt') {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(245, 158, 11); // amber-500
        doc.text(" ALACAK & VERECEK HESABI", 15, y);
        y += 8;
        
        const items = block.items || [];
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        
        items.forEach(item => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const debtType = item.type === 'give' ? (lang === 'tr' ? 'Verilecek: ' : 'To Give: ') : (lang === 'tr' ? 'Alinacak: ' : 'To Receive: ');
          const debtText = `* ${item.name || ''} - ${debtType}${item.amount || '0'} TL`;
          doc.text(debtText, 15, y);
          y += 6;
        });
        y += 6;
      }
      else if (type === 'expense') {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(244, 63, 94); // rose-500
        doc.text(" GELIR/GIDER LISTESI", 15, y);
        y += 8;
        
        const items = block.items || [];
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        
        items.forEach(item => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const typeLabel = item.type === 'income' ? (lang === 'tr' ? 'Gelir: +' : 'Income: +') : (lang === 'tr' ? 'Gider: -' : 'Expense: -');
          const expText = `* ${item.title || ''} - ${typeLabel}${item.amount || '0'} TL`;
          doc.text(expText, 15, y);
          y += 6;
        });
        y += 6;
      }
      else if (type === 'split') {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(249, 115, 22); // orange-500
        doc.text(" HESAP BOLUSTURME", 15, y);
        y += 8;
        
        const expenses = block.expenses || [];
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        
        expenses.forEach(exp => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const expText = `* ${exp.description || ''} - Paid by ${exp.paidBy || ''}: ${exp.amount || '0'} TL`;
          doc.text(expText, 15, y);
          y += 6;
        });
        y += 6;
      }
      else if (type === 'parking') {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(239, 68, 68);
        doc.text(" OTOPARK / ARACIM NEREDE", 15, y);
        y += 6;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.text(`* Kat/Alan: ${block.floor || '-'} | Peron/Sira: ${block.slot || '-'}`, 15, y);
        y += 6;
        if (block.note) {
          doc.text(`* Not: ${block.note}`, 15, y);
          y += 6;
        }
        y += 4;
      }
      else if (type === 'bill') {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(139, 92, 246);
        doc.text(` FATURA: ${block.name || ''}`, 15, y);
        y += 6;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        const status = block.paid ? (lang === 'tr' ? 'Odendi' : 'Paid') : (lang === 'tr' ? 'Odenmedi' : 'Unpaid');
        doc.text(`* Durum: ${status} | Her ayin ${block.day || '1'}. gunu saat ${block.time || '12:00'}`, 15, y);
        y += 8;
      }
    });
    return doc;
  };

  const safeTitle = (note.title || 'NoteUp_Not').replace(/[^a-zA-Z0-9]/g, '_');
  const pdfFileName = `${safeTitle}.pdf`;

  const doSaveToDevice = async () => {
    try {
      setToast({
        title: lang === 'tr' ? "🔄 PDF Kaydediliyor..." : "🔄 Saving PDF...",
        msg: lang === 'tr' ? "Lütfen bekleyin." : "Please wait."
      });
      
      const doc = generatePDFDoc();
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      await Filesystem.writeFile({
        path: pdfFileName,
        data: pdfBase64,
        directory: Directory.Documents
      });

      setToast({
        title: lang === 'tr' ? "✅ Cihaza Kaydedildi" : "✅ Saved to Device",
        msg: lang === 'tr' 
          ? `PDF başarıyla 'Belgeler' (Documents) klasörüne kaydedildi.` 
          : `PDF successfully saved to 'Documents' folder.`
      });
    } catch (err) {
      console.error("PDF save failed:", err);
      setToast({
        title: lang === 'tr' ? "❌ Hata" : "❌ Error",
        msg: lang === 'tr' ? "PDF cihaza kaydedilirken hata oluştu." : "Error saving PDF to device."
      });
    }
  };

  const doSharePDF = async () => {
    try {
      setToast({
        title: lang === 'tr' ? "🔄 PDF Hazırlanıyor..." : "🔄 Preparing PDF...",
        msg: lang === 'tr' ? "Lütfen bekleyin." : "Please wait."
      });

      const doc = generatePDFDoc();
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const fileResult = await Filesystem.writeFile({
        path: pdfFileName,
        data: pdfBase64,
        directory: Directory.Cache
      });

      await Share.share({
        title: pdfFileName,
        text: lang === 'tr' ? 'NoteUp PDF Not Paylaşımı' : 'NoteUp PDF Note Share',
        url: fileResult.uri,
        dialogTitle: lang === 'tr' ? 'Notu PDF Olarak Paylaş' : 'Share Note as PDF'
      });

      setToast({
        title: lang === 'tr' ? "✅ PDF Paylaşıldı" : "✅ PDF Shared",
        msg: lang === 'tr' ? "PDF başarıyla oluşturuldu ve paylaşıldı." : "PDF successfully generated and shared."
      });
    } catch (err) {
      console.error("PDF share failed:", err);
      setToast({
        title: lang === 'tr' ? "❌ Hata" : "❌ Error",
        msg: lang === 'tr' ? "PDF paylaşılırken hata oluştu." : "Error sharing PDF."
      });
    }
  };

  // 2. Platform Action selection
  if (Capacitor.isNativePlatform() && typeof setConfirmDialog === 'function') {
    // Show Action Choice Dialog
    setConfirmDialog({
      title: lang === 'tr' ? "📄 PDF Seçenekleri" : "📄 PDF Options",
      message: lang === 'tr' 
        ? "Notunuzu PDF olarak cihazınıza kaydetmek mi yoksa paylaşmak mı istersiniz?" 
        : "Would you like to save the PDF to your device or share it?",
      cancelText: lang === 'tr' ? "📥 Cihaza İndir (Kaydet)" : "📥 Save to Device",
      confirmText: lang === 'tr' ? "🌐 PDF'i Paylaş" : "🌐 Share PDF",
      confirmBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      confirmHoverBg: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
      confirmShadow: '0 4px 16px rgba(59,130,246,0.30)',
      iconBg: 'radial-gradient(circle at 30% 30%, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.06) 100%)',
      iconBorder: '1.5px solid rgba(239,68,68,0.35)',
      iconShadow: '0 0 24px rgba(239,68,68,0.18)',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      onCancel: () => {
        doSaveToDevice();
      },
      onConfirm: () => {
        doSharePDF();
      }
    });
  } else {
    // Web Browser fallback
    const doc = generatePDFDoc();
    doc.save(pdfFileName);
    setToast({
      title: lang === 'tr' ? "✅ PDF İndirildi" : "✅ PDF Downloaded",
      msg: lang === 'tr' ? "PDF bilgisayarınıza başarıyla indirildi." : "PDF successfully downloaded."
    });
  }
};
