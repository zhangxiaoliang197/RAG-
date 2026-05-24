## 1. Architecture Design

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[文档管理页]
        B[智能问答页]
        C[设置页]
    end
    
    subgraph "Backend (Express.js)"
        D[文件处理API]
        E[向量数据库API]
        F[问答API]
    end
    
    subgraph "Data Layer"
        G[(向量数据库<br/>ChromaDB)]
        H[(文件存储<br/>Local FS)]
        I[(配置存储<br/>JSON文件)]
    end
    
    subgraph "AI Services"
        J[Embedding Model<br/>sentence-transformers]
        K[LLM<br/>Ollama / OpenAI API]
    end
    
    A --> D
    B --> F
    C --> I
    D --> H
    D --> G
    F --> G
    F --> J
    F --> K
```

## 2. Technology Description
- Frontend: React@18 + TypeScript + tailwindcss@3 + Vite + zustand
- Initialization Tool: vite-init (react-express-ts 模板)
- Backend: Express@4 + TypeScript
- Vector Database: ChromaDB (本地向量数据库)
- Embedding: sentence-transformers (通过 transformers.js 或 Python 后端)
- LLM: Ollama (本地) 或 OpenAI API (可选)
- File Processing: pdf-parse, mammoth, marked

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | 智能问答首页 |
| /documents | 文档管理页面 |
| /settings | 设置页面 |

## 4. API Definitions

```typescript
// 文档相关接口
interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'docx';
  size: number;
  uploadTime: string;
  chunkCount: number;
}

interface UploadDocumentResponse {
  success: boolean;
  document: Document;
}

// 问答相关接口
interface QueryRequest {
  question: string;
  topK: number;
}

interface QueryResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    documentName: string;
    content: string;
    score: number;
  }>;
}

// 配置相关接口
interface AppConfig {
  llmProvider: 'ollama' | 'openai';
  ollamaModel?: string;
  ollamaBaseUrl?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  chunkSize: number;
  chunkOverlap: number;
}
```

后端API路由：
- `POST /api/documents/upload` - 上传文档
- `GET /api/documents` - 获取文档列表
- `DELETE /api/documents/:id` - 删除文档
- `POST /api/query` - 提问
- `GET /api/config` - 获取配置
- `POST /api/config` - 保存配置

## 5. Server Architecture Diagram

```mermaid
graph LR
    subgraph "Express.js Backend"
        A[Routes 路由层] --> B[Controllers 控制器层]
        B --> C[Services 服务层]
        C --> D[Repositories 数据层]
    end
    
    C --> E[ChromaDB Service]
    C --> F[File Processing Service]
    C --> G[LLM Service]
    
    D --> H[(Local Storage)]
    D --> I[(ChromaDB)]
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    DOCUMENT ||--o{ CHUNK : contains
    DOCUMENT {
        string id
        string name
        string type
        number size
        datetime uploadTime
    }
    CHUNK {
        string id
        string documentId
        string content
        vector embedding
        number position
    }
```

### 6.2 Data Definition Language

ChromaDB集合定义：
```javascript
// 创建文档集合
await chromaClient.createCollection({
  name: 'documents',
  metadata: { description: '用户上传文档的向量存储' }
});

// 配置存储 (JSON文件)
{
  "llmProvider": "ollama",
  "ollamaModel": "llama2",
  "ollamaBaseUrl": "http://localhost:11434",
  "chunkSize": 512,
  "chunkOverlap": 50
}
```

文件存储结构：
```
/workspace/data/
  ├── documents/
  │   ├── {doc-id}/
  │   │   ├── original.{ext}
  │   │   └── extracted.txt
  └── config.json
```
