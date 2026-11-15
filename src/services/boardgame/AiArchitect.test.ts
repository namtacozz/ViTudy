import { describe, it, expect, vi } from 'vitest';
import { createMonopolyPackageV2 } from '@/engine/boardgame';
import { architectGameWithAi, validateAiPackageDeep } from './AiArchitect';
import { describeRuleInVietnamese } from '@/components/boardgame/rules/ruleTranslator';
import { mergePackages } from '@/components/boardgame/editor/TemplateLibraryModal';

describe('Cluster G, H, I: Rule Translator, Package Merge & AiArchitect', () => {
  it('translates JSON rules into readable Vietnamese prose', () => {
    const pkg = createMonopolyPackageV2();
    const buyRule = pkg.rules.find((r) => r.id === 'rule-buy-property')!;
    const text = describeRuleInVietnamese(buyRule);
    expect(text).toContain('Khi bấm nút');
    expect(text).toContain('Chuyển');
    expect(text).toContain('Gán quyền sở hữu');
  });

  it('merges packages cleanly while resolving ID conflicts', () => {
    const a = createMonopolyPackageV2({ id: 'a' });
    const b = createMonopolyPackageV2({ id: 'b' });
    const merged = mergePackages(a, b);
    expect(merged.zones.length).toBe(a.zones.length + b.zones.length);
    const ids = new Set(merged.zones.map((z) => z.id));
    expect(ids.size).toBe(merged.zones.length);
  });

  it('detects unreachable rules and dead counters, repairs via AI retry, and debits ViToken only on pass', async () => {
    const broken = createMonopolyPackageV2();
    // Add unreachable rule pointing to missing button
    broken.rules.push({
      id: 'dead-rule',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-ghost' },
      priority: 1,
      actions: [{ type: 'log', params: { message: 'never' } }],
    });
    expect(validateAiPackageDeep(broken).valid).toBe(false);

    const valid = createMonopolyPackageV2();
    const callAiJson = vi
      .fn()
      .mockResolvedValueOnce(broken)
      .mockResolvedValueOnce(valid);
    const debitViToken = vi.fn().mockResolvedValue({ ok: true });

    const res = await architectGameWithAi({
      prompt: 'Tạo game Cờ Tỷ Phú',
      requestId: 'req-123',
      viTokenCost: 5,
      simMatches: 10,
      deps: { callAiJson, debitViToken },
    });

    expect(res.ok).toBe(true);
    expect(res.attempts).toBe(2);
    expect(res.chargedViToken).toBe(5);
    expect(debitViToken).toHaveBeenCalledTimes(1);
    expect(debitViToken).toHaveBeenCalledWith('req-123', 5);
  });

  it('does not debit ViToken if AI fails to fix after 2 repair rounds', async () => {
    const broken = createMonopolyPackageV2();
    broken.rules.push({
      id: 'dead-rule',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-ghost' },
      priority: 1,
      actions: [{ type: 'log', params: { message: 'never' } }],
    });

    const callAiJson = vi.fn().mockResolvedValue(broken);
    const debitViToken = vi.fn().mockResolvedValue({ ok: true });

    const res = await architectGameWithAi({
      prompt: 'Game lỗi',
      requestId: 'req-fail',
      viTokenCost: 5,
      deps: { callAiJson, debitViToken },
    });

    expect(res.ok).toBe(false);
    expect(res.attempts).toBe(3);
    expect(res.chargedViToken).toBe(0);
    expect(debitViToken).not.toHaveBeenCalled();
  });
});
