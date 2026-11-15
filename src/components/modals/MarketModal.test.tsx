import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarketModal } from './MarketModal';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@vitudy.vn' },
    profile: { display_name: 'Test' }
  })
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@vitudy.vn' },
    profile: { display_name: 'Test' }
  })
}));

// Mock contexts
vi.mock('@/context/StudySpaceContext', () => ({
  useStudySpace: () => ({
    activeSpace: {
      id: 'mock-space-1',
      name: 'Bàn học mẫu',
      items: []
    },
    spaces: [
      { id: 'mock-space-1', name: 'Bàn học mẫu', items: [] }
    ],
    addUploadedDocument: vi.fn(),
    addMarketItemToSpace: vi.fn(),
    createSpace: vi.fn(),
    switchSpace: vi.fn(),
    saveCurrentSpaceImmediately: vi.fn()
  })
}));

vi.mock('@/context/ViTokenContext', () => ({
  useViToken: () => ({
    wallet: {
      balance: 50,
      streakDays: 3,
      history: []
    },
    deductTokens: vi.fn().mockReturnValue(true),
    addTokens: vi.fn()
  })
}));

describe('MarketModal Mobile Sheet & Ergonomics', () => {
  const mockOnClose = vi.fn();
  const mockOnEnterDesk = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open with mobile handle and title', () => {
    render(
      <MarketModal
        isOpen={true}
        onClose={mockOnClose}
        onEnterDesk={mockOnEnterDesk}
      />
    );

    expect(screen.getByText('Chợ Tài Liệu')).toBeDefined();
    // Drag handle title
    const dragHandle = screen.getByTitle('Nhấn để đóng Chợ');
    expect(dragHandle).toBeDefined();
  });

  it('calls onClose when clicking close button X', () => {
    render(
      <MarketModal
        isOpen={true}
        onClose={mockOnClose}
        onEnterDesk={mockOnEnterDesk}
      />
    );

    const closeBtn = screen.getByLabelText('Đóng chợ tài liệu');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when tapping on the mobile drag indicator handle', () => {
    render(
      <MarketModal
        isOpen={true}
        onClose={mockOnClose}
        onEnterDesk={mockOnEnterDesk}
      />
    );

    const dragHandle = screen.getByTitle('Nhấn để đóng Chợ');
    fireEvent.click(dragHandle);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose on touch swipe-down gesture', () => {
    render(
      <MarketModal
        isOpen={true}
        onClose={mockOnClose}
        onEnterDesk={mockOnEnterDesk}
      />
    );

    const titleEl = screen.getByText('Chợ Tài Liệu');
    const headerContainer = titleEl.closest('div[class*="border-b"]');
    expect(headerContainer).not.toBeNull();

    if (headerContainer) {
      fireEvent.touchStart(headerContainer, {
        touches: [{ clientY: 100 }]
      });
      fireEvent.touchEnd(headerContainer, {
        changedTouches: [{ clientY: 200 }] // deltaY = 100 > 70
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('switches between Market and Personal Cabinet view without crashing', () => {
    render(
      <MarketModal
        isOpen={true}
        onClose={mockOnClose}
        onEnterDesk={mockOnEnterDesk}
      />
    );

    // Look for cabinet buttons (both desktop and mobile exist)
    const cabinetBtns = screen.getAllByText(/Tủ cá nhân|Tủ tài liệu cá nhân/);
    expect(cabinetBtns.length).toBeGreaterThan(0);

    fireEvent.click(cabinetBtns[0]);
    // Should show cabinet mode notice or empty state
    expect(screen.getAllByText(/Bạn chưa có tài liệu nào|Tủ cá nhân/).length).toBeGreaterThan(0);
  });
});
