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

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const { timeout = 70000 } = options as any;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      if (response.status === 429) {
        throw new ApiError('Rate limit reached. Please wait a moment.', 429);
      }
      if (response.status >= 500) {
        throw new ApiError('Server error. Check backend logs.', response.status);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'An unexpected error occurred.', response.status);
    }

    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new ApiError('Backend is offline. Make sure Spring Boot is running on port 8080.', 503);
    }
    throw error;
  }
}

export async function generateCode(instruction: string, targetLanguage: string): Promise<CodeResponse> {
  const response = await fetchWithTimeout(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction, targetLanguage }),
  });
  return response.json();
}

export async function executeCode(code: string, language: string): Promise<ExecutionResponse> {
  const response = await fetchWithTimeout(`${API_URL}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });
  return response.json();
}

export async function getHistory(): Promise<ExecutionHistory[]> {
  const response = await fetchWithTimeout(`${API_URL}/api/history`);
  return response.json();
}

export async function clearHistory(): Promise<void> {
  await fetchWithTimeout(`${API_URL}/api/history`, {
    method: 'DELETE',
  });
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
