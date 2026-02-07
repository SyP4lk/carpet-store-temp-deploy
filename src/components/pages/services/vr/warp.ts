export type Point = { x: number; y: number };
export type Quad = { tl: Point; tr: Point; br: Point; bl: Point };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const interpolateQuad = (quad: Quad, u: number, v: number): Point => {
  const topX = lerp(quad.tl.x, quad.tr.x, u);
  const topY = lerp(quad.tl.y, quad.tr.y, u);
  const bottomX = lerp(quad.bl.x, quad.br.x, u);
  const bottomY = lerp(quad.bl.y, quad.br.y, u);
  return {
    x: lerp(topX, bottomX, v),
    y: lerp(topY, bottomY, v),
  };
};

const drawImageTriangle = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  sx0: number,
  sy0: number,
  sx1: number,
  sy1: number,
  sx2: number,
  sy2: number,
  dx0: number,
  dy0: number,
  dx1: number,
  dy1: number,
  dx2: number,
  dy2: number
) => {
  const denom = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1);
  if (!denom) return;

  const a = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
  const b = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
  const c = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
  const d = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
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

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
};

export const drawImageToQuad = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  quad: Quad,
  gridSize = 16
) => {
  const cols = Math.max(2, gridSize);
  const rows = Math.max(2, gridSize);
  const sw = img.width;
  const sh = img.height;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const u0 = x / cols;
      const v0 = y / rows;
      const u1 = (x + 1) / cols;
      const v1 = (y + 1) / rows;

      const p00 = interpolateQuad(quad, u0, v0);
      const p10 = interpolateQuad(quad, u1, v0);
      const p11 = interpolateQuad(quad, u1, v1);
      const p01 = interpolateQuad(quad, u0, v1);

      const sx0 = u0 * sw;
      const sy0 = v0 * sh;
      const sx1 = u1 * sw;
      const sy1 = v1 * sh;

      drawImageTriangle(ctx, img, sx0, sy0, sx1, sy0, sx1, sy1, p00.x, p00.y, p10.x, p10.y, p11.x, p11.y);
      drawImageTriangle(ctx, img, sx0, sy0, sx1, sy1, sx0, sy1, p00.x, p00.y, p11.x, p11.y, p01.x, p01.y);
    }
  }
};

const pointInTriangle = (p: Point, a: Point, b: Point, c: Point) => {
  const area = (x1: Point, x2: Point, x3: Point) =>
    (x1.x * (x2.y - x3.y) + x2.x * (x3.y - x1.y) + x3.x * (x1.y - x2.y)) / 2;

  const areaTotal = Math.abs(area(a, b, c));
  const area1 = Math.abs(area(p, b, c));
  const area2 = Math.abs(area(a, p, c));
  const area3 = Math.abs(area(a, b, p));
  return Math.abs(areaTotal - (area1 + area2 + area3)) < 0.5;
};

export const pointInQuad = (point: Point, quad: Quad) => {
  return (
    pointInTriangle(point, quad.tl, quad.tr, quad.br) ||
    pointInTriangle(point, quad.tl, quad.br, quad.bl)
  );
};

export const drawShadow = (ctx: CanvasRenderingContext2D, quad: Quad, strengthPct = 30) => {
  const clamped = Math.min(Math.max(strengthPct, 0), 100) / 100;
  if (clamped <= 0) return;

  const offset = 8 * clamped;
  const blur = 16 * clamped + 2;

  ctx.save();
  ctx.globalAlpha = 0.35 * clamped;
  ctx.filter = `blur(${blur}px)`;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(quad.tl.x, quad.tl.y + offset);
  ctx.lineTo(quad.tr.x, quad.tr.y + offset);
  ctx.lineTo(quad.br.x, quad.br.y + offset);
  ctx.lineTo(quad.bl.x, quad.bl.y + offset);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};
