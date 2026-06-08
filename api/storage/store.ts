import { Document } from '../../shared/types';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class KnowledgeStore {
  private documents: Map<string, Document> = new Map();
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings | null = null;

  constructor() {
    this.initializeVectorStore();
  }

  private initializeVectorStore() {
    try {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY || 'demo-key',
        configuration: {
          baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        },
      });
      this.vectorStore = new MemoryVectorStore(this.embeddings);
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
    }
  }

  public updateEmbeddings(apiKey: string, baseUrl: string) {
    try {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: apiKey || 'demo-key',
        configuration: {
          baseURL: baseUrl || 'https://api.openai.com/v1',
        },
      });
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      
      for (const doc of this.documents.values()) {
        const filePath = path.join(UPLOAD_DIR, `${doc.id}.txt`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          this.addDocumentToVectorStore(doc.id, doc.name, content);
        }
      }
    } catch (error) {
      console.error('Failed to update embeddings:', error);
    }
  }

  public saveFile(filename: string, content: Buffer): string {
    const id = uuidv4();
    const ext = path.extname(filename).toLowerCase().slice(1);
    const filePath = path.join(UPLOAD_DIR, `${id}.${ext}`);
    fs.writeFileSync(filePath, content);
    return id;
  }

  public getFilePath(id: string, ext: string): string {
    return path.join(UPLOAD_DIR, `${id}.${ext}`);
  }

  public saveTextContent(id: string, content: string) {
    const filePath = path.join(UPLOAD_DIR, `${id}.txt`);
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  public async addDocumentToVectorStore(
    docId: string,
    docName: string,
    content: string
  ): Promise<number> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitText(content);
    
    const documents = chunks.map((chunk, index) => ({
      pageContent: chunk,
      metadata: {
        documentId: docId,
        documentName: docName,
        position: index,
      },
    }));

    await this.vectorStore.addDocuments(documents);
    return chunks.length;
  }

  public addDocument(doc: Document) {
    this.documents.set(doc.id, doc);
  }

  public getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  public getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  public deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (doc) {
      const ext = ['pdf', 'txt', 'md', 'docx'].find(e => 
        fs.existsSync(path.join(UPLOAD_DIR, `${id}.${e}`))
      );
      if (ext) {
        fs.unlinkSync(path.join(UPLOAD_DIR, `${id}.${ext}`));
      }
      const txtPath = path.join(UPLOAD_DIR, `${id}.txt`);
      if (fs.existsSync(txtPath)) {
        fs.unlinkSync(txtPath);
      }
      this.documents.delete(id);
      return true;
    }
    return false;
  }

  public async similaritySearch(
    query: string,
    topK: number = 5
  ): Promise<Array<{ documentId: string; documentName: string; content: string; score: number }>> {
    if (!this.vectorStore) {
      return [];
    }

    try {
      const results = await this.vectorStore.similaritySearchWithScore(query, topK);
      return results.map(([doc, score]) => ({
        documentId: doc.metadata.documentId as string,
        documentName: doc.metadata.documentName as string,
        content: doc.pageContent,
        score,
      }));
    } catch (error) {
      console.error('Similarity search failed:', error);
      return [];
    }
  }
}

export const knowledgeStore = new KnowledgeStore();
