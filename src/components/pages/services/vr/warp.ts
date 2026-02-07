export type Point = { x: number; y: number };
export type Quad = [Point, Point, Point, Point]; // TL, TR, BR, BL

function affineFromTriangles(
  s0: Point,
  s1: Point,
  s2: Point,
  d0: Point,
  d1: Point,
  d2: Point
) {
  const sx0 = s0.x, sy0 = s0.y;
  const sx1 = s1.x, sy1 = s1.y;
  const sx2 = s2.x, sy2 = s2.y;

  const dx0 = d0.x, dy0 = d0.y;
  const dx1 = d1.x, dy1 = d1.y;
  const dx2 = d2.x, dy2 = d2.y;

  const denom = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1);
  if (Math.abs(denom) < 1e-6) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  }

  const a =
    (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
  const b =
    (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
  const c =
    (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
  const d =
    (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
  const e =
    (dx0 * (sx1 * sy2 - sx2 * sy1) +
      dx1 * (sx2 * sy0 - sx0 * sy2) +
      dx2 * (sx0 * sy1 - sx1 * sy0)) /
    denom;
  const f =
    (dy0 * (sx1 * sy2 - sx2 * sy1) +
      dy1 * (sx2 * sy0 - sx0 * sy2) +
      dy2 * (sx0 * sy1 - sx1 * sy0)) /
    denom;

  return { a, b, c, d, e, f };
}

function bilinearPoint(quad: Quad, u: number, v: number): Point {
  const [p00, p10, p11, p01] = quad;
  const x =
    (1 - u) * (1 - v) * p00.x +
    u * (1 - v) * p10.x +
    u * v * p11.x +
    (1 - u) * v * p01.x;
  const y =
    (1 - u) * (1 - v) * p00.y +
    u * (1 - v) * p10.y +
    u * v * p11.y +
    (1 - u) * v * p01.y;
  return { x, y };
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  quad: Quad,
  intensity: number
) {
  if (intensity <= 0) return;

  ctx.save();
  ctx.globalAlpha = Math.min(0.65, intensity / 100);
  ctx.filter = `blur(${Math.max(2, intensity / 8)}px)`;
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.beginPath();
  ctx.moveTo(quad[0].x, quad[0].y);
  ctx.lineTo(quad[1].x, quad[1].y);
  ctx.lineTo(quad[2].x, quad[2].y);
  ctx.lineTo(quad[3].x, quad[3].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawImageToQuad(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  quad: Quad,
  grid = 16
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;

  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const u0 = i / grid;
      const v0 = j / grid;
      const u1 = (i + 1) / grid;
      const v1 = (j + 1) / grid;

      const p00 = bilinearPoint(quad, u0, v0);
      const p10 = bilinearPoint(quad, u1, v0);
      const p11 = bilinearPoint(quad, u1, v1);
      const p01 = bilinearPoint(quad, u0, v1);

      const sx0 = u0 * sw;
      const sy0 = v0 * sh;
      const sx1 = u1 * sw;
      const sy1 = v1 * sh;

      // tri 1
      {
        const s0 = { x: sx0, y: sy0 };
        const s1 = { x: sx1, y: sy0 };
        const s2 = { x: sx1, y: sy1 };
        const t = affineFromTriangles(s0, s1, s2, p00, p10, p11);

        ctx.save();
        ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
        ctx.beginPath();
        ctx.moveTo(s0.x, s0.y);
        ctx.lineTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      }

      // tri 2
      {
        const s0 = { x: sx0, y: sy0 };
        const s1 = { x: sx1, y: sy1 };
        const s2 = { x: sx0, y: sy1 };
        const t = affineFromTriangles(s0, s1, s2, p00, p11, p01);

        ctx.save();
        ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
        ctx.beginPath();
        ctx.moveTo(s0.x, s0.y);
        ctx.lineTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      }
    }
  }
}

export function pointInQuad(p: Point, quad: Quad): boolean {
  const pts = quad;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;

    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
