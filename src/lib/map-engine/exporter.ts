import confetti from 'canvas-confetti';

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  resolution: 'standard' | 'hd' | 'ultra_hd';
  showWatermark?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  showCompass?: boolean;
  showLegend?: boolean;
}

export async function exportMapPNG(
  svgElement: SVGSVGElement,
  mapName: string,
  resolution: 'standard' | 'hd' | 'ultra_hd' = 'hd',
  showWatermark = false
): Promise<void> {
  try {
    // Clone SVG element to prevent mutating live DOM
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Ensure root SVG attributes are clean for export
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Remove any editor selection outlines or handles if present
    const selectionOutlines = clonedSvg.querySelectorAll('[stroke-dasharray="3,3"]');
    selectionOutlines.forEach((el) => {
      if (el.tagName.toLowerCase() === 'circle' || el.tagName.toLowerCase() === 'rect') {
        el.remove();
      }
    });

    const viewBoxAttr = clonedSvg.getAttribute('viewBox') || '0 0 1200 800';
    const viewBoxParts = viewBoxAttr.split(' ').map(Number);
    const nativeWidth = viewBoxParts[2] || 1200;
    const nativeHeight = viewBoxParts[3] || 800;

    clonedSvg.setAttribute('width', nativeWidth.toString());
    clonedSvg.setAttribute('height', nativeHeight.toString());

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let multiplier = 2; // HD default
    if (resolution === 'standard') multiplier = 1;
    if (resolution === 'ultra_hd') multiplier = 4;

    const width = Math.round(nativeWidth * multiplier);
    const height = Math.round(nativeHeight * multiplier);

    canvas.width = width;
    canvas.height = height;

    // PREVENT LEFT-EDGE / BORDER BLACK ARTIFACT: Fill canvas background explicitly first
    ctx.fillStyle = '#b0c4de'; // Default parchment cartography water tone fallback
    ctx.fillRect(0, 0, width, height);

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Draw SVG image seamlessly across full canvas bounds without margins
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        // Render subtle watermark if enabled
        if (showWatermark) {
          ctx.font = `bold ${Math.max(14, 16 * multiplier)}px Cinzel, serif`;
          ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
          ctx.textAlign = 'right';
          ctx.fillText('Created with CreateFantasyMap.com', width - 20 * multiplier, height - 20 * multiplier);
        }

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${mapName.toLowerCase().replace(/\s+/g, '_')}_${resolution}_map.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Confetti celebration burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        resolve();
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  } catch (err) {
    console.error('Export PNG failed:', err);
  }
}

export function exportMapToSVG(svgElement: SVGSVGElement, mapName: string): void {
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${mapName.toLowerCase().replace(/\s+/g, '_')}_vector.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.6 }
  });
}

export async function exportMapToPDF(svgElement: SVGSVGElement, mapName: string): Promise<void> {
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${mapName} — CreateFantasyMap PDF Export</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { margin: 0; background: #b0c4de; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
          svg { width: 100vw; height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        ${svgData}
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 1000);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();

  confetti({
    particleCount: 100,
    spread: 90,
    origin: { y: 0.6 }
  });
}

// Backward-compatible fallback export function
export async function exportMapToPNG(
  svgElement: SVGSVGElement,
  mapName: string,
  resolutionMultiplier: number = 2
): Promise<void> {
  const resMode = resolutionMultiplier >= 4 ? 'ultra_hd' : resolutionMultiplier <= 1 ? 'standard' : 'hd';
  return exportMapPNG(svgElement, mapName, resMode);
}
