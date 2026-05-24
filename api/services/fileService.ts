import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DOCUMENTS_DIR = path.join(DATA_DIR, 'documents');

export interface ExtractedText {
  text: string;
  metadata: any;
}

export class FileService {
  static async ensureDir(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static async saveUploadedFile(
    file: Express.Multer.File,
    docId: string
  ): Promise<string> {
    const docDir = path.join(DOCUMENTS_DIR, docId);
    await this.ensureDir(docDir);
    
    const ext = path.extname(file.originalname);
    const originalPath = path.join(docDir, `original${ext}`);
    fs.writeFileSync(originalPath, file.buffer);
    
    return originalPath;
  }

  static async extractText(filePath: string, fileType: string): Promise<ExtractedText> {
    const buffer = fs.readFileSync(filePath);
    
    switch (fileType) {
      case 'pdf':
        const pdfData = await pdf(buffer);
        return { text: pdfData.text, metadata: pdfData.metadata };
      
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer });
        return { text: docxResult.value, metadata: {} };
      
      case 'txt':
      case 'md':
        return { text: buffer.toString('utf-8'), metadata: {} };
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  static splitTextIntoChunks(
    text: string,
    chunkSize: number = 512,
    chunkOverlap: number = 50
  ): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?。！？])\s+/);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const potentialChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
      
      if (potentialChunk.length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          chunks.push(sentence);
          currentChunk = '';
        }
      } else {
        currentChunk = potentialChunk;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  static saveExtractedText(docId: string, text: string): void {
    const docDir = path.join(DOCUMENTS_DIR, docId);
    const extractedPath = path.join(docDir, 'extracted.txt');
    fs.writeFileSync(extractedPath, text, 'utf-8');
  }

  static deleteDocument(docId: string): void {
    const docDir = path.join(DOCUMENTS_DIR, docId);
    if (fs.existsSync(docDir)) {
      fs.rmSync(docDir, { recursive: true, force: true });
    }
  }

  static getDocumentPath(docId: string): string {
    return path.join(DOCUMENTS_DIR, docId);
  }
}
