import katex from 'katex';
import { saveAs } from 'file-saver';

export const exportToWordWithMath = async (editorContentHtml: string) => {
  try {
    console.log("Starting export...");

    // 1. Create a Temp Div
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorContentHtml;

    // 2. IMAGE FIXER (Base64 conversion)
    const images = tempDiv.querySelectorAll('img');
    await Promise.all(Array.from(images).map(async (img) => {
      if (img.src.startsWith('blob:')) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              img.src = reader.result as string; 
              resolve();
            };
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn("Could not process image", e);
        }
      }
      if (img.width > 600) {
        img.style.width = '100%';
        img.setAttribute('width', '600');
      }
    }));

    // 3. MATH FIXER: Center Equations & Use Display Mode
    const mathBlocks = tempDiv.querySelectorAll('.ql-formula, .ql-block-math, .ql-inline-math');
    
    mathBlocks.forEach((node) => {
      const latex = node.getAttribute('data-value');
      // Check if it's meant to be a Block Equation (on its own line)
      // Quill usually uses 'ql-block-math', or we check if the parent is a centered paragraph
      const isBlock = node.classList.contains('ql-block-math');

      if (latex) {
        try {
          // Render to MathML
          const mathMLString = katex.renderToString(latex, {
            throwOnError: false,
            output: 'mathml',
            // CRITICAL: displayMode makes fractions tall and integrals big
            displayMode: isBlock, 
          });

          const tempMathDiv = document.createElement('div');
          tempMathDiv.innerHTML = mathMLString;
          const mathNode = tempMathDiv.querySelector('math');

          if (mathNode && node.parentNode) {
             if (isBlock) {
                 // IF BLOCK: Wrap in a centered DIV so Word centers it
                 const wrapper = document.createElement('div');
                 wrapper.style.textAlign = 'center'; // CSS that Pandoc understands
                 wrapper.appendChild(mathNode);
                 node.parentNode.replaceChild(wrapper, node);
             } else {
                 // IF INLINE: Just replace normally
                 node.parentNode.replaceChild(mathNode, node);
             }
          }
        } catch (e) {
          console.error("Math conversion failed", e);
        }
      }
    });

    // 4. Wrap & Send
    const finalHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Export</title>
      </head>
      <body>
        ${tempDiv.innerHTML}
      </body>
      </html>
    `;

    console.log("Sending to server...");
    const response = await fetch('http://localhost:3001/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: finalHtml }),
    });

    if (!response.ok) throw new Error(`Server Error: ${response.statusText}`);

    const blob = await response.blob();
    saveAs(blob, 'MathNotes.docx');
    console.log("Download complete!");

  } catch (error) {
    console.error("Export failed:", error);
    alert("Export failed! Ensure 'node server.js' is running.");
  }
};
