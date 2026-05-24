export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'docx';
  size: number;
  uploadTime: string;
  chunkCount: number;
}

export interface UploadDocumentResponse {
  success: boolean;
  document: Document;
}

export interface QueryRequest {
  question: string;
  topK: number;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    documentName: string;
    content: string;
    score: number;
  }>;
}

export interface AppConfig {
  llmProvider: 'ollama' | 'openai';
  ollamaModel?: string;
  ollamaBaseUrl?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  chunkSize: number;
  chunkOverlap: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: QueryResponse['sources'];
  timestamp: number;
}
