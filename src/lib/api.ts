import { Document, ChatRequest, ChatResponse, Settings } from '../../shared/types';

const API_BASE = '/api';

export async function uploadDocument(file: File): Promise<{ success: boolean; document: Document }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  return response.json();
}

export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE}/documents`);
  
  if (!response.ok) {
    throw new Error('Failed to get documents');
  }

  return response.json();
}

export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }

  return response.json();
}

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to send chat');
  }

  return response.json();
}

export async function getSettings(): Promise<Omit<Settings, 'openaiApiKey'>> {
  const response = await fetch(`${API_BASE}/chat/settings`);
  
  if (!response.ok) {
    throw new Error('Failed to get settings');
  }

  return response.json();
}

export async function updateSettings(settings: Partial<Settings>): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/chat/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update settings');
  }

  return response.json();
}
