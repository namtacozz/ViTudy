import type { DeskItem, DrawingStroke } from '@/types/studyspace';

export type Point = { x: number; y: number };

export function pointsToSvgPath(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const isClosedPolygon = points.length <= 8 && Math.hypot(first.x - last.x, first.y - last.y) < 10;

  if (isClosedPolygon) {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    d += ' Z';
    return d;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x} ${p1.y}, ${midX} ${midY}`;
  }
  const lastPt = points[points.length - 1];
  d += ` L ${lastPt.x} ${lastPt.y}`;
  if (Math.hypot(first.x - lastPt.x, first.y - lastPt.y) < 10) {
    d += ' Z';
  }
  return d;
}

export function getDeskItemBounds(item: DeskItem): { w: number; h: number } {
  if (item.type === 'book') {
    return { w: item.width || 980, h: item.height || 640 };
  }
  if (item.type === 'paper') {
    return {
      w: item.width || (item.isExamSheet ? 380 : 360),
      h: item.height || (item.isExamSheet ? 490 : 500),
    };
  }
  if (item.type === 'artboard') {
    return { w: item.width || 600, h: item.height || 450 };
  }
  if (item.type === 'board_game') {
    return { w: item.width || 720, h: item.height || 720 };
  }
  if (item.type === 'spreadsheet') {
    return { w: item.width || 580, h: item.height || 400 };
  }
  if (item.type === 'presentation') {
    return { w: item.width || 620, h: item.height || 400 };
  }
  return { w: item.width || 220, h: item.height || 200 };
}

export function worldToItemLocal(pt: Point, item: DeskItem): Point {
  const dx = pt.x - item.x;
  const dy = pt.y - item.y;
  const rad = (-item.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: Math.round((dx * cos - dy * sin) * 10) / 10,
    y: Math.round((dx * sin + dy * cos) * 10) / 10,
  };
}

export function findTopItemAtPoint(pt: Point, sortedItemsDesc: DeskItem[]): DeskItem | null {
  for (const item of sortedItemsDesc) {
    const { w, h } = getDeskItemBounds(item);
    const local = worldToItemLocal(pt, item);
    if (local.x >= 0 && local.x <= w && local.y >= 0 && local.y <= h) {
      return item;
    }
  }
  return null;
}

function findBoundaryCrossing(
  a: Point,
  b: Point,
  targetA: string | null,
  sortedItemsDesc: DeskItem[]
): Point {
  let lo = 0;
  let hi = 1;
  for (let iter = 0; iter < 9; iter++) {
    const mid = (lo + hi) / 2;
    const midPt = { x: a.x + (b.x - a.x) * mid, y: a.y + (b.y - a.y) * mid };
    const midTarget = findTopItemAtPoint(midPt, sortedItemsDesc)?.id ?? null;
    if (midTarget === targetA) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const t = (lo + hi) / 2;
  return {
    x: Math.round((a.x + (b.x - a.x) * t) * 10) / 10,
    y: Math.round((a.y + (b.y - a.y) * t) * 10) / 10,
  };
}

/**
 * Tách một nét vẽ trên bàn học thành các phần độc lập theo bề mặt mà nét đi qua
 * (phần trên sách nằm trên sách, phần trên tờ giấy nằm trên tờ giấy, phần ngoài bàn nằm trên desk).
 */
export function segmentStrokeByDeskItems(
  stroke: DrawingStroke,
  items: DeskItem[],
  createSegmentId: () => string
): DrawingStroke[] {
  const pts = stroke.points;
  if (pts.length === 0) return [];

  const sortedItemsDesc = [...items].sort((a, b) => b.zIndex - a.zIndex);
  const itemById = new Map<string, DeskItem>(sortedItemsDesc.map((it) => [it.id, it]));

  interface Run {
    targetId: string | null;
    points: Point[];
  }

  const runs: Run[] = [];
  let currentTarget = findTopItemAtPoint(pts[0], sortedItemsDesc)?.id ?? null;
  let currentPoints: Point[] = [pts[0]];

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);

    // Nếu đoạn thẳng dài (> 12px), lấy mẫu trung gian để không bỏ sót vật thể hẹp nằm giữa 2 điểm
    const steps = dist > 12 ? Math.min(20, Math.ceil(dist / 10)) : 1;
    let prevPt = a;
    let prevTarget = currentTarget;

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const samplePt: Point = s === steps ? b : { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const sampleTarget = findTopItemAtPoint(samplePt, sortedItemsDesc)?.id ?? null;

      if (sampleTarget === prevTarget) {
        currentPoints.push(samplePt);
      } else {
        const crossingPt = findBoundaryCrossing(prevPt, samplePt, prevTarget, sortedItemsDesc);
        currentPoints.push(crossingPt);
        runs.push({ targetId: prevTarget, points: currentPoints });

        currentTarget = sampleTarget;
        currentPoints = [crossingPt, samplePt];
        prevTarget = sampleTarget;
      }
      prevPt = samplePt;
    }
  }

  if (currentPoints.length > 0) {
    runs.push({ targetId: currentTarget, points: currentPoints });
  }

  return runs
    .filter((run) => run.points.length >= 2 || runs.length === 1)
    .map((run, idx) => {
      const targetItem = run.targetId ? itemById.get(run.targetId) : undefined;
      const mappedPoints = targetItem
        ? run.points.map((p) => worldToItemLocal(p, targetItem))
        : run.points.map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));

      return {
        ...stroke,
        id: idx === 0 ? stroke.id : createSegmentId(),
        points: mappedPoints,
        attachedToItemId: targetItem ? targetItem.id : undefined,
        originalPoints: undefined,
      };
    });
}
