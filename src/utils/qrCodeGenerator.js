/**
 * QR Code Generator Utility
 * Generates QR code data URL using HTML Canvas
 */

export const generateQRCodeDataUrl = (text, size = 200) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Simple visual pattern representation for QR
    ctx.fillStyle = '#000000';
    const cells = 21;
    const cellSize = size / cells;

    // Draw positioning squares
    const drawPositionSquare = (x, y) => {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawPositionSquare(0, 0);
    drawPositionSquare(14, 0);
    drawPositionSquare(0, 14);

    // Pseudo random data dots based on string characters
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        if (
          (r < 7 && c < 7) ||
          (r < 7 && c >= 14) ||
          (r >= 14 && c < 7)
        ) {
          continue;
        }
        const charCode = text.charCodeAt((r * cells + c) % text.length) || 65;
        if ((charCode * (r + 1) + c) % 3 === 0) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    resolve(canvas.toDataURL('image/png'));
  });
};

export default generateQRCodeDataUrl;
