import { ActionSpec, Expr, Rule, TriggerType } from '@/engine/boardgame';

const TRIGGER_LABELS: Record<TriggerType, string> = {
  game_start: 'Khi bắt đầu ván đấu',
  turn_start: 'Khi bắt đầu lượt',
  turn_end: 'Khi kết thúc lượt',
  phase_enter: 'Khi vào pha',
  piece_enter: 'Khi quân bước vào ô',
  piece_leave: 'Khi quân rời khỏi ô',
  dice_rolled: 'Khi đổ xúc xắc',
  card_played: 'Khi đánh thẻ bài',
  counter_changed: 'Khi chỉ số thay đổi',
  button_pressed: 'Khi bấm nút',
  zone_empty: 'Khi vùng trống rỗng',
  rule_fired: 'Khi luật khác kích hoạt',
};

export function describeExpr(expr: Expr | undefined): string {
  if (expr === undefined || expr === null) return '';
  if (typeof expr !== 'object') return String(expr);
  if ('ref' in expr) return expr.ref;
  if ('var' in expr) return `$${expr.var}`;
  if ('op' in expr) {
    if (expr.op === 'not') return `không (${describeExpr(expr.args[0])})`;
    const joiner = expr.op === 'and' ? ' VÀ ' : expr.op === 'or' ? ' HOẶC ' : ` ${expr.op} `;
    return `(${expr.args.map(describeExpr).join(joiner)})`;
  }
  if ('fn' in expr) {
    return `${expr.fn}(${expr.args.map(describeExpr).join(', ')})`;
  }
  return '';
}

function describeAction(a: ActionSpec): string {
  switch (a.type) {
    case 'transfer':
      return `Chuyển ${describeExpr(a.params.amount as Expr)} (${a.params.counterId}) từ ${describeExpr(a.params.fromId as Expr)} sang ${describeExpr(a.params.toId as Expr)}`;
    case 'set_counter':
      return `Đặt chỉ số ${a.params.counterId}`;
    case 'move_piece':
      return `Di chuyển quân tới ${describeExpr(a.params.toZoneId as Expr)}`;
    case 'draw':
      return `Rút ${a.params.count ?? 1} lá từ ${a.params.fromZoneId}`;
    case 'skip_turn':
      return `Mất ${a.params.count ?? 1} lượt`;
    case 'extra_turn':
      return `Thêm ${a.params.count ?? 1} lượt`;
    case 'reverse_order':
      return 'Đảo chiều lượt chơi';
    case 'next_turn':
      return 'Chuyển lượt tiếp theo';
    case 'end_game':
      return 'Kết thúc ván đấu';
    case 'set_owner':
      return 'Gán quyền sở hữu';
    case 'set_field':
      return `Cập nhật ${a.params.key}`;
    default:
      return a.type;
  }
}

/**
 * Translates a JSON Rule into human-readable Vietnamese prose (Cluster H).
 */
export function describeRuleInVietnamese(rule: Rule): string {
  const when = TRIGGER_LABELS[rule.trigger] || rule.trigger;
  const scope = rule.scope?.tag
    ? ` gắn tag "${rule.scope.tag}"`
    : rule.scope?.entityId
    ? ` (${rule.scope.entityId})`
    : '';
  const cond = rule.condition ? `, nếu ${describeExpr(rule.condition)}` : '';
  const acts = rule.actions.map(describeAction).join('; ');
  return `${when}${scope}${cond} → ${acts || 'Không có hành động'}.`;
}
