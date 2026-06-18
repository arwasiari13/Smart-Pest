import { auth } from '../config/firebase';

const defaultApiBaseUrl = 'http://localhost:4000/api/v1';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl).replace(/\/$/, '');

// Returns the current user's Firebase ID token, or null if not signed in.
async function currentIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token: explicitToken, headers, ...rest } = options;

  // Prefer an explicitly-passed token, fall back to the current Firebase session
  const token = explicitToken ?? (await currentIdToken());

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as any).message ?? `API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
