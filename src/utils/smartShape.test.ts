import { describe, it, expect } from 'vitest';
import { recognizeSmartShape, recognizeSmartShapeDetailed, Point } from './smartShape';

// ==========================================
// DETERMINISTIC PRNG (Mulberry32)
// ==========================================
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Gaussian Random (Box-Muller)
function gaussian(rng: () => number, mean = 0, stdev = 1): number {
  const u1 = Math.max(1e-7, rng());
  const u2 = rng();
  return mean + stdev * Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function rotatePoint(p: Point, angle: number, origin: Point): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}

// ==========================================
// SHAPE GENERATORS (Noise, Rotation, Gaps)
// ==========================================

export function generateLineStroke(rng: () => number): Point[] {
  const length = 50 + rng() * 750;
  const numPoints = Math.floor(50 + rng() * 250);
  const angle = rng() * 2 * Math.PI;
  const origin = { x: 500, y: 500 };
  const sigma = length * (0.01 + rng() * 0.02);

  // Non-uniform sampling
  const ts: number[] = [0];
  for (let i = 1; i < numPoints - 1; i++) {
    ts.push(rng());
  }
  ts.push(1);
  ts.sort((a, b) => a - b);

  return ts.map(t => {
    const rawX = origin.x + t * length;
    const rawY = origin.y + gaussian(rng, 0, sigma);
    return rotatePoint({ x: rawX, y: rawY }, angle, origin);
  });
}

export function generateCircleStroke(rng: () => number): Point[] {
  const radius = 20 + rng() * 380;
  const perimeter = 2 * Math.PI * radius;
  const gapRatio = 0.03 + rng() * 0.12; // 3% to 15% gap
  const sweep = 2 * Math.PI * (1 - gapRatio);
  const startAngle = rng() * 2 * Math.PI;
  const numPoints = Math.floor(50 + rng() * 250);
  const origin = { x: 500, y: 500 };
  const sigma = (2 * radius) * (0.01 + rng() * 0.02);

  const ts: number[] = [0];
  for (let i = 1; i < numPoints - 1; i++) {
    ts.push(rng());
  }
  ts.push(1);
  ts.sort((a, b) => a - b);

  return ts.map(t => {
    const angle = startAngle + t * sweep;
    const r = radius + gaussian(rng, 0, sigma);
    return {
      x: origin.x + r * Math.cos(angle),
      y: origin.y + r * Math.sin(angle),
    };
  });
}

export function generateEllipseStroke(rng: () => number): Point[] {
  const a = 40 + rng() * 360;
  const ratio = 1.45 + rng() * 2.0; // distinctly elongated
  const b = a / ratio;
  const gapRatio = 0.03 + rng() * 0.12;
  const sweep = 2 * Math.PI * (1 - gapRatio);
  const startAngle = rng() * 2 * Math.PI;
  const rotation = rng() * 2 * Math.PI;
  const numPoints = Math.floor(50 + rng() * 250);
  const origin = { x: 500, y: 500 };
  const sigma = (2 * a) * (0.01 + rng() * 0.02);

  const ts: number[] = [0];
  for (let i = 1; i < numPoints - 1; i++) {
    ts.push(rng());
  }
  ts.push(1);
  ts.sort((a, b) => a - b);

  return ts.map(t => {
    const angle = startAngle + t * sweep;
    const rawX = origin.x + a * Math.cos(angle) + gaussian(rng, 0, sigma);
    const rawY = origin.y + b * Math.sin(angle) + gaussian(rng, 0, sigma);
    return rotatePoint({ x: rawX, y: rawY }, rotation, origin);
  });
}

export function generateSquareStroke(rng: () => number): Point[] {
  const side = 40 + rng() * 560;
  const aspectWiggle = 1 + (rng() - 0.5) * 0.08; // 0.96 to 1.04
  const w = side * aspectWiggle;
  const h = side;
  const perimeter = 2 * (w + h);
  const gapRatio = 0.03 + rng() * 0.12;
  const endDist = perimeter * (1 - gapRatio);
  const rotation = rng() * 2 * Math.PI;
  const numPoints = Math.floor(50 + rng() * 250);
  const origin = { x: 500, y: 500 };
  const sigma = side * (0.01 + rng() * 0.02);

  const ds: number[] = [0];
  for (let i = 1; i < numPoints - 1; i++) {
    ds.push(rng() * endDist);
  }
  ds.push(endDist);
  ds.sort((a, b) => a - b);

  const halfW = w / 2;
  const halfH = h / 2;

  return ds.map(d => {
    let rawX = 0;
    let rawY = 0;
    if (d < w) {
      // Top edge: left to right
      rawX = -halfW + d;
      rawY = -halfH;
    } else if (d < w + h) {
      // Right edge: top to bottom
      rawX = halfW;
      rawY = -halfH + (d - w);
    } else if (d < 2 * w + h) {
      // Bottom edge: right to left
      rawX = halfW - (d - (w + h));
      rawY = halfH;
    } else {
      // Left edge: bottom to top
      rawX = -halfW;
      rawY = halfH - (d - (2 * w + h));
    }

    rawX += gaussian(rng, 0, sigma);
    rawY += gaussian(rng, 0, sigma);
    return rotatePoint({ x: origin.x + rawX, y: origin.y + rawY }, rotation, origin);
  });
}

export function generateRectangleStroke(rng: () => number): Point[] {
  const w = 70 + rng() * 630;
  const ratio = 1.45 + rng() * 2.5; // Aspect ratio >= 1.45
  const h = w / ratio;
  const perimeter = 2 * (w + h);
  const gapRatio = 0.03 + rng() * 0.12;
  const endDist = perimeter * (1 - gapRatio);
  const rotation = rng() * 2 * Math.PI;
  const numPoints = Math.floor(50 + rng() * 250);
  const origin = { x: 500, y: 500 };
  const sigma = w * (0.01 + rng() * 0.02);

  const ds: number[] = [0];
  for (let i = 1; i < numPoints - 1; i++) {
    ds.push(rng() * endDist);
  }
  ds.push(endDist);
  ds.sort((a, b) => a - b);

  const halfW = w / 2;
  const halfH = h / 2;

  return ds.map(d => {
    let rawX = 0;
    let rawY = 0;
    if (d < w) {
      rawX = -halfW + d;
      rawY = -halfH;
    } else if (d < w + h) {
      rawX = halfW;
      rawY = -halfH + (d - w);
    } else if (d < 2 * w + h) {
      rawX = halfW - (d - (w + h));
      rawY = halfH;
    } else {
      rawX = -halfW;
      rawY = halfH - (d - (2 * w + h));
    }

    rawX += gaussian(rng, 0, sigma);
    rawY += gaussian(rng, 0, sigma);
    return rotatePoint({ x: origin.x + rawX, y: origin.y + rawY }, rotation, origin);
  });
}

export function generateTriangleStroke(rng: () => number): Point[] {
  const size = 50 + rng() * 550;
  // Equilateral or moderately skewed triangle
  const p1 = { x: 0, y: -size / Math.sqrt(3) };
  const p2 = { x: (size / 2) * (0.8 + rng() * 0.4), y: size / (2 * Math.sqrt(3)) };
  const p3 = { x: (-size / 2) * (0.8 + rng() * 0.4), y: size / (2 * Math.sqrt(3)) };

  const edges = [
    { from: p1, to: p2, len: Math.hypot(p2.x - p1.x, p2.y - p1.y) },
    { from: p2, to: p3, len: Math.hypot(p3.x - p2.x, p3.y - p2.y) },
    { from: p3, to: p1, len: Math.hypot(p1.x - p3.x, p1.y - p3.y) },
  ];
  const perimeter = edges[0].len + edges[1].len + edges[2].len;
  const gapRatio = 0.03 + rng() * 0.12;
  const endDist = perimeter * (1 - gapRatio);
  const rotation = rng() * 2 * Math.PI;
  const numPoints = Math.floor(50 + rng() * 250);
  const origin = { x: 500, y: 500 };
  const sigma = size * (0.01 + rng() * 0.02);

  const ds: number[] = [0];
  for (let i = 1; i < numPoints - 1; i++) {
    ds.push(rng() * endDist);
  }
  ds.push(endDist);
  ds.sort((a, b) => a - b);

  return ds.map(d => {
    let rawX = 0;
    let rawY = 0;
    if (d <= edges[0].len) {
      const t = d / edges[0].len;
      rawX = edges[0].from.x + t * (edges[0].to.x - edges[0].from.x);
      rawY = edges[0].from.y + t * (edges[0].to.y - edges[0].from.y);
    } else if (d <= edges[0].len + edges[1].len) {
      const t = (d - edges[0].len) / edges[1].len;
      rawX = edges[1].from.x + t * (edges[1].to.x - edges[1].from.x);
      rawY = edges[1].from.y + t * (edges[1].to.y - edges[1].from.y);
    } else {
      const t = (d - edges[0].len - edges[1].len) / edges[2].len;
      rawX = edges[2].from.x + t * (edges[2].to.x - edges[2].from.x);
      rawY = edges[2].from.y + t * (edges[2].to.y - edges[2].from.y);
    }

    rawX += gaussian(rng, 0, sigma);
    rawY += gaussian(rng, 0, sigma);
    return rotatePoint({ x: origin.x + rawX, y: origin.y + rawY }, rotation, origin);
  });
}

export function generateNonShapeStroke(rng: () => number): Point[] {
  const type = Math.floor(rng() * 4);
  const numPoints = Math.floor(60 + rng() * 180);
  const origin = { x: 500, y: 500 };
  const size = 100 + rng() * 400;

  if (type === 0) {
    // S-curve (inflection point, wide open ends)
    const points: Point[] = [];
    for (let i = 0; i < numPoints; i++) {
      const t = (i / (numPoints - 1)) * 2 * Math.PI;
      const x = origin.x + (t - Math.PI) * (size / 3);
      const y = origin.y + Math.sin(t) * (size / 2) + gaussian(rng, 0, size * 0.02);
      points.push({ x, y });
    }
    return points;
  } else if (type === 1) {
    // Random scribble / zigzag walk
    const points: Point[] = [{ x: origin.x, y: origin.y }];
    let curX = origin.x;
    let curY = origin.y;
    let dir = rng() * 2 * Math.PI;
    for (let i = 1; i < numPoints; i++) {
      dir += (rng() - 0.5) * 1.8;
      const step = 2 + rng() * 6;
      curX += Math.cos(dir) * step;
      curY += Math.sin(dir) * step;
      points.push({ x: curX, y: curY });
    }
    return points;
  } else if (type === 2) {
    // Letter C-like open arc (ends far apart)
    const points: Point[] = [];
    const sweep = Math.PI * 1.35; // ~240 degrees, wide gap
    const startAngle = rng() * 2 * Math.PI;
    for (let i = 0; i < numPoints; i++) {
      const th = startAngle + (i / (numPoints - 1)) * sweep;
      const r = (size / 2) + gaussian(rng, 0, size * 0.02);
      points.push({
        x: origin.x + r * Math.cos(th),
        y: origin.y + r * Math.sin(th),
      });
    }
    return points;
  } else {
    // Letter Z / M zigzag open strokes
    const points: Point[] = [];
    const waypoints = [
      { x: origin.x - size / 2, y: origin.y - size / 2 },
      { x: origin.x + size / 2, y: origin.y - size / 2 },
      { x: origin.x - size / 2, y: origin.y + size / 2 },
      { x: origin.x + size / 2, y: origin.y + size / 2 },
    ];
    for (let seg = 0; seg < 3; seg++) {
      const pA = waypoints[seg];
      const pB = waypoints[seg + 1];
      const count = Math.floor(numPoints / 3);
      for (let j = 0; j < count; j++) {
        const t = j / count;
        points.push({
          x: pA.x + t * (pB.x - pA.x) + gaussian(rng, 0, size * 0.02),
          y: pA.y + t * (pB.y - pA.y) + gaussian(rng, 0, size * 0.02),
        });
      }
    }
    return points;
  }
}

// Classifier for the recognizeSmartShape output
export type RecognizedLabel = 'line' | 'circle' | 'ellipse' | 'square' | 'rectangle' | 'triangle' | 'none';

export function classifyResult(input: Point[], output: Point[]): RecognizedLabel {
  const detailed = recognizeSmartShapeDetailed(input);
  return detailed.shape;
}

// ==========================================
// TEST SUITE
// ==========================================

describe('smartShape recognition test harness', () => {
  // Preserve original unit tests
  it('recognizes a straight horizontal line and snaps it', () => {
    const points: Point[] = [
      { x: 10, y: 50 },
      { x: 30, y: 51 },
      { x: 60, y: 49 },
      { x: 90, y: 50 },
      { x: 120, y: 50 },
    ];
    const res = recognizeSmartShape(points);
    expect(res).toHaveLength(2);
    expect(res[0].y).toBe(res[1].y);
  });

  it('recognizes a square and returns a 5-point closed quadrilateral', () => {
    const square: Point[] = [];
    const size = 100;
    for (let i = 0; i <= 10; i++) square.push({ x: (i / 10) * size, y: 0 });
    for (let i = 0; i <= 10; i++) square.push({ x: size, y: (i / 10) * size });
    for (let i = 0; i <= 10; i++) square.push({ x: size - (i / 10) * size, y: size });
    for (let i = 0; i <= 10; i++) square.push({ x: 0, y: size - (i / 10) * size });

    const res = recognizeSmartShape(square);
    expect(res).toHaveLength(5);
    expect(res[0]).toEqual(res[4]);
  });

  it('recognizes a triangle and returns a 4-point closed polygon', () => {
    const triangle: Point[] = [];
    const size = 100;
    for (let i = 0; i <= 10; i++) triangle.push({ x: 50 + (i / 10) * 50, y: (i / 10) * size });
    for (let i = 0; i <= 10; i++) triangle.push({ x: 100 - (i / 10) * 100, y: size });
    for (let i = 0; i <= 10; i++) triangle.push({ x: (i / 10) * 50, y: size - (i / 10) * size });

    const res = recognizeSmartShape(triangle);
    expect(res).toHaveLength(4);
    expect(res[0]).toEqual(res[3]);
  });

  it('prevents square from turning into drop or circle (user regression test)', () => {
    const squareWithSag: Point[] = [];
    const size = 120;
    // Top
    for (let i = 0; i <= 10; i++) squareWithSag.push({ x: 200 + (i / 10) * size, y: 200 });
    // Right (slight bulge)
    for (let i = 0; i <= 10; i++) squareWithSag.push({ x: 200 + size + 2, y: 200 + (i / 10) * size });
    // Bottom (slight sag)
    for (let i = 0; i <= 10; i++) squareWithSag.push({ x: 200 + size - (i / 10) * size, y: 200 + size + 3 });
    // Left
    for (let i = 0; i <= 10; i++) squareWithSag.push({ x: 200, y: 200 + size - (i / 10) * size });

    const det = recognizeSmartShapeDetailed(squareWithSag);
    expect(det.shape).toBe('square');
    expect(det.points).toHaveLength(5);
  });

  it('prevents circular stroke from turning into ellipse (user regression test)', () => {
    const circlePts: Point[] = [];
    const r = 80;
    for (let i = 0; i < 40; i++) {
      const th = (i / 40) * 2 * Math.PI;
      // Slight 3% hand eccentricity
      const rad = r + Math.sin(2 * th) * 2;
      circlePts.push({ x: 300 + rad * Math.cos(th), y: 300 + rad * Math.sin(th) });
    }
    const det = recognizeSmartShapeDetailed(circlePts);
    expect(det.shape).toBe('circle');
  });

  it('prevents square from turning into triangle (user regression test)', () => {
    const squarePts: Point[] = [];
    const size = 150;
    for (let i = 0; i <= 12; i++) squarePts.push({ x: 100 + (i / 12) * size, y: 100 });
    for (let i = 0; i <= 12; i++) squarePts.push({ x: 100 + size, y: 100 + (i / 12) * size });
    for (let i = 0; i <= 12; i++) squarePts.push({ x: 100 + size - (i / 12) * size, y: 100 + size });
    for (let i = 0; i <= 12; i++) squarePts.push({ x: 100, y: 100 + size - (i / 12) * size });

    const det = recognizeSmartShapeDetailed(squarePts);
    expect(det.shape).toBe('square');
    expect(det.shape).not.toBe('triangle');
  });

  it('recognizes tilted / rotated square and rectangle (rotation invariance test)', () => {
    // 45 degree rotated square (diamond)
    const diamond: Point[] = [];
    const size = 100;
    const center = { x: 400, y: 400 };
    const angle = Math.PI / 4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const corners = [
      { x: -size / 2, y: -size / 2 },
      { x: size / 2, y: -size / 2 },
      { x: size / 2, y: size / 2 },
      { x: -size / 2, y: size / 2 },
    ];
    for (let side = 0; side < 4; side++) {
      const c1 = corners[side];
      const c2 = corners[(side + 1) % 4];
      for (let step = 0; step < 10; step++) {
        const t = step / 10;
        const lx = c1.x + t * (c2.x - c1.x);
        const ly = c1.y + t * (c2.y - c1.y);
        diamond.push({
          x: center.x + lx * cos - ly * sin,
          y: center.y + lx * sin + ly * cos,
        });
      }
    }
    const det = recognizeSmartShapeDetailed(diamond);
    expect(det.shape).toBe('square');
  });

  it('runs comprehensive synthetic noise benchmark across 7 classes', () => {
    const rng = createPRNG(42);
    const SAMPLES_PER_CLASS = 200;
    const classes: RecognizedLabel[] = ['line', 'circle', 'ellipse', 'square', 'rectangle', 'triangle', 'none'];

    // Confusion matrix: [actual][predicted]
    const matrix: Record<RecognizedLabel, Record<RecognizedLabel, number>> = {
      line: { line: 0, circle: 0, ellipse: 0, square: 0, rectangle: 0, triangle: 0, none: 0 },
      circle: { line: 0, circle: 0, ellipse: 0, square: 0, rectangle: 0, triangle: 0, none: 0 },
      ellipse: { line: 0, circle: 0, ellipse: 0, square: 0, rectangle: 0, triangle: 0, none: 0 },
      square: { line: 0, circle: 0, ellipse: 0, square: 0, rectangle: 0, triangle: 0, none: 0 },
      rectangle: { line: 0, circle: 0, ellipse: 0, square: 0, rectangle: 0, triangle: 0, none: 0 },
      triangle: { line: 0, circle: 0, ellipse: 0, square: 0, rectangle: 0, triangle: 0, none: 0 },
      none: { line: 0, circle: 0, ellipse: 0, square: 0, rectangle: 0, triangle: 0, none: 0 },
    };

    const generators: Record<RecognizedLabel, (rng: () => number) => Point[]> = {
      line: generateLineStroke,
      circle: generateCircleStroke,
      ellipse: generateEllipseStroke,
      square: generateSquareStroke,
      rectangle: generateRectangleStroke,
      triangle: generateTriangleStroke,
      none: generateNonShapeStroke,
    };

    let totalDurationMs = 0;

    for (const actual of classes) {
      const gen = generators[actual];
      for (let i = 0; i < SAMPLES_PER_CLASS; i++) {
        const stroke = gen(rng);
        const t0 = performance.now();
        const recognized = recognizeSmartShape(stroke);
        const t1 = performance.now();
        totalDurationMs += (t1 - t0);

        const predicted = classifyResult(stroke, recognized);
        matrix[actual][predicted]++;
      }
    }

    const totalStrokes = SAMPLES_PER_CLASS * classes.length;
    const avgLatencyMs = totalDurationMs / totalStrokes;

    console.log('\n============================================================');
    console.log(`SMART SHAPE BENCHMARK REPORT (${totalStrokes} samples, avg latency: ${avgLatencyMs.toFixed(3)}ms/stroke)`);
    console.log('============================================================');
    console.log('Actual \\ Predicted | ' + classes.map(c => c.padEnd(9)).join(' | '));
    console.log('-'.repeat(80));

    const accuracyByClass: Record<string, string> = {};

    for (const actual of classes) {
      const row = classes.map(c => String(matrix[actual][c]).padStart(9)).join(' | ');
      const correct = matrix[actual][actual];
      const acc = ((correct / SAMPLES_PER_CLASS) * 100).toFixed(1);
      accuracyByClass[actual] = `${acc}% (${correct}/${SAMPLES_PER_CLASS})`;
      console.log(`${actual.padEnd(18)} | ${row} | Acc: ${acc}%`);
    }
    console.log('============================================================\n');

    // We do not fail the benchmark here on the baseline, but record it
    expect(totalStrokes).toBe(1400);
  });
});
