"use client";

import React, { useMemo, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

type LeadFormProps = {
  title: string;
  subtitle?: string;
  source: string; // например "VR", "ATELIER", "DESIGNER", "DEMO"
  withCity?: boolean;
  withComment?: boolean;
  className?: string;
};

export default function LeadForm({
  title,
  subtitle,
  source,
  withCity,
  withComment,
  className,
}: LeadFormProps) {
  const [locale] = useLocale();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const isRu = useMemo(() => locale === "ru", [locale]);

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      setStatus("err");
      return;
    }

    setLoading(true);
    setStatus("idle");

    // send-contact ожидает { name, phone, stock }
    const stockParts: string[] = [`source=${source}`];
    if (withCity && city.trim()) stockParts.push(`city=${city.trim()}`);
    if (withComment && comment.trim()) stockParts.push(`comment=${comment.trim()}`);

    try {
      const res = await fetch("/api/send-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-locale": locale,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          stock: stockParts.join(" | "),
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setStatus("ok");
        setName("");
        setPhone("");
        setCity("");
        setComment("");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className ?? ""}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase text-gray-600">
            {isRu ? "Имя" : "Name"}
          </label>
          <input
            className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRu ? "Как к вам обращаться" : "Your name"}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-gray-600">
            {isRu ? "Телефон" : "Phone"}
          </label>
          <input
            className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isRu ? "+7 ..." : "+49 ..."}
          />
        </div>

        {withCity ? (
          <div>
            <label className="text-xs font-semibold uppercase text-gray-600">
              {isRu ? "Город" : "City"}
            </label>
            <input
              className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={isRu ? "Например, Калининград" : "For example, Berlin"}
            />
          </div>
        ) : null}

        {withComment ? (
          <div>
            <label className="text-xs font-semibold uppercase text-gray-600">
              {isRu ? "Комментарий" : "Comment"}
            </label>
            <textarea
              className="mt-1 w-full min-h-[90px] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isRu ? "Что важно учесть?" : "Any details?"}
            />
          </div>
        ) : null}

        <button
          onClick={submit}
          disabled={loading}
          className={`w-full h-11 rounded-lg font-semibold transition ${
            loading ? "bg-gray-300 text-gray-600" : "bg-black text-white hover:bg-black/90"
          }`}
        >
          {loading ? (isRu ? "Отправка..." : "Sending...") : (isRu ? "Оставить заявку" : "Send")}
        </button>

        {status === "ok" ? (
          <p className="text-sm text-green-700">{isRu ? "Заявка отправлена." : "Sent."}</p>
        ) : null}
        {status === "err" ? (
          <p className="text-sm text-red-700">{isRu ? "Проверьте поля или попробуйте позже." : "Check fields or try later."}</p>
        ) : null}
      </div>
    </div>
  );
}
