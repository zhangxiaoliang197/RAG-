import type { 
  Document, AppConfig, QueryResponse, DatabaseConfig, TableMetadata, 
  MetricKnowledge, SqlExample, AnalyzeRequest, AnalyzeResponse,
  CreateTableMetadataRequest, CreateMetricKnowledgeRequest, CreateSqlExampleRequest
} from '../../shared/types.js';

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

  db: {
    async uploadDriver(file: File): Promise<{ success: boolean; driverJarPath?: string; fileName?: string; error?: string }> {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/db/driver/upload`, {
        method: 'POST',
        body: formData,
      });

      return response.json();
    },

    async testConfig(config: DatabaseConfig): Promise<{ success: boolean; valid: boolean; error?: string }> {
      return request('/db/config/test', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    },

    async saveConfig(config: DatabaseConfig): Promise<{ success: boolean }> {
      return request('/db/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    },

    async getConfig(): Promise<{ success: boolean; config: DatabaseConfig | null }> {
      return request('/db/config');
    },

    async getRemoteTables(schema?: string): Promise<{ success: boolean; tables: string[] }> {
      const url = schema ? `/db/tables/remote?schema=${encodeURIComponent(schema)}` : '/db/tables/remote';
      return request(url);
    },

    async getRemoteTableStructure(tableName: string, schema?: string): Promise<{ success: boolean; columns: any[] }> {
      const url = schema 
        ? `/db/tables/remote/${encodeURIComponent(tableName)}?schema=${encodeURIComponent(schema)}` 
        : `/db/tables/remote/${encodeURIComponent(tableName)}`;
      return request(url);
    },

    async getAllTables(): Promise<{ success: boolean; tables: TableMetadata[] }> {
      return request('/db/tables');
    },

    async saveTable(data: CreateTableMetadataRequest): Promise<{ success: boolean; metadata: TableMetadata }> {
      return request('/db/tables', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateTable(id: string, data: Partial<TableMetadata>): Promise<{ success: boolean; metadata: TableMetadata }> {
      return request(`/db/tables/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async deleteTable(id: string): Promise<{ success: boolean }> {
      return request(`/db/tables/${id}`, { method: 'DELETE' });
    },

    async executeSql(sql: string): Promise<{ success: boolean; columns: string[]; rows: any[]; executionTime?: number }> {
      return request('/db/sql/execute', {
        method: 'POST',
        body: JSON.stringify({ sql }),
      });
    },

    async validateSql(sql: string): Promise<{ success: boolean; valid: boolean; error?: string }> {
      return request('/db/sql/validate', {
        method: 'POST',
        body: JSON.stringify({ sql }),
      });
    },
  },

  oracle: undefined as any,

  knowledge: {
    async getAllMetrics(): Promise<{ success: boolean; metrics: MetricKnowledge[] }> {
      return request('/knowledge/metrics');
    },

    async saveMetric(data: CreateMetricKnowledgeRequest): Promise<{ success: boolean; metric: MetricKnowledge }> {
      return request('/knowledge/metrics', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateMetric(id: string, data: Partial<MetricKnowledge>): Promise<{ success: boolean; metric: MetricKnowledge }> {
      return request(`/knowledge/metrics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async deleteMetric(id: string): Promise<{ success: boolean }> {
      return request(`/knowledge/metrics/${id}`, { method: 'DELETE' });
    },

    async getAllSqlExamples(): Promise<{ success: boolean; examples: SqlExample[] }> {
      return request('/knowledge/sql-examples');
    },

    async saveSqlExample(data: CreateSqlExampleRequest): Promise<{ success: boolean; example: SqlExample }> {
      return request('/knowledge/sql-examples', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateSqlExample(id: string, data: Partial<SqlExample>): Promise<{ success: boolean; example: SqlExample }> {
      return request(`/knowledge/sql-examples/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async deleteSqlExample(id: string): Promise<{ success: boolean }> {
      return request(`/knowledge/sql-examples/${id}`, { method: 'DELETE' });
    },
  },

  analysis: {
    async analyze(data: AnalyzeRequest): Promise<{ success: boolean } & AnalyzeResponse> {
      return request('/analysis', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async generateSql(data: AnalyzeRequest): Promise<{ success: boolean; sql: string; retrievedMetrics: MetricKnowledge[]; retrievedExamples: SqlExample[] }> {
      return request('/analysis/generate-sql', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async executeSql(sql: string): Promise<{ 
      success: boolean; 
      sqlValid: boolean; 
      sqlError?: string;
      result?: any[]; 
      resultColumns?: string[]; 
      executionTime?: number 
    }> {
      return request('/analysis/execute-sql', {
        method: 'POST',
        body: JSON.stringify({ sql }),
      });
    },
  },
};

api.oracle = api.db;
