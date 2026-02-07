"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import type { RugProduct } from "@/types/product";
import { drawImageToQuad, drawShadow, pointInQuad, type Point, type Quad } from "./vr/warp";

type LayerId = "A" | "B";

type LayerState = {
  id: LayerId;
  code: string;
  isLoading: boolean;
  error: string | null;
  product: RugProduct | null;
  imageUrl: string | null;
  image: HTMLImageElement | null;
  sizes: string[];
  defaultSize: string | null;
  selectedSize: string | null;
  sku: string | null;
  userScale: number;
  sizeScale: number;
  actualScale: number;
  rotate: number;
  shadowEnabled: boolean;
  shadowStrength: number;
  quad: Quad | null;
};

type DragState =
  | { mode: "move"; layerId: LayerId; last: Point }
  | { mode: "corner"; layerId: LayerId; corner: keyof Quad; last: Point }
  | null;

const SIZE_REGEX = /(\d+(?:\.\d+)?)\s*[x\u00d7\u0445]\s*(\d+(?:\.\d+)?)/i;

const parseSizeSides = (sizeLabel: string | null): { w: number; h: number } | null => {
  if (!sizeLabel) return null;
  const cleaned = sizeLabel.replace(/cm/gi, "").trim();
  const match = cleaned.match(SIZE_REGEX);
  if (!match) return null;
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (w <= 0 || h <= 0) return null;
  return { w, h };
};

const normalizeSizeKey = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .replace(/cm/gi, "")
    .replace(/\s+/g, "")
    .replace(/[x\u00d7\u0445]/g, "x")
    .trim();

const getSizeScale = (baseSize: string | null, selectedSize: string | null) => {
  if (!baseSize || !selectedSize) return 1;
  const base = parseSizeSides(baseSize);
  const next = parseSizeSides(selectedSize);
  if (!base || !next) return 1;
  const baseArea = base.w * base.h;
  const nextArea = next.w * next.h;
  if (!baseArea || !nextArea) return 1;
  return Math.sqrt(nextArea / baseArea);
};

const getSkuForSize = (product: RugProduct | null, sizeLabel: string | null) => {
  if (!product || !sizeLabel) return null;
  const variants = product.sourceMeta?.bmhome?.variants ?? [];
  const target = normalizeSizeKey(sizeLabel);
  const match = variants.find((variant) => normalizeSizeKey(variant.sizeLabel) === target);
  return match?.sku ?? null;
};

const createEmptyLayer = (id: LayerId): LayerState => ({
  id,
  code: "",
  isLoading: false,
  error: null,
  product: null,
  imageUrl: null,
  image: null,
  sizes: [],
  defaultSize: null,
  selectedSize: null,
  sku: null,
  userScale: 100,
  sizeScale: 1,
  actualScale: 1,
  rotate: 0,
  shadowEnabled: true,
  shadowStrength: 30,
  quad: null,
});

const getQuadCenter = (quad: Quad): Point => ({
  x: (quad.tl.x + quad.tr.x + quad.br.x + quad.bl.x) / 4,
  y: (quad.tl.y + quad.tr.y + quad.br.y + quad.bl.y) / 4,
});

const translateQuad = (quad: Quad, dx: number, dy: number): Quad => ({
  tl: { x: quad.tl.x + dx, y: quad.tl.y + dy },
  tr: { x: quad.tr.x + dx, y: quad.tr.y + dy },
  br: { x: quad.br.x + dx, y: quad.br.y + dy },
  bl: { x: quad.bl.x + dx, y: quad.bl.y + dy },
});

const scaleQuad = (quad: Quad, center: Point, factor: number): Quad => {
  const scalePoint = (p: Point): Point => ({
    x: center.x + (p.x - center.x) * factor,
    y: center.y + (p.y - center.y) * factor,
  });
  return {
    tl: scalePoint(quad.tl),
    tr: scalePoint(quad.tr),
    br: scalePoint(quad.br),
    bl: scalePoint(quad.bl),
  };
};

const rotateQuad = (quad: Quad, center: Point, degrees: number): Quad => {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rotatePoint = (p: Point): Point => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  };
  return {
    tl: rotatePoint(quad.tl),
    tr: rotatePoint(quad.tr),
    br: rotatePoint(quad.br),
    bl: rotatePoint(quad.bl),
  };
};

const createInitialQuad = (
  width: number,
  height: number,
  img: HTMLImageElement,
  scaleFactor: number
): Quad => {
  const aspect = img.width / img.height || 1;
  const baseWidth = width * 0.42;
  let w = baseWidth;
  let h = w / aspect;
  const maxHeight = height * 0.55;
  if (h > maxHeight) {
    h = maxHeight;
    w = h * aspect;
  }
  w *= scaleFactor;
  h *= scaleFactor;

  const center = { x: width / 2, y: height * 0.65 };
  return {
    tl: { x: center.x - w / 2, y: center.y - h / 2 },
    tr: { x: center.x + w / 2, y: center.y - h / 2 },
    br: { x: center.x + w / 2, y: center.y + h / 2 },
    bl: { x: center.x - w / 2, y: center.y + h / 2 },
  };
};

const getCornerHit = (quad: Quad, point: Point, radius = 12): keyof Quad | null => {
  const corners: Array<[keyof Quad, Point]> = [
    ["tl", quad.tl],
    ["tr", quad.tr],
    ["br", quad.br],
    ["bl", quad.bl],
  ];
  const r2 = radius * radius;
  for (const [key, p] of corners) {
    const dx = p.x - point.x;
    const dy = p.y - point.y;
    if (dx * dx + dy * dy <= r2) return key;
  }
  return null;
};

const computeActualScale = (userScale: number, sizeScale: number) => (userScale / 100) * sizeScale;

const VrPreview: React.FC = () => {
  const [locale] = useLocale();
  const isRu = useMemo(() => locale === "ru", [locale]);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [layerA, setLayerA] = useState<LayerState>(() => createEmptyLayer("A"));
  const [layerB, setLayerB] = useState<LayerState>(() => createEmptyLayer("B"));
  const [activeLayer, setActiveLayer] = useState<LayerId>("A");
  const [showSecond, setShowSecond] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSplit, setCompareSplit] = useState(50);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>(null);

  const activeState = activeLayer === "A" ? layerA : layerB;
  const setActiveState = activeLayer === "A" ? setLayerA : setLayerB;

  const handlePhotoFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  useEffect(() => {
    if (!photoUrl) {
      setPhotoImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => setPhotoImage(img);
    img.src = photoUrl;
  }, [photoUrl]);

  const loadProduct = async (layerId: LayerId, code: string) => {
    const setter = layerId === "A" ? setLayerA : setLayerB;
    const current = layerId === "A" ? layerA : layerB;
    if (!code.trim()) {
      setter({ ...current, error: isRu ? "Введите артикул" : "Enter an article" });
      return;
    }
    setter({ ...current, isLoading: true, error: null });
    try {
      const res = await fetch(`/api/vr/product?code=${encodeURIComponent(code.trim())}`);
      if (!res.ok) {
        setter({
          ...current,
          isLoading: false,
          error: isRu ? "Ковер не найден" : "Rug not found",
          product: null,
          imageUrl: null,
          image: null,
          quad: null,
        });
        return;
      }
      const data = await res.json();
      const product = data.product as RugProduct;
      const sizes = product.sizes || [];
      const defaultSize = product.defaultSize || sizes[0] || null;
      const selectedSize = defaultSize;
      const sizeScale = getSizeScale(defaultSize, selectedSize);
      const userScale = 100;
      const actualScale = computeActualScale(userScale, sizeScale);

      setter({
        ...current,
        isLoading: false,
        error: null,
        product,
        sizes,
        defaultSize,
        selectedSize,
        sku: getSkuForSize(product, selectedSize),
        imageUrl: product.images?.[0] || null,
        image: null,
        userScale,
        sizeScale,
        actualScale,
        rotate: 0,
        shadowEnabled: true,
        shadowStrength: 30,
        quad: null,
      });
    } catch (error) {
      setter({
        ...current,
        isLoading: false,
        error: isRu ? "Ошибка загрузки" : "Failed to load",
      });
    }
  };

  const updateLayerScale = (layer: LayerState, setLayer: (next: LayerState) => void, nextUserScale: number, nextSizeScale?: number) => {
    const sizeScale = nextSizeScale ?? layer.sizeScale;
    const nextActual = computeActualScale(nextUserScale, sizeScale);
    let quad = layer.quad;
    if (quad) {
      const factor = nextActual / (layer.actualScale || 1);
      quad = scaleQuad(quad, getQuadCenter(quad), factor);
    }
    setLayer({ ...layer, userScale: nextUserScale, sizeScale, actualScale: nextActual, quad });
  };

  const updateLayerRotation = (layer: LayerState, setLayer: (next: LayerState) => void, nextRotate: number) => {
    let quad = layer.quad;
    if (quad) {
      const delta = nextRotate - layer.rotate;
      quad = rotateQuad(quad, getQuadCenter(quad), delta);
    }
    setLayer({ ...layer, rotate: nextRotate, quad });
  };

  const updateLayerSize = (layer: LayerState, setLayer: (next: LayerState) => void, nextSize: string) => {
    const sizeScale = getSizeScale(layer.defaultSize, nextSize);
    const sku = getSkuForSize(layer.product, nextSize);
    updateLayerScale({ ...layer, selectedSize: nextSize, sku }, setLayer, layer.userScale, sizeScale);
  };

  useEffect(() => {
    if (!layerA.imageUrl) {
      if (layerA.image) setLayerA({ ...layerA, image: null, quad: null });
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLayerA((prev) => ({ ...prev, image: img }));
    img.src = layerA.imageUrl;
  }, [layerA.imageUrl]);

  useEffect(() => {
    if (!layerB.imageUrl) {
      if (layerB.image) setLayerB({ ...layerB, image: null, quad: null });
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLayerB((prev) => ({ ...prev, image: img }));
    img.src = layerB.imageUrl;
  }, [layerB.imageUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: Math.max(1, Math.floor(entry.contentRect.width)),
          height: Math.max(1, Math.floor(entry.contentRect.height)),
        });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize.width || !canvasSize.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvasSize.width * dpr);
    canvas.height = Math.round(canvasSize.height * dpr);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [canvasSize]);

  useEffect(() => {
    if (layerA.image && !layerA.quad && canvasSize.width && canvasSize.height) {
      const quad = createInitialQuad(canvasSize.width, canvasSize.height, layerA.image, layerA.actualScale);
      setLayerA((prev) => ({ ...prev, quad }));
    }
  }, [layerA.image, layerA.quad, layerA.actualScale, canvasSize]);

  useEffect(() => {
    if (layerB.image && !layerB.quad && canvasSize.width && canvasSize.height) {
      const quad = createInitialQuad(canvasSize.width, canvasSize.height, layerB.image, layerB.actualScale);
      setLayerB((prev) => ({ ...prev, quad }));
    }
  }, [layerB.image, layerB.quad, layerB.actualScale, canvasSize]);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    if (!photoImage) return;
    const scale = Math.max(width / photoImage.width, height / photoImage.height);
    const drawW = photoImage.width * scale;
    const drawH = photoImage.height * scale;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;
    ctx.drawImage(photoImage, dx, dy, drawW, drawH);
  };

  const drawLayer = (ctx: CanvasRenderingContext2D, layer: LayerState) => {
    if (!layer.image || !layer.quad) return;
    if (layer.shadowEnabled) drawShadow(ctx, layer.quad, layer.shadowStrength);
    drawImageToQuad(ctx, layer.image, layer.quad);
  };

  const drawHandles = (ctx: CanvasRenderingContext2D, quad: Quad) => {
    ctx.save();
    ctx.fillStyle = "#111827";
    const points = [quad.tl, quad.tr, quad.br, quad.bl];
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvasSize.width;
    const height = canvasSize.height;
    if (!width || !height) return;

    drawBackground(ctx, width, height);

    if (compareMode && showSecond && layerB.image && layerB.quad) {
      const splitX = (width * compareSplit) / 100;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, height);
      ctx.clip();
      drawLayer(ctx, layerA);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, width - splitX, height);
      ctx.clip();
      drawLayer(ctx, layerB);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();
      ctx.restore();
    } else {
      drawLayer(ctx, layerA);
      if (showSecond) drawLayer(ctx, layerB);
    }

    const activeQuad = activeState.quad;
    if (activeQuad) drawHandles(ctx, activeQuad);
  }, [
    photoImage,
    layerA,
    layerB,
    compareMode,
    compareSplit,
    showSecond,
    activeState.quad,
    canvasSize,
  ]);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const layer = activeState;
    if (!layer.quad) return;
    const point = getCanvasPoint(event);
    const corner = getCornerHit(layer.quad, point);
    if (corner) {
      dragRef.current = { mode: "corner", layerId: activeLayer, corner, last: point };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (pointInQuad(point, layer.quad)) {
      dragRef.current = { mode: "move", layerId: activeLayer, last: point };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = dragRef.current;
    if (!state) return;
    const point = getCanvasPoint(event);
    const layer = state.layerId === "A" ? layerA : layerB;
    const setLayer = state.layerId === "A" ? setLayerA : setLayerB;
    if (!layer.quad) return;
    const dx = point.x - state.last.x;
    const dy = point.y - state.last.y;
    let quad = layer.quad;
    if (state.mode === "move") {
      quad = translateQuad(quad, dx, dy);
    } else {
      quad = { ...quad, [state.corner]: point };
    }
    setLayer({ ...layer, quad });
    dragRef.current = { ...state, last: point };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "koenigcarpet-tryon.png";
    link.click();
  };

  const handleToggleSecond = () => {
    if (showSecond) {
      setShowSecond(false);
      setCompareMode(false);
      setLayerB(createEmptyLayer("B"));
      setActiveLayer("A");
    } else {
      setShowSecond(true);
      setActiveLayer("B");
    }
  };

  const renderLayerControls = (layer: LayerState, setLayer: (next: LayerState) => void) => (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase text-gray-600">
          {isRu ? "Артикул ковра" : "Rug article"}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
            value={layer.code}
            onChange={(e) => setLayer({ ...layer, code: e.target.value })}
            placeholder={isRu ? "Например: 12345" : "e.g. 12345"}
          />
          <button
            type="button"
            onClick={() => loadProduct(layer.id, layer.code)}
            className="h-10 px-4 rounded-lg bg-black text-white font-semibold hover:bg-black/90"
          >
            {isRu ? "Найти" : "Find"}
          </button>
        </div>
        {layer.error ? <p className="text-xs text-red-600 mt-2">{layer.error}</p> : null}
        {layer.product?.product_name?.[locale] ? (
          <p className="text-xs text-gray-500 mt-2">{layer.product.product_name[locale]}</p>
        ) : null}
      </div>

      {layer.sizes.length > 0 ? (
        <div>
          <label className="text-xs font-semibold uppercase text-gray-600">
            {isRu ? "Размер" : "Size"}
          </label>
          <select
            className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-300 bg-white"
            value={layer.selectedSize ?? ""}
            onChange={(e) => updateLayerSize(layer, setLayer, e.target.value)}
          >
            {layer.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {layer.sku ? (
        <div className="text-xs text-gray-600">
          {isRu ? "SKU" : "SKU"}: <span className="font-semibold text-gray-900">{layer.sku}</span>
        </div>
      ) : null}

      {layer.product?.images?.length ? (
        <div>
          <label className="text-xs font-semibold uppercase text-gray-600">
            {isRu ? "Текстура" : "Texture"}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {layer.product.images.slice(0, 6).map((img, idx) => (
              <button
                type="button"
                key={`${layer.id}-img-${idx}`}
                className={`w-12 h-12 rounded-md border overflow-hidden ${layer.imageUrl === img ? "border-black" : "border-gray-200"}`}
                onClick={() => setLayer({ ...layer, imageUrl: img, image: null, quad: null })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="texture" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isRu ? "Редактор примерки" : "Try-on editor"}
          </h3>
          <p className="text-sm text-gray-600">
            {isRu
              ? "Загрузите фото, найдите ковер по артикулу и настройте перспективу."
              : "Upload a photo, search by article, and adjust perspective."}
          </p>
        </div>
        <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          {isRu ? "VR" : "VR"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 p-5">
          <div
            ref={containerRef}
            className="min-h-[320px] sm:min-h-[380px] md:min-h-[460px] lg:min-h-[520px] rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden relative"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
            {!photoImage ? (
              <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {isRu ? "Загрузите фото комнаты" : "Upload your room photo"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isRu ? "JPG или PNG, лучше при дневном свете" : "JPG or PNG, daylight is best"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <label className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-black/90">
              {isRu ? "Загрузить фото" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              type="button"
              onClick={handleDownload}
              className="h-11 px-4 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
            >
              {isRu ? "Скачать результат" : "Download"}
            </button>

            <button
              type="button"
              onClick={handleToggleSecond}
              className="h-11 px-4 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
            >
              {showSecond ? (isRu ? "Убрать 2-й ковер" : "Remove 2nd rug") : (isRu ? "Добавить 2-й ковер" : "Add 2nd rug")}
            </button>
          </div>

          {showSecond ? (
            <div className="mt-4 flex items-center gap-3">
              <label className="text-xs font-semibold uppercase text-gray-600">
                {isRu ? "Сравнение" : "Compare"}
              </label>
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
              />
              {compareMode ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={compareSplit}
                    onChange={(e) => setCompareSplit(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{compareSplit}%</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="p-5 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white space-y-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveLayer("A")}
              className={`flex-1 h-10 rounded-lg border text-sm font-semibold ${activeLayer === "A" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
            >
              {isRu ? "Ковер A" : "Rug A"}
            </button>
            {showSecond ? (
              <button
                type="button"
                onClick={() => setActiveLayer("B")}
                className={`flex-1 h-10 rounded-lg border text-sm font-semibold ${activeLayer === "B" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
              >
                {isRu ? "Ковер B" : "Rug B"}
              </button>
            ) : null}
          </div>

          {activeLayer === "A"
            ? renderLayerControls(layerA, setLayerA)
            : renderLayerControls(layerB, setLayerB)}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-900">{isRu ? "Управление" : "Controls"}</p>

            <div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{isRu ? "Масштаб" : "Scale"}</span>
                <span>{activeState.userScale}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={160}
                value={activeState.userScale}
                onChange={(e) => updateLayerScale(activeState, setActiveState, Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{isRu ? "Поворот" : "Rotate"}</span>
                <span>{activeState.rotate}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                value={activeState.rotate}
                onChange={(e) => updateLayerRotation(activeState, setActiveState, Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{isRu ? "Тень" : "Shadow"}</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeState.shadowEnabled}
                    onChange={(e) => setActiveState({ ...activeState, shadowEnabled: e.target.checked })}
                  />
                  <span>{activeState.shadowEnabled ? (isRu ? "Вкл" : "On") : (isRu ? "Выкл" : "Off")}</span>
                </label>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={activeState.shadowStrength}
                onChange={(e) => setActiveState({ ...activeState, shadowStrength: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="text-xs text-gray-500">
              {isRu
                ? "Перспектива настраивается перетаскиванием углов ковра на изображении."
                : "Adjust perspective by dragging the rug corners on the canvas."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VrPreview;
