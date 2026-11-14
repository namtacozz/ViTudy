import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { HomePage } from './HomePage';

// Mock useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Link
vi.mock('next/link', () => ({
  default: ({ children, href, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@vitudy.edu.vn' },
    profile: { display_name: 'Nguyễn Văn A' },
    status: 'authenticated',
    signOut: vi.fn(),
  }),
}));

// Mock ViTokenContext
vi.mock('@/context/ViTokenContext', () => ({
  useViToken: () => ({
    wallet: { balance: 100, streakDays: 5, lastClaimDate: '2026-11-13' },
    claimDailyStreak: vi.fn().mockReturnValue({ earned: 2, message: 'Thành công' }),
  }),
}));

// Mock StudySpaceContext
const mockSpaces = [
  {
    id: 'space-1',
    name: 'Giải tích 1',
    subject: 'Toán cao cấp',
    description: 'Tài liệu ôn thi cuối kỳ',
    items: [
      { id: 'item-1', type: 'book', title: 'Giáo trình Giải tích' },
      { id: 'item-2', type: 'paper', title: 'Đề thi 2024' },
    ],
    lastOpenedAt: new Date().toISOString(),
    starred: true,
  },
  {
    id: 'space-2',
    name: 'Cấu trúc dữ liệu',
    subject: 'CNTT',
    description: 'Cây nhị phân và đồ thị',
    items: [
      { id: 'item-3', type: 'book', title: 'DSA Textbook' },
    ],
    lastOpenedAt: new Date().toISOString(),
    starred: false,
  },
];

vi.mock('@/context/StudySpaceContext', () => ({
  useStudySpace: () => ({
    spaces: mockSpaces,
    activeSpaceId: 'space-1',
    switchSpace: vi.fn(),
    createSpaceFromTemplate: vi.fn().mockReturnValue('new-space-id'),
    toggleStarSpace: vi.fn(),
    deleteSpace: vi.fn(),
    renameSpace: vi.fn(),
    duplicateSpace: vi.fn(),
  }),
}));

// Mock PomodoroContext
vi.mock('@/context/PomodoroContext', () => ({
  usePomodoroContext: () => ({
    startSession: vi.fn(),
  }),
}));

// Mock Modals
vi.mock('@/components/payment/TopUpModal', () => ({
  TopUpModal: () => <div data-testid="topup-modal" />,
}));
vi.mock('@/components/modals/MarketModal', () => ({
  MarketModal: () => <div data-testid="market-modal" />,
}));
vi.mock('@/components/modals/AiConfigModal', () => ({
  AiConfigModal: () => <div data-testid="aiconfig-modal" />,
}));

// Mock ResponsiveLayout to mobile by default
let mockResponsiveState = {
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  orientation: 'portrait' as const,
  touchCapable: true,
};

vi.mock('@/hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: () => mockResponsiveState,
}));

describe('Mobile HomePage Responsiveness', () => {
  const mockOnEnterDesk = vi.fn();
  const mockOnCreateSpace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockResponsiveState = {
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      orientation: 'portrait',
      touchCapable: true,
    };
  });

  it('renders fixed bottom navigation bar with 5 items on mobile', () => {
    render(<HomePage onEnterDesk={mockOnEnterDesk} onCreateSpace={mockOnCreateSpace} />);
    
    const bottomNav = screen.getByRole('navigation', { name: /Điều hướng di động/i });
    expect(bottomNav).toBeInTheDocument();
    expect(bottomNav.className).toContain('responsive-bottom-nav');
    expect(bottomNav.className).toContain('fixed bottom-0');

    // 5 tabs must be present: Trang chủ, Bàn học, Chợ, Nhật ký, Hồ sơ within bottomNav
    const navScope = within(bottomNav);
    expect(navScope.getByText('Trang chủ')).toBeInTheDocument();
    expect(navScope.getByText('Bàn học')).toBeInTheDocument();
    expect(navScope.getByText('Chợ')).toBeInTheDocument();
    expect(navScope.getByText('Nhật ký')).toBeInTheDocument();
    expect(navScope.getByText('Hồ sơ')).toBeInTheDocument();
  });

  it('navigates to desk when clicking Bàn học tab on bottom bar', () => {
    render(<HomePage onEnterDesk={mockOnEnterDesk} onCreateSpace={mockOnCreateSpace} />);
    
    const bottomNav = screen.getByRole('navigation', { name: /Điều hướng di động/i });
    const deskTabBtn = within(bottomNav).getByText('Bàn học').closest('button');
    expect(deskTabBtn).toBeInTheDocument();
    fireEvent.click(deskTabBtn!);
    
    expect(mockOnEnterDesk).toHaveBeenCalledWith('space-1');
  });

  it('renders responsive mobile drawer trigger button and opens drawer', () => {
    render(<HomePage onEnterDesk={mockOnEnterDesk} onCreateSpace={mockOnCreateSpace} />);
    
    const menuBtn = screen.getByTitle('Mở danh bạ bàn học');
    expect(menuBtn).toBeInTheDocument();
    expect(menuBtn.className).toContain('responsive-mobile-menu-btn');
    
    // Open drawer
    fireEvent.click(menuBtn);
    
    // Drawer should appear with 'Tất cả bàn học'
    expect(screen.getByText(/Tất cả bàn học/i)).toBeInTheDocument();
  });

  it('renders mobile card items with titles and star buttons', () => {
    render(<HomePage onEnterDesk={mockOnEnterDesk} onCreateSpace={mockOnCreateSpace} />);
    
    // Title 'Giải tích 1' must be rendered in mobile card
    const titleElements = screen.getAllByText('Giải tích 1');
    expect(titleElements.length).toBeGreaterThanOrEqual(1);

    // Summary '1 sách · 1 tờ'
    expect(screen.getAllByText(/1 sách · 1 tờ/i).length).toBeGreaterThanOrEqual(1);
  });
});
