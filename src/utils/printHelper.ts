/**
 * GCap Enterprise Print & Document Export Helper
 * Provides bulletproof printing inside iframes, desktop browsers, mobile devices, and PDF export.
 */

export function printDocument(elementId: string, documentTitle: string = 'GCap Official Document'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Print target #${elementId} not found, falling back to window.print()`);
    window.print();
    return;
  }

  try {
    // Check if an existing print iframe exists and remove it
    const existingIframe = document.getElementById('gcap-print-frame');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'gcap-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      window.print();
      return;
    }

    // Collect all styles from parent document
    let stylesHtml = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    const contentHtml = element.innerHTML;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="hi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${documentTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        ${stylesHtml}
        <style>
          @page {
            size: A4;
            margin: 12mm 12mm 12mm 12mm;
          }
          @media print {
            body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-after: always;
            }
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 16px;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div id="print-root">
          ${contentHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    iframeDoc.close();

    // Trigger print once loaded
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      }
    }, 400);

    // Clean up iframe after 60 seconds
    setTimeout(() => {
      iframe.remove();
    }, 60000);
  } catch (error) {
    console.error('Iframe print error, falling back to window.print()', error);
    window.print();
  }
}

/**
 * Downloads a standalone, self-contained printable HTML/PDF file
 */
export function downloadDocumentAsHtml(elementId: string, filename: string = 'GCap-Document.html'): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const contentHtml = element.innerHTML;
  const fullHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename.replace(/\.html$/i, '')}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4; margin: 12mm; }
    body { background-color: #ffffff; color: #0f172a; padding: 24px; font-family: system-ui, sans-serif; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #f1f5f9; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: bold; font-size: 14px; color: #0f172a;">📄 GCap Official Printable Document</span>
    <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print / Save as PDF</button>
  </div>
  ${contentHtml}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
