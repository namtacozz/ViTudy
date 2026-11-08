import { getSupabase } from '@/lib/supabase';
import { MarketItem, INITIAL_MARKET_ITEMS } from '@/data/marketMockData';

export interface ListingReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export class MarketService {
  static async getListings(filters?: {
    category?: string;
    search?: string;
    sort?: 'newest' | 'score' | 'price_asc' | 'price_desc';
  }): Promise<MarketItem[]> {
    const supabase = getSupabase();
    let items: MarketItem[] = [...INITIAL_MARKET_ITEMS];

    if (supabase) {
      try {
        let query = supabase
          .from('know_inherit_listings')
          .select('*')
          .eq('status', 'published');

        if (filters?.category && filters.category !== 'all') {
          query = query.eq('tier', filters.category.toUpperCase());
        }

        if (filters?.search) {
          const safeSearch = filters.search.replace(/[%_]/g, '');
          query = query.or(`title.ilike.%${safeSearch}%,summary.ilike.%${safeSearch}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          // Merge database listings with mock listings
          const dbItems: MarketItem[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            author: d.author_name || 'Tác giả',
            aiScore: d.ai_score || 90,
            price: d.price || 15,
            type: d.item_type || 'book',
            category: d.tier?.toLowerCase() || 'ai_ml',
            date: new Date(d.created_at).toLocaleDateString('vi-VN'),
            summary: d.summary || '',
            previewText: d.preview_content || d.summary || '',
            pageCount: d.page_count || 1,
            downloadsCount: d.downloads_count || 0,
          }));
          items = [...dbItems, ...INITIAL_MARKET_ITEMS];
        }
      } catch {}
    }

    // Apply in-memory search and filter for fallback consistency
    if (filters?.category && filters.category !== 'all') {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (item) => item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q)
      );
    }

    // Sort
    if (filters?.sort === 'score') {
      items.sort((a, b) => b.aiScore - a.aiScore);
    } else if (filters?.sort === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (filters?.sort === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    }

    return items;
  }

  static async getPreview(listingId: string, userId?: string): Promise<{
    previewContent: string;
    totalPages: number;
    isOwned: boolean;
  }> {
    const supabase = getSupabase();
    let isOwned = false;

    if (supabase && userId) {
      try {
        const { data } = await supabase
          .from('know_inherit_purchases')
          .select('id')
          .eq('listing_id', listingId)
          .eq('buyer_id', userId)
          .maybeSingle();

        if (data) isOwned = true;
      } catch {}
    }

    const item = INITIAL_MARKET_ITEMS.find((i) => i.id === listingId);
    return {
      previewContent: item?.previewText || item?.summary || 'Nội dung xem trước bản quyền.',
      totalPages: item?.pages?.length || 1,
      isOwned,
    };
  }

  static async getReviews(listingId: string): Promise<ListingReview[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('listing_reviews')
        .select(`
          id,
          reviewer_id,
          rating,
          comment,
          created_at,
          profiles:reviewer_id (display_name, avatar_url)
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((d: any) => ({
        id: d.id,
        reviewerId: d.reviewer_id,
        reviewerName: d.profiles?.display_name || 'Người học',
        reviewerAvatar: d.profiles?.avatar_url || null,
        rating: d.rating,
        comment: d.comment || '',
        createdAt: d.created_at,
      }));
    } catch {
      return [];
    }
  }

  static async submitReview(listingId: string, rating: number, comment: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('listing_reviews').insert({
      listing_id: listingId,
      rating,
      comment: comment.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
