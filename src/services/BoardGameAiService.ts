import { askAi } from '@/lib/aiClient';
import { AiConfig } from '@/types/vitoken';
import { GameCardItem } from '@/types/boardgame';

function extractJsonArray(raw: string): any[] | null {
  try {
    const trimmed = raw.trim();
    const start = trimmed.indexOf('[');
    const end = trimmed.lastIndexOf(']');
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
  } catch {}
  return null;
}

export async function generateBoardDeckWithAi(params: {
  deckName: string;
  topicPrompt: string;
  count: number;
  aiConfig: AiConfig;
}): Promise<{ cards: GameCardItem[]; usedFallback: boolean }> {
  const count = Math.max(4, Math.min(30, params.count));
  const prompt = `Bạn là nhà thiết kế Board Game chuyên nghiệp. Hãy thu thập ý tưởng và tạo đúng ${count} thẻ bài cho bộ bài "${params.deckName}" với chủ đề: "${params.topicPrompt}".
Trả về DUY NHẤT một mảng JSON hợp lệ (không giải thích thêm), mỗi phần tử có dạng:
{
  "title": "Tiêu đề ngắn gọn của thẻ",
  "description": "Nội dung sự kiện rõ ràng, thú vị",
  "effectType": "money_delta" | "move_steps" | "skip_turn",
  "effectValue": số nguyên (VD: 50000, -20000, 3, -2, hoặc 1 nếu skip_turn)
}`;

  try {
    const res = await askAi({
      provider: params.aiConfig.provider,
      model: params.aiConfig.model,
      prompt,
      context: `Tạo bộ bài board game "${params.deckName}"`,
      maxTokens: 2500,
    });

    const parsed = extractJsonArray(res.reply);
    if (parsed && parsed.length > 0) {
      const cards: GameCardItem[] = parsed.slice(0, count).map((item, idx) => ({
        id: `card-${Date.now()}-${idx}`,
        title: String(item.title || `Thẻ ${idx + 1}`),
        description: String(item.description || 'Thực hiện hiệu ứng theo quy định.'),
        effect: {
          type:
            item.effectType === 'move_steps' || item.effectType === 'skip_turn'
              ? item.effectType
              : 'money_delta',
          value: typeof item.effectValue === 'number' ? item.effectValue : 20000,
        },
      }));
      return { cards, usedFallback: false };
    }
  } catch {
    // Fallback offline phía dưới
  }

  const isChance = params.deckName.toLowerCase().includes('cơ hội');
  const presets: Omit<GameCardItem, 'id'>[] = isChance
    ? [
        { title: 'Trúng thưởng học bổng', description: 'Nhận ngay 200.000đ từ Ngân hàng.', effect: { type: 'money_delta', value: 200000 } },
        { title: 'Tiến thẳng tới phía trước', description: 'Đi tiếp 3 bước tới ô kế tiếp.', effect: { type: 'move_steps', value: 3 } },
        { title: 'Hoàn thuế bất động sản', description: 'Ngân hàng hoàn lại 100.000đ.', effect: { type: 'money_delta', value: 100000 } },
        { title: 'Đầu tư sinh lời', description: 'Cổ tức cuối kỳ về ví: +150.000đ.', effect: { type: 'money_delta', value: 150000 } },
        { title: 'Tắc đường giờ cao điểm', description: 'Lùi lại 2 bước để tìm lối rẽ khác.', effect: { type: 'move_steps', value: -2 } },
        { title: 'Sửa chữa hệ thống', description: 'Đóng phí bảo trì 50.000đ cho Ngân hàng.', effect: { type: 'money_delta', value: -50000 } },
      ]
    : [
        { title: 'Khí vận hanh thông', description: 'Nhận 100.000đ tiền hỗ trợ khởi nghiệp.', effect: { type: 'money_delta', value: 100000 } },
        { title: 'Phí kiểm định tài sản', description: 'Nộp 50.000đ cho Ngân hàng.', effect: { type: 'money_delta', value: -50000 } },
        { title: 'Nhận quà sinh nhật', description: 'Ngân hàng tặng bạn 80.000đ.', effect: { type: 'money_delta', value: 80000 } },
        { title: 'Nghỉ ngơi thư giãn', description: 'Tạm dừng 1 lượt để hồi sức.', effect: { type: 'skip_turn', value: 1 } },
        { title: 'Thưởng sáng kiến', description: 'Nhận 120.000đ từ quỹ phát triển.', effect: { type: 'money_delta', value: 120000 } },
        { title: 'Đóng phạt trễ hạn', description: 'Trả 30.000đ vào Ngân hàng.', effect: { type: 'money_delta', value: -30000 } },
      ];

  const cards: GameCardItem[] = Array.from({ length: count }, (_, idx) => {
    const base = presets[idx % presets.length];
    return {
      id: `card-fb-${Date.now()}-${idx}`,
      ...base,
    };
  });

  return { cards, usedFallback: true };
}

export async function generateTilesContentWithAi(params: {
  tileCount: number;
  themePrompt: string;
  aiConfig: AiConfig;
}): Promise<{
  items: { title: string; price: number; headerColor: string; baseRent: number; houseCost: number }[];
  usedFallback: boolean;
}> {
  const count = Math.max(1, params.tileCount);
  const prompt = `Hãy thiết kế ${count} ô đất cho bàn cờ Board Game chủ đề: "${params.themePrompt}".
Trả về DUY NHẤT mảng JSON hợp lệ gồm ${count} phần tử:
{
  "title": "Tên địa điểm ngắn gọn",
  "price": số tiền mua (bội số của 10000, từ 60000 đến 400000),
  "headerColor": mã màu hex nổi bật (VD: "#E0562D", "#2563eb", "#16a34a", "#9333ea", "#ca8a04"),
  "baseRent": tiền thuê cơ bản (khoảng 10-20% giá mua),
  "houseCost": tiền nâng cấp 1 nhà (khoảng 50% giá mua)
}`;

  try {
    const res = await askAi({
      provider: params.aiConfig.provider,
      model: params.aiConfig.model,
      prompt,
      context: `Thiết kế ${count} ô đất Board Game`,
      maxTokens: 3000,
    });
    const parsed = extractJsonArray(res.reply);
    if (parsed && parsed.length > 0) {
      const items = Array.from({ length: count }, (_, idx) => {
        const raw = parsed[idx % parsed.length];
        const price = Math.max(10000, Number(raw.price) || (idx + 1) * 20000);
        return {
          title: String(raw.title || `Địa điểm ${idx + 1}`),
          price,
          headerColor: String(raw.headerColor || '#E0562D'),
          baseRent: Math.max(5000, Number(raw.baseRent) || Math.round(price * 0.15)),
          houseCost: Math.max(10000, Number(raw.houseCost) || Math.round(price * 0.5)),
        };
      });
      return { items, usedFallback: false };
    }
  } catch {
    // Fallback offline phía dưới
  }

  const vnPlaces = [
    'Hà Nội', 'Hải Phòng', 'Hạ Long', 'Sapa', 'Ninh Bình',
    'Thanh Hóa', 'Vinh', 'Huế', 'Đà Nẵng', 'Hội An',
    'Quy Nhơn', 'Nha Trang', 'Đà Lạt', 'Phan Thiết', 'Vũng Tàu',
    'TP.HCM', 'Cần Thơ', 'Phú Quốc', 'Côn Đảo', 'Buôn Ma Thuột',
    'Pleiku', 'Mỹ Tho', 'Bến Tre', 'Cà Mau', 'Đồng Tháp',
  ];
  const palette = ['#E0562D', '#2563eb', '#16a34a', '#9333ea', '#ca8a04', '#0891b2'];

  const items = Array.from({ length: count }, (_, idx) => {
    const price = 60000 + Math.floor(idx / 2) * 20000;
    return {
      title: vnPlaces[idx % vnPlaces.length],
      price,
      headerColor: palette[Math.floor(idx / Math.max(1, Math.ceil(count / palette.length))) % palette.length],
      baseRent: Math.round(price * 0.15),
      houseCost: Math.round(price * 0.5),
    };
  });

  return { items, usedFallback: true };
}
