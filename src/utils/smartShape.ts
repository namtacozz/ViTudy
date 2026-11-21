/**
 * Smart Shape Recognition for ViTudy Canvas (Model-Fitting Core)
 * Uses robust mathematical fitting (Total Least Squares Line, Algebraic Circle Fit,
 * Minimum Area Rotated Rectangle, Resampled Curve Fitting, and Geometric Optimization)
 * to beautify hand-drawn sketches into accurate geometric primitives.
 */

export interface Point {
  x: number;
  y: number;
}

export type ShapeType = 'line' | 'circle' | 'ellipse' | 'triangle' | 'square' | 'rectangle' | 'none';

export interface RecognizedShapeResult {
  shape: ShapeType;
  confidence: number;
  points: Point[];
  originalPoints: Point[];
}

interface ShapeCandidate {
  shape: ShapeType;
  points: Point[];
  error: number; // normalized mean distance / diagonal
  confidence: number;
  outerArea?: number;
}

// ============================================================================
// 1. PREPROCESSING: SMOOTHING & UNIFORM ARC-LENGTH RESAMPLING
// ============================================================================

export function smoothPoints(pts: Point[]): Point[] {
  if (pts.length <= 2) return pts;
  const smoothed: Point[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    smoothed.push({
      x: 0.25 * pts[i - 1].x + 0.5 * pts[i].x + 0.25 * pts[i + 1].x,
      y: 0.25 * pts[i - 1].y + 0.5 * pts[i].y + 0.25 * pts[i + 1].y,
    });
  }
  smoothed.push(pts[pts.length - 1]);
  return smoothed;
}

export function computeArcLengths(pts: Point[]): { lengths: number[]; total: number } {
  const lengths = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    lengths.push(total);
  }
  return { lengths, total };
}

export function resampleByArcLength(pts: Point[], n = 64): Point[] {
  if (pts.length <= 1) return pts;
  const { lengths, total } = computeArcLengths(pts);
  if (total <= 1e-4) return Array(n).fill({ ...pts[0] });

  const resampled: Point[] = [{ ...pts[0] }];
  const step = total / (n - 1);
  let curIdx = 0;

  for (let i = 1; i < n - 1; i++) {
    const targetDist = i * step;
    while (curIdx < lengths.length - 1 && lengths[curIdx + 1] < targetDist) {
      curIdx++;
    }
    const d0 = lengths[curIdx];
    const d1 = lengths[curIdx + 1];
    const segLen = d1 - d0;
    const t = segLen > 1e-6 ? (targetDist - d0) / segLen : 0;

    resampled.push({
      x: pts[curIdx].x + t * (pts[curIdx + 1].x - pts[curIdx].x),
      y: pts[curIdx].y + t * (pts[curIdx + 1].y - pts[curIdx].y),
    });
  }

  resampled.push({ ...pts[pts.length - 1] });
  return resampled;
}

export function computeBoundingBox(pts: Point[]) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const diagonal = Math.hypot(w, h) || 1;
  const cx = minX + w / 2;
  const cy = minY + h / 2;
  return { minX, maxX, minY, maxY, w, h, diagonal, cx, cy };
}

// ============================================================================
// 2. CORNER DETECTION & POLYGON HELPERS
// ============================================================================

export function ramerDouglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const last = points.length - 1;

  for (let i = 1; i < last; i++) {
    const d = pointToSegmentDistance(points[i], points[0], points[last]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = ramerDouglasPeucker(points.slice(0, index + 1), epsilon);
    const rec2 = ramerDouglasPeucker(points.slice(index), epsilon);
    return [...rec1.slice(0, -1), ...rec2];
  }

  return [points[0], points[last]];
}

export function pointToSegmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

export function computePolygonArea(pts: Point[]): number {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

export function countSharpCorners(pts: Point[], diagonal: number): number {
  if (pts.length < 5) return 0;
  const simplified = ramerDouglasPeucker(pts, Math.max(5, diagonal * 0.045));
  if (simplified.length < 3) return 0;

  let count = 0;
  const m = simplified.length;
  for (let i = 1; i < m - 1; i++) {
    const prev = simplified[i - 1];
    const curr = simplified[i];
    const next = simplified[i + 1];

    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);
    if (d1 < diagonal * 0.06 || d2 < diagonal * 0.06) continue;

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const dot = v1x * v2x + v1y * v2y;
    const cosAngle = dot / (d1 * d2);
    const angleDeg = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
    if (angleDeg >= 50 && angleDeg <= 118) {
      count++;
    }
  }
  return count;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Trim self-overlapping or overshooting start/end tails on nearly closed strokes
 * so tail noise does not shift shape centroids or bounding dimensions.
 */
export function trimClosedStrokeOvershoot(pts: Point[], diagonal: number): Point[] {
  const n = pts.length;
  if (n < 12) return pts;

  const endsDist = Math.hypot(pts[n - 1].x - pts[0].x, pts[n - 1].y - pts[0].y);
  const maxStartIdx = Math.floor(n * 0.16);
  const minEndIdx = Math.ceil(n * 0.82);

  let bestI = 0;
  let bestJ = n - 1;
  let bestDist = endsDist;

  for (let i = 0; i <= maxStartIdx; i++) {
    for (let j = minEndIdx; j < n; j++) {
      if (j - i < Math.floor(n * 0.72)) continue;
      const d = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
      if (d < bestDist) {
        bestDist = d;
        bestI = i;
        bestJ = j;
      }
    }
  }

  if ((bestI > 0 || bestJ < n - 1) && bestDist <= Math.min(endsDist * 0.65, diagonal * 0.12)) {
    return pts.slice(bestI, bestJ + 1);
  }
  return pts;
}

/**
 * Fit a 2D line via Total Least Squares (PCA) returning a point on the line and unit direction.
 */
function fitTlsLineModel(pts: Point[]): { origin: Point; dir: Point } | null {
  const n = pts.length;
  if (n < 2) return null;
  let meanX = 0, meanY = 0;
  for (const p of pts) {
    meanX += p.x;
    meanY += p.y;
  }
  meanX /= n;
  meanY /= n;

  let sxx = 0, sxy = 0, syy = 0;
  for (const p of pts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  if (sxx + syy < 1e-6) return null;
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return {
    origin: { x: meanX, y: meanY },
    dir: { x: Math.cos(theta), y: Math.sin(theta) },
  };
}

function intersectLines(
  l1: { origin: Point; dir: Point },
  l2: { origin: Point; dir: Point }
): Point | null {
  const det = l1.dir.x * (-l2.dir.y) - l1.dir.y * (-l2.dir.x);
  if (Math.abs(det) < 1e-4) return null;
  const dx = l2.origin.x - l1.origin.x;
  const dy = l2.origin.y - l1.origin.y;
  const t = (dx * (-l2.dir.y) - dy * (-l2.dir.x)) / det;
  return {
    x: l1.origin.x + t * l1.dir.x,
    y: l1.origin.y + t * l1.dir.y,
  };
}

// ============================================================================
// 3. MODEL FITTERS
// ============================================================================

/**
 * 3A. Straight Line Fit via Total Least Squares (PCA)
 */
export function fitLine(pts: Point[], diagonal: number): ShapeCandidate | null {
  const n = pts.length;
  if (n < 2) return null;

  let meanX = 0, meanY = 0;
  for (const p of pts) {
    meanX += p.x;
    meanY += p.y;
  }
  meanX /= n;
  meanY /= n;

  let sxx = 0, sxy = 0, syy = 0;
  for (const p of pts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }

  // Principal direction
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const dirX = Math.cos(theta);
  const dirY = Math.sin(theta);

  // Project endpoints along principal axis
  let minT = Infinity;
  let maxT = -Infinity;
  let totalDist = 0;

  for (const p of pts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    const t = dx * dirX + dy * dirY;
    const perpDist = Math.abs(dx * (-dirY) + dy * dirX);
    totalDist += perpDist;
    if (t < minT) minT = t;
    if (t > maxT) maxT = t;
  }

  const error = (totalDist / n) / diagonal;

  let p0 = { x: meanX + minT * dirX, y: meanY + minT * dirY };
  let pN = { x: meanX + maxT * dirX, y: meanY + maxT * dirY };

  // Angle snapping: horizontal (< ~7.5 deg) or vertical (< ~7.5 deg)
  const lineAngle = Math.atan2(pN.y - p0.y, pN.x - p0.x);
  const absAngle = Math.abs(lineAngle);
  const snapThreshold = 0.13; // ~7.5 degrees

  if (absAngle < snapThreshold || Math.abs(absAngle - Math.PI) < snapThreshold) {
    const midY = (p0.y + pN.y) / 2;
    p0.y = midY;
    pN.y = midY;
  } else if (Math.abs(absAngle - Math.PI / 2) < snapThreshold) {
    const midX = (p0.x + pN.x) / 2;
    p0.x = midX;
    pN.x = midX;
  }

  p0.x = Math.round(p0.x);
  p0.y = Math.round(p0.y);
  pN.x = Math.round(pN.x);
  pN.y = Math.round(pN.y);

  // Line error must be small (straight strokes with small hand jitter)
  if (error > 0.058) return null;

  return {
    shape: 'line',
    points: [p0, pN],
    error,
    confidence: Math.max(0, Math.min(1, 1 - error * 8)),
  };
}

/**
 * 3B. Circle Fit (Algebraic Least Squares Kasa method)
 */
export function fitCircle(pts: Point[], diagonal: number): ShapeCandidate | null {
  const n = pts.length;
  if (n < 4) return null;

  let sumX = 0, sumY = 0;
  for (const p of pts) {
    sumX += p.x;
    sumY += p.y;
  }
  const mx = sumX / n;
  const my = sumY / n;

  let mxx = 0, myy = 0, mxy = 0, mxz = 0, myz = 0;
  for (const p of pts) {
    const u = p.x - mx;
    const v = p.y - my;
    const z = u * u + v * v;
    mxx += u * u;
    myy += v * v;
    mxy += u * v;
    mxz += u * z;
    myz += v * z;
  }

  const det = mxx * myy - mxy * mxy;
  if (Math.abs(det) < 1e-6) return null;

  const uc = (mxz * myy - myz * mxy) / (2 * det);
  const vc = (mxx * myz - mxy * mxz) / (2 * det);

  let cx = mx + uc;
  let cy = my + vc;

  // Two lightweight radial-median refinement steps so the fitted circle hugs ink density
  for (let iter = 0; iter < 2; iter++) {
    const rMed = median(pts.map(p => Math.hypot(p.x - cx, p.y - cy)));
    if (rMed <= 2) break;
    let nextX = 0;
    let nextY = 0;
    let valid = 0;
    for (const p of pts) {
      const dist = Math.hypot(p.x - cx, p.y - cy);
      if (dist > 1e-4) {
        nextX += p.x - (rMed * (p.x - cx)) / dist;
        nextY += p.y - (rMed * (p.y - cy)) / dist;
        valid++;
      }
    }
    if (valid > 0) {
      cx = nextX / valid;
      cy = nextY / valid;
    }
  }

  const radius = median(pts.map(p => Math.hypot(p.x - cx, p.y - cy)));
  if (radius <= 2) return null;

  let totalDist = 0;
  for (const p of pts) {
    totalDist += Math.abs(Math.hypot(p.x - cx, p.y - cy) - radius);
  }
  const error = (totalDist / n) / diagonal;

  const output: Point[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    output.push({
      x: Math.round(cx + radius * Math.cos(theta)),
      y: Math.round(cy + radius * Math.sin(theta)),
    });
  }

  return {
    shape: 'circle',
    points: output,
    error,
    confidence: Math.max(0, Math.min(1, 1 - error * 5)),
  };
}

/**
 * 3C. Rotated Ellipse Fit via PCA & Moment Analysis
 */
export function fitEllipse(pts: Point[], diagonal: number): ShapeCandidate | null {
  const n = pts.length;
  if (n < 6) return null;

  let meanX = 0, meanY = 0;
  for (const p of pts) {
    meanX += p.x;
    meanY += p.y;
  }
  meanX /= n;
  meanY /= n;

  let mxx = 0, myy = 0, mxy = 0;
  for (const p of pts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    mxx += dx * dx;
    myy += dy * dy;
    mxy += dx * dy;
  }
  mxx /= n;
  myy /= n;
  mxy /= n;

  let theta = 0.5 * Math.atan2(2 * mxy, mxx - myy);
  let cos = Math.cos(theta);
  let sin = Math.sin(theta);

  // Variances in rotated frame
  let varU = 0, varV = 0;
  for (const p of pts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    const u = dx * cos + dy * sin;
    const v = -dx * sin + dy * cos;
    varU += u * u;
    varV += v * v;
  }
  varU /= n;
  varV /= n;

  let a = Math.sqrt(Math.max(1, 2 * varU));
  let b = Math.sqrt(Math.max(1, 2 * varV));

  if (a < b) {
    const tmp = a;
    a = b;
    b = tmp;
    // Rotate frame by 90 degrees so major axis a always aligns with theta
    theta += Math.PI / 2;
    cos = Math.cos(theta);
    sin = Math.sin(theta);
  }

  const axisRatio = b / a;
  // If close to circular, force to circle
  if (axisRatio >= 0.88) {
    return fitCircle(pts, diagonal);
  }

  // Ink-hugging radial scale refinement using median normalized distance
  const normRadii: number[] = [];
  for (const p of pts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    const u = dx * cos + dy * sin;
    const v = -dx * sin + dy * cos;
    normRadii.push(Math.hypot(u / a, v / b));
  }
  const medScale = Math.max(0.88, Math.min(1.12, median(normRadii)));
  a *= medScale;
  b *= medScale;

  let totalDist = 0;
  for (const p of pts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    const u = dx * cos + dy * sin;
    const v = -dx * sin + dy * cos;
    // Normalized algebraic distance approximation to ellipse boundary
    const val = Math.hypot(u / a, v / b);
    const approxDist = Math.abs(val - 1) * Math.min(a, b);
    totalDist += approxDist;
  }
  const error = (totalDist / n) / diagonal;

  const output: Point[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const u = a * Math.cos(t);
    const v = b * Math.sin(t);
    output.push({
      x: Math.round(meanX + u * cos - v * sin),
      y: Math.round(meanY + u * sin + v * cos),
    });
  }

  return {
    shape: 'ellipse',
    points: output,
    error,
    confidence: Math.max(0, Math.min(1, 1 - error * 5)),
  };
}

/**
 * 3D. Rotated Rectangle and Square Fit via Minimum Bounding Box Search
 */
export function fitRotatedRectangle(pts: Point[], diagonal: number): ShapeCandidate | null {
  if (pts.length < 4) return null;

  // Search best rotation angle with fine step around Convex Hull / Moments
  let minMeanX = 0, minMeanY = 0;
  for (const p of pts) {
    minMeanX += p.x;
    minMeanY += p.y;
  }
  minMeanX /= pts.length;
  minMeanY /= pts.length;

  let mxx = 0, myy = 0, mxy = 0;
  for (const p of pts) {
    const dx = p.x - minMeanX;
    const dy = p.y - minMeanY;
    mxx += dx * dx;
    myy += dy * dy;
    mxy += dx * dy;
  }
  const baseAngle = 0.5 * Math.atan2(2 * mxy, mxx - myy);

  // Sample 36 angles spanning 0 to 90 degrees + dominant RDP segment angles
  let bestAngle = 0;
  let bestScore = Infinity;
  let minArea = Infinity;
  let bestOuterArea = Infinity;
  let bestCorners: Point[] = [];
  let bestW = 0, bestH = 0;
  let bestCenter = { x: minMeanX, y: minMeanY };

  const computeInkEdgesAtAngle = (angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;
    const uvPts: Array<{ u: number; v: number }> = [];

    for (const p of pts) {
      const u = p.x * cos + p.y * sin;
      const v = -p.x * sin + p.y * cos;
      uvPts.push({ u, v });
      if (u < minU) minU = u;
      if (u > maxU) maxU = u;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }

    const rawW = Math.max(1, maxU - minU);
    const rawH = Math.max(1, maxV - minV);

    const leftBand: number[] = [];
    const rightBand: number[] = [];
    const topBand: number[] = [];
    const bottomBand: number[] = [];

    for (const { u, v } of uvPts) {
      if (u <= minU + 0.18 * rawW) leftBand.push(u);
      if (u >= maxU - 0.18 * rawW) rightBand.push(u);
      if (v <= minV + 0.18 * rawH) topBand.push(v);
      if (v >= maxV - 0.18 * rawH) bottomBand.push(v);
    }

    const uLeft = leftBand.length >= 2 ? median(leftBand) : minU;
    const uRight = rightBand.length >= 2 ? median(rightBand) : maxU;
    const vTop = topBand.length >= 2 ? median(topBand) : minV;
    const vBottom = bottomBand.length >= 2 ? median(bottomBand) : maxV;

    const curW = Math.max(2, uRight - uLeft);
    const curH = Math.max(2, vBottom - vTop);
    const area = curW * curH;

    let edgeErrSum = 0;
    for (const { u, v } of uvPts) {
      const cu = Math.max(uLeft, Math.min(uRight, u));
      const cv = Math.max(vTop, Math.min(vBottom, v));
      const dLeft = Math.hypot(u - uLeft, v - cv);
      const dRight = Math.hypot(u - uRight, v - cv);
      const dTop = Math.hypot(u - cu, v - vTop);
      const dBottom = Math.hypot(u - cu, v - vBottom);
      edgeErrSum += Math.min(dLeft, dRight, dTop, dBottom);
    }
    const meanEdgeErr = (edgeErrSum / uvPts.length) / diagonal;
    const midU = (uLeft + uRight) / 2;
    const midV = (vTop + vBottom) / 2;

    return {
      curW,
      curH,
      area,
      outerArea: rawW * rawH,
      meanEdgeErr,
      center: {
        x: midU * cos - midV * sin,
        y: midU * sin + midV * cos,
      },
    };
  };

  const testAngle = (angle: number) => {
    const res = computeInkEdgesAtAngle(angle);
    // Score prioritizes lowest ink-to-edge error, tie-broken lightly by compact area
    const score = res.meanEdgeErr + (res.area / (diagonal * diagonal)) * 0.015;
    if (score < bestScore - 1e-5 || (Math.abs(score - bestScore) <= 1e-5 && res.area < minArea)) {
      bestScore = score;
      minArea = res.area;
      bestOuterArea = res.outerArea;
      bestAngle = angle;
      bestW = res.curW;
      bestH = res.curH;
      bestCenter = res.center;
    }
  };

  for (let step = 0; step < 36; step++) {
    testAngle(baseAngle + (step * (Math.PI / 2)) / 36);
  }
  const rdpForAngle = ramerDouglasPeucker(pts, Math.max(4, diagonal * 0.04));
  for (let i = 0; i < rdpForAngle.length - 1; i++) {
    const segLen = Math.hypot(
      rdpForAngle[i + 1].x - rdpForAngle[i].x,
      rdpForAngle[i + 1].y - rdpForAngle[i].y
    );
    if (segLen >= diagonal * 0.15) {
      testAngle(Math.atan2(rdpForAngle[i + 1].y - rdpForAngle[i].y, rdpForAngle[i + 1].x - rdpForAngle[i].x));
    }
  }
  const fineStep = (Math.PI / 2) / 72;
  testAngle(bestAngle - fineStep);
  testAngle(bestAngle + fineStep);

  // Snap angle only if almost horizontal or vertical (~3.4 degrees)
  let snappedAngle = bestAngle % (Math.PI / 2);
  if (snappedAngle < 0) snappedAngle += Math.PI / 2;
  if (snappedAngle < 0.06 || Math.abs(snappedAngle - Math.PI / 2) < 0.06) {
    bestAngle = 0;
    const snappedRes = computeInkEdgesAtAngle(0);
    bestW = snappedRes.curW;
    bestH = snappedRes.curH;
    bestOuterArea = snappedRes.outerArea;
    bestCenter = snappedRes.center;
  }

  const cos = Math.cos(bestAngle);
  const sin = Math.sin(bestAngle);

  // Aspect ratio check for Square vs Rectangle
  const ratio = Math.min(bestW, bestH) / Math.max(bestW, bestH || 1);
  const isSquare = ratio >= 0.84;

  let halfW = bestW / 2;
  let halfH = bestH / 2;

  if (ratio >= 0.88) {
    const s = (bestW + bestH) / 2;
    halfW = s / 2;
    halfH = s / 2;
  }

  // Generate 4 corners
  const localCorners = [
    { u: -halfW, v: -halfH },
    { u: halfW, v: -halfH },
    { u: halfW, v: halfH },
    { u: -halfW, v: halfH },
  ];

  bestCorners = localCorners.map(lc => ({
    x: Math.round(bestCenter.x + lc.u * cos - lc.v * sin),
    y: Math.round(bestCenter.y + lc.u * sin + lc.v * cos),
  }));
  bestCorners.push({ ...bestCorners[0] });

  // Calculate error as average distance to the 4 edges
  let totalDist = 0;
  for (const p of pts) {
    let minDistToEdge = Infinity;
    for (let e = 0; e < 4; e++) {
      const dist = pointToSegmentDistance(p, bestCorners[e], bestCorners[e + 1]);
      if (dist < minDistToEdge) minDistToEdge = dist;
    }
    totalDist += minDistToEdge;
  }
  const error = (totalDist / pts.length) / diagonal;

  return {
    shape: isSquare ? 'square' : 'rectangle',
    points: bestCorners,
    error,
    confidence: Math.max(0, Math.min(1, 1 - error * 5)),
    outerArea: bestOuterArea,
  };
}

/**
 * 3E. Triangle Fit via RDP simplification and 3-segment Least Squares
 */
export function fitTriangle(pts: Point[], diagonal: number): ShapeCandidate | null {
  if (pts.length < 5) return null;

  // Adaptive epsilon to find exactly 3 main corner vertices
  let eps = Math.max(6, diagonal * 0.04);
  let simplified = ramerDouglasPeucker(pts, eps);
  let iterations = 0;

  while (simplified.length - 1 > 3 && iterations < 10) {
    eps *= 1.35;
    simplified = ramerDouglasPeucker(pts, eps);
    iterations++;
  }

  let vertices: Point[] = [];
  if (simplified.length - 1 === 3) {
    vertices = simplified.slice(0, 3);
  } else {
    // Pick 3 points maximizing enclosed triangle area
    let maxArea = -1;
    const len = simplified.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        for (let k = j + 1; k < len; k++) {
          const p1 = simplified[i];
          const p2 = simplified[j];
          const p3 = simplified[k];
          const area = Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2;
          if (area > maxArea) {
            maxArea = area;
            vertices = [p1, p2, p3];
          }
        }
      }
    }
  }

  if (vertices.length < 3) return null;

  // Refine triangle corners by intersecting TLS lines fitted to each edge's interior points
  const edgeBuckets: Point[][] = [[], [], []];
  for (const p of pts) {
    let bestEdge = 0;
    let bestDist = Infinity;
    for (let e = 0; e < 3; e++) {
      const d = pointToSegmentDistance(p, vertices[e], vertices[(e + 1) % 3]);
      if (d < bestDist) {
        bestDist = d;
        bestEdge = e;
      }
    }
    const a = vertices[bestEdge];
    const b = vertices[(bestEdge + 1) % 3];
    const abX = b.x - a.x;
    const abY = b.y - a.y;
    const lenSq = abX * abX + abY * abY;
    if (lenSq > 1e-4) {
      const t = ((p.x - a.x) * abX + (p.y - a.y) * abY) / lenSq;
      if (t >= 0.15 && t <= 0.85) {
        edgeBuckets[bestEdge].push(p);
      }
    }
  }

  const edgeLines = edgeBuckets.map((bucket, idx) => {
    if (bucket.length >= 4) {
      const tls = fitTlsLineModel(bucket);
      if (tls) return tls;
    }
    const a = vertices[idx];
    const b = vertices[(idx + 1) % 3];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return {
      origin: a,
      dir: { x: (b.x - a.x) / len, y: (b.y - a.y) / len },
    };
  });

  const i0 = intersectLines(edgeLines[2], edgeLines[0]);
  const i1 = intersectLines(edgeLines[0], edgeLines[1]);
  const i2 = intersectLines(edgeLines[1], edgeLines[2]);
  if (
    i0 &&
    i1 &&
    i2 &&
    Math.hypot(i0.x - vertices[0].x, i0.y - vertices[0].y) <= diagonal * 0.18 &&
    Math.hypot(i1.x - vertices[1].x, i1.y - vertices[1].y) <= diagonal * 0.18 &&
    Math.hypot(i2.x - vertices[2].x, i2.y - vertices[2].y) <= diagonal * 0.18
  ) {
    vertices = [i0, i1, i2];
  }

  // Close triangle: 4 points
  const trianglePoints = [
    { x: Math.round(vertices[0].x), y: Math.round(vertices[0].y) },
    { x: Math.round(vertices[1].x), y: Math.round(vertices[1].y) },
    { x: Math.round(vertices[2].x), y: Math.round(vertices[2].y) },
    { x: Math.round(vertices[0].x), y: Math.round(vertices[0].y) },
  ];

  let totalDist = 0;
  for (const p of pts) {
    const d0 = pointToSegmentDistance(p, trianglePoints[0], trianglePoints[1]);
    const d1 = pointToSegmentDistance(p, trianglePoints[1], trianglePoints[2]);
    const d2 = pointToSegmentDistance(p, trianglePoints[2], trianglePoints[0]);
    totalDist += Math.min(d0, d1, d2);
  }
  const error = (totalDist / pts.length) / diagonal;

  return {
    shape: 'triangle',
    points: trianglePoints,
    error,
    confidence: Math.max(0, Math.min(1, 1 - error * 5)),
  };
}

// ============================================================================
// 4. MAIN RECOGNITION ORCHESTRATOR
// ============================================================================

export function recognizeSmartShapeDetailed(rawPoints: Point[]): RecognizedShapeResult {
  if (!rawPoints || rawPoints.length < 5) {
    return { shape: 'none', confidence: 0, points: rawPoints, originalPoints: rawPoints };
  }

  const smoothed = smoothPoints(rawPoints);
  const bbox = computeBoundingBox(smoothed);

  // If stroke is microscopic, reject
  if (bbox.diagonal < 12) {
    return { shape: 'none', confidence: 0, points: rawPoints, originalPoints: rawPoints };
  }

  // Resample to N=64 uniform arc-length points
  const resampled = resampleByArcLength(smoothed, 64);
  const { total: totalArc } = computeArcLengths(resampled);

  const p0 = resampled[0];
  const pN = resampled[resampled.length - 1];
  const endsDist = Math.hypot(pN.x - p0.x, pN.y - p0.y);
  const closureRatio = endsDist / (totalArc || 1);

  // Trim overshooting tails when stroke ends cross or loop back close together
  const trimmedClosedCandidate = trimClosedStrokeOvershoot(smoothed, bbox.diagonal);
  const trimmedResampled =
    trimmedClosedCandidate.length < smoothed.length
      ? resampleByArcLength(trimmedClosedCandidate, 64)
      : resampled;
  const trimmedEndsDist = Math.hypot(
    trimmedResampled[trimmedResampled.length - 1].x - trimmedResampled[0].x,
    trimmedResampled[trimmedResampled.length - 1].y - trimmedResampled[0].y
  );
  const { total: trimmedTotalArc } = computeArcLengths(trimmedResampled);
  const trimmedClosureRatio = trimmedEndsDist / (trimmedTotalArc || 1);

  // Strict Open vs Closed classification:
  // Closed curves have ends coming back close together: endsDist / totalArc <= 0.20 (or after overshoot trim)
  const isClosedStroke = closureRatio <= 0.20 || (trimmedClosedCandidate.length < smoothed.length && trimmedClosureRatio <= 0.20);

  const candidates: ShapeCandidate[] = [];

  if (!isClosedStroke) {
    // Open stroke: only consider straight line if path spans its bounding box and is not highly winding (letters S, Z, M, C)
    const spanRatio = endsDist / (bbox.diagonal || 1);
    const directRatio = endsDist / (totalArc || 1);
    if (spanRatio >= 0.70 && directRatio >= 0.45) {
      const lineFit = fitLine(resampled, bbox.diagonal);
      if (lineFit) {
        candidates.push(lineFit);
      }
    }
  } else {
    // Closed stroke: use overshoot-trimmed points and append closure segment
    const baseClosed = trimmedClosureRatio <= closureRatio ? trimmedResampled : resampled;
    const closedStroke = [...baseClosed, { ...baseClosed[0] }];
    const closedBbox = computeBoundingBox(closedStroke);
    const sharpCount = countSharpCorners(closedStroke, closedBbox.diagonal);

    // Fit Closed Primitives
    const circle = fitCircle(closedStroke, closedBbox.diagonal);
    if (circle) candidates.push(circle);

    const ellipse = fitEllipse(closedStroke, closedBbox.diagonal);
    if (ellipse) candidates.push(ellipse);

    const rect = fitRotatedRectangle(closedStroke, closedBbox.diagonal);
    if (rect) candidates.push(rect);

    const triangle = fitTriangle(closedStroke, closedBbox.diagonal);
    if (triangle) candidates.push(triangle);

    const strokeArea = computePolygonArea(closedStroke);
    const rectArea = rect ? (rect.outerArea ?? computePolygonArea(rect.points)) : 0;
    const fillRatio = rectArea > 0 ? (strokeArea / rectArea) : 1;

    // Apply Corner Disambiguation & Complexity Penalties
    for (const c of candidates) {
      if (c.shape === 'triangle') {
        c.error *= (sharpCount === 3 ? 0.85 : (sharpCount >= 4 ? 1.4 : 1.05));
        if (fillRatio >= 0.72) c.error *= 1.60;
      } else if (c.shape === 'square' || c.shape === 'rectangle') {
        c.error *= (sharpCount >= 3 ? 0.85 : (sharpCount === 0 ? 1.35 : 1.0));
        if (fillRatio >= 0.84) c.error *= 0.88;
        else if (fillRatio <= 0.78) c.error *= 1.35;
      } else if (c.shape === 'circle') {
        c.error *= (sharpCount >= 2 ? 1.5 : (sharpCount <= 1 ? 0.95 : 1.0));
        if (fillRatio <= 0.83) c.error *= 0.95;
      } else if (c.shape === 'ellipse') {
        c.error *= (sharpCount >= 3 ? 1.6 : (sharpCount === 0 ? 0.92 : 1.0));
        if (fillRatio <= 0.84) c.error *= 0.90;
        else if (fillRatio >= 0.86) c.error *= 1.80;
      }
    }
  }

  if (candidates.length === 0) {
    return { shape: 'none', confidence: 0, points: rawPoints, originalPoints: rawPoints };
  }

  // Sort by lowest penalized error
  candidates.sort((a, b) => a.error - b.error);
  const best = candidates[0];

  // Rejection threshold: must be within 8.5% of diagonal error
  const MAX_REJECTION_ERROR = 0.085;
  if (best.error > MAX_REJECTION_ERROR) {
    return { shape: 'none', confidence: Math.max(0, 1 - best.error * 5), points: rawPoints, originalPoints: rawPoints };
  }

  return {
    shape: best.shape,
    confidence: best.confidence,
    points: best.points,
    originalPoints: rawPoints,
  };
}

/**
 * Public backward-compatible API: returns beautified Point[] or original points
 */
export function recognizeSmartShape(points: Point[]): Point[] {
  const result = recognizeSmartShapeDetailed(points);
  return result.shape !== 'none' ? result.points : points;
}
