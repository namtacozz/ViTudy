// In-memory persistent cache for study tools (Summary, Quiz, Flashcards, Roadmap)
// Keeps user-generated content intact across tab switches and modal re-opens

export interface CachedStudyData {
  summaryResult?: string;
  quizQuestions?: any[];
  userAnswers?: Record<string, number>;
  isGraded?: boolean;
  creationSource?: 'ai' | 'offline' | null;
  flashcards?: any[];
  roadmap?: any[];
}

const cache = new Map<string, CachedStudyData>();

export function getStudyCache(key: string): CachedStudyData {
  return cache.get(key) || {};
}

export function setStudyCache(key: string, data: Partial<CachedStudyData>): void {
  const current = cache.get(key) || {};
  cache.set(key, { ...current, ...data });
}
