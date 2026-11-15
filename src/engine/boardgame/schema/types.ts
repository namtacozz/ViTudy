export type EntityId = string;

export interface Ref {
  $ref: EntityId;
}

export type FieldValue = number | string | boolean | Ref;

export function isRef(val: unknown): val is Ref {
  return (
    typeof val === 'object' &&
    val !== null &&
    '$ref' in val &&
    typeof (val as Ref).$ref === 'string'
  );
}

export type ZoneLayout = 'grid' | 'hex' | 'graph' | 'stack' | 'list' | 'free';
export type ZoneVisibility = 'public' | 'owner' | 'hidden';

export interface ZoneCoords {
  row: number;
  col: number;
  x?: number;
  y?: number;
}

export interface Zone {
  id: EntityId;
  name: string;
  layout: ZoneLayout;
  slots?: number;
  rows?: number;
  cols?: number;
  coords?: ZoneCoords;
  neighbors?: EntityId[];
  visibility: ZoneVisibility;
  ownerId?: EntityId | null;
  tags: string[];
  fields: Record<string, FieldValue>;
}

export interface PieceFace {
  label: string;
  imageUrl?: string;
  color?: string;
  data?: Record<string, FieldValue>;
}

export interface Piece {
  id: EntityId;
  name: string;
  faces: PieceFace[];
  activeFace: number;
  rotation: number;
  zoneId: EntityId | null;
  slot?: number;
  ownerId?: EntityId | null;
  hidden?: boolean;
  tags: string[];
  fields: Record<string, FieldValue>;
}

export type CounterScope = 'global' | 'player' | 'zone' | 'piece';
export type CounterKind = 'scalar' | 'denominated';

export interface CounterDef {
  id: EntityId;
  name: string;
  scope: CounterScope;
  kind: CounterKind;
  denominations?: number[];
  min?: number;
  max?: number;
  initial: number;
  tags: string[];
  fields: Record<string, FieldValue>;
}

export type RandomizerKind = 'dice' | 'shuffle' | 'spinner';

export interface RandomizerDef {
  id: EntityId;
  name: string;
  kind: RandomizerKind;
  sides?: number[];
  options?: string[];
  tags: string[];
  fields: Record<string, FieldValue>;
}

export interface PlayerDef {
  id: EntityId;
  name: string;
  seat: number;
  team?: string;
  handZoneId?: EntityId;
  eliminated?: boolean;
  tags: string[];
  fields: Record<string, FieldValue>;
}

export interface TurnPhaseDef {
  id: string;
  name: string;
  allowedActions?: ActionType[];
  allowedButtons?: string[];
}

export interface TurnConfig {
  phases: TurnPhaseDef[];
  initialPhase: string;
}

export type ExprOp =
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'and'
  | 'or'
  | 'not'
  | 'in';

export type ExprFn =
  | 'counter'
  | 'field'
  | 'tag_has'
  | 'count'
  | 'sum'
  | 'any'
  | 'all'
  | 'neighbors'
  | 'line_of'
  | 'in_zone'
  | 'distance'
  | 'zone_pieces'
  | 'zone_of'
  | 'owner_of'
  | 'piece_of'
  | 'track_step'
  | 'track_passed'
  | 'dice_is_double'
  | 'active_players'
  | 'len'
  | 'get';

export type Expr =
  | number
  | string
  | boolean
  | null
  | { ref: string }
  | { var: string }
  | { op: ExprOp; args: Expr[] }
  | { fn: ExprFn; args: Expr[] };

export type TriggerType =
  | 'game_start'
  | 'turn_start'
  | 'turn_end'
  | 'phase_enter'
  | 'piece_enter'
  | 'piece_leave'
  | 'dice_rolled'
  | 'card_played'
  | 'counter_changed'
  | 'button_pressed'
  | 'zone_empty'
  | 'rule_fired';

export type ActionType =
  | 'move_piece'
  | 'draw'
  | 'discard'
  | 'shuffle'
  | 'deal'
  | 'transfer'
  | 'set_counter'
  | 'set_field'
  | 'set_owner'
  | 'spawn'
  | 'destroy'
  | 'flip'
  | 'rotate'
  | 'roll'
  | 'skip_turn'
  | 'extra_turn'
  | 'reverse_order'
  | 'set_phase'
  | 'next_turn'
  | 'prompt_choice'
  | 'prompt_pick'
  | 'show_panel'
  | 'end_game'
  | 'run_rule'
  | 'log';

export interface ActionSpec {
  type: ActionType;
  params: Record<string, Expr | unknown>;
}

export interface RuleScope {
  tag?: string;
  entityId?: EntityId;
}

export interface Rule {
  id: EntityId;
  name?: string;
  trigger: TriggerType;
  scope?: RuleScope;
  priority: number;
  condition?: Expr;
  actions: ActionSpec[];
  enabled?: boolean;
}

export interface UIButtonBinding {
  id: string;
  label: string;
  phases?: string[];
  condition?: Expr;
  ruleId?: EntityId;
}

export interface UIPanelBinding {
  id: string;
  title: string;
  template: string;
}

export interface UIBinding {
  panels: UIPanelBinding[];
  buttons: UIButtonBinding[];
  cardFaces?: Record<string, { frontColor?: string; backColor?: string }>;
}

export interface WinConfig {
  scoreCounterId?: EntityId;
  tieBreaker?: 'highest' | 'lowest';
}

export interface GamePackageV2 {
  schemaVersion: 2;
  id: EntityId;
  title: string;
  description: string;
  zones: Zone[];
  pieces: Piece[];
  counters: CounterDef[];
  randomizers: RandomizerDef[];
  players: PlayerDef[];
  turnConfig: TurnConfig;
  rules: Rule[];
  ui: UIBinding;
  winConfig?: WinConfig;
}

export interface PendingOption {
  id: string;
  label: string;
  value: unknown;
}

export interface PendingInput {
  id: string;
  playerId: EntityId;
  kind: 'choice' | 'pick';
  prompt: string;
  options: PendingOption[];
  targetKey: string;
  resumeQueue: QueuedItem[];
}

export interface EngineEvent {
  type: TriggerType;
  actorId?: EntityId | null;
  entityId?: EntityId | null;
  targetId?: EntityId | null;
  data?: Record<string, unknown>;
}

export interface UIPanelInstance {
  id: string;
  title: string;
  body: string;
  targetPlayerId?: EntityId | null;
}

export interface BankTransactionLogEntry {
  id: string;
  tick: number;
  fromId: EntityId | null;
  toId: EntityId | null;
  counterId: EntityId;
  amount: number;
  reason: string;
  notes?: Record<number, number>;
}

export interface ActionLogEntry {
  seq: number;
  tick: number;
  playerId: EntityId | null;
  action: GameAction;
  checksumAfter?: string;
}

export interface TurnState {
  order: EntityId[];
  currentIndex: number;
  direction: 1 | -1;
  phase: string;
  round: number;
  skippedPlayers: Record<EntityId, number>;
  extraTurns: Record<EntityId, number>;
}

export interface EngineState {
  schemaVersion: 2;
  packageId: EntityId;
  seed: number;
  rngState: number;
  tick: number;
  status: 'idle' | 'playing' | 'ended';
  winnerIds: EntityId[];
  turn: TurnState;
  zones: Record<EntityId, Zone>;
  pieces: Record<EntityId, Piece>;
  zonePieces: Record<EntityId, EntityId[]>;
  counters: Record<string, number>;
  counterDefs: Record<EntityId, CounterDef>;
  denominatedCounters: Record<string, Record<number, number>>;
  randomizers: Record<EntityId, RandomizerDef>;
  players: Record<EntityId, PlayerDef>;
  pending: PendingInput | null;
  vars: Record<string, unknown>;
  panels: UIPanelInstance[];
  messages: string[];
  bankLogs: BankTransactionLogEntry[];
  stateChecksum?: string;
  lastRoll: { randomizerId: EntityId; values: number[]; total: number } | null;
  logs: ActionLogEntry[];
}

export type GameAction =
  | { type: 'start_game' }
  | { type: 'press_button'; playerId: EntityId; buttonId: string }
  | { type: 'resolve_input'; playerId: EntityId; choiceId: string }
  | { type: 'exec'; playerId?: EntityId | null; spec: ActionSpec };

export interface QueuedItem {
  kind: 'action';
  spec: ActionSpec;
  eventContext?: EngineEvent;
  depth: number;
}

export interface ReduceResult {
  state: EngineState;
  events: EngineEvent[];
  error?: string;
}
