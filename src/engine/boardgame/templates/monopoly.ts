import { DEFAULT_VND_DENOMINATIONS } from '../core/denomination';
import { GamePackageV2, Piece, Rule, Zone } from '../schema/types';

export interface MonopolyTemplateOptions {
  id?: string;
  title?: string;
  playerNames?: string[];
  startingCash?: number;
  passStartSalary?: number;
}

/**
 * Pure data-driven Monopoly package (Cluster D).
 * Expresses board track, properties, rent, house upgrades, mortgage,
 * jail, penalty, chance cards, and bankruptcy purely as GamePackageV2 JSON.
 */
export function createMonopolyPackageV2(
  opts: MonopolyTemplateOptions = {}
): GamePackageV2 {
  const playerNames = opts.playerNames?.length ? opts.playerNames : ['Người chơi 1', 'Người chơi 2'];
  const startingCash = opts.startingCash ?? 1800000;
  const passStartSalary = opts.passStartSalary ?? 200000;

  const players = playerNames.map((name, idx) => ({
    id: `p${idx + 1}`,
    name,
    seat: idx,
    handZoneId: `hand-p${idx + 1}`,
    tags: ['player'],
    fields: {},
  }));

  // 12-tile perimeter ring (4x4 ring): Start, Properties, Chance, Jail, Penalty
  const ringCoords: [number, number][] = [
    [0, 0], [0, 1], [0, 2], [0, 3],
    [1, 3], [2, 3], [3, 3], [3, 2],
    [3, 1], [3, 0], [2, 0], [1, 0],
  ];

  const tileDefs: {
    id: string;
    name: string;
    tags: string[];
    fields: Zone['fields'];
  }[] = [
    { id: 'tile-0', name: 'Xuất phát', tags: ['track', 'start'], fields: {} },
    {
      id: 'tile-1',
      name: 'Hà Nội',
      tags: ['track', 'property'],
      fields: {
        price: 200000,
        baseRent: 40000,
        houseCost: 100000,
        rent1: 80000,
        rent2: 160000,
        rent3: 320000,
        rent4: 480000,
        rent5: 640000,
        resellValue: 100000,
        houseCount: 0,
        isMortgaged: false,
      },
    },
    { id: 'tile-2', name: 'Cơ hội', tags: ['track', 'draw_card'], fields: {} },
    {
      id: 'tile-3',
      name: 'Đà Nẵng',
      tags: ['track', 'property'],
      fields: {
        price: 240000,
        baseRent: 50000,
        houseCost: 120000,
        rent1: 100000,
        rent2: 200000,
        rent3: 400000,
        rent4: 550000,
        rent5: 750000,
        resellValue: 120000,
        houseCount: 0,
        isMortgaged: false,
      },
    },
    { id: 'tile-4', name: 'Nhà tù', tags: ['track', 'jail'], fields: { jailTurns: 2 } },
    {
      id: 'tile-5',
      name: 'Huế',
      tags: ['track', 'property'],
      fields: {
        price: 280000,
        baseRent: 60000,
        houseCost: 140000,
        rent1: 120000,
        rent2: 240000,
        rent3: 480000,
        rent4: 640000,
        rent5: 850000,
        resellValue: 140000,
        houseCount: 0,
        isMortgaged: false,
      },
    },
    { id: 'tile-6', name: 'Thuế thu nhập', tags: ['track', 'penalty'], fields: { penaltyAmount: 100000 } },
    {
      id: 'tile-7',
      name: 'Nha Trang',
      tags: ['track', 'property'],
      fields: {
        price: 320000,
        baseRent: 70000,
        houseCost: 150000,
        rent1: 140000,
        rent2: 280000,
        rent3: 520000,
        rent4: 720000,
        rent5: 950000,
        resellValue: 160000,
        houseCount: 0,
        isMortgaged: false,
      },
    },
    { id: 'tile-8', name: 'Khí vận', tags: ['track', 'draw_card'], fields: {} },
    {
      id: 'tile-9',
      name: 'Đà Lạt',
      tags: ['track', 'property'],
      fields: {
        price: 360000,
        baseRent: 80000,
        houseCost: 180000,
        rent1: 160000,
        rent2: 320000,
        rent3: 600000,
        rent4: 820000,
        rent5: 1100000,
        resellValue: 180000,
        houseCount: 0,
        isMortgaged: false,
      },
    },
    { id: 'tile-10', name: 'Phạt giao thông', tags: ['track', 'penalty'], fields: { penaltyAmount: 150000 } },
    {
      id: 'tile-11',
      name: 'TP.HCM',
      tags: ['track', 'property'],
      fields: {
        price: 400000,
        baseRent: 100000,
        houseCost: 200000,
        rent1: 200000,
        rent2: 400000,
        rent3: 750000,
        rent4: 1000000,
        rent5: 1300000,
        resellValue: 200000,
        houseCount: 0,
        isMortgaged: false,
      },
    },
  ];

  const zones: Zone[] = tileDefs.map((t, idx) => {
    const nextId = tileDefs[(idx + 1) % tileDefs.length].id;
    const [row, col] = ringCoords[idx];
    return {
      id: t.id,
      name: t.name,
      layout: 'grid',
      coords: { row, col },
      visibility: 'public',
      tags: t.tags,
      fields: { ...t.fields, nextTileId: { $ref: nextId } },
    };
  });

  zones.push(
    {
      id: 'chance-deck',
      name: 'Bộ thẻ Cơ hội',
      layout: 'stack',
      visibility: 'hidden',
      tags: ['deck'],
      fields: {},
    },
    {
      id: 'chance-discard',
      name: 'Thẻ Cơ hội đã rút',
      layout: 'stack',
      visibility: 'public',
      tags: ['discard'],
      fields: {},
    },
    ...players.map((p) => ({
      id: p.handZoneId!,
      name: `Tay bài ${p.name}`,
      layout: 'list' as const,
      visibility: 'owner' as const,
      ownerId: p.id,
      tags: ['hand'],
      fields: {},
    }))
  );

  const pieces: Piece[] = [
    ...players.map((p, idx) => ({
      id: `pawn-${p.id}`,
      name: `Quân ${p.name}`,
      faces: [{ label: `P${idx + 1}`, color: idx === 0 ? '#E0562D' : '#2563eb' }],
      activeFace: 0,
      rotation: 0,
      zoneId: 'tile-0',
      ownerId: p.id,
      tags: ['pawn'],
      fields: {},
    })),
    {
      id: 'chance-1',
      name: 'Thưởng học bổng',
      faces: [{ label: '+150.000đ' }],
      activeFace: 0,
      rotation: 0,
      zoneId: 'chance-deck',
      tags: ['chance_card'],
      fields: { moneyDelta: 150000 },
    },
    {
      id: 'chance-2',
      name: 'Sửa nhà',
      faces: [{ label: '-100.000đ' }],
      activeFace: 0,
      rotation: 0,
      zoneId: 'chance-deck',
      tags: ['chance_card'],
      fields: { moneyDelta: -100000 },
    },
  ];

  const currentPawnExpr = { fn: 'piece_of' as const, args: [{ ref: '$player' }, 'pawn'] };
  const currentZoneExpr = { fn: 'zone_of' as const, args: [currentPawnExpr] };

  const rentRules: Rule[] = [0, 1, 2, 3, 4, 5].flatMap((lvl) => {
    const rentExpr = {
      fn: 'field' as const,
      args: [{ ref: '$tile' }, lvl === 0 ? 'baseRent' : `rent${lvl}`],
    };
    const baseConds = [
      { op: '!=' as const, args: [{ fn: 'owner_of' as const, args: [{ ref: '$tile' }] }, null] },
      { op: '!=' as const, args: [{ fn: 'owner_of' as const, args: [{ ref: '$tile' }] }, { ref: '$player' }] },
      { op: '==' as const, args: [{ fn: 'field' as const, args: [{ ref: '$tile' }, 'isMortgaged'] }, false] },
      { op: '==' as const, args: [{ fn: 'field' as const, args: [{ ref: '$tile' }, 'houseCount'] }, lvl] },
    ];
    return [
      {
        id: `rule-pay-rent-lvl-${lvl}`,
        name: `Trả tiền thuê cấp ${lvl}`,
        trigger: 'piece_enter' as const,
        scope: { tag: 'property' },
        priority: 10,
        condition: {
          op: 'and' as const,
          args: [
            ...baseConds,
            { op: '>=' as const, args: [{ fn: 'counter' as const, args: ['cash', { ref: '$player' }] }, rentExpr] },
          ],
        },
        actions: [
          {
            type: 'transfer' as const,
            params: {
              counterId: 'cash',
              fromId: { ref: '$player' },
              toId: { fn: 'owner_of' as const, args: [{ ref: '$tile' }] },
              amount: rentExpr,
              reason: 'Tiền thuê đất',
            },
          },
        ],
      },
      {
        id: `rule-rent-bankrupt-lvl-${lvl}`,
        name: `Phá sản do không đủ tiền thuê cấp ${lvl}`,
        trigger: 'piece_enter' as const,
        scope: { tag: 'property' },
        priority: 9,
        condition: {
          op: 'and' as const,
          args: [
            ...baseConds,
            { op: '<' as const, args: [{ fn: 'counter' as const, args: ['cash', { ref: '$player' }] }, rentExpr] },
          ],
        },
        actions: [{ type: 'run_rule' as const, params: { ruleId: 'rule-bankrupt' } }],
      },
    ];
  });

  const rules: Rule[] = [
    // Roll when NOT in jail
    {
      id: 'rule-roll-normal',
      name: 'Đổ xúc xắc & di chuyển',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-roll' },
      priority: 20,
      condition: { op: '==', args: [{ fn: 'counter', args: ['jail_turns', { ref: '$player' }] }, 0] },
      actions: [
        { type: 'roll', params: { randomizerId: 'd6' } },
        {
          type: 'move_piece',
          params: {
            pieceId: currentPawnExpr,
            toZoneId: { fn: 'track_step', args: [currentZoneExpr, { ref: '$roll' }] },
          },
        },
        { type: 'set_phase', params: { phase: 'action' } },
      ],
    },
    // Pass Start salary check after roll
    {
      id: 'rule-pass-start-salary',
      name: 'Nhận lương qua ô Xuất phát',
      trigger: 'piece_leave',
      scope: { tag: 'track' },
      priority: 5,
      condition: {
        op: 'and',
        args: [
          { op: '!=', args: [{ ref: '$roll' }, null] },
          { fn: 'track_passed', args: [{ ref: '$target' }, { ref: '$roll' }, 'start'] },
        ],
      },
      actions: [
        {
          type: 'transfer',
          params: {
            counterId: 'cash',
            fromId: 'bank',
            toId: { ref: '$player' },
            amount: passStartSalary,
            reason: 'Lương qua ô Xuất phát',
          },
        },
      ],
    },
    // Roll when IN jail: roll first
    {
      id: 'rule-roll-in-jail',
      name: 'Đổ xúc xắc trong tù',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-roll' },
      priority: 10,
      condition: { op: '>', args: [{ fn: 'counter', args: ['jail_turns', { ref: '$player' }] }, 0] },
      actions: [
        { type: 'roll', params: { randomizerId: 'd6' } },
        { type: 'set_phase', params: { phase: 'action' } },
      ],
    },
    // Released on doubles
    {
      id: 'rule-jail-release-double',
      name: 'Ra tù khi đổ đôi',
      trigger: 'dice_rolled',
      priority: 20,
      condition: {
        op: 'and',
        args: [
          { op: '>', args: [{ fn: 'counter', args: ['jail_turns', { ref: '$player' }] }, 0] },
          { fn: 'dice_is_double', args: [] },
        ],
      },
      actions: [
        { type: 'set_counter', params: { counterId: 'jail_turns', targetId: { ref: '$player' }, value: 0 } },
        {
          type: 'move_piece',
          params: {
            pieceId: currentPawnExpr,
            toZoneId: { fn: 'track_step', args: [currentZoneExpr, { ref: '$roll' }] },
          },
        },
      ],
    },
    // Decrement jail turn if not double
    {
      id: 'rule-jail-stay',
      name: 'Giảm lượt ở tù',
      trigger: 'dice_rolled',
      priority: 10,
      condition: {
        op: 'and',
        args: [
          { op: '>', args: [{ fn: 'counter', args: ['jail_turns', { ref: '$player' }] }, 0] },
          { op: 'not', args: [{ fn: 'dice_is_double', args: [] }] },
        ],
      },
      actions: [
        { type: 'set_counter', params: { counterId: 'jail_turns', targetId: { ref: '$player' }, delta: -1 } },
      ],
    },
    // Enter jail tile
    {
      id: 'rule-enter-jail',
      name: 'Vào ô Nhà tù',
      trigger: 'piece_enter',
      scope: { tag: 'jail' },
      priority: 10,
      actions: [
        {
          type: 'set_counter',
          params: {
            counterId: 'jail_turns',
            targetId: { ref: '$player' },
            value: { fn: 'field', args: [{ ref: '$tile' }, 'jailTurns'] },
          },
        },
      ],
    },
    // Enter penalty tile
    {
      id: 'rule-enter-penalty',
      name: 'Nộp phạt',
      trigger: 'piece_enter',
      scope: { tag: 'penalty' },
      priority: 10,
      condition: {
        op: '>=',
        args: [
          { fn: 'counter', args: ['cash', { ref: '$player' }] },
          { fn: 'field', args: [{ ref: '$tile' }, 'penaltyAmount'] },
        ],
      },
      actions: [
        {
          type: 'transfer',
          params: {
            counterId: 'cash',
            fromId: { ref: '$player' },
            toId: 'bank',
            amount: { fn: 'field', args: [{ ref: '$tile' }, 'penaltyAmount'] },
            reason: 'Nộp phạt',
          },
        },
      ],
    },
    {
      id: 'rule-penalty-bankrupt',
      name: 'Phá sản do không đủ tiền phạt',
      trigger: 'piece_enter',
      scope: { tag: 'penalty' },
      priority: 9,
      condition: {
        op: '<',
        args: [
          { fn: 'counter', args: ['cash', { ref: '$player' }] },
          { fn: 'field', args: [{ ref: '$tile' }, 'penaltyAmount'] },
        ],
      },
      actions: [{ type: 'run_rule', params: { ruleId: 'rule-bankrupt' } }],
    },
    // Enter draw card tile
    {
      id: 'rule-enter-draw-card',
      name: 'Rút thẻ Cơ hội',
      trigger: 'piece_enter',
      scope: { tag: 'draw_card' },
      priority: 10,
      actions: [
        { type: 'draw', params: { fromZoneId: 'chance-deck', toZoneId: 'chance-discard', count: 1 } },
      ],
    },
    ...rentRules,
    // Buy property
    {
      id: 'rule-buy-property',
      name: 'Mua đất',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-buy' },
      priority: 10,
      condition: {
        op: 'and',
        args: [
          { fn: 'tag_has', args: [currentZoneExpr, 'property'] },
          { op: '==', args: [{ fn: 'owner_of', args: [currentZoneExpr] }, null] },
          {
            op: '>=',
            args: [
              { fn: 'counter', args: ['cash', { ref: '$player' }] },
              { fn: 'field', args: [currentZoneExpr, 'price'] },
            ],
          },
        ],
      },
      actions: [
        {
          type: 'transfer',
          params: {
            counterId: 'cash',
            fromId: { ref: '$player' },
            toId: 'bank',
            amount: { fn: 'field', args: [currentZoneExpr, 'price'] },
            reason: 'Mua đất',
          },
        },
        {
          type: 'set_owner',
          params: { entityId: currentZoneExpr, ownerId: { ref: '$player' } },
        },
      ],
    },
    // Upgrade house
    {
      id: 'rule-upgrade-house',
      name: 'Nâng cấp nhà',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-upgrade' },
      priority: 10,
      condition: {
        op: 'and',
        args: [
          { fn: 'tag_has', args: [currentZoneExpr, 'property'] },
          { op: '==', args: [{ fn: 'owner_of', args: [currentZoneExpr] }, { ref: '$player' }] },
          { op: '==', args: [{ fn: 'field', args: [currentZoneExpr, 'isMortgaged'] }, false] },
          { op: '<', args: [{ fn: 'field', args: [currentZoneExpr, 'houseCount'] }, 5] },
        ],
      },
      actions: [
        {
          type: 'transfer',
          params: {
            counterId: 'cash',
            fromId: { ref: '$player' },
            toId: 'bank',
            amount: { fn: 'field', args: [currentZoneExpr, 'houseCost'] },
            reason: 'Xây nhà',
          },
        },
        {
          type: 'set_field',
          params: {
            entityId: currentZoneExpr,
            key: 'houseCount',
            value: { op: '+', args: [{ fn: 'field', args: [currentZoneExpr, 'houseCount'] }, 1] },
          },
        },
      ],
    },
    // Mortgage property
    {
      id: 'rule-mortgage-property',
      name: 'Thế chấp đất',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-mortgage' },
      priority: 10,
      condition: {
        op: 'and',
        args: [
          { fn: 'tag_has', args: [currentZoneExpr, 'property'] },
          { op: '==', args: [{ fn: 'owner_of', args: [currentZoneExpr] }, { ref: '$player' }] },
          { op: '==', args: [{ fn: 'field', args: [currentZoneExpr, 'isMortgaged'] }, false] },
        ],
      },
      actions: [
        {
          type: 'transfer',
          params: {
            counterId: 'cash',
            fromId: 'bank',
            toId: { ref: '$player' },
            amount: { fn: 'field', args: [currentZoneExpr, 'resellValue'] },
            reason: 'Thế chấp đất',
          },
        },
        {
          type: 'set_field',
          params: { entityId: currentZoneExpr, key: 'isMortgaged', value: true },
        },
      ],
    },
    // Declare bankruptcy
    {
      id: 'rule-bankrupt',
      name: 'Phá sản',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-bankrupt' },
      priority: 20,
      actions: [
        { type: 'set_field', params: { entityId: { ref: '$player' }, key: 'eliminated', value: true } },
        { type: 'log', params: { message: 'Người chơi tuyên bố phá sản' } },
        { type: 'run_rule', params: { ruleId: 'rule-bankrupt-check-win' } },
        { type: 'run_rule', params: { ruleId: 'rule-bankrupt-next-turn' } },
      ],
    },
    {
      id: 'rule-bankrupt-check-win',
      name: 'Kiểm tra người thắng sau phá sản',
      trigger: 'rule_fired',
      scope: { entityId: 'rule-bankrupt' },
      priority: 10,
      condition: { op: '==', args: [{ fn: 'len', args: [{ fn: 'active_players', args: [] }] }, 1] },
      actions: [
        { type: 'end_game', params: { winnerId: { fn: 'get', args: [{ fn: 'active_players', args: [] }, 0] } } },
      ],
    },
    {
      id: 'rule-bankrupt-next-turn',
      name: 'Chuyển lượt sau phá sản nếu còn >= 2 người',
      trigger: 'rule_fired',
      scope: { entityId: 'rule-bankrupt' },
      priority: 5,
      condition: { op: '>', args: [{ fn: 'len', args: [{ fn: 'active_players', args: [] }] }, 1] },
      actions: [{ type: 'next_turn', params: {} }],
    },
    // End turn
    {
      id: 'rule-end-turn',
      name: 'Kết thúc lượt',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-end-turn' },
      priority: 10,
      actions: [{ type: 'next_turn', params: {} }],
    },
  ];

  return {
    schemaVersion: 2,
    id: opts.id ?? 'monopoly-v2',
    title: opts.title ?? 'Cờ Tỷ Phú (Data-Driven v2)',
    description: 'Gói Cờ Tỷ Phú chuẩn định nghĩa hoàn toàn bằng dữ liệu GamePackageV2.',
    zones,
    pieces,
    counters: [
      {
        id: 'cash',
        name: 'Tiền mặt VNĐ',
        scope: 'player',
        kind: 'denominated',
        denominations: [...DEFAULT_VND_DENOMINATIONS],
        min: 0,
        initial: startingCash,
        tags: ['currency'],
        fields: {},
      },
      {
        id: 'jail_turns',
        name: 'Số lượt ở tù',
        scope: 'player',
        kind: 'scalar',
        min: 0,
        initial: 0,
        tags: [],
        fields: {},
      },
    ],
    randomizers: [
      {
        id: 'd6',
        name: '2 Xúc xắc 6 mặt',
        kind: 'dice',
        sides: [6, 6],
        tags: [],
        fields: {},
      },
    ],
    players,
    turnConfig: {
      initialPhase: 'roll',
      phases: [
        { id: 'roll', name: 'Đổ xúc xắc', allowedButtons: ['btn-roll', 'btn-bankrupt'] },
        {
          id: 'action',
          name: 'Hành động',
          allowedButtons: ['btn-buy', 'btn-upgrade', 'btn-mortgage', 'btn-bankrupt', 'btn-end-turn'],
        },
      ],
    },
    rules,
    ui: {
      panels: [],
      buttons: [
        { id: 'btn-roll', label: 'Đổ xúc xắc', phases: ['roll'] },
        { id: 'btn-buy', label: 'Mua đất', phases: ['action'] },
        { id: 'btn-upgrade', label: 'Nâng cấp nhà', phases: ['action'] },
        { id: 'btn-mortgage', label: 'Thế chấp', phases: ['action'] },
        { id: 'btn-bankrupt', label: 'Phá sản', phases: ['roll', 'action'] },
        { id: 'btn-end-turn', label: 'Kết lượt', phases: ['action'] },
      ],
    },
    winConfig: {
      scoreCounterId: 'cash',
      tieBreaker: 'highest',
    },
  };
}
