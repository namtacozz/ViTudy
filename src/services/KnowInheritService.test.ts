import { describe, it, expect } from 'vitest';
import { mapDbRowToMarketItem, DbListingRow } from './KnowInheritService';

describe('KnowInheritService', () => {
  it('maps database listing row to MarketItem with purchased state', () => {
    const row: DbListingRow = {
      id: '00000000-0000-4000-8000-000000000101',
      author_id: null,
      author_name: 'Wikipedia Tiếng Việt (CC BY-SA 4.0)',
      title: 'Giải tích toán học',
      subject: 'Toán học',
      doc_type: 'Giáo trình & Tổng hợp',
      tier: 'B',
      price: 15,
      quality_score: 86,
      preview_text: 'Giải tích toán học là một nhánh của toán học...',
      pages: [
        { pageNumber: 1, text: 'Trang 1' },
        { pageNumber: 2, text: 'Trang 2' },
        { pageNumber: 3, text: 'Trang 3' },
        { pageNumber: 4, text: 'Trang 4' },
        { pageNumber: 5, text: 'Trang 5' },
      ],
      downloads_count: 12,
      created_at: '2026-11-13T00:00:00.000Z',
    };

    const item = mapDbRowToMarketItem(row, new Set([row.id]));
    expect(item.id).toBe(row.id);
    expect(item.category).toBe('math');
    expect(item.type).toBe('book');
    expect(item.purchased).toBe(true);
    expect(item.pageCount).toBe(5);
  });
});
