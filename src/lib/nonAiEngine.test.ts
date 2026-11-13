import { describe, it, expect } from 'vitest';
import { extractOutlineAndRoadmap, summarizeWithTextRank } from './nonAiEngine';

describe('nonAiEngine', () => {
  it('estimates reading duration at 200 words per minute', () => {
    const words600 = Array.from({ length: 600 }, (_, i) => `từ${i}`).join(' ');
    const steps = extractOutlineAndRoadmap([{ title: 'Chương 1', text: words600 }]);
    expect(steps).toHaveLength(1);
    expect(steps[0].estimatedMinutes).toBe(3);
  });

  it('summarizes Vietnamese academic text using compound terms', () => {
    const text = [
      'Giải tích toán học nghiên cứu hàm số liên tục và giới hạn trên tập số thực.',
      'Đạo hàm của hàm số biểu diễn tốc độ biến thiên tức thời tại một điểm.',
      'Tích phân xác định cho phép tính diện tích hình phẳng giới hạn bởi đường cong.',
      'Ngoài ra các bài toán vật lý cũng dùng đạo hàm và tích phân để tính vận tốc.',
      'Hôm nay trời khá mát mẻ và dễ chịu.',
    ].join(' ');

    const summary = summarizeWithTextRank(text, 2);
    expect(summary).toHaveLength(2);
  });
});
