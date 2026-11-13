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
  points: { x: number; y: number }[];
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
  | 'bank_zone';

export interface PropertyDetails {
  baseRent: number;
  houseCost: number;
  rentsByLevel: [number, number, number, number, number];
  resellValue: number;
  currentHouses: number;
  upgradeRuleText?: string;
}

export interface BoardTile {
  id: string;
  role: BoardTileRole;
  shape: 'square' | 'circle' | 'rect';
  gridRow?: number;
  gridCol?: number;
  relX: number;
  relY: number;
  width: number;
  height: number;
  hasFunction: boolean;
  form?: TileFormTemplate;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  price?: number;
  deckId?: string;
  diceConfig?: {
    diceCount: number;
    lastRollValues?: number[];
    rollTimestamp?: number;
  };
  propertyDetails?: PropertyDetails;
}

export type GameLinkType =
  | 'on_step_show_info'
  | 'on_step_draw_deck'
  | 'deed_ownership';

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
  effect?: GameCardEffect;
}

export interface GameCardDeck {
  id: string;
  name: string;
  deckType: 'draw_deck' | 'title_deeds';
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
  color: string;
  width: number;
  height: number;
  relX: number;
  relY: number;
  currentTileId?: string | null;
  controlledByUserId?: string | null;
}

export interface BankTransactionLog {
  id: string;
  timestamp: string;
  message: string;
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
}

export interface BoardGamePackage {
  id: string;
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
  mapConfig: {
    layoutMode: 'full_grid' | 'perimeter_ring';
    rows: number;
    cols: number;
    tileSize: number;
    width: number;
    height: number;
  };
  tiles: BoardTile[];
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
 * Sinh lưới ô vuông cho Map (Full Grid như Cờ vua/Caro hoặc Viền rỗng như Cờ tỷ phú).
 */
export function generateMapTiles(params: {
  layoutMode: 'full_grid' | 'perimeter_ring';
  rows: number;
  cols: number;
  totalWidth: number;
  totalHeight: number;
  hasFunction?: boolean;
}): BoardTile[] {
  const rows = Math.max(2, Math.min(20, params.rows));
  const cols = Math.max(2, Math.min(20, params.cols));
  const cellW = Math.round(params.totalWidth / cols);
  const cellH = Math.round(params.totalHeight / rows);
  const tiles: BoardTile[] = [];
  const hasFn = params.hasFunction ?? params.layoutMode === 'perimeter_ring';

  if (params.layoutMode === 'full_grid') {
    let idx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          id: `tile-${r}-${c}-${idx}`,
          role: 'normal_cell',
          shape: 'square',
          gridRow: r,
          gridCol: c,
          relX: c * cellW,
          relY: r * cellH,
          width: cellW,
          height: cellH,
          hasFunction: hasFn,
          title: hasFn ? `Ô ${idx}` : '',
        });
        idx++;
      }
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
    const defaultTitle =
      idx === 0
        ? 'Xuất phát'
        : isCorner
        ? `Góc ${idx + 1}`
        : `Ô đất ${idx}`;

    tiles.push({
      id: `tile-ring-${r}-${c}-${idx + 1}`,
      role: 'normal_cell',
      shape: 'square',
      gridRow: r,
      gridCol: c,
      relX: c * cellW,
      relY: r * cellH,
      width: cellW,
      height: cellH,
      hasFunction: hasFn,
      title: defaultTitle,
      price: isCorner || idx === 0 ? undefined : (idx % 5 + 1) * 50000,
      form: {
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
  layoutMode: 'full_grid' | 'perimeter_ring';
  rows: number;
  cols: number;
  width: number;
  height: number;
}): BoardGamePackage {
  const tiles = generateMapTiles({
    layoutMode: params.layoutMode,
    rows: params.rows,
    cols: params.cols,
    totalWidth: params.width,
    totalHeight: params.height,
  });

  const now = new Date().toISOString();
  return {
    id: params.id,
    title: params.layoutMode === 'perimeter_ring' ? 'Bàn Cờ Tỷ Phú Mới' : 'Bàn Cờ Chiến Thuật Mới',
    description: 'Board game tự thiết kế trên ViTudy Studio.',
    minPlayers: 2,
    maxPlayers: 4,
    createdAt: now,
    updatedAt: now,
    mapConfig: {
      layoutMode: params.layoutMode,
      rows: params.rows,
      cols: params.cols,
      tileSize: Math.round(params.width / params.cols),
      width: params.width,
      height: params.height,
    },
    tiles,
    decks: [],
    links: [],
    currencyDesigns: DEFAULT_VND_CURRENCIES,
    startingCashPerPlayer: 1800000,
    pawns: [],
    matchState: {
      isPlaying: false,
      playerBalances: {},
      playerNames: {},
      activeTriggeredInfoTileIds: [],
      lastDrawnCard: null,
      logs: [],
    },
  };
}
