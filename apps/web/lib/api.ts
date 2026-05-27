import type { AssistantResponse, Course, Lesson, ProgressSummary, Role, SearchResult, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type AuthPayload = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function register(full_name: string, email: string, password: string, role: Role) {
  return apiFetch<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name, email, password, role })
  });
}

export function getCourses(token: string) {
  return apiFetch<Course[]>("/courses", { token });
}

export function getLessons(token: string, courseId: number) {
  return apiFetch<Lesson[]>(`/courses/${courseId}/lessons`, { token });
}

export function getLesson(token: string, lessonId: number) {
  return apiFetch<Lesson>(`/courses/lessons/${lessonId}`, { token });
}

export function askAssistant(token: string, body: Record<string, unknown>) {
  return apiFetch<AssistantResponse>("/assistant/chat", {
    method: "POST",
    token,
    body: JSON.stringify(body)
  });
}

export function semanticSearch(token: string, query: string, course_id?: number) {
  return apiFetch<SearchResult[]>("/search", {
    method: "POST",
    token,
    body: JSON.stringify({ query, course_id, limit: 6 })
  });
}

export function getProgress(token: string) {
  return apiFetch<ProgressSummary>("/progress/summary", { token });
}
