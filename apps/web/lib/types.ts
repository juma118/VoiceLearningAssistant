export type Role = "student" | "instructor";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: Role;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  level: string;
  instructor_id: number | null;
};

export type Lesson = {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  position: number;
  estimated_minutes: number;
};

export type SearchResult = {
  resource_id: number | null;
  lesson_id: number | null;
  title: string;
  snippet: string;
  score: number;
  metadata: Record<string, unknown>;
};

export type AssistantResponse = {
  conversation_id: number;
  answer: string;
  detected_language: string;
  citations: SearchResult[];
  suggested_followups: string[];
  audio_base64: string | null;
};

export type ProgressSummary = {
  completed_lessons: number;
  average_score: number;
  weak_topics: string[];
  recent_activity: Array<Record<string, unknown>>;
  recommendations: Array<Record<string, unknown>>;
};
