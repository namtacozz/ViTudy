import { getSupabase } from '@/lib/supabase';
import type { MarketItem } from '@/data/marketMockData';

export interface DbListingRow {
  id: string;
  author_id: string | null;
  author_name: string | null;
  title: string;
  summary: string | null;
  subject: string | null;
  doc_type: string | null;
  tier: 'C' | 'B' | 'A' | 'S';
  price: number;
  ai_quality_score: number;
  preview_content: string | null;
  pages: Array<{ pageNumber?: number; title?: string; text: string }> | null;
  created_at: string;
}

function mapSubjectToCategory(subject: string | null): MarketItem['category'] {
  const s = (subject || '').toLowerCase();
  if (s.includes('toán') || s.includes('xác suất') || s.includes('giải tích')) return 'math';
  if (s.includes('ai') || s.includes('trí tuệ') || s.includes('học máy')) return 'ai_ml';
  if (s.includes('dữ liệu') && !s.includes('công nghệ thông tin')) return 'data';
  if (s.includes('phần mềm') || s.includes('kinh tế')) return 'software';
  return 'cs';
}

function mapDocTypeToItemType(docType: string | null, pageCount: number): MarketItem['type'] {
  if (docType === 'exam') return 'exam';
  if (docType === 'paper') return 'paper';
  if (docType === 'book') return 'book';
  return pageCount > 0 && pageCount < 5 ? 'paper' : 'book';
}

function formatDateVN(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '01/01/2026';
  }
}

export function mapDbRowToMarketItem(row: DbListingRow, purchasedIds: Set<string>): MarketItem {
  const rawPages = Array.isArray(row.pages) ? row.pages : [];
  const mappedPages = rawPages.map((p, idx) => ({
    title: p.title || `Trang ${p.pageNumber || idx + 1}`,
    text: p.text || '',
  }));
  const preview = row.preview_content || row.summary || '';

  return {
    id: row.id,
    title: row.title,
    author: row.author_name || 'Thành viên ViTudy',
    authorId: row.author_id || undefined,
    aiScore: row.ai_quality_score,
    price: row.price,
    type: mapDocTypeToItemType(row.doc_type, mappedPages.length),
    category: mapSubjectToCategory(row.subject),
    date: formatDateVN(row.created_at),
    summary: row.summary || preview.slice(0, 180) + (preview.length > 180 ? '...' : ''),
    previewText: preview,
    purchased: purchasedIds.has(row.id),
    pages: mappedPages,
    pageCount: mappedPages.length || 1,
    downloadsCount: 0,
    updatedDate: formatDateVN(row.created_at),
    isAuthorVerified: true,
    aiReviewCount: 1,
  };
}

export const KnowInheritService = {
  async fetchPublishedListings(userId?: string | null): Promise<{ items: MarketItem[]; fromServer: boolean }> {
    const supabase = getSupabase();
    if (!supabase) return { items: [], fromServer: false };

    try {
      const [{ data: listings, error }, purchasedRes] = await Promise.all([
        supabase
          .from('know_inherit_listings')
          .select('id, author_id, author_name, title, summary, subject, doc_type, tier, price, ai_quality_score, preview_content, pages, created_at')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(60),
        userId
          ? supabase
              .from('know_inherit_purchases')
              .select('listing_id')
              .eq('buyer_id', userId)
          : Promise.resolve({ data: [] as Array<{ listing_id: string }>, error: null }),
      ]);

      if (error || !listings) {
        return { items: [], fromServer: false };
      }

      const purchasedIds = new Set<string>(
        (purchasedRes.data || []).map((p: { listing_id: string }) => p.listing_id)
      );

      return {
        items: (listings as DbListingRow[]).map((row) => mapDbRowToMarketItem(row, purchasedIds)),
        fromServer: true,
      };
    } catch {
      return { items: [], fromServer: false };
    }
  },

  async publishListing(params: {
    title: string;
    summary: string;
    subject: string;
    docType: 'paper' | 'book' | 'exam';
    authorName: string;
    previewText: string;
    pages: Array<{ pageNumber: number; title?: string; text: string }>;
  }): Promise<{ ok: boolean; listing?: MarketItem; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { ok: false, error: 'Chưa kết nối cơ sở dữ liệu Supabase.' };
    }

    const { data: listingId, error } = await supabase.rpc('publish_know_inherit_listing', {
      p_title: params.title,
      p_summary: params.summary,
      p_doc_type: params.docType,
      p_subject: params.subject,
      p_author_name: params.authorName,
      p_preview_content: params.previewText,
      p_pages: params.pages,
    });

    if (error || !listingId) {
      return { ok: false, error: error?.message || 'Không thể đăng bán tài liệu lên máy chủ.' };
    }

    const { data: createdRow } = await supabase
      .from('know_inherit_listings')
      .select('id, author_id, author_name, title, summary, subject, doc_type, tier, price, ai_quality_score, preview_content, pages, created_at')
      .eq('id', listingId)
      .maybeSingle();

    if (createdRow) {
      const item = mapDbRowToMarketItem(createdRow as DbListingRow, new Set([createdRow.id]));
      item.purchased = true;
      return { ok: true, listing: item };
    }

    return { ok: true };
  },
};
