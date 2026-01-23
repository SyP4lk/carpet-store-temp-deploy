"use client";

import React, { useMemo, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

export default function VrPreview() {
  const [locale] = useLocale();
  const isRu = useMemo(() => locale === "ru", [locale]);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [article, setArticle] = useState("");
  const [scale, setScale] = useState(70);
  const [rotate, setRotate] = useState(0);
  const [shadow, setShadow] = useState(30);
  const [showSecond, setShowSecond] = useState(false);

  const onFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isRu ? "Редактор примерки (превью)" : "Try-on editor (preview)"}
          </h3>
          <p className="text-sm text-gray-600">
            {isRu
              ? "Здесь будет полноценная примерка: загрузка фото, поиск по артикулу, управление ковром."
              : "Full try-on will be here: photo upload, search by article, controls."}
          </p>
        </div>
        <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          {isRu ? "В разработке" : "In progress"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 p-5">
          <div className="aspect-video rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center relative">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="room" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="text-center px-4">
                <p className="font-semibold text-gray-900">
                  {isRu ? "Загрузите фото комнаты" : "Upload your room photo"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {isRu ? "JPG/PNG, лучше при дневном свете" : "JPG/PNG, daylight is best"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <label className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-black/90">
              {isRu ? "Загрузить фото" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button
              disabled
              className="h-11 px-4 rounded-lg border border-gray-300 text-gray-500 font-semibold cursor-not-allowed"
            >
              {isRu ? "Скачать результат" : "Download"}
            </button>

            <button
              type="button"
              onClick={() => setShowSecond((v) => !v)}
              className="h-11 px-4 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
            >
              {showSecond ? (isRu ? "Убрать 2-й ковер" : "Remove 2nd") : (isRu ? "Добавить 2-й ковер" : "Add 2nd")}
            </button>
          </div>
        </div>

        <div className="p-5 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-gray-600">
                {isRu ? "Артикул ковра" : "Carpet article"}
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  placeholder={isRu ? "Например: 12345" : "e.g. 12345"}
                />
                <button
                  disabled
                  className="h-10 px-4 rounded-lg bg-gray-200 text-gray-600 font-semibold cursor-not-allowed"
                >
                  {isRu ? "Найти" : "Find"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isRu ? "Поиск по артикулу подключим на следующем этапе." : "Article search will be connected in the next stage."}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900">{isRu ? "Управление ковром" : "Controls"}</p>

              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{isRu ? "Масштаб" : "Scale"}</span>
                    <span>{scale}%</span>
                  </div>
                  <input type="range" min={30} max={140} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{isRu ? "Поворот" : "Rotate"}</span>
                    <span>{rotate}°</span>
                  </div>
                  <input type="range" min={-45} max={45} value={rotate} onChange={(e) => setRotate(Number(e.target.value))} className="w-full" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{isRu ? "Тень" : "Shadow"}</span>
                    <span>{shadow}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={shadow} onChange={(e) => setShadow(Number(e.target.value))} className="w-full" />
                </div>

                {showSecond ? (
                  <div className="text-xs text-gray-600 pt-2">
                    {isRu
                      ? "Режим сравнения: второй ковер будет добавлен отдельным слоем."
                      : "Compare mode: second carpet will be a separate layer."}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              {isRu
                ? "Сейчас это превью интерфейса - чтобы заказчик видел конечную идею."
                : "This is a UI preview - so the client sees the final concept."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
