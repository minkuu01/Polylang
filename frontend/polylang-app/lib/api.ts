import { supabase } from "./supabase";

export interface CodeRequest {
  instruction: string;
  targetLanguage: string;
}

export interface CodeResponse {
  generatedCode: string;
  detectedLanguage: string;
  translatedInstruction: string;
  targetLanguage: string;
}

export interface ExecutionRequest {
  code: string;
  language: string;
}

export interface ExecutionResponse {
  output: string;
  error: string;
  exitCode: number;
}

export interface ExecutionHistory {
  id: number;
  userId: string;
  inputText: string;
  detectedLanguage: string;
  translatedText: string;
  targetLanguage: string;
  generatedCode: string;
  output: string;
  error: string;
  executionTime: number;
  status: string;
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

/**
 * Helper to get authentication headers
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new ApiError('Authentication required. Please sign in.', 401);
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

async function fetchWithTimeout(url: string, options: FetchWithTimeoutOptions = {}) {
  const { timeout = 70000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiError('Rate limit reached. Please wait a moment.', 429);
      }
      if (response.status === 401 || response.status === 403) {
        throw new ApiError('Authentication required. Please sign in.', response.status);
      }
      if (response.status >= 500) {
        throw new ApiError('Server error. Check backend logs.', response.status);
      }
      const errorData = await response.json().catch(() => ({})) as { message?: string };
      throw new ApiError(errorData.message || 'An unexpected error occurred.', response.status);
    }

    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Backend is offline. Make sure Spring Boot is running.', 503);
    }
    throw error;
  }
}

export async function generateCode(instruction: string, targetLanguage: string): Promise<CodeResponse> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_URL}/api/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ instruction, targetLanguage }),
  });
  return response.json();
}

export async function executeCode(code: string, language: string): Promise<ExecutionResponse> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_URL}/api/execute`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, language }),
  });
  return response.json();
}

export async function getHistory(): Promise<ExecutionHistory[]> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_URL}/api/history`, {
    headers
  });
  return response.json();
}

export async function clearHistory(): Promise<void> {
  const headers = await getAuthHeaders();
  await fetchWithTimeout(`${API_URL}/api/history`, {
    method: 'DELETE',
    headers
  });
}

export async function deleteHistoryItem(id: number): Promise<void> {
  const headers = await getAuthHeaders();
  await fetchWithTimeout(`${API_URL}/api/history/${id}`, {
    method: 'DELETE',
    headers
  });
}

export async function updateHistoryItem(id: number, data: { code?: string; status?: string }): Promise<ExecutionHistory> {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(`${API_URL}/api/history/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getSharedItem(id: number): Promise<ExecutionHistory> {
  const response = await fetchWithTimeout(`${API_URL}/api/share/${id}`);
  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'UP';
  } catch {
    return false;
  }
}
