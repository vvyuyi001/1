## 1. Architecture Design
```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        A[知识库管理页面]
        B[智能问答页面]
        C[设置页面]
        D[组件库]
    end
    
    subgraph "Backend (Express)"
        E[文档处理API]
        F[向量检索API]
        G[问答生成API]
        H[文件服务]
    end
    
    subgraph "Data Layer"
        I[(文件存储)]
        J[(向量数据库)]
    end
    
    subgraph "External Services"
        K[LLM API]
    end
    
    A --> E
    B --> F
    B --> G
    E --> H
    E --> I
    E --> J
    F --> J
    G --> K
    G --> J
```

## 2. Technology Description
- **Frontend**: React@18 + TypeScript + TailwindCSS@3 + Vite + Zustand
- **Initialization Tool**: vite-init
- **Backend**: Express@4 + TypeScript
- **Vector Database**: LangChain + Memory Vector Store (本地)
- **LLM Integration**: OpenAI API兼容接口
- **Document Parsing**: pdf-parse, mammoth, markdown-it

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | 智能问答页面 |
| /knowledge | 知识库管理页面 |
| /settings | 设置页面 |

## 4. API Definitions
```typescript
// API接口定义
interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'docx';
  size: number;
  uploadTime: Date;
  chunkCount: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface Source {
  documentId: string;
  documentName: string;
  content: string;
  score: number;
}

// API响应类型
interface UploadResponse {
  success: boolean;
  document: Document;
}

interface ChatRequest {
  question: string;
  history: Message[];
}

interface ChatResponse {
  answer: string;
  sources: Source[];
}
```

## 5. Server Architecture Diagram
```mermaid
graph LR
    A[Controller层] --> B[Service层]
    B --> C[Repository层]
    C --> D[(数据存储)]
    
    A1[文档控制器] --> B1[文档服务]
    A2[问答控制器] --> B2[问答服务]
    A3[向量控制器] --> B3[向量服务]
    
    B1 --> C1[文件存储]
    B2 --> C2[LLM客户端]
    B3 --> C3[向量存储]
```

## 6. Data Model
### 6.1 Data Model Definition
```mermaid
erDiagram
    DOCUMENT {
        string id PK
        string name
        string type
        int size
        datetime uploadTime
        int chunkCount
    }
    
    CHUNK {
        string id PK
        string documentId FK
        string content
        vector embedding
        int position
    }
    
    CONVERSATION {
        string id PK
        string title
        datetime createdAt
        datetime updatedAt
    }
    
    MESSAGE {
        string id PK
        string conversationId FK
        string role
        string content
        datetime timestamp
        json sources
    }
    
    DOCUMENT ||--o{ CHUNK : has
    CONVERSATION ||--o{ MESSAGE : contains
```

### 6.2 Data Definition Language
```typescript
// 使用内存存储的数据结构定义
interface DocumentStore {
  documents: Map<string, Document>;
  chunks: Map<string, Chunk>;
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;
}

// 向量存储使用LangChain MemoryVectorStore
```
