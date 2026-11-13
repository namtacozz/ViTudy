import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FloatingPet } from './FloatingPet';
import { calculateStage, calculateDaysToNextStage } from './stages';

// Mock hook usePet
const mockCheckin = vi.fn();
let mockStatus = {
  current_streak: 5,
  longest_streak: 12,
  checked_in_today: false,
  stage: 2,
  unlocked_stages: [1, 2, 3],
  days_to_next_stage: 6,
};
let mockLoading = false;

vi.mock('./usePet', () => ({
  usePet: () => ({
    status: mockStatus,
    loading: mockLoading,
    checkin: mockCheckin,
    isCheckingIn: false,
    evolutionModalData: null,
    closeEvolutionModal: vi.fn(),
    fetchStatus: vi.fn(),
  }),
}));

describe('Streak Pet Stages & Helpers', () => {
  it('calculates stages accurately according to streak day ranges', () => {
    // Stage 1: 0 - 3 days
    expect(calculateStage(0)).toBe(1);
    expect(calculateStage(3)).toBe(1);

    // Stage 2: 4 - 10 days
    expect(calculateStage(4)).toBe(2);
    expect(calculateStage(10)).toBe(2);

    // Stage 3: 11 - 100 days
    expect(calculateStage(11)).toBe(3);
    expect(calculateStage(100)).toBe(3);

    // Stage 4: 101+ days
    expect(calculateStage(101)).toBe(4);
    expect(calculateStage(365)).toBe(4);
  });

  it('calculates days remaining until the next evolution', () => {
    // Current streak 2 (Stage 1: 0-3) -> Next stage 2 is at 4 -> 4 - 2 = 2 days
    expect(calculateDaysToNextStage(2)).toBe(2);

    // Current streak 8 (Stage 2: 4-10) -> Next stage 3 is at 11 -> 11 - 8 = 3 days
    expect(calculateDaysToNextStage(8)).toBe(3);

    // Current streak 101+ (Stage 4 max) -> null
    expect(calculateDaysToNextStage(105)).toBeNull();
  });
});

describe('FloatingPet Widget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockStatus = {
      current_streak: 5,
      longest_streak: 12,
      checked_in_today: false,
      stage: 2,
      unlocked_stages: [1, 2, 3],
      days_to_next_stage: 6,
    };
  });

  it('renders pet streak badge and sleep image when not checked in', () => {
    render(<FloatingPet />);
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('🔥')).toBeDefined();

    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('sleep-stage2.png');
  });

  it('triggers checkin when tapped while asleep (movement under 6px)', async () => {
    render(<FloatingPet />);
    const petContainer = screen.getByTitle('Bấm để đánh thức và điểm danh hôm nay');

    // Simulate tap: pointerDown -> pointerUp at the exact same coordinates (movement = 0px)
    fireEvent.pointerDown(petContainer, { clientX: 200, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(petContainer, { clientX: 200, clientY: 300, pointerId: 1 });

    expect(mockCheckin).toHaveBeenCalledTimes(1);
  });

  it('opens PetGalleryModal when tapped while awake', () => {
    mockStatus.checked_in_today = true;
    render(<FloatingPet />);

    const petContainer = screen.getByTitle('Bấm để xem bộ sưu tập');
    fireEvent.pointerDown(petContainer, { clientX: 200, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(petContainer, { clientX: 200, clientY: 300, pointerId: 1 });

    expect(screen.getByText('Bộ Sưu Tập Thú Cưng')).toBeDefined();
    expect(screen.getByText(/Kỷ lục chuỗi bền bỉ nhất/)).toBeDefined();
  });
});
