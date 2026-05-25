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

export interface OracleConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  sid: string;
}

export interface ColumnMetadata {
  columnName: string;
  dataType: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: string;
  comment: string;
  displayName?: string;
}

export interface TableRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}

export interface TableMetadata {
  id: string;
  tableName: string;
  tableComment: string;
  schema: string;
  columns: ColumnMetadata[];
  relationships: TableRelationship[];
  displayName: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MetricKnowledge {
  id: string;
  name: string;
  definition: string;
  formula: string;
  category: string;
  relatedTables: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SqlExample {
  id: string;
  naturalLanguage: string;
  sql: string;
  tablesUsed: string[];
  metrics: string[];
  complexity: 'simple' | 'medium' | 'complex';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeRequest {
  question: string;
  topK?: number;
}

export interface AnalyzeResponse {
  question: string;
  sql: string;
  sqlValid: boolean;
  sqlError?: string;
  explanation: string;
  result?: any[];
  resultColumns?: string[];
  retrievedMetrics: MetricKnowledge[];
  retrievedExamples: SqlExample[];
}

export interface ExecuteSqlRequest {
  sql: string;
}

export interface ExecuteSqlResponse {
  success: boolean;
  result?: any[];
  columns?: string[];
  error?: string;
  executionTime?: number;
}

export interface CreateTableMetadataRequest {
  tableName: string;
  schema?: string;
  displayName: string;
  tableComment: string;
  columns: ColumnMetadata[];
  relationships: TableRelationship[];
  tags?: string[];
}

export interface CreateMetricKnowledgeRequest {
  name: string;
  definition: string;
  formula: string;
  category: string;
  relatedTables: string[];
  tags?: string[];
}

export interface CreateSqlExampleRequest {
  naturalLanguage: string;
  sql: string;
  tablesUsed: string[];
  metrics: string[];
  complexity: 'simple' | 'medium' | 'complex';
  description?: string;
}

export interface SaveOracleConfigRequest {
  user: string;
  password: string;
  host: string;
  port: number;
  sid: string;
}
