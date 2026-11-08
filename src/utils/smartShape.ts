/**
 * Smart Shape Recognition for ViTudy Canvas
 * Converts hand-drawn messy sketches into perfect geometric shapes
 * (Circle, Ellipse, Square, Rectangle, Triangle, Straight Line)
 */

export interface Point {
  x: number;
  y: number;
}

export function recognizeSmartShape(points: Point[]): Point[] {
  if (points.length < 5) return points;

  const n = points.length;
  const p0 = points[0];
  const pN = points[n - 1];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  let totalPathLength = 0;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;

    if (i > 0) {
      totalPathLength += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
    }
  }

  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 10 && h < 10) return points;

  const cx = minX + w / 2;
  const cy = minY + h / 2;
  const endsDist = Math.hypot(pN.x - p0.x, pN.y - p0.y);
  const maxDim = Math.max(w, h);

  // 1. Check if OPEN STROKE -> Straight Line
  const isClosed = endsDist / maxDim < 0.35 || endsDist < 35;

  if (!isClosed) {
    // If start-to-end direct distance is > 85% of total path length, it's a straight line
    if (endsDist > totalPathLength * 0.82) {
      // Check for horizontal or vertical snap within 8 degrees
      const angle = Math.atan2(pN.y - p0.y, pN.x - p0.x);
      const absAngle = Math.abs(angle);
      const snapThreshold = 0.14; // ~8 deg

      let snappedP0 = { ...p0 };
      let snappedPN = { ...pN };

      if (absAngle < snapThreshold || Math.abs(absAngle - Math.PI) < snapThreshold) {
        // Horizontal line
        const midY = (p0.y + pN.y) / 2;
        snappedP0.y = midY;
        snappedPN.y = midY;
      } else if (Math.abs(absAngle - Math.PI / 2) < snapThreshold) {
        // Vertical line
        const midX = (p0.x + pN.x) / 2;
        snappedP0.x = midX;
        snappedPN.x = midX;
      }

      return [snappedP0, snappedPN];
    }
    return points;
  }

  // 2. CLOSED SHAPES ANALYSIS
  const aspectRatio = w / h;

  // Calculate distance from center for all points
  const rads: number[] = [];
  let sumR = 0;
  for (const p of points) {
    const r = Math.hypot(p.x - cx, p.y - cy);
    rads.push(r);
    sumR += r;
  }
  const meanR = sumR / n;

  let sumVarR = 0;
  for (const r of rads) {
    sumVarR += (r - meanR) * (r - meanR);
  }
  const stdR = Math.sqrt(sumVarR / n);
  const cvR = stdR / (meanR || 1); // Coefficient of variation of radius

  // 2A. CIRCLE: Low radius variance & aspect ratio near 1
  if (cvR < 0.22 && aspectRatio >= 0.78 && aspectRatio <= 1.28) {
    const radius = (w + h) / 4;
    const circlePoints: Point[] = [];
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      circlePoints.push({
        x: Math.round(cx + radius * Math.cos(theta)),
        y: Math.round(cy + radius * Math.sin(theta))
      });
    }
    return circlePoints;
  }

  // 2B. ELLIPSE: Low ellipse-normalized variance
  const rx = w / 2;
  const ry = h / 2;
  let sumNormDev = 0;
  for (const p of points) {
    const normDist = Math.hypot((p.x - cx) / (rx || 1), (p.y - cy) / (ry || 1));
    sumNormDev += Math.abs(normDist - 1);
  }
  const meanNormDev = sumNormDev / n;

  if (meanNormDev < 0.22) {
    const ellipsePoints: Point[] = [];
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      ellipsePoints.push({
        x: Math.round(cx + rx * Math.cos(theta)),
        y: Math.round(cy + ry * Math.sin(theta))
      });
    }
    return ellipsePoints;
  }

  // 2C. POLYGON SIMPLIFICATION (Ramer-Douglas-Peucker)
  const simplified = ramerDouglasPeucker(points, maxDim * 0.08);

  // If simplified has ~3 main corners (plus closure) -> Triangle
  if (simplified.length >= 3 && simplified.length <= 5) {
    // Find 3 most prominent extrema
    const top = points.reduce((prev, curr) => (curr.y < prev.y ? curr : prev), points[0]);
    const bottomBase = points.filter(p => p.y > cy);
    if (bottomBase.length > 0) {
      const leftBase = bottomBase.reduce((prev, curr) => (curr.x < prev.x ? curr : prev), bottomBase[0]);
      const rightBase = bottomBase.reduce((prev, curr) => (curr.x > prev.x ? curr : prev), bottomBase[0]);
      if (Math.abs(leftBase.x - rightBase.x) > w * 0.45) {
        return [
          { x: top.x, y: minY },
          { x: minX, y: maxY },
          { x: maxX, y: maxY },
          { x: top.x, y: minY }
        ];
      }
    }
  }

  // 2D. SQUARE OR RECTANGLE
  // If aspect ratio is close to 1, make it a perfect square
  if (aspectRatio >= 0.82 && aspectRatio <= 1.22) {
    const side = (w + h) / 2;
    const half = side / 2;
    return [
      { x: Math.round(cx - half), y: Math.round(cy - half) },
      { x: Math.round(cx + half), y: Math.round(cy - half) },
      { x: Math.round(cx + half), y: Math.round(cy + half) },
      { x: Math.round(cx - half), y: Math.round(cy + half) },
      { x: Math.round(cx - half), y: Math.round(cy - half) }
    ];
  }

  // Standard Rectangle
  return [
    { x: Math.round(minX), y: Math.round(minY) },
    { x: Math.round(maxX), y: Math.round(minY) },
    { x: Math.round(maxX), y: Math.round(maxY) },
    { x: Math.round(minX), y: Math.round(maxY) },
    { x: Math.round(minX), y: Math.round(minY) }
  ];
}

function ramerDouglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const last = points.length - 1;

  for (let i = 1; i < last; i++) {
    const d = perpendicularDistance(points[i], points[0], points[last]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const recResults1 = ramerDouglasPeucker(points.slice(0, index + 1), epsilon);
    const recResults2 = ramerDouglasPeucker(points.slice(index), epsilon);
    return [...recResults1.slice(0, -1), ...recResults2];
  }

  return [points[0], points[last]];
}

function perpendicularDistance(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - p1.x, p.y - p1.y);
  }
  const numerator = Math.abs(dy * p.x - dx * p.y + p2.x * p1.y - p2.y * p1.x);
  const denominator = Math.hypot(dx, dy);
  return numerator / denominator;
}
