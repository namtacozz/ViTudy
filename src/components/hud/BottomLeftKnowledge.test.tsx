import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BottomLeftKnowledge } from './BottomLeftKnowledge';

vi.mock('@/context/StudySpaceContext', () => ({
  useStudySpace: () => ({
    activeSpace: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Bàn học test',
      subject: 'Toán',
      description: '',
      createdAt: '',
      updatedAt: '',
      items: [],
    },
    addUploadedDocument: vi.fn(),
    markSpaceShared: vi.fn(),
    saveCurrentSpaceImmediately: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseConfig: () => ({
    url: 'https://demo.supabase.co',
    anonKey: 'demo-anon-key',
    isConfigured: true,
  }),
  saveSupabaseConfig: vi.fn(),
  clearSupabaseConfig: vi.fn(),
  getSupabase: () => null,
}));

describe('BottomLeftKnowledge Share Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders official Zalo and Messenger logo buttons and displays test connection result', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    } as Response);

    render(<BottomLeftKnowledge />);

    // Open share modal via event
    fireEvent(window, new CustomEvent('vitudy:open-share-modal'));

    const zaloBtn = await screen.findByRole('button', { name: 'Chia sẻ qua Zalo' });
    const messengerBtn = screen.getByRole('button', { name: 'Chia sẻ qua Messenger' });
    expect(zaloBtn.querySelector('svg')).not.toBeNull();
    expect(messengerBtn.querySelector('svg')).not.toBeNull();

    // Open server config & click "Thử kết nối"
    fireEvent.click(screen.getByText('+ Cài đặt kết nối máy chủ nâng cao'));
    fireEvent.click(screen.getByRole('button', { name: 'Thử kết nối' }));

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain('Kết nối thành công!');
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://demo.supabase.co/rest/v1/',
      expect.objectContaining({
        headers: expect.objectContaining({ apikey: 'demo-anon-key' }),
      })
    );

    fetchSpy.mockRestore();
  });
});
