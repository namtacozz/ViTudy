import { describe, it, expect } from 'vitest';
import type { DeskItem, DrawingStroke } from '@/types/studyspace';
import { segmentStrokeByDeskItems } from './strokeSegmentation';

function makeItem(partial: Partial<DeskItem> & Pick<DeskItem, 'id' | 'type' | 'x' | 'y'>): DeskItem {
  return {
    title: partial.id,
    rotation: 0,
    scale: 1,
    zIndex: 1,
    pageCount: 1,
    currentPageIndex: 0,
    pages: [],
    ...partial,
  };
}

describe('segmentStrokeByDeskItems', () => {
  it('splits a single stroke crossing paper -> desk -> book into 3 independent segments', () => {
    const paper = makeItem({ id: 'paper-1', type: 'paper', x: 0, y: 0, zIndex: 5 });
    const book = makeItem({ id: 'book-1', type: 'book', x: 500, y: 0, zIndex: 10 });

    const stroke: DrawingStroke = {
      id: 's-1',
      color: '#2563eb',
      width: 3.5,
      isHighlighter: false,
      points: [
        { x: 100, y: 100 }, // inside paper (0..360, 0..500)
        { x: 420, y: 100 }, // on bare desk (360..500)
        { x: 700, y: 100 }, // inside book (500..1480, 0..640)
      ],
    };

    let seq = 1;
    const segments = segmentStrokeByDeskItems(stroke, [paper, book], () => `seg-${++seq}`);

    expect(segments).toHaveLength(3);

    // 1. Paper segment
    expect(segments[0].attachedToItemId).toBe('paper-1');
    expect(segments[0].points[0]).toEqual({ x: 100, y: 100 });
    expect(segments[0].points[segments[0].points.length - 1].x).toBeLessThanOrEqual(360.5);

    // 2. Desk segment
    expect(segments[1].attachedToItemId).toBeUndefined();
    expect(segments[1].points[0].x).toBeGreaterThanOrEqual(359.5);
    expect(segments[1].points[segments[1].points.length - 1].x).toBeLessThanOrEqual(500.5);

    // 3. Book segment (local x relative to book.x=500)
    expect(segments[2].attachedToItemId).toBe('book-1');
    expect(segments[2].points[0].x).toBeGreaterThanOrEqual(-0.5);
    expect(segments[2].points[segments[2].points.length - 1]).toEqual({ x: 200, y: 100 });
  });

  it('assigns overlapping regions to the item with higher zIndex', () => {
    const bottomNote = makeItem({ id: 'note-low', type: 'sticky_note', x: 0, y: 0, width: 220, height: 200, zIndex: 1 });
    const topNote = makeItem({ id: 'note-high', type: 'sticky_note', x: 100, y: 0, width: 220, height: 200, zIndex: 20 });

    const stroke: DrawingStroke = {
      id: 's-2',
      color: '#000',
      width: 2,
      isHighlighter: false,
      points: [
        { x: 50, y: 50 },  // only in note-low
        { x: 150, y: 50 }, // overlap -> note-high wins
      ],
    };

    let seq = 1;
    const segments = segmentStrokeByDeskItems(stroke, [bottomNote, topNote], () => `seg-${++seq}`);

    expect(segments).toHaveLength(2);
    expect(segments[0].attachedToItemId).toBe('note-low');
    expect(segments[1].attachedToItemId).toBe('note-high');
    expect(segments[1].points[segments[1].points.length - 1]).toEqual({ x: 50, y: 50 });
  });
});
