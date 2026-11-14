export type VndDenomination =
  | 1000
  | 2000
  | 5000
  | 10000
  | 20000
  | 50000
  | 100000
  | 200000
  | 500000;

export interface CurrencyNoteDesign {
  denomination: VndDenomination;
  label: string;
  colorHex: string;
  accentHex: string;
  customImageUrl?: string;
}

export const DEFAULT_VND_CURRENCIES: CurrencyNoteDesign[] = [
  { denomination: 1000, label: '1k', colorHex: '#d4c5a9', accentHex: '#6b5b3e' },
  { denomination: 2000, label: '2k', colorHex: '#cbd5e1', accentHex: '#475569' },
  { denomination: 5000, label: '5k', colorHex: '#bfdbfe', accentHex: '#1d4ed8' },
  { denomination: 10000, label: '10k', colorHex: '#fef08a', accentHex: '#a16207' },
  { denomination: 20000, label: '20k', colorHex: '#bae6fd', accentHex: '#0369a1' },
  { denomination: 50000, label: '50k', colorHex: '#fbcfe8', accentHex: '#be185d' },
  { denomination: 100000, label: '100k', colorHex: '#bbf7d0', accentHex: '#15803d' },
  { denomination: 200000, label: '200k', colorHex: '#fed7aa', accentHex: '#c2410c' },
  { denomination: 500000, label: '500k', colorHex: '#c7d2fe', accentHex: '#4338ca' },
];

export interface ArtboardStroke {
  id: string;
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  width: number;
  opacity?: number;
  tool: 'pen' | 'brush' | 'eraser' | 'line' | 'rect' | 'circle';
}

export interface ArtboardImageLayer {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  visible?: boolean;
}

export interface SavedDrawingAsset {
  id: string;
  name: string;
  dataUrl: string;
  strokes: ArtboardStroke[];
  images: ArtboardImageLayer[];
  backgroundColor: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface TileFormTemplate {
  hasHeader: boolean;
  headerBgColor: string;
  hasBodyImage: boolean;
  hasFooterPrice: boolean;
  borderStyle: 'solid' | 'dashed';
}

export type BoardTileRole =
  | 'normal_cell'
  | 'draw_card_tile'
  | 'dice_drop_zone'
  | 'external_info'
  | 'bank_zone'
  | 'start_tile'
  | 'jail_tile'
  | 'penalty_tile'
  | 'card_zone'
  | 'supply_zone'
  | 'track_node';

export type BoardRuleMode = 'monopoly' | 'sandbox' | 'turn_based';

export type BoardMapLayoutMode =
  | 'full_grid'
  | 'perimeter_ring'
  | 'hex_grid'
  | 'node_graph'
  | 'card_table'
  | 'freeform';

export type BoardGameTemplateId =
  | 'monopoly'
  | 'grid_chess'
  | 'card_table'
  | 'hex_strategy'
  | 'node_track'
  | 'sandbox';

export interface ResourceDefinition {
  id: string;
  name: string;
  unit?: string;
  color: string;
  initialAmount: number;
}

export interface GameTriggerRule {
  id: string;
  label?: string;
  when: 'on_enter_tile' | 'on_roll_value' | 'on_play_card';
  sourceTileId?: string;
  rollValue?: number;
  action:
    | 'teleport'
    | 'resource_delta'
    | 'draw_cards'
    | 'skip_turn'
    | 'reverse_turn'
    | 'extra_turn';
  targetTileId?: string;
  resourceId?: string;
  amount?: number;
}

export interface PropertyDetails {
  baseRent: number;
  houseCost: number;
  rentsByLevel: [number, number, number, number, number];
  resellValue: number;
  currentHouses: number;
  isMortgaged?: boolean;
  upgradeRuleText?: string;
}

export type BoardShape =
  | 'square'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hex'
  | 'octagon';

export const BOARD_SHAPE_OPTIONS: { id: BoardShape; label: string }[] = [
  { id: 'square', label: 'Vuông' },
  { id: 'rect', label: 'Chữ nhật' },
  { id: 'circle', label: 'Tròn' },
  { id: 'triangle', label: 'Tam giác' },
  { id: 'diamond', label: 'Tứ giác thoi' },
  { id: 'pentagon', label: 'Ngũ giác' },
  { id: 'hex', label: 'Lục giác' },
  { id: 'octagon', label: 'Bát giác' },
];

export function getBoardShapeClipPath(shape?: BoardShape): string | undefined {
  switch (shape) {
    case 'triangle':
      return 'polygon(50% 0%, 0% 100%, 100% 100%)';
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    case 'pentagon':
      return 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
    case 'hex':
      return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    case 'octagon':
      return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
    default:
      return undefined;
  }
}

export interface TileCustomField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'badge';
  showOnTile?: boolean;
}

export interface TileTemplatePreset {
  id: string;
  name: string;
  shape: BoardShape;
  hasFunction: boolean;
  form: TileFormTemplate;
  customFields: TileCustomField[];
  createdAt: string;
}

export interface BoardTile {
  id: string;
  role: BoardTileRole;
  shape: BoardShape;
  gridRow?: number;
  gridCol?: number;
  relX: number;
  relY: number;
  width: number;
  height: number;
  hasFunction: boolean;
  form?: TileFormTemplate;
  customFields?: TileCustomField[];
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  price?: number;
  penaltyAmount?: number;
  jailTurns?: number;
  deckId?: string;
  nextTileIds?: string[];
  zoneType?: 'draw_pile' | 'discard_pile' | 'play_area' | 'supply';
  diceConfig?: {
    diceCount: number;
    diceSides?: number;
    perDieSides?: number[];
    diceColor?: string;
    labelColor?: string;
    lastRollValues?: number[];
    rollTimestamp?: number;
  };
  propertyDetails?: PropertyDetails;
}

export type GameLinkType =
  | 'on_step_show_info'
  | 'on_step_draw_deck'
  | 'deed_ownership'
  | 'graph_edge'
  | 'teleport_link';

export interface GameNodeLink {
  id: string;
  sourceId: string;
  targetId: string;
  linkType: GameLinkType;
}

export interface GameCardEffect {
  type: 'money_delta' | 'move_steps' | 'skip_turn' | 'custom';
  value?: number;
}

export interface GameCardItem {
  id: string;
  title: string;
  description: string;
  linkedTileId?: string;
  ownerPlayerId?: string | null;
  faceUp?: boolean;
  tapped?: boolean;
  color?: string;
  effect?: GameCardEffect;
}

export interface TableCardInstance {
  instanceId: string;
  card: GameCardItem;
  deckId: string;
  ownerPawnId?: string | null;
  zoneTileId?: string;
  relX: number;
  relY: number;
  faceUp: boolean;
  tapped?: boolean;
}

export interface GameCardDeck {
  id: string;
  name: string;
  deckType: 'draw_deck' | 'title_deeds' | 'standard_deck';
  color: string;
  relX: number;
  relY: number;
  width: number;
  height: number;
  cards: GameCardItem[];
}

export interface GamePawn {
  id: string;
  name: string;
  drawingAssetId?: string;
  imageUrl: string;
  backImageUrl?: string;
  color: string;
  width: number;
  height: number;
  relX: number;
  relY: number;
  currentTileId?: string | null;
  controlledByUserId?: string | null;
  isInfiniteSupply?: boolean;
  faceUp?: boolean;
  stackCount?: number;
}

export interface BankTransactionLog {
  id: string;
  timestamp: string;
  message: string;
  fromId?: string;
  toId?: string;
  amount?: number;
  reason?: string;
}

export interface MatchSnapshot {
  playerBalances: Record<string, Record<VndDenomination, number>>;
  pawns: GamePawn[];
  tiles: BoardTile[];
  tileTemplates?: TileTemplatePreset[];
  decks: GameCardDeck[];
  currentTurnIndex: number;
  turnPhase: 'roll' | 'action' | 'ended';
  jailTurnsRemaining: Record<string, number>;
  bankruptPlayerIds: string[];
  winnerId: string | null;
  lastDiceRoll?: { values: number[]; total: number; rolledAt: number } | null;
  lastDrawnCard?: {
    deckId: string;
    deckName: string;
    card: GameCardItem;
    drawnAt: number;
  } | null;
  ledgerChecksum?: string;
}

export interface BoardGameMatchState {
  isPlaying: boolean;
  playerBalances: Record<string, Record<VndDenomination, number>>;
  playerNames: Record<string, string>;
  activeTriggeredInfoTileIds: string[];
  lastDrawnCard?: {
    deckId: string;
    deckName: string;
    card: GameCardItem;
    drawnAt: number;
  } | null;
  logs: BankTransactionLog[];
  turnOrder?: string[];
  currentTurnIndex?: number;
  turnDirection?: 1 | -1;
  turnPhase?: 'roll' | 'action' | 'ended';
  lastDiceRoll?: { values: number[]; total: number; rolledAt: number } | null;
  jailTurnsRemaining?: Record<string, number>;
  bankruptPlayerIds?: string[];
  winnerId?: string | null;
  passStartSalary?: number;
  ledgerChecksum?: string;
  freeDragMode?: boolean;
  playerHands?: Record<string, GameCardItem[]>;
  tableCards?: TableCardInstance[];
  playerResources?: Record<string, Record<string, number>>;
  undoStack?: MatchSnapshot[];
  redoStack?: MatchSnapshot[];
}

export interface BoardGamePackage {
  id: string;
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  ruleMode?: BoardRuleMode;
  templateId?: BoardGameTemplateId;
  resources?: ResourceDefinition[];
  triggerRules?: GameTriggerRule[];
  createdAt: string;
  updatedAt: string;
  mapConfig: {
    layoutMode: BoardMapLayoutMode;
    mapShape?: BoardShape;
    rows: number;
    cols: number;
    tileSize: number;
    width: number;
    height: number;
    backgroundImageUrl?: string;
  };
  tiles: BoardTile[];
  tileTemplates?: TileTemplatePreset[];
  decks: GameCardDeck[];
  links: GameNodeLink[];
  currencyDesigns: CurrencyNoteDesign[];
  startingCashPerPlayer: number;
  pawns: GamePawn[];
  matchState: BoardGameMatchState;
}

export type GamePenTool =
  | 'select'
  | 'create_map'
  | 'create_tile'
  | 'create_dice'
  | 'create_draw_tile'
  | 'create_external_info'
  | 'create_bank'
  | 'create_deck'
  | 'connect_nodes'
  | 'place_pawn';

export function createEmptyBalance(): Record<VndDenomination, number> {
  return {
    1000: 0,
    2000: 0,
    5000: 0,
    10000: 0,
    20000: 0,
    50000: 0,
    100000: 0,
    200000: 0,
    500000: 0,
  };
}

export function createStarterVndBalance(): Record<VndDenomination, number> {
  return {
    1000: 5,
    2000: 5,
    5000: 4,
    10000: 5,
    20000: 5,
    50000: 4,
    100000: 3,
    200000: 2,
    500000: 2,
  };
}

export function calculateBalanceTotal(balance: Partial<Record<VndDenomination, number>> | undefined): number {
  if (!balance) return 0;
  return (Object.entries(balance) as [string, number][]).reduce((sum, [denom, count]) => {
    return sum + Number(denom) * (count || 0);
  }, 0);
}

/**
 * Tự động đổi số tiền thành các tờ tiền Việt Nam hợp lý (greedy từ 500k xuống 1k).
 */
export function breakAmountIntoVndNotes(amount: number): Record<VndDenomination, number> {
  const result = createEmptyBalance();
  let remaining = Math.max(0, Math.round(amount / 1000) * 1000);
  const denoms: VndDenomination[] = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];
  for (const d of denoms) {
    if (remaining >= d) {
      const cnt = Math.floor(remaining / d);
      result[d] = cnt;
      remaining -= cnt * d;
    }
  }
  return result;
}

/**
 * Sinh lưới ô cho Map:
 * - full_grid: Lưới ô vuông đầy đủ (Cờ vua, Caro, Cờ vây)
 * - perimeter_ring: Đường viền khép kín (Cờ tỷ phú)
 * - hex_grid: Lưới lục giác so le (Catan, Chiến thuật lục giác)
 * - node_graph: Đồ thị các nút nối nhau (Rắn leo thang, Cá ngựa, Đường đua)
 * - card_table: Bàn đấu thẻ bài (Chồng rút, Chồng bỏ, Khu vực ra bài)
 * - freeform: Bàn trống tự do
 */
export function generateMapTiles(params: {
  layoutMode: BoardMapLayoutMode;
  rows: number;
  cols: number;
  totalWidth: number;
  totalHeight: number;
  hasFunction?: boolean;
  blank?: boolean;
  tileShape?: BoardShape;
  mapShape?: BoardShape;
}): BoardTile[] {
  const rows = Math.max(2, Math.min(20, params.rows));
  const cols = Math.max(2, Math.min(20, params.cols));
  const cellW = Math.round(params.totalWidth / cols);
  const cellH = Math.round(params.totalHeight / rows);
  const tiles: BoardTile[] = [];
  const isBlank = Boolean(params.blank);
  const tileShape: BoardShape = params.tileShape || 'square';
  const hasFn = params.hasFunction ?? (isBlank ? false : params.layoutMode === 'perimeter_ring');

  if (params.layoutMode === 'freeform') {
    return [];
  }

  if (params.layoutMode === 'card_table') {
    const padX = Math.round(params.totalWidth * 0.06);
    const padY = Math.round(params.totalHeight * 0.08);
    const zoneW = Math.round(params.totalWidth * 0.24);
    const zoneH = Math.round(params.totalHeight * 0.34);
    return [
      {
        id: 'zone-draw-pile',
        role: 'card_zone',
        zoneType: 'draw_pile',
        shape: 'rect',
        gridRow: 0,
        gridCol: 0,
        relX: padX,
        relY: padY,
        width: zoneW,
        height: zoneH,
        hasFunction: true,
        title: 'Chồng rút bài',
        content: 'Bấm để rút bài lên tay',
        form: {
          hasHeader: true,
          headerBgColor: '#2563eb',
          hasBodyImage: false,
          hasFooterPrice: false,
          borderStyle: 'dashed',
        },
      },
      {
        id: 'zone-play-area',
        role: 'card_zone',
        zoneType: 'play_area',
        shape: 'rect',
        gridRow: 0,
        gridCol: 1,
        relX: padX + zoneW + 24,
        relY: padY,
        width: Math.round(params.totalWidth * 0.36),
        height: Math.round(params.totalHeight * 0.62),
        hasFunction: true,
        title: 'Khu vực đánh bài',
        content: 'Thả hoặc đánh lá bài ra bàn',
        form: {
          hasHeader: true,
          headerBgColor: '#E0562D',
          hasBodyImage: false,
          hasFooterPrice: false,
          borderStyle: 'solid',
        },
      },
      {
        id: 'zone-discard-pile',
        role: 'card_zone',
        zoneType: 'discard_pile',
        shape: 'rect',
        gridRow: 0,
        gridCol: 2,
        relX: params.totalWidth - padX - zoneW,
        relY: padY,
        width: zoneW,
        height: zoneH,
        hasFunction: true,
        title: 'Chồng bài bỏ',
        content: 'Các lá bài đã dùng',
        form: {
          hasHeader: true,
          headerBgColor: '#475569',
          hasBodyImage: false,
          hasFooterPrice: false,
          borderStyle: 'dashed',
        },
      },
    ];
  }

  if (params.layoutMode === 'hex_grid') {
    const hexW = Math.round((params.totalWidth * 0.88) / (cols + 0.5));
    const hexH = Math.round(hexW * 0.92);
    const startX = Math.round((params.totalWidth - (cols + 0.5) * hexW * 0.82) / 2);
    const startY = Math.round((params.totalHeight - rows * hexH * 0.78) / 2);
    const hexColors = ['#16a34a', '#ca8a04', '#ea580c', '#0284c7', '#65a30d', '#9333ea'];
    let idx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offsetX = r % 2 === 1 ? Math.round(hexW * 0.42) : 0;
        tiles.push({
          id: `tile-hex-${r}-${c}-${idx}`,
          role: 'normal_cell',
          shape: 'hex',
          gridRow: r,
          gridCol: c,
          relX: Math.max(0, startX + Math.round(c * hexW * 0.84) + offsetX),
          relY: Math.max(0, startY + Math.round(r * hexH * 0.75)),
          width: hexW,
          height: hexH,
          hasFunction: true,
          title: `Vùng ${idx}`,
          form: {
            hasHeader: true,
            headerBgColor: hexColors[(r + c) % hexColors.length],
            hasBodyImage: false,
            hasFooterPrice: false,
            borderStyle: 'solid',
          },
        });
        idx++;
      }
    }
    return tiles;
  }

  if (params.layoutMode === 'node_graph') {
    const count = Math.max(6, Math.min(24, rows * 2 + cols));
    const nodeSize = Math.max(46, Math.min(72, Math.round(Math.min(params.totalWidth, params.totalHeight) / 8)));
    const centerX = params.totalWidth / 2;
    const centerY = params.totalHeight / 2;
    const rx = params.totalWidth * 0.36;
    const ry = params.totalHeight * 0.34;
    const nodeIds = Array.from({ length: count }, (_, idx) => `node-track-${idx + 1}`);
    nodeIds.forEach((id, idx) => {
      const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const relX = Math.round(centerX + Math.cos(angle) * rx - nodeSize / 2);
      const relY = Math.round(centerY + Math.sin(angle) * ry - nodeSize / 2);
      const nextId = nodeIds[(idx + 1) % count];
      tiles.push({
        id,
        role: 'track_node',
        shape: 'circle',
        gridRow: Math.floor(idx / cols),
        gridCol: idx % cols,
        relX: Math.max(8, Math.min(params.totalWidth - nodeSize - 8, relX)),
        relY: Math.max(8, Math.min(params.totalHeight - nodeSize - 8, relY)),
        width: nodeSize,
        height: nodeSize,
        hasFunction: true,
        nextTileIds: [nextId],
        title: idx === 0 ? 'Bắt đầu' : `Nút ${idx + 1}`,
        form: {
          hasHeader: true,
          headerBgColor: idx === 0 ? '#E0562D' : ['#2563eb', '#16a34a', '#9333ea', '#ca8a04'][idx % 4],
          hasBodyImage: false,
          hasFooterPrice: false,
          borderStyle: 'solid',
        },
      });
    });
    return tiles;
  }

  if (params.layoutMode === 'full_grid') {
    let idx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          id: `tile-${r}-${c}-${idx}`,
          role: 'normal_cell',
          shape: tileShape,
          gridRow: r,
          gridCol: c,
          relX: c * cellW,
          relY: r * cellH,
          width: cellW,
          height: cellH,
          hasFunction: hasFn,
          title: isBlank ? '' : hasFn ? `Ô ${idx}` : '',
          form: isBlank
            ? {
                hasHeader: false,
                headerBgColor: '#ffffff',
                hasBodyImage: false,
                hasFooterPrice: false,
                borderStyle: 'solid',
              }
            : undefined,
        });
        idx++;
      }
    }
    return tiles;
  }

  // Nếu mapShape là đa giác đều hoặc hình tròn -> phân bố các ô quanh chu vi đa giác/vòng tròn đó
  const polySides: Record<string, number> = {
    triangle: 3,
    diamond: 4,
    pentagon: 5,
    hex: 6,
    octagon: 8,
  };
  if (params.mapShape && (params.mapShape === 'circle' || polySides[params.mapShape])) {
    const ringCount = Math.max(8, (rows + cols - 2) * 2);
    const tileW = Math.max(38, Math.min(cellW, cellH, 64));
    const tileH = tileW;
    const cx = params.totalWidth / 2;
    const cy = params.totalHeight / 2;
    const rx = Math.max(40, params.totalWidth / 2 - tileW * 0.72);
    const ry = Math.max(40, params.totalHeight / 2 - tileH * 0.72);
    const sides = polySides[params.mapShape];

    for (let i = 0; i < ringCount; i++) {
      let x = cx;
      let y = cy;
      if (!sides) {
        const theta = (i / ringCount) * Math.PI * 2 - Math.PI / 2;
        x = cx + Math.cos(theta) * rx;
        y = cy + Math.sin(theta) * ry;
      } else {
        const perSide = ringCount / sides;
        const sideIdx = Math.min(sides - 1, Math.floor(i / perSide));
        const t = (i - sideIdx * perSide) / perSide;
        const a1 = (sideIdx / sides) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((sideIdx + 1) / sides) * Math.PI * 2 - Math.PI / 2;
        const p1x = cx + Math.cos(a1) * rx;
        const p1y = cy + Math.sin(a1) * ry;
        const p2x = cx + Math.cos(a2) * rx;
        const p2y = cy + Math.sin(a2) * ry;
        x = p1x + (p2x - p1x) * t;
        y = p1y + (p2y - p1y) * t;
      }

      tiles.push({
        id: `tile-poly-${i + 1}`,
        role: 'normal_cell',
        shape: tileShape,
        gridRow: 0,
        gridCol: i,
        relX: Math.round(x - tileW / 2),
        relY: Math.round(y - tileH / 2),
        width: tileW,
        height: tileH,
        hasFunction: hasFn,
        title: isBlank ? '' : `Ô ${i + 1}`,
        form: {
          hasHeader: !isBlank,
          headerBgColor: isBlank ? '#ffffff' : '#E0562D',
          hasBodyImage: false,
          hasFooterPrice: false,
          borderStyle: 'solid',
        },
      });
    }
    return tiles;
  }

  // Perimeter ring: chạy theo chiều kim đồng hồ từ góc dưới-phải (hoặc trên-trái)
  const coords: { r: number; c: number }[] = [];
  for (let c = cols - 1; c >= 0; c--) coords.push({ r: rows - 1, c });
  for (let r = rows - 2; r >= 0; r--) coords.push({ r, c: 0 });
  for (let c = 1; c < cols; c++) coords.push({ r: 0, c });
  for (let r = 1; r < rows - 1; r++) coords.push({ r, c: cols - 1 });

  coords.forEach(({ r, c }, idx) => {
    const isCorner =
      (r === 0 || r === rows - 1) && (c === 0 || c === cols - 1);
    const defaultTitle = isBlank
      ? ''
      : idx === 0
      ? 'Xuất phát'
      : isCorner
      ? `Góc ${idx + 1}`
      : `Ô đất ${idx}`;

    tiles.push({
      id: `tile-ring-${r}-${c}-${idx + 1}`,
      role: 'normal_cell',
      shape: tileShape,
      gridRow: r,
      gridCol: c,
      relX: c * cellW,
      relY: r * cellH,
      width: cellW,
      height: cellH,
      hasFunction: hasFn,
      title: defaultTitle,
      price: isBlank || isCorner || idx === 0 ? undefined : (idx % 5 + 1) * 50000,
      form: isBlank
        ? {
            hasHeader: false,
            headerBgColor: '#ffffff',
            hasBodyImage: false,
            hasFooterPrice: false,
            borderStyle: 'solid',
          }
        : {
            hasHeader: !isCorner && idx !== 0,
            headerBgColor: ['#E0562D', '#2563eb', '#16a34a', '#9333ea', '#ca8a04'][
              Math.floor(idx / Math.max(1, Math.floor(coords.length / 5))) % 5
            ],
            hasBodyImage: false,
            hasFooterPrice: !isCorner && idx !== 0,
            borderStyle: 'solid',
          },
    });
  });

  return tiles;
}

export function createDefaultBoardGamePackage(params: {
  id: string;
  layoutMode: BoardMapLayoutMode;
  rows: number;
  cols: number;
  width: number;
  height: number;
  blank?: boolean;
  mapShape?: BoardShape;
  tileShape?: BoardShape;
}): BoardGamePackage {
  const isBlank = Boolean(params.blank);
  const tiles = generateMapTiles({
    layoutMode: params.layoutMode,
    rows: params.rows,
    cols: params.cols,
    totalWidth: params.width,
    totalHeight: params.height,
    blank: isBlank,
    tileShape: params.tileShape,
    mapShape: params.mapShape,
  });

  const now = new Date().toISOString();
  const isMonopoly = !isBlank && params.layoutMode === 'perimeter_ring';
  return {
    id: params.id,
    title: isBlank
      ? 'Board Game chưa đặt tên'
      : isMonopoly
      ? 'Bàn Cờ Tỷ Phú Mới'
      : 'Bàn Cờ Đa Năng Mới',
    description: isBlank
      ? 'Không gian bàn chơi tùy biến tự do.'
      : 'Board game tự thiết kế trên ViTudy Studio.',
    ruleMode: isBlank ? 'sandbox' : isMonopoly ? 'monopoly' : 'sandbox',
    templateId: isBlank ? 'sandbox' : isMonopoly ? 'monopoly' : 'sandbox',
    minPlayers: 2,
    maxPlayers: 4,
    createdAt: now,
    updatedAt: now,
    mapConfig: {
      layoutMode: params.layoutMode,
      mapShape: params.mapShape || 'square',
      rows: params.rows,
      cols: params.cols,
      tileSize: Math.round(params.width / params.cols),
      width: params.width,
      height: params.height,
    },
    tiles,
    decks: [],
    links: [],
    resources: [],
    triggerRules: [],
    currencyDesigns: DEFAULT_VND_CURRENCIES,
    startingCashPerPlayer: 1800000,
    pawns: [],
    matchState: {
      isPlaying: false,
      turnDirection: 1,
      playerBalances: {},
      playerNames: {},
      playerHands: {},
      tableCards: [],
      playerResources: {},
      activeTriggeredInfoTileIds: [],
      lastDrawnCard: null,
      logs: [],
    },
  };
}

/**
 * Tạo nhanh gói Board Game theo 6 mẫu thể loại chuẩn (Mọi Board Game).
 */
export function createBoardGameFromTemplate(
  templateId: BoardGameTemplateId,
  id: string,
  dims: { width?: number; height?: number } = {}
): BoardGamePackage {
  const width = dims.width ?? 760;
  const height = dims.height ?? 560;

  if (templateId === 'monopoly') {
    const pkg = createDefaultBoardGamePackage({
      id,
      layoutMode: 'perimeter_ring',
      rows: 7,
      cols: 7,
      width,
      height,
    });
    return { ...pkg, templateId: 'monopoly', ruleMode: 'monopoly' };
  }

  if (templateId === 'grid_chess') {
    const pkg = createDefaultBoardGamePackage({
      id,
      layoutMode: 'full_grid',
      rows: 8,
      cols: 8,
      width,
      height,
    });
    const supplyX: GamePawn = {
      id: `pawn-supply-x-${id}`,
      name: 'Quân X',
      imageUrl: '',
      color: '#E0562D',
      width: 28,
      height: 28,
      relX: 24,
      relY: 24,
      isInfiniteSupply: true,
      faceUp: true,
    };
    const supplyO: GamePawn = {
      id: `pawn-supply-o-${id}`,
      name: 'Quân O',
      imageUrl: '',
      color: '#2563eb',
      width: 28,
      height: 28,
      relX: 72,
      relY: 24,
      isInfiniteSupply: true,
      faceUp: true,
    };
    return {
      ...pkg,
      title: 'Bàn Cờ Lưới (Cờ Vua / Caro / Cờ Vây)',
      description: 'Lưới ô vuông 8x8 kèm nguồn quân vô tận có thể nhân bản và lật mặt.',
      templateId: 'grid_chess',
      ruleMode: 'turn_based',
      pawns: [supplyX, supplyO],
      resources: [
        { id: 'score', name: 'Điểm', unit: 'đ', color: '#E0562D', initialAmount: 0 },
      ],
    };
  }

  if (templateId === 'card_table') {
    const pkg = createDefaultBoardGamePackage({
      id,
      layoutMode: 'card_table',
      rows: 4,
      cols: 4,
      width,
      height,
    });
    const deckId = `deck-standard-${id}`;
    const sampleCards: GameCardItem[] = [
      { id: `c-1-${id}`, title: 'Tấn công +2', description: 'Gây 2 sát thương hoặc đối thủ rút 2 lá.', color: '#E0562D', faceUp: true },
      { id: `c-2-${id}`, title: 'Đảo chiều', description: 'Đổi chiều lượt chơi hiện tại.', color: '#2563eb', faceUp: true },
      { id: `c-3-${id}`, title: 'Phòng thủ', description: 'Chặn 1 đòn tấn công trong lượt này.', color: '#16a34a', faceUp: true },
      { id: `c-4-${id}`, title: 'Rút thêm 2', description: 'Rút 2 lá từ chồng rút bài.', color: '#9333ea', faceUp: true },
      { id: `c-5-${id}`, title: 'Bỏ lượt', description: 'Người kế tiếp bị mất lượt.', color: '#ca8a04', faceUp: true },
      { id: `c-6-${id}`, title: 'Đổi màu / Luật', description: 'Chọn lại điều kiện bàn chơi.', color: '#0f172a', faceUp: true },
    ];
    return {
      ...pkg,
      title: 'Bàn Đấu Thẻ Bài (UNO / TCG / Mèo Nổ)',
      description: 'Có tay bài bí mật từng người, chồng rút, khu vực đánh bài và lật/xoay lá.',
      templateId: 'card_table',
      ruleMode: 'turn_based',
      decks: [
        {
          id: deckId,
          name: 'Bộ bài chính',
          deckType: 'standard_deck',
          color: '#1e293b',
          relX: 24,
          relY: 24,
          width: 96,
          height: 128,
          cards: sampleCards,
        },
      ],
      pawns: [
        { id: `pawn-p1-${id}`, name: 'Người chơi 1', imageUrl: '', color: '#E0562D', width: 28, height: 28, relX: 120, relY: height - 56, faceUp: true },
        { id: `pawn-p2-${id}`, name: 'Người chơi 2', imageUrl: '', color: '#2563eb', width: 28, height: 28, relX: width - 150, relY: height - 56, faceUp: true },
      ],
      resources: [
        { id: 'hp', name: 'Máu (HP)', unit: 'HP', color: '#dc2626', initialAmount: 10 },
        { id: 'mana', name: 'Năng lượng', unit: 'MP', color: '#2563eb', initialAmount: 3 },
      ],
    };
  }

  if (templateId === 'hex_strategy') {
    const pkg = createDefaultBoardGamePackage({
      id,
      layoutMode: 'hex_grid',
      rows: 5,
      cols: 6,
      width,
      height,
    });
    return {
      ...pkg,
      title: 'Chiến Thuật Lục Giác (Catan / Wargame)',
      description: 'Bản đồ lục giác so le kèm bộ đếm tài nguyên đa dạng.',
      templateId: 'hex_strategy',
      ruleMode: 'turn_based',
      pawns: [
        { id: `pawn-hex-1-${id}`, name: 'Đội Đỏ', imageUrl: '', color: '#E0562D', width: 28, height: 28, relX: 160, relY: 160, faceUp: true },
        { id: `pawn-hex-2-${id}`, name: 'Đội Xanh', imageUrl: '', color: '#2563eb', width: 28, height: 28, relX: 460, relY: 320, faceUp: true },
      ],
      resources: [
        { id: 'wood', name: 'Gỗ', color: '#16a34a', initialAmount: 2 },
        { id: 'ore', name: 'Quặng', color: '#475569', initialAmount: 1 },
        { id: 'vp', name: 'Điểm thắng', unit: 'VP', color: '#E0562D', initialAmount: 0 },
      ],
    };
  }

  if (templateId === 'node_track') {
    const pkg = createDefaultBoardGamePackage({
      id,
      layoutMode: 'node_graph',
      rows: 4,
      cols: 5,
      width,
      height,
    });
    const links: GameNodeLink[] = pkg.tiles.slice(0, -1).map((t, idx) => ({
      id: `link-track-${idx + 1}`,
      sourceId: t.id,
      targetId: pkg.tiles[idx + 1].id,
      linkType: 'graph_edge',
    }));
    const firstTile = pkg.tiles[0];
    return {
      ...pkg,
      title: 'Đường Đua Nút (Cá Ngựa / Rắn Leo Thang)',
      description: 'Di chuyển theo các nút nối tiếp và kích hoạt luật Nếu–Thì.',
      templateId: 'node_track',
      ruleMode: 'turn_based',
      links,
      pawns: [
        {
          id: `pawn-track-1-${id}`,
          name: 'Tay đua 1',
          imageUrl: '',
          color: '#E0562D',
          width: 26,
          height: 26,
          relX: (firstTile?.relX ?? 100) + 8,
          relY: (firstTile?.relY ?? 100) + 8,
          currentTileId: firstTile?.id,
          faceUp: true,
        },
        {
          id: `pawn-track-2-${id}`,
          name: 'Tay đua 2',
          imageUrl: '',
          color: '#2563eb',
          width: 26,
          height: 26,
          relX: (firstTile?.relX ?? 100) + 24,
          relY: (firstTile?.relY ?? 100) + 20,
          currentTileId: firstTile?.id,
          faceUp: true,
        },
      ],
      resources: [
        { id: 'vp', name: 'Điểm', color: '#E0562D', initialAmount: 0 },
      ],
    };
  }

  // sandbox
  const pkg = createDefaultBoardGamePackage({
    id,
    layoutMode: 'freeform',
    rows: 4,
    cols: 4,
    width,
    height,
  });
  return {
    ...pkg,
    title: 'Bàn Chơi Tự Do (Sandbox)',
    description: 'Bàn trống không ràng buộc: kéo thả quân, tung xúc xắc, rút thẻ và tự đặt luật.',
    templateId: 'sandbox',
    ruleMode: 'sandbox',
    pawns: [
      { id: `pawn-sb-1-${id}`, name: 'Quân 1', imageUrl: '', color: '#E0562D', width: 28, height: 28, relX: 120, relY: 120, faceUp: true },
      { id: `pawn-sb-2-${id}`, name: 'Quân 2', imageUrl: '', color: '#2563eb', width: 28, height: 28, relX: 180, relY: 120, faceUp: true },
    ],
  };
}
