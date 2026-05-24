import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Document } from '../../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCUMENTS_META_PATH = path.resolve(__dirname, '../../data/documents.json');

export class DocumentService {
  private static documents: Document[] | null = null;

  private static async loadDocuments(): Promise<Document[]> {
    if (this.documents) {
      return this.documents;
    }

    try {
      if (fs.existsSync(DOCUMENTS_META_PATH)) {
        const data = fs.readFileSync(DOCUMENTS_META_PATH, 'utf-8');
        this.documents = JSON.parse(data);
      } else {
        this.documents = [];
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      this.documents = [];
    }

    return this.documents;
  }

  private static saveDocuments(): void {
    if (this.documents) {
      fs.writeFileSync(
        DOCUMENTS_META_PATH,
        JSON.stringify(this.documents, null, 2),
        'utf-8'
      );
    }
  }

  static async getAllDocuments(): Promise<Document[]> {
    return await this.loadDocuments();
  }

  static async getDocument(id: string): Promise<Document | null> {
    const docs = await this.loadDocuments();
    return docs.find(doc => doc.id === id) || null;
  }

  static async addDocument(document: Document): Promise<void> {
    const docs = await this.loadDocuments();
    docs.push(document);
    this.saveDocuments();
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const docs = await this.loadDocuments();
    const index = docs.findIndex(doc => doc.id === id);
    if (index !== -1) {
      docs[index] = { ...docs[index], ...updates };
      this.saveDocuments();
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    const docs = await this.loadDocuments();
    this.documents = docs.filter(doc => doc.id !== id);
    this.saveDocuments();
  }
}
