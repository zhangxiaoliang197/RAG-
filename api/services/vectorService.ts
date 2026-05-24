import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConfigService } from './configService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VECTOR_DB_PATH = path.resolve(__dirname, '../../data/vector_db.json');

interface VectorDocument {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  embedding: number[];
  position: number;
}

export class VectorService {
  private static vectors: VectorDocument[] = [];
  private static initialized = false;

  static async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      if (fs.existsSync(VECTOR_DB_PATH)) {
        const data = fs.readFileSync(VECTOR_DB_PATH, 'utf-8');
        this.vectors = JSON.parse(data);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing vector DB:', error);
      this.vectors = [];
      this.initialized = true;
    }
  }

  private static saveToDisk(): void {
    fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(this.vectors, null, 2), 'utf-8');
  }

  private static simpleEmbedding(text: string): number[] {
    const embedding = new Array(128).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, i) => {
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(j);
        hash = hash & hash;
      }
      const idx = Math.abs(hash) % 128;
      embedding[idx] += 1 / (i + 1);
    });

    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => norm > 0 ? val / norm : 0);
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return normA > 0 && normB > 0 ? dotProduct / (normA * normB) : 0;
  }

  static async addChunks(
    documentId: string,
    documentName: string,
    chunks: string[]
  ): Promise<void> {
    await this.init();

    chunks.forEach((content, position) => {
      const id = `${documentId}_${position}`;
      const embedding = this.simpleEmbedding(content);
      
      this.vectors.push({
        id,
        documentId,
        documentName,
        content,
        embedding,
        position
      });
    });

    this.saveToDisk();
  }

  static async search(
    query: string,
    topK: number = 5
  ): Promise<Array<{
    documentId: string;
    documentName: string;
    content: string;
    score: number;
  }>> {
    await this.init();

    const queryEmbedding = this.simpleEmbedding(query);
    
    const results = this.vectors
      .map(vec => ({
        documentId: vec.documentId,
        documentName: vec.documentName,
        content: vec.content,
        score: this.cosineSimilarity(queryEmbedding, vec.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  static async deleteDocument(documentId: string): Promise<void> {
    await this.init();
    this.vectors = this.vectors.filter(vec => vec.documentId !== documentId);
    this.saveToDisk();
  }

  static async getChunksByDocument(documentId: string): Promise<VectorDocument[]> {
    await this.init();
    return this.vectors.filter(vec => vec.documentId === documentId);
  }
}
