import { askAi, refundAiRequest } from '@/lib/aiClient';
import { getSupabase } from '@/lib/supabase';
import { AiConfig } from '@/types/vitoken';
import {
  BoardGamePackage,
  BoardGameTemplateId,
  BoardRuleMode,
  GameCardItem,
  ResourceDefinition,
  createBoardGameFromTemplate,
} from '@/types/boardgame';

export interface ValidatedAiDeckCard {
  title: string;
  description: string;
  effectType: 'money_delta' | 'move_steps' | 'skip_turn';
  effectValue: number;
}

export interface ValidatedAiTileItem {
  title: string;
  price: number;
  headerColor: string;
  baseRent: number;
  houseCost: number;
}

const MONEY_MIN = -2_000_000;
const MONEY_MAX = 2_000_000;
const PRICE_MAX = 10_000_000;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function extractJsonArray(raw: string): unknown[] | null {
  try {
    const trimmed = raw.trim();
    const start = trimmed.indexOf('[');
    const end = trimmed.lastIndexOf(']');
    if (start !== -1 && end > start) {
      const parsed = JSON.parse(trimmed.slice(start, end + 1));
      return Array.isArray(parsed) ? parsed : null;
    }
  } catch {}
  return null;
}

export function validateAiDeckCards(rawList: unknown): {
  valid: boolean;
  cards: ValidatedAiDeckCard[];
  errors: string[];
} {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return { valid: false, cards: [], errors: ['Dữ liệu thẻ phải là mảng không rỗng.'] };
  }

  const cards: ValidatedAiDeckCard[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i] as Record<string, unknown> | null;
    if (!item || typeof item !== 'object') {
      errors.push(`Phần tử #${i} không phải object.`);
      continue;
    }
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const description = typeof item.description === 'string' ? item.description.trim() : '';
    const effectType = item.effectType;
    const effectValue = Number(item.effectValue);

    if (!title || !description) {
      errors.push(`Thẻ #${i} thiếu title hoặc description.`);
      continue;
    }
    if (effectType !== 'money_delta' && effectType !== 'move_steps' && effectType !== 'skip_turn') {
      errors.push(`Thẻ #${i} có effectType không hợp lệ: ${String(effectType)}.`);
      continue;
    }
    if (!Number.isFinite(effectValue)) {
      errors.push(`Thẻ #${i} có effectValue không phải số.`);
      continue;
    }
    if (effectType === 'money_delta' && (effectValue < MONEY_MIN || effectValue > MONEY_MAX)) {
      errors.push(`Thẻ #${i} money_delta vượt ngưỡng [${MONEY_MIN}, ${MONEY_MAX}].`);
      continue;
    }
    if (effectType === 'move_steps' && (effectValue < -12 || effectValue > 12 || effectValue === 0)) {
      errors.push(`Thẻ #${i} move_steps vượt ngưỡng [-12, 12] hoặc bằng 0.`);
      continue;
    }
    if (effectType === 'skip_turn' && (effectValue < 1 || effectValue > 3)) {
      errors.push(`Thẻ #${i} skip_turn vượt ngưỡng [1, 3].`);
      continue;
    }

    cards.push({
      title,
      description,
      effectType,
      effectValue: Math.round(effectValue),
    });
  }

  return {
    valid: cards.length > 0 && errors.length === 0,
    cards,
    errors,
  };
}

export function validateAiTileItems(rawList: unknown): {
  valid: boolean;
  items: ValidatedAiTileItem[];
  errors: string[];
} {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return { valid: false, items: [], errors: ['Dữ liệu ô đất phải là mảng không rỗng.'] };
  }

  const items: ValidatedAiTileItem[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i] as Record<string, unknown> | null;
    if (!raw || typeof raw !== 'object') {
      errors.push(`Ô #${i} không phải object.`);
      continue;
    }
    const title = typeof raw.title === 'string' ? raw.title.trim() : '';
    const price = Number(raw.price);
    const baseRent = Number(raw.baseRent);
    const houseCost = Number(raw.houseCost);
    const headerColor = typeof raw.headerColor === 'string' ? raw.headerColor.trim() : '';

    if (!title) {
      errors.push(`Ô #${i} thiếu title.`);
      continue;
    }
    if (!Number.isFinite(price) || price < 0 || price > PRICE_MAX) {
      errors.push(`Ô #${i} có price không hợp lệ (${raw.price}).`);
      continue;
    }
    if (!Number.isFinite(baseRent) || baseRent < 0 || baseRent > price) {
      errors.push(`Ô #${i} có baseRent không hợp lệ (${raw.baseRent}).`);
      continue;
    }
    if (!Number.isFinite(houseCost) || houseCost < 0 || houseCost > PRICE_MAX) {
      errors.push(`Ô #${i} có houseCost không hợp lệ (${raw.houseCost}).`);
      continue;
    }
    if (!HEX_COLOR_RE.test(headerColor)) {
      errors.push(`Ô #${i} có headerColor không hợp lệ (${headerColor}).`);
      continue;
    }

    items.push({
      title,
      price: Math.round(price),
      headerColor,
      baseRent: Math.round(baseRent),
      houseCost: Math.round(houseCost),
    });
  }

  return {
    valid: items.length > 0 && errors.length === 0,
    items,
    errors,
  };
}

export async function fetchModelViTokenCost(model: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase || !model) return 1;
  try {
    const { data, error } = await supabase
      .from('ai_model_costs')
      .select('vitoken_cost, enabled')
      .eq('model', model)
      .maybeSingle();
    if (!error && data && typeof data.vitoken_cost === 'number') {
      return Math.max(0, data.vitoken_cost);
    }
  } catch {}
  return 1;
}

export async function generateBoardDeckWithAi(params: {
  deckName: string;
  topicPrompt: string;
  count: number;
  aiConfig: AiConfig;
  onBalanceUpdate?: (balanceAfter?: number) => void;
}): Promise<{ cards: GameCardItem[]; usedFallback: boolean; refunded?: boolean; requestId: string }> {
  const count = Math.max(4, Math.min(30, params.count));
  const requestId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `bg-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const basePrompt = `Bạn là nhà thiết kế Board Game chuyên nghiệp. Hãy tạo đúng ${count} thẻ bài cho bộ bài "${params.deckName}" với chủ đề: "${params.topicPrompt}".
Trả về DUY NHẤT một mảng JSON hợp lệ (không markdown, không giải thích thêm), mỗi phần tử có dạng:
{
  "title": "Tiêu đề ngắn gọn của thẻ",
  "description": "Nội dung sự kiện rõ ràng, thú vị",
  "effectType": "money_delta" | "move_steps" | "skip_turn",
  "effectValue": số nguyên (money_delta trong [-2000000, 2000000], move_steps trong [-12, 12] khác 0, skip_turn trong [1, 3])
}`;

  const modelName = params.aiConfig.model || 'gpt-4o-mini';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const prompt =
        attempt === 1
          ? basePrompt
          : `${basePrompt}\n\nCHÚ Ý QUAN TRỌNG: Lần trước JSON bị sai cấu trúc. Chỉ xuất đúng mảng JSON bắt đầu bằng '[' và kết thúc bằng ']'.`;

      const res = await askAi({
        provider: params.aiConfig.provider,
        model: modelName,
        prompt,
        context: `Tạo bộ bài board game "${params.deckName}"`,
        maxTokens: 2500,
        requestId,
      });

      const parsed = extractJsonArray(res.reply);
      const validation = validateAiDeckCards(parsed);
      if (validation.valid) {
        const cards: GameCardItem[] = validation.cards.slice(0, count).map((item, idx) => ({
          id: `card-${Date.now()}-${idx}`,
          title: item.title,
          description: item.description,
          effect: {
            type: item.effectType,
            value: item.effectValue,
          },
        }));

        if (typeof res.balanceAfter === 'number') {
          params.onBalanceUpdate?.(res.balanceAfter);
        }

        return { cards, usedFallback: false, requestId };
      }
    } catch {
      // Thử lại lần 2 hoặc fallback offline
    }
  }

  // Thất bại hẳn -> hoàn tiền idempotent phía server nếu đã trừ qua system provider
  let refunded = false;
  if (params.aiConfig.provider === 'system') {
    const refundRes = await refundAiRequest(requestId);
    refunded = refundRes.refunded;
    if (typeof refundRes.balanceAfter === 'number') {
      params.onBalanceUpdate?.(refundRes.balanceAfter);
    }
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

  return { cards, usedFallback: true, refunded, requestId };
}

export async function generateTilesContentWithAi(params: {
  tileCount: number;
  themePrompt: string;
  aiConfig: AiConfig;
  onBalanceUpdate?: (balanceAfter?: number) => void;
}): Promise<{
  items: ValidatedAiTileItem[];
  usedFallback: boolean;
  refunded?: boolean;
  requestId: string;
}> {
  const count = Math.max(1, params.tileCount);
  const requestId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `bg-tile-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const basePrompt = `Hãy thiết kế ${count} ô đất cho bàn cờ Board Game chủ đề: "${params.themePrompt}".
Trả về DUY NHẤT mảng JSON hợp lệ gồm ${count} phần tử:
{
  "title": "Tên địa điểm ngắn gọn",
  "price": số tiền mua >= 0 (bội số của 10000, từ 60000 đến 400000),
  "headerColor": mã màu hex 6 ký tự (VD: "#E0562D", "#2563eb", "#16a34a", "#9333ea", "#ca8a04"),
  "baseRent": tiền thuê cơ bản >= 0 và <= price,
  "houseCost": tiền nâng cấp 1 nhà >= 0
}`;

  const modelName = params.aiConfig.model || 'gpt-4o-mini';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const prompt =
        attempt === 1
          ? basePrompt
          : `${basePrompt}\n\nCHÚ Ý: JSON phải hợp lệ, price >= 0, baseRent <= price, headerColor là #RRGGBB.`;

      const res = await askAi({
        provider: params.aiConfig.provider,
        model: modelName,
        prompt,
        context: `Thiết kế ${count} ô đất Board Game`,
        maxTokens: 3000,
        requestId,
      });

      const parsed = extractJsonArray(res.reply);
      const validation = validateAiTileItems(parsed);
      if (validation.valid) {
        const items = Array.from({ length: count }, (_, idx) => {
          const validItem = validation.items[idx % validation.items.length];
          return { ...validItem };
        });

        if (typeof res.balanceAfter === 'number') {
          params.onBalanceUpdate?.(res.balanceAfter);
        }

        return { items, usedFallback: false, requestId };
      }
    } catch {
      // Retry / Fallback offline
    }
  }

  let refunded = false;
  if (params.aiConfig.provider === 'system') {
    const refundRes = await refundAiRequest(requestId);
    refunded = refundRes.refunded;
    if (typeof refundRes.balanceAfter === 'number') {
      params.onBalanceUpdate?.(refundRes.balanceAfter);
    }
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

  return { items, usedFallback: true, refunded, requestId };
}

export interface UniversalAiGameSpec {
  title: string;
  description: string;
  templateId: BoardGameTemplateId;
  ruleMode: BoardRuleMode;
  resources: ResourceDefinition[];
  cards: GameCardItem[];
  tileTitles: string[];
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const trimmed = raw.trim();
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(trimmed.slice(start, end + 1));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

const VALID_TEMPLATES: BoardGameTemplateId[] = [
  'monopoly',
  'grid_chess',
  'card_table',
  'hex_strategy',
  'node_track',
  'sandbox',
];
const VALID_MODES: BoardRuleMode[] = ['monopoly', 'turn_based', 'sandbox'];

/**
 * AI đồng thiết kế bất kỳ thể loại Board Game nào (thẻ bài, lục giác, cờ lưới, đường đua nút, sandbox).
 */
export async function generateUniversalGamePackWithAi(params: {
  prompt: string;
  aiConfig: AiConfig;
  boardId: string;
  onBalanceUpdate?: (balanceAfter?: number) => void;
}): Promise<{
  pkg: BoardGamePackage;
  usedFallback: boolean;
  refunded?: boolean;
  requestId: string;
}> {
  const requestId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `bg-univ-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const basePrompt = `Hãy thiết kế cấu trúc một Board Game theo ý tưởng: "${params.prompt}".
Trả về DUY NHẤT một JSON object hợp lệ:
{
  "title": "Tên trò chơi ngắn gọn",
  "description": "Mô tả luật chơi 1-2 câu",
  "templateId": "monopoly" | "grid_chess" | "card_table" | "hex_strategy" | "node_track" | "sandbox",
  "ruleMode": "monopoly" | "turn_based" | "sandbox",
  "resources": [{ "id": "hp", "name": "Máu", "unit": "HP", "color": "#dc2626", "initialAmount": 10 }],
  "cards": [{ "title": "Tên lá bài", "description": "Tác dụng lá bài", "color": "#2563eb" }],
  "tileTitles": ["Ô 1", "Ô 2"]
}`;

  const modelName = params.aiConfig.model || 'gpt-4o-mini';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const prompt =
        attempt === 1
          ? basePrompt
          : `${basePrompt}\n\nCHÚ Ý: Chỉ trả JSON object hợp lệ, templateId thuộc 6 giá trị trên, initialAmount >= 0.`;
      const res = await askAi({
        provider: params.aiConfig.provider,
        model: modelName,
        prompt,
        context: 'Thiết kế Board Game đa năng',
        maxTokens: 3000,
        requestId,
      });

      const obj = extractJsonObject(res.reply);
      if (obj && typeof obj.title === 'string' && obj.title.trim()) {
        const templateId = VALID_TEMPLATES.includes(obj.templateId as BoardGameTemplateId)
          ? (obj.templateId as BoardGameTemplateId)
          : 'sandbox';
        const ruleMode = VALID_MODES.includes(obj.ruleMode as BoardRuleMode)
          ? (obj.ruleMode as BoardRuleMode)
          : templateId === 'monopoly'
          ? 'monopoly'
          : 'turn_based';

        const basePkg = createBoardGameFromTemplate(templateId, params.boardId);
        const rawResources = Array.isArray(obj.resources) ? obj.resources : [];
        const resources: ResourceDefinition[] = rawResources
          .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'))
          .slice(0, 6)
          .map((r, idx) => ({
            id: typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `res-${idx + 1}`,
            name: typeof r.name === 'string' && r.name.trim() ? r.name.trim() : `Tài nguyên ${idx + 1}`,
            unit: typeof r.unit === 'string' ? r.unit : undefined,
            color: typeof r.color === 'string' && HEX_COLOR_RE.test(r.color) ? r.color : '#E0562D',
            initialAmount:
              typeof r.initialAmount === 'number' && Number.isFinite(r.initialAmount) && r.initialAmount >= 0
                ? Math.round(r.initialAmount)
                : 0,
          }));

        const rawCards = Array.isArray(obj.cards) ? obj.cards : [];
        const cards: GameCardItem[] = rawCards
          .filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object'))
          .slice(0, 16)
          .map((c, idx) => ({
            id: `card-ai-${Date.now()}-${idx}`,
            title: typeof c.title === 'string' && c.title.trim() ? c.title.trim() : `Lá ${idx + 1}`,
            description: typeof c.description === 'string' ? c.description.trim() : '',
            color: typeof c.color === 'string' && HEX_COLOR_RE.test(c.color) ? c.color : '#2563eb',
            faceUp: true,
          }));

        const rawTitles = Array.isArray(obj.tileTitles)
          ? obj.tileTitles.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
          : [];
        const tiles = basePkg.tiles.map((t, idx) =>
          rawTitles[idx] ? { ...t, title: rawTitles[idx].trim() } : t
        );

        const decks =
          cards.length > 0
            ? [
                {
                  id: `deck-ai-${Date.now()}`,
                  name: 'Bộ bài chính',
                  deckType: 'standard_deck' as const,
                  color: '#1e293b',
                  relX: 24,
                  relY: 24,
                  width: 96,
                  height: 128,
                  cards,
                },
              ]
            : basePkg.decks;

        if (typeof res.balanceAfter === 'number') {
          params.onBalanceUpdate?.(res.balanceAfter);
        }

        return {
          pkg: {
            ...basePkg,
            title: obj.title.trim(),
            description:
              typeof obj.description === 'string' && obj.description.trim()
                ? obj.description.trim()
                : basePkg.description,
            ruleMode,
            resources: resources.length > 0 ? resources : basePkg.resources,
            decks,
            tiles,
          },
          usedFallback: false,
          requestId,
        };
      }
    } catch {
      // Retry / Fallback
    }
  }

  let refunded = false;
  if (params.aiConfig.provider === 'system') {
    const refundRes = await refundAiRequest(requestId);
    refunded = refundRes.refunded;
    if (typeof refundRes.balanceAfter === 'number') {
      params.onBalanceUpdate?.(refundRes.balanceAfter);
    }
  }

  const lower = params.prompt.toLowerCase();
  const fallbackTemplate: BoardGameTemplateId = lower.includes('thẻ') || lower.includes('uno') || lower.includes('bài')
    ? 'card_table'
    : lower.includes('lục giác') || lower.includes('catan') || lower.includes('hex')
    ? 'hex_strategy'
    : lower.includes('cá ngựa') || lower.includes('rắn') || lower.includes('đua')
    ? 'node_track'
    : lower.includes('cờ') || lower.includes('caro')
    ? 'grid_chess'
    : 'sandbox';

  return {
    pkg: createBoardGameFromTemplate(fallbackTemplate, params.boardId),
    usedFallback: true,
    refunded,
    requestId,
  };
}
