import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudySpaceService, deskItemToRow, rowToDeskItem, ensureUUID } from './StudySpaceService';
import { DeskItem } from '@/types/studyspace';

describe('StudySpaceService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loadSpaces returns empty array when Supabase is not configured', async () => {
    const result = await StudySpaceService.loadSpaces('user-1');
    expect(result).toEqual([]);
  });

  it('mapper round-trip: converts DeskItem to DB row and back without data loss', () => {
    const sampleItem: DeskItem = {
      id: 'a0000000-0000-0000-0000-000000000001',
      type: 'book',
      title: 'Giáo Trình Trí Tuệ Nhân Tạo',
      x: 350,
      y: 200,
      rotation: 0,
      scale: 1,
      zIndex: 10,
      pageCount: 12,
      currentPageIndex: 2,
      pages: [
        { id: 'p-1', pageNumber: 1, title: 'Chương 1', text: 'Nội dung chương 1' },
      ],
      colorTheme: 'classic',
      coverColor: '#5c3920',
      isBinder: false,
      stickyText: undefined,
      stickyColor: undefined,
      textAlign: 'left',
      isBold: true,
      isExamSheet: false,
      width: 980,
      height: 640,
    };

    const row = deskItemToRow(sampleItem, 'space-123');
    const restored = rowToDeskItem(row as any, sampleItem.pages);

    expect(restored.id).toBe(sampleItem.id);
    expect(restored.type).toBe(sampleItem.type);
    expect(restored.title).toBe(sampleItem.title);
    expect(restored.coverColor).toBe(sampleItem.coverColor);
    expect(restored.width).toBe(sampleItem.width);
    expect(restored.height).toBe(sampleItem.height);
    expect(restored.pages).toEqual(sampleItem.pages);
  });

  it('ensureUUID is deterministic for legacy IDs and sticker/gif/emoji round-trips cleanly', () => {
    const u1 = ensureUUID('sticker-1731500000000');
    const u2 = ensureUUID('sticker-1731500000000');
    expect(u1).toBe(u2);
    expect(u1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);

    const emojiSticker: DeskItem = {
      id: 'sticker-1731500000000',
      type: 'sticker',
      title: 'Smile',
      x: 100,
      y: 200,
      rotation: 0,
      scale: 1,
      zIndex: 5,
      pageCount: 1,
      currentPageIndex: 0,
      pages: [],
      width: 100,
      height: 100,
      stickerData: { type: 'emoji', name: 'Smile', content: '😄', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f604.svg' },
    };

    const row = deskItemToRow(emojiSticker, 'space-123');
    const restored = rowToDeskItem(row as any, []);
    expect(restored.id).toBe(u1);
    expect(restored.stickerData).toEqual(emojiSticker.stickerData);
  });
});
