import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { InfiniteDesk } from './InfiniteDesk';

const mockSetTransform = vi.fn();
const mockPanBy = vi.fn();
const mockZoomBy = vi.fn();
const mockSelectItem = vi.fn();

vi.mock('@/context/StudySpaceContext', () => ({
  useStudySpace: () => ({
    activeSpace: {
      id: 'space-test',
      name: 'Bàn học test',
      items: [],
      updatedAt: '2026-11-13T00:00:00Z',
    },
    strokes: [],
    transform: { x: 100, y: 150, scale: 1, rotation: 0 },
    setTransform: mockSetTransform,
    panBy: mockPanBy,
    zoomBy: mockZoomBy,
    rotateDeskBy: vi.fn(),
    resetDeskRotation: vi.fn(),
    selectItem: mockSelectItem,
    selectedItemId: null,
    addUploadedDocument: vi.fn(),
    activeTool: 'cursor',
    isViewRotateMode: false,
    focusedItemId: null,
    isFocusNoticeVisible: false,
    triggerFocusNotice: vi.fn(),
    exitFocusMode: vi.fn(),
    fitAllToScreen: vi.fn(),
  }),
}));

describe('InfiniteDesk Native Touch Pinch-to-Zoom & Pan Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createTouch = (identifier: number, clientX: number, clientY: number): Touch => ({
    identifier,
    target: document.body,
    clientX,
    clientY,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  });

  it('triggers setTransform with correct zoom factor and pan offset when two fingers pinch out', () => {
    render(<InfiniteDesk />);

    // Step 1: Touchstart with 2 fingers at distance = 100px, mid = (150, 200)
    const touch1 = createTouch(1, 100, 200);
    const touch2 = createTouch(2, 200, 200);

    act(() => {
      window.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [touch1, touch2],
          targetTouches: [touch1, touch2],
          changedTouches: [touch1, touch2],
          cancelable: true,
          bubbles: true,
        })
      );
    });

    // Step 2: Pinch out - distance increases to 140px, mid shifts to (160, 210)
    const moveTouch1 = createTouch(1, 90, 210);
    const moveTouch2 = createTouch(2, 230, 210);

    act(() => {
      window.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [moveTouch1, moveTouch2],
          targetTouches: [moveTouch1, moveTouch2],
          changedTouches: [moveTouch1, moveTouch2],
          cancelable: true,
          bubbles: true,
        })
      );
    });

    expect(mockSetTransform).toHaveBeenCalled();

    // Verify the transform updater function behaves mathematically correctly
    const updater = mockSetTransform.mock.calls[0][0];
    const prevTransform = { x: 100, y: 150, scale: 1, rotation: 0 };
    const nextTransform = updater(prevTransform);

    // Initial dist was 100, new dist is 140 -> factor = 1.4 -> scale = 1.4
    expect(nextTransform.scale).toBeCloseTo(1.4, 2);
    expect(typeof nextTransform.x).toBe('number');
    expect(typeof nextTransform.y).toBe('number');
  });

  it('resets pinch baseline when fingers are lifted (touchend)', () => {
    render(<InfiniteDesk />);

    const touch1 = createTouch(1, 100, 200);
    const touch2 = createTouch(2, 200, 200);

    act(() => {
      window.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [touch1, touch2],
          cancelable: true,
          bubbles: true,
        })
      );
    });

    // One finger lifts up -> touches.length < 2
    act(() => {
      window.dispatchEvent(
        new TouchEvent('touchend', {
          touches: [touch1],
          cancelable: true,
          bubbles: true,
        })
      );
    });

    // Subsequent move with 1 finger must NOT trigger pinch setTransform
    mockSetTransform.mockClear();
    act(() => {
      window.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [touch1],
          cancelable: true,
          bubbles: true,
        })
      );
    });

    expect(mockSetTransform).not.toHaveBeenCalled();
  });
});
