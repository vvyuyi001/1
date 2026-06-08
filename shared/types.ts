export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'docx';
  size: number;
  uploadTime: Date;
  chunkCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

export interface Source {
  documentId: string;
  documentName: string;
  content: string;
  score: number;
}

export interface UploadResponse {
  success: boolean;
  document: Document;
}

export interface ChatRequest {
  question: string;
  history: Message[];
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export interface Settings {
  openaiApiKey: string;
  openaiBaseUrl: string;
  model: string;
  temperature: number;
  topK: number;
}
