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

  const cx = mx + uc;
  const cy = my + vc;

  let sumR = 0;
  for (const p of pts) {
    sumR += Math.hypot(p.x - cx, p.y - cy);
  }
  const radius = sumR / n;
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

  const theta = 0.5 * Math.atan2(2 * mxy, mxx - myy);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

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
  }

  const axisRatio = b / a;
  // If close to circular, force to circle
  if (axisRatio >= 0.88) {
    return fitCircle(pts, diagonal);
  }

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

  // Sample 36 angles spanning 0 to 90 degrees
  let bestAngle = 0;
  let minArea = Infinity;
  let bestCorners: Point[] = [];
  let bestW = 0, bestH = 0;
  let bestCenter = { x: minMeanX, y: minMeanY };

  const testAngle = (angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (const p of pts) {
      const u = p.x * cos + p.y * sin;
      const v = -p.x * sin + p.y * cos;
      if (u < minU) minU = u;
      if (u > maxU) maxU = u;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }

    const curW = maxU - minU;
    const curH = maxV - minV;
    const area = curW * curH;

    if (area < minArea) {
      minArea = area;
      bestAngle = angle;
      bestW = curW;
      bestH = curH;

      const midU = (minU + maxU) / 2;
      const midV = (minV + maxV) / 2;
      bestCenter = {
        x: midU * cos - midV * sin,
        y: midU * sin + midV * cos,
      };
    }
  };

  for (let step = 0; step < 36; step++) {
    testAngle(baseAngle + (step * (Math.PI / 2)) / 36);
  }
  const fineStep = (Math.PI / 2) / 72;
  testAngle(bestAngle - fineStep);
  testAngle(bestAngle + fineStep);

  // Snap angle if almost horizontal or vertical
  let snappedAngle = bestAngle % (Math.PI / 2);
  if (snappedAngle < 0) snappedAngle += Math.PI / 2;
  if (snappedAngle < 0.08 || Math.abs(snappedAngle - Math.PI / 2) < 0.08) {
    bestAngle = 0;
  }

  const cos = Math.cos(bestAngle);
  const sin = Math.sin(bestAngle);

  // Aspect ratio check for Square vs Rectangle
  const ratio = Math.min(bestW, bestH) / Math.max(bestW, bestH || 1);
  const isSquare = ratio >= 0.84;

  let halfW = bestW / 2;
  let halfH = bestH / 2;

  if (isSquare) {
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

  // Strict Open vs Closed classification:
  // Closed curves have ends coming back close together: endsDist / totalArc <= 0.20
  const isClosedStroke = closureRatio <= 0.20;

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
    // Closed stroke: Resample with closure segment to ensure full polygon fitting
    const closedStroke = [...resampled, { ...p0 }];
    const sharpCount = countSharpCorners(closedStroke, bbox.diagonal);

    // Fit Closed Primitives
    const circle = fitCircle(closedStroke, bbox.diagonal);
    if (circle) candidates.push(circle);

    const ellipse = fitEllipse(closedStroke, bbox.diagonal);
    if (ellipse) candidates.push(ellipse);

    const rect = fitRotatedRectangle(closedStroke, bbox.diagonal);
    if (rect) candidates.push(rect);

    const triangle = fitTriangle(closedStroke, bbox.diagonal);
    if (triangle) candidates.push(triangle);

    const strokeArea = computePolygonArea(closedStroke);
    const rectArea = rect ? computePolygonArea(rect.points) : 0;
    const fillRatio = rectArea > 0 ? (strokeArea / rectArea) : 1;

    // Apply Corner Disambiguation & Complexity Penalties
    for (const c of candidates) {
      if (c.shape === 'triangle') {
        c.error *= (sharpCount === 3 ? 0.85 : (sharpCount >= 4 ? 1.4 : 1.05));
        if (fillRatio >= 0.72) c.error *= 1.60;
      } else if (c.shape === 'square' || c.shape === 'rectangle') {
        c.error *= (sharpCount >= 3 ? 0.85 : (sharpCount === 0 ? 1.25 : 1.0));
        if (fillRatio >= 0.80) c.error *= 0.88;
        else if (fillRatio <= 0.72) c.error *= 1.35;
      } else if (c.shape === 'circle') {
        c.error *= (sharpCount >= 2 ? 1.5 : (sharpCount <= 1 ? 0.95 : 1.0));
        if (fillRatio <= 0.80) c.error *= 0.95;
      } else if (c.shape === 'ellipse') {
        c.error *= (sharpCount >= 3 ? 1.6 : (sharpCount === 0 ? 0.95 : 1.0));
        if (fillRatio <= 0.80) c.error *= 0.90;
        else if (fillRatio >= 0.80) c.error *= 1.80;
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
