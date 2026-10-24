import { PDFParse } from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { promises as fs } from "node:fs";
import { pdf } from 'pdf-to-img';

export async function extractTextFromPdf(filePath) {
  try {
    const parser = new PDFParse({ url: filePath });
    const result = await parser.getText();
    await parser.destroy();
    
    let extractedText = result.text?.trim() || "";

    // If text layer is virtually empty (scanned PDF), run OCR
    if (extractedText.length < 50) {
      console.log("📄 PDF text layer empty. Running OCR...");
      extractedText = await performOcr(filePath);
    }

    return extractedText;
  } catch (error) {
    console.error("PDF Extraction Error:", error.message);
    throw new Error("Failed to extract text from PDF");
  }
}

async function performOcr(filePath) {
  const worker = await createWorker('eng');
  let fullText = "";

  try {
    let counter = 1;
    const images = await pdf(filePath, { scale: 3 });

    for await (const image of images) {
      const { data: { text } } = await worker.recognize(Buffer.from(image));
      fullText += `--- Page ${counter} ---\n${text}\n`;
      counter++;
      
      if (counter > 10) {
        fullText += "\n--- OCR truncated after 10 pages for performance ---";
        break;
      }
    }
    return fullText;
  } finally {
    await worker.terminate();
  }
}