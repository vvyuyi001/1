import { create } from 'zustand';
import { Document, Message, Settings } from '../../shared/types';

interface AppState {
  documents: Document[];
  messages: Message[];
  settings: Omit<Settings, 'openaiApiKey'>;
  isLoading: boolean;
  currentPage: 'chat' | 'knowledge' | 'settings';
  
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  
  setSettings: (settings: Partial<Omit<Settings, 'openaiApiKey'>>) => void;
  
  setIsLoading: (loading: boolean) => void;
  setCurrentPage: (page: 'chat' | 'knowledge' | 'settings') => void;
}

export const useStore = create<AppState>((set) => ({
  documents: [],
  messages: [],
  settings: {
    openaiBaseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    topK: 5,
  },
  isLoading: false,
  currentPage: 'chat',

  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  removeDocument: (id) => set((state) => ({ 
    documents: state.documents.filter(d => d.id !== id) 
  })),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  setSettings: (settings) => set((state) => ({ 
    settings: { ...state.settings, ...settings } 
  })),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
