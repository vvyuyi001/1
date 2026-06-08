import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { Document } from '../../shared/types';
import { knowledgeStore } from '../storage/store';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  async processDocument(
    file: Express.Multer.File
  ): Promise<Document> {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'txt';
    const id = knowledgeStore.saveFile(file.originalname, file.buffer);
    
    let content = '';
    
    try {
      switch (ext) {
        case 'pdf':
          content = await this.extractPdfContent(knowledgeStore.getFilePath(id, 'pdf'));
          break;
        case 'docx':
          content = await this.extractDocxContent(knowledgeStore.getFilePath(id, 'docx'));
          break;
        case 'md':
        case 'txt':
        default:
          content = file.buffer.toString('utf-8');
          break;
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      content = file.buffer.toString('utf-8');
    }

    knowledgeStore.saveTextContent(id, content);
    const chunkCount = await knowledgeStore.addDocumentToVectorStore(
      id,
      file.originalname,
      content
    );

    const document: Document = {
      id,
      name: file.originalname,
      type: ext as any,
      size: file.size,
      uploadTime: new Date(),
      chunkCount,
    };

    knowledgeStore.addDocument(document);
    return document;
  }

  private async extractPdfContent(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  private async extractDocxContent(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  getAllDocuments(): Document[] {
    return knowledgeStore.getAllDocuments();
  }

  deleteDocument(id: string): boolean {
    return knowledgeStore.deleteDocument(id);
  }
}

export const documentService = new DocumentService();
