import { getSupabase } from '@/lib/supabase';
import { ViTokenWallet, ViTokenTransaction, TransactionType } from '@/types/vitoken';

const DEFAULT_WALLET: ViTokenWallet = {
  balance: 50,
  streakDays: 1,
  lastClaimDate: null,
  history: [
    {
      id: 'tx-welcome',
      type: 'signup_bonus',
      amount: 50,
      description: 'Quà tặng khởi đầu thành viên mới ViTudy',
      timestamp: new Date().toISOString(),
    },
  ],
};

export class ViTokenService {
  static async getWallet(userId: string): Promise<ViTokenWallet> {
    const supabase = getSupabase();
    if (!supabase || !userId) {
      return DEFAULT_WALLET;
    }

    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('email, vitoken_balance, daily_streak_days, last_claim_date')
        .eq('id', userId)
        .single();

      if (profileErr || !profile) {
        return DEFAULT_WALLET;
      }

      const balance = profile.vitoken_balance;

      const history = await this.getHistory(userId, 50);

      return {
        balance,
        streakDays: profile.daily_streak_days,
        lastClaimDate: profile.last_claim_date,
        history,
      };
    } catch (err) {
      console.warn('Lỗi getWallet từ Supabase Cloud:', err);
      return DEFAULT_WALLET;
    }
  }

  static async getHistory(userId: string, limit = 50): Promise<ViTokenTransaction[]> {
    const supabase = getSupabase();
    if (!supabase || !userId) return DEFAULT_WALLET.history;

    try {
      const { data, error } = await supabase
        .from('vitoken_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return DEFAULT_WALLET.history;

      return data.map(tx => ({
        id: tx.id,
        type: (tx.transaction_type as TransactionType) || 'daily_streak',
        amount: tx.amount,
        description: tx.description,
        timestamp: tx.created_at,
      }));
    } catch (err) {
      console.warn('Lỗi getHistory:', err);
      return DEFAULT_WALLET.history;
    }
  }

  static async claimStreak(): Promise<{ success: boolean; earned: number; streak: number; balanceAfter: number }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, earned: 0, streak: 1, balanceAfter: 50 };
    }

    try {
      const { data, error } = await supabase.rpc('claim_daily_streak');

      if (error || !data || data.length === 0) {
        return { success: false, earned: 0, streak: 1, balanceAfter: 50 };
      }

      const row = data[0];
      return {
        success: row.earned > 0,
        earned: row.earned,
        streak: row.streak,
        balanceAfter: row.balance_after,
      };
    } catch (err) {
      console.warn('Lỗi claimStreak qua RPC:', err);
      return { success: false, earned: 0, streak: 1, balanceAfter: 50 };
    }
  }

  static async spendTokensServer(
    amount: number,
    type: string,
    description: string,
    reference?: string
  ): Promise<{ success: boolean; balanceAfter?: number; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    try {
      const { data, error } = await supabase.rpc('spend_vitoken', {
        p_amount: amount,
        p_type: type,
        p_description: description,
        p_reference: reference || null,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, balanceAfter: typeof data === 'number' ? data : undefined };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }

  static async purchaseListing(listingId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !listingId) return false;

    try {
      const { data, error } = await supabase.rpc('process_know_inherit_purchase', {
        p_listing_id: listingId,
      });

      if (error) {
        throw error;
      }

      return Boolean(data);
    } catch (err: any) {
      console.warn('Lỗi purchaseListing qua RPC:', err);
      throw err;
    }
  }
}
