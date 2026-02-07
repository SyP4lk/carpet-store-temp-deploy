"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import type { RugProduct } from "@/types/product";
import { drawImageToQuad, drawShadow, pointInQuad, type Point, type Quad } from "./vr/warp";

type LayerId = "A" | "B";

type LayerState = {
  id: LayerId;
  product: RugProduct | null;
  img: HTMLImageElement | null;
  article: string;
  size: string;
  scalePct: number;
  rotateDeg: number;
  shadowPct: number;
  quad: Quad | null;
};

function dist(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function centerOfQuad(q: Quad): Point {
  return {
    x: (q[0].x + q[1].x + q[2].x + q[3].x) / 4,
    y: (q[0].y + q[1].y + q[2].y + q[3].y) / 4,
  };
}

function rotatePointAround(p: Point, c: Point, deg: number): Point {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const x = p.x - c.x;
  const y = p.y - c.y;
  return { x: c.x + x * cos - y * sin, y: c.y + x * sin + y * cos };
}

function scalePointAround(p: Point, c: Point, factor: number): Point {
  return { x: c.x + (p.x - c.x) * factor, y: c.y + (p.y - c.y) * factor };
}

function parseSizeArea(sizeLabel: string): number | null {
  // supports: 80 x 150, 80x150, 80×150, 80 х 150
  const s = (sizeLabel ?? "").replace(/cm/gi, "").trim();
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*[x×х]\s*(\d+(?:[.,]\d+)?)/i);
  if (!m) return null;
  const a = Number.parseFloat(m[1].replace(",", "."));
  const b = Number.parseFloat(m[2].replace(",", "."));
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return null;
  return a * b;
}

async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

async function downscaleToBlobUrl(file: File, maxDim = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const nw = Math.max(1, Math.round(w * scale));
  const nh = Math.max(1, Math.round(h * scale));

  const c = document.createElement("canvas");
  c.width = nw;
  c.height = nh;

  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, nw, nh);

  const blob: Blob = await new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92);
  });

  return URL.createObjectURL(blob);
}

function initRectQuad(canvasW: number, canvasH: number, rugImg: HTMLImageElement): Quad {
  const rw = canvasW * 0.42;
  const aspect = (rugImg.naturalHeight || rugImg.height) / (rugImg.naturalWidth || rugImg.width);
  const rh = rw * aspect;

  const cx = canvasW * 0.5;
  const cy = canvasH * 0.68;

  const tl = { x: cx - rw / 2, y: cy - rh / 2 };
  const tr = { x: cx + rw / 2, y: cy - rh / 2 };
  const br = { x: cx + rw / 2, y: cy + rh / 2 };
  const bl = { x: cx - rw / 2, y: cy + rh / 2 };
  return [tl, tr, br, bl];
}

export default function VrPreview() {
  const [locale] = useLocale();
  const isRu = useMemo(() => locale === "ru", [locale]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [roomImg, setRoomImg] = useState<HTMLImageElement | null>(null);

  const [active, setActive] = useState<LayerId>("A");
  const [compareMode, setCompareMode] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [layerA, setLayerA] = useState<LayerState>({
    id: "A",
    product: null,
    img: null,
    article: "",
    size: "",
    scalePct: 100,
    rotateDeg: 0,
    shadowPct: 25,
    quad: null,
  });

  const [layerB, setLayerB] = useState<LayerState>({
    id: "B",
    product: null,
    img: null,
    article: "",
    size: "",
    scalePct: 100,
    rotateDeg: 0,
    shadowPct: 25,
    quad: null,
  });

  const getLayer = (id: LayerId) => (id === "A" ? layerA : layerB);
  const setLayer = (id: LayerId, next: LayerState) => (id === "A" ? setLayerA(next) : setLayerB(next));

  // Resize canvas to container
  useEffect(() => {
    const el = hostRef.current;
    const c = canvasRef.current;
    if (!el || !c) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(360, Math.floor(rect.height));
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
      draw();
    });

    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomImg, layerA, layerB, compareMode, compareSplit, active]);

  // Load room image
  useEffect(() => {
    if (!roomUrl) return;
    let alive = true;
    loadImg(roomUrl)
      .then((img) => {
        if (!alive) return;
        setRoomImg(img);
      })
      .catch(() => {
        if (!alive) return;
        setRoomImg(null);
      });
    return () => {
      alive = false;
    };
  }, [roomUrl]);

  // Draw
  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);

    // background
    if (roomImg) {
      // cover
      const iw = roomImg.naturalWidth || roomImg.width;
      const ih = roomImg.naturalHeight || roomImg.height;
      const scale = Math.max(c.width / iw, c.height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (c.width - dw) / 2;
      const dy = (c.height - dh) / 2;
      ctx.drawImage(roomImg, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, c.width, c.height);
    }

    const la = layerA;
    const lb = layerB;

    const drawLayer = (layer: LayerState) => {
      if (!layer.img || !layer.quad) return;
      drawShadow(ctx, layer.quad, layer.shadowPct);
      drawImageToQuad(ctx, layer.img, layer.quad, 18);
    };

    if (compareMode && la.img && la.quad && lb.img && lb.quad) {
      drawLayer(la);
      const splitX = (compareSplit / 100) * c.width;
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, c.width - splitX, c.height);
      ctx.clip();
      drawLayer(lb);
      ctx.restore();

      // split line
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, c.height);
      ctx.stroke();
      ctx.restore();
    } else {
      drawLayer(la);
      drawLayer(lb);
    }

    // handles for active layer
    const act = active === "A" ? la : lb;
    if (act.quad) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      for (const p of act.quad) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomImg, layerA, layerB, compareMode, compareSplit, active]);

  // Interaction
  const dragRef = useRef<{
    mode: "none" | "corner" | "move";
    cornerIndex: number;
    last: Point;
  }>({ mode: "none", cornerIndex: -1, last: { x: 0, y: 0 } });

  const getPointer = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = getPointer(e);
    const act = getLayer(active);
    if (!act.quad) return;

    // corners
    for (let i = 0; i < 4; i++) {
      if (dist(p, act.quad[i]) <= 14) {
        dragRef.current = { mode: "corner", cornerIndex: i, last: p };
        (e.currentTarget as any).setPointerCapture?.(e.pointerId);
        return;
      }
    }

    // inside
    if (pointInQuad(p, act.quad)) {
      dragRef.current = { mode: "move", cornerIndex: -1, last: p };
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (d.mode === "none") return;

    const p = getPointer(e);
    const dx = p.x - d.last.x;
    const dy = p.y - d.last.y;
    d.last = p;

    const act = getLayer(active);
    if (!act.quad) return;

    const next: LayerState = { ...act, quad: [...act.quad.map((pt) => ({ ...pt }))] as Quad };

    if (d.mode === "corner") {
      next.quad![d.cornerIndex] = { x: next.quad![d.cornerIndex].x + dx, y: next.quad![d.cornerIndex].y + dy };
    } else if (d.mode === "move") {
      next.quad = next.quad!.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })) as Quad;
    }

    setLayer(active, next);
  };

  const onPointerUp = () => {
    dragRef.current.mode = "none";
    dragRef.current.cornerIndex = -1;
  };

  const applyScale = (id: LayerId, nextPct: number) => {
    const layer = getLayer(id);
    if (!layer.quad) return setLayer(id, { ...layer, scalePct: nextPct });

    const factor = nextPct / (layer.scalePct || 1);
    const c = centerOfQuad(layer.quad);
    const nextQuad = layer.quad.map((p) => scalePointAround(p, c, factor)) as Quad;
    setLayer(id, { ...layer, scalePct: nextPct, quad: nextQuad });
  };

  const applyRotate = (id: LayerId, nextDeg: number) => {
    const layer = getLayer(id);
    if (!layer.quad) return setLayer(id, { ...layer, rotateDeg: nextDeg });

    const delta = nextDeg - (layer.rotateDeg || 0);
    const c = centerOfQuad(layer.quad);
    const nextQuad = layer.quad.map((p) => rotatePointAround(p, c, delta)) as Quad;
    setLayer(id, { ...layer, rotateDeg: nextDeg, quad: nextQuad });
  };

  const applyShadow = (id: LayerId, nextPct: number) => {
    const layer = getLayer(id);
    setLayer(id, { ...layer, shadowPct: nextPct });
  };

  const applySize = (id: LayerId, nextSize: string) => {
    const layer = getLayer(id);
    const oldArea = layer.size ? parseSizeArea(layer.size) : null;
    const newArea = nextSize ? parseSizeArea(nextSize) : null;

    if (layer.quad && oldArea && newArea && oldArea > 0 && newArea > 0) {
      const factor = Math.sqrt(newArea / oldArea);
      const c = centerOfQuad(layer.quad);
      const nextQuad = layer.quad.map((p) => scalePointAround(p, c, factor)) as Quad;
      setLayer(id, { ...layer, size: nextSize, quad: nextQuad });
    } else {
      setLayer(id, { ...layer, size: nextSize });
    }
  };

  const findProduct = async (id: LayerId) => {
    setError(null);
    const layer = getLayer(id);
    const code = layer.article.trim();
    if (!code) {
      setError(isRu ? "Введите артикул" : "Enter article");
      return;
    }

    setLoading(isRu ? "Поиск..." : "Searching...");
    try {
      const res = await fetch(`/api/vr/product?code=${encodeURIComponent(code)}`, { cache: "no-store" });
      if (!res.ok) {
        setLoading(null);
        setError(res.status === 404 ? (isRu ? "Не найдено" : "Not found") : (isRu ? "Ошибка поиска" : "Search error"));
        return;
      }

      const data = await res.json();
      const product: RugProduct = data.product;

      const imageUrl = product.images?.[0];
      if (!imageUrl) {
        setLoading(null);
        setError(isRu ? "У товара нет картинки" : "No image found");
        return;
      }

      const img = await loadImg(imageUrl);

      const c = canvasRef.current;
      if (!c) {
        setLoading(null);
        setError(isRu ? "Canvas не готов" : "Canvas not ready");
        return;
      }

      const sizes = (product.sizes ?? []).filter((s) => !/özel\s*ölçü|ozel\s*olcu/i.test(s));
      const size = (product.defaultSize && sizes.includes(product.defaultSize)) ? product.defaultSize : (sizes[0] ?? "");

      const quad = initRectQuad(c.width, c.height, img);

      const next: LayerState = {
        ...layer,
        product,
        img,
        size,
        quad,
        scalePct: 100,
        rotateDeg: 0,
        shadowPct: 25,
      };

      setLayer(id, next);
      setLoading(null);
    } catch {
      setLoading(null);
      setError(isRu ? "Ошибка загрузки" : "Load error");
    }
  };

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;

    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "koenigcarpet-vr.png";
    a.click();
  };

  const onRoomFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const url = await downscaleToBlobUrl(file, 1600);
      setRoomUrl(url);
    } catch {
      // fallback
      const url = URL.createObjectURL(file);
      setRoomUrl(url);
    }
  };

  const activeLayer = getLayer(active);
  const canDownload = !!roomImg && (!!layerA.img || !!layerB.img);

  const sizeOptions = (p: RugProduct | null) =>
    (p?.sizes ?? []).filter((s) => !/özel\s*ölçü|ozel\s*olcu/i.test(s));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isRu ? "VR примерка" : "VR try-on"}
          </h3>
          <p className="text-sm text-gray-600">
            {isRu
              ? "Загрузите фото, найдите ковер по артикулу, настройте перспективу и скачайте результат."
              : "Upload a photo, find a rug by article, adjust perspective and download the result."}
          </p>
          {loading ? <p className="text-sm text-gray-600 mt-1">{loading}</p> : null}
          {error ? <p className="text-sm text-red-600 mt-1">{error}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCompareMode((v) => !v)}
            className="h-10 px-3 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
          >
            {compareMode ? (isRu ? "Обычный режим" : "Normal") : (isRu ? "Сравнение" : "Compare")}
          </button>

          <button
            type="button"
            onClick={download}
            disabled={!canDownload}
            className={`h-10 px-3 rounded-lg font-semibold ${canDownload ? "bg-black text-white hover:bg-black/90" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
          >
            {isRu ? "Скачать" : "Download"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 p-5">
          <div ref={hostRef} className="min-h-[420px] md:min-h-[560px] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <label className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-black/90">
              {isRu ? "Загрузить фото" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onRoomFile(e.target.files?.[0] ?? null)} />
            </label>

            <button
              type="button"
              onClick={() => setActive("A")}
              className={`h-11 px-4 rounded-lg border font-semibold ${active === "A" ? "border-black text-black" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              {isRu ? "Ковер A" : "Rug A"}
            </button>

            <button
              type="button"
              onClick={() => setActive("B")}
              className={`h-11 px-4 rounded-lg border font-semibold ${active === "B" ? "border-black text-black" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              {isRu ? "Ковер B" : "Rug B"}
            </button>
          </div>

          {compareMode ? (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{isRu ? "Разделитель сравнения" : "Compare split"}</span>
                <span>{compareSplit}%</span>
              </div>
              <input type="range" min={5} max={95} value={compareSplit} onChange={(e) => setCompareSplit(Number(e.target.value))} className="w-full" />
            </div>
          ) : null}
        </div>

        <div className="p-5 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">
                {active === "A" ? (isRu ? "Ковер A" : "Rug A") : (isRu ? "Ковер B" : "Rug B")}
              </p>

              <div className="mt-3">
                <label className="text-xs font-semibold uppercase text-gray-600">
                  {isRu ? "Артикул" : "Article"}
                </label>

                <div className="mt-1 flex gap-2">
                  <input
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
                    value={activeLayer.article}
                    onChange={(e) => setLayer(active, { ...activeLayer, article: e.target.value })}
                    placeholder={isRu ? "Например: 2025-C-4395" : "e.g. 2025-C-4395"}
                  />
                  <button
                    type="button"
                    onClick={() => findProduct(active)}
                    className="h-10 px-4 rounded-lg bg-black text-white font-semibold hover:bg-black/90"
                  >
                    {isRu ? "Найти" : "Find"}
                  </button>
                </div>

                {activeLayer.product ? (
                  <p className="text-xs text-gray-600 mt-2">
                    {isRu ? "Найдено:" : "Found:"}{" "}
                    <span className="font-semibold">
                      {isRu ? activeLayer.product.product_name.ru : activeLayer.product.product_name.en}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase text-gray-600">
                  {isRu ? "Размер" : "Size"}
                </label>

                <select
                  className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-300 bg-white"
                  value={activeLayer.size}
                  onChange={(e) => applySize(active, e.target.value)}
                  disabled={!activeLayer.product}
                >
                  <option value="">{isRu ? "Выберите размер" : "Select size"}</option>
                  {sizeOptions(activeLayer.product).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{isRu ? "Масштаб" : "Scale"}</span>
                    <span>{activeLayer.scalePct}%</span>
                  </div>
                  <input type="range" min={40} max={180} value={activeLayer.scalePct} onChange={(e) => applyScale(active, Number(e.target.value))} className="w-full" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{isRu ? "Поворот" : "Rotate"}</span>
                    <span>{activeLayer.rotateDeg}°</span>
                  </div>
                  <input type="range" min={-90} max={90} value={activeLayer.rotateDeg} onChange={(e) => applyRotate(active, Number(e.target.value))} className="w-full" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{isRu ? "Тень" : "Shadow"}</span>
                    <span>{activeLayer.shadowPct}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={activeLayer.shadowPct} onChange={(e) => applyShadow(active, Number(e.target.value))} className="w-full" />
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                {isRu
                  ? "Перспектива: перетаскивайте точки по углам ковра. Перемещение: тяните внутри ковра."
                  : "Perspective: drag corner points. Move: drag inside the rug."}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              {isRu
                ? "Если ковер не рисуется, откройте DevTools - Network и проверьте запрос /api/vr/product."
                : "If the rug is not drawn, check DevTools - Network for /api/vr/product."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
