import type { Document, AppConfig, QueryResponse } from '../../shared/types.js';

const API_BASE = '/api';

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  documents: {
    async upload(file: File): Promise<{ success: boolean; document: Document }> {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      return response.json();
    },

    async getAll(): Promise<{ success: boolean; documents: Document[] }> {
      return request('/documents');
    },

    async delete(id: string): Promise<{ success: boolean }> {
      return request(`/documents/${id}`, { method: 'DELETE' });
    },
  },

  query: {
    async ask(question: string, topK: number = 5): Promise<{ success: boolean } & QueryResponse> {
      return request('/query', {
        method: 'POST',
        body: JSON.stringify({ question, topK }),
      });
    },
  },

  config: {
    async get(): Promise<{ success: boolean; config: AppConfig }> {
      return request('/config');
    },

    async update(config: Partial<AppConfig>): Promise<{ success: boolean; config: AppConfig }> {
      return request('/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    },
  },
};
