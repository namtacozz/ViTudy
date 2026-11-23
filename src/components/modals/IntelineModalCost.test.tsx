import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntelineModal } from './IntelineModal';

const mockSpendTokens = vi.fn().mockReturnValue(true);
const mockSyncBalanceFromServer = vi.fn();
let mockWalletBalance = 50;

vi.mock('@/context/ViTokenContext', () => ({
  useViToken: () => ({
    wallet: { balance: mockWalletBalance, streakDays: 1, lastClaimDate: '', history: [] },
    aiConfig: { provider: 'system', model: 'gpt-4o-mini' },
    spendTokens: mockSpendTokens,
    syncBalanceFromServer: mockSyncBalanceFromServer,
  }),
}));

vi.mock('@/context/StudySpaceContext', () => ({
  useStudySpace: () => ({
    activeSpace: { id: 'space-1', items: [] },
    addIntelineThread: vi.fn(),
  }),
}));

vi.mock('@/lib/aiClient', () => ({
  askAi: vi.fn().mockResolvedValue({
    reply: 'Câu trả lời từ AI',
    balanceAfter: 48,
  }),
}));

describe('IntelineModal ViToken Cost Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWalletBalance = 50;
  });

  it('displays unified 2 ViToken cost in the header pill', () => {
    const dummySourceItem = {
      id: 'doc-1',
      title: 'Giáo trình Giải tích',
      type: 'book' as const,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      zIndex: 1,
      pageCount: 10,
      currentPageIndex: 0,
      pages: [],
    };

    render(
      <IntelineModal
        isOpen={true}
        onClose={vi.fn()}
        sourceItem={dummySourceItem}
        pageNumber={1}
        selectedText="Định lý Fermat về cực trị"
      />
    );

    // Header phải hiển thị thống nhất 2 ViToken / câu
    const pill = screen.getByText(/2 ViToken \/ câu/i);
    expect(pill).toBeDefined();
  });

  it('blocks sending when balance is less than 2 ViTokens', () => {
    mockWalletBalance = 1; // Chỉ có 1 ViToken (không đủ 2)
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const dummySourceItem = {
      id: 'doc-1',
      title: 'Giáo trình Giải tích',
      type: 'book' as const,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      zIndex: 1,
      pageCount: 10,
      currentPageIndex: 0,
      pages: [],
    };

    render(
      <IntelineModal
        isOpen={true}
        onClose={vi.fn()}
        sourceItem={dummySourceItem}
        pageNumber={1}
        selectedText="Định lý Fermat về cực trị"
      />
    );

    const input = screen.getByPlaceholderText(/Đặt câu hỏi về đoạn văn bản này/i);
    fireEvent.change(input, { target: { value: 'Giải thích định lý này?' } });

    const submitBtn = input.closest('form')?.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn!);

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('2 ViToken'));
    alertMock.mockRestore();
  });
});
