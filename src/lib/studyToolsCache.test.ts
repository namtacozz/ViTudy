import { describe, it, expect, beforeEach } from 'vitest';
import { getStudyToolsCache, updateStudyToolsCache, clearStudyToolsCache } from './studyToolsCache';

describe('studyToolsCache', () => {
  beforeEach(() => {
    clearStudyToolsCache();
  });

  it('stores and retrieves AI summary cache', () => {
    const docKey = 'Giao Trinh Giai Tich 1';
    updateStudyToolsCache(docKey, {
      summaryResult: '- Định lý Lagrange\n- Định lý Cauchy',
      creationSource: 'ai',
    });

    const cached = getStudyToolsCache(docKey);
    expect(cached).toBeDefined();
    expect(cached?.summaryResult).toContain('Lagrange');
    expect(cached?.creationSource).toBe('ai');
  });

  it('stores and retrieves Quiz questions and answers', () => {
    const docKey = 'doc-123';
    updateStudyToolsCache(docKey, {
      quizQuestions: [{ id: 'q1', question: '1+1=?', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: 'Toán' }],
      userAnswers: { q1: 1 },
      isGraded: true,
    });

    const cached = getStudyToolsCache(docKey);
    expect(cached?.quizQuestions?.length).toBe(1);
    expect(cached?.userAnswers?.q1).toBe(1);
    expect(cached?.isGraded).toBe(true);
  });

  it('preserves other tools data on partial update', () => {
    const docKey = 'doc-456';
    updateStudyToolsCache(docKey, {
      summaryResult: 'Tóm tắt bài học',
      creationSource: 'offline',
    });

    updateStudyToolsCache(docKey, {
      flashcards: [{ front: 'A', back: 'B' }],
    });

    const cached = getStudyToolsCache(docKey);
    expect(cached?.summaryResult).toBe('Tóm tắt bài học');
    expect(cached?.flashcards?.length).toBe(1);
  });
});
