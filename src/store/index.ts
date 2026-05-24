import { create } from 'zustand';
import type { Document, AppConfig, ChatMessage } from '../../shared/types.js';

interface AppState {
  documents: Document[];
  config: AppConfig | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  removeDocument: (id: string) => void;
  setConfig: (config: AppConfig) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  documents: [],
  config: null,
  messages: [],
  loading: false,
  error: null,

  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ 
    documents: [...state.documents, document] 
  })),
  removeDocument: (id) => set((state) => ({ 
    documents: state.documents.filter(d => d.id !== id) 
  })),
  setConfig: (config) => set({ config }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  clearMessages: () => set({ messages: [] }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
