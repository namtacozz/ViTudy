import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeftCreationBar } from './LeftCreationBar';
import { StickyNoteItemComponent } from '../objects/StickyNoteItem';
import { StudySpaceService } from '@/services/StudySpaceService';

vi.mock('@/context/ViTokenContext', () => ({
  useViToken: () => ({
    wallet: { balance: 50, streakDays: 1, lastClaimDate: '', history: [] },
    aiConfig: { provider: 'system', model: 'gpt-4o-mini' },
    spendTokens: vi.fn(),
    addTokens: vi.fn(),
    syncBalanceFromServer: vi.fn(),
  }),
}));

// Mock StudySpaceContext
const mockSetActiveTool = vi.fn();
const mockSetPenColor = vi.fn();
const mockSetPenWidthLevel = vi.fn();
const mockTogglePanLock = vi.fn();
const mockRemoveDeskItem = vi.fn();

let mockActiveTool = 'pen';
let mockPenColor = '#2563eb';

vi.mock('@/context/StudySpaceContext', () => ({
  useStudySpace: () => ({
    activeTool: mockActiveTool,
    setActiveTool: mockSetActiveTool,
    penColor: mockPenColor,
    setPenColor: mockSetPenColor,
    penWidthLevel: 'medium',
    setPenWidthLevel: mockSetPenWidthLevel,
    isPanLocked: false,
    togglePanLock: mockTogglePanLock,
    strokes: [],
    undoStroke: vi.fn(),
    redoStroke: vi.fn(),
    redoStack: [],
    clearStrokes: vi.fn(),
    isFingerDrawingEnabled: true,
    setIsFingerDrawingEnabled: vi.fn(),
    addStickyNote: vi.fn(),
    removeDeskItem: mockRemoveDeskItem,
    updateStickyNoteColor: vi.fn(),
    updateStickyNoteText: vi.fn(),
    bringToFront: vi.fn(),
    selectItem: vi.fn(),
    transform: { x: 0, y: 0, scale: 1 },
    isFocusMode: false,
  }),
}));

// Mock useDeskItemInteraction
vi.mock('@/hooks/useDeskItemInteraction', () => ({
  useDeskItemInteraction: () => ({
    isDragging: false,
    handleMouseDown: vi.fn(),
    handleRotateMouseDown: vi.fn(),
    handleRotateDoubleClick: vi.fn(),
  }),
}));

describe('LeftCreationBar Pen Color Palette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveTool = 'pen';
  });

  it('renders pen sub-toolbar with overflow-visible to prevent clipping palette', () => {
    render(<LeftCreationBar />);
    const penToolBtn = screen.getByTitle(/Bộ công cụ bút vẽ/i);
    // Mở pen flyout
    fireEvent.click(penToolBtn);

    // Tìm subpanel
    const colorBtn = screen.getByTitle(/Bấm để đổi màu nét vẽ \(Mở bảng 6 màu\)/i);
    expect(colorBtn).toBeDefined();

    // Container của sub-toolbar phải có class overflow-visible (không bị overflow-y-auto cắt xén)
    const subpanel = colorBtn.closest('.landscape-subpanel');
    expect(subpanel?.className).toContain('overflow-visible');
    expect(subpanel?.className).not.toContain('overflow-y-auto');
  });

  it('opens 6-color palette when color button is clicked and allows selecting a color', () => {
    render(<LeftCreationBar />);
    const penToolBtn = screen.getByTitle(/Bộ công cụ bút vẽ/i);
    fireEvent.click(penToolBtn);

    const colorBtn = screen.getByTitle(/Bấm để đổi màu nét vẽ \(Mở bảng 6 màu\)/i);
    fireEvent.click(colorBtn);

    // Bảng 6 màu phải hiển thị
    const redColorBtn = screen.getByTitle('Đỏ');
    expect(redColorBtn).toBeDefined();
    const greenColorBtn = screen.getByTitle('Xanh lá');
    expect(greenColorBtn).toBeDefined();

    // Nhấp chọn màu Đỏ
    fireEvent.click(redColorBtn);
    expect(mockSetPenColor).toHaveBeenCalledWith('#dc2626');
  });
});

describe('StickyNoteItem Quick Deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers removeDeskItem when Delete key is pressed on selected note outside textarea', () => {
    const dummyNote = {
      id: 'test-note-1',
      type: 'sticky_note' as const,
      title: 'Ghi chú',
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      zIndex: 10,
      pageCount: 1,
      currentPageIndex: 0,
      stickyColor: '#fef08a',
      stickyText: 'Học tập chăm chỉ',
      pages: [],
    };

    render(<StickyNoteItemComponent item={dummyNote} isSelected={true} />);

    // Nhấn Delete khi đang chọn ghi chú
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(mockRemoveDeskItem).toHaveBeenCalledWith('test-note-1');
  });

  it('does not trigger removeDeskItem when typing inside textarea', () => {
    const dummyNote = {
      id: 'test-note-2',
      type: 'sticky_note' as const,
      title: 'Ghi chú',
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      zIndex: 10,
      pageCount: 1,
      currentPageIndex: 0,
      stickyColor: '#fef08a',
      stickyText: 'Nội dung',
      pages: [],
    };

    render(<StickyNoteItemComponent item={dummyNote} isSelected={true} />);

    const textarea = screen.getByDisplayValue('Nội dung');
    textarea.focus();

    fireEvent.keyDown(textarea, { key: 'Delete' });
    expect(mockRemoveDeskItem).not.toHaveBeenCalled();
  });
});
