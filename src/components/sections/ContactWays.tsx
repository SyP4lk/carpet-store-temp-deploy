"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useDictionary } from "@/hooks/useDictionary";
import { useLocale } from "@/hooks/useLocale";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

type ContactWaysProps = {
  className?: string;
};

export default function ContactWays({ className }: ContactWaysProps) {
  const { dictionary } = useDictionary();
  const [locale] = useLocale();
  const isRu = locale === "ru";

  const phone = dictionary?.shared?.contacts?.phone ?? "";
  const email = dictionary?.shared?.contacts?.email ?? "";
  const whatsappValue = dictionary?.shared?.contacts?.whatsapp ?? "";
  const telegramValue = dictionary?.shared?.contacts?.telegram ?? "";

  const whatsappHref = whatsappValue.startsWith("http")
    ? whatsappValue
    : `https://wa.me/${whatsappValue.replace(/\\D/g, "")}`;
  const telegramHref = telegramValue.startsWith("http")
    ? telegramValue
    : `https://t.me/${telegramValue.replace(/^@/, "")}`;

  const contactLink = `/${locale}/contact`;

  return (
    <section className={`px-6 md:px-24 py-12 bg-white text-gray-800 ${className ?? ""}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold">
          {isRu ? "Свяжитесь с нами удобным способом" : "Contact us in the way that suits you"}
        </h2>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold">{isRu ? "Мессенджеры" : "Messengers"}</p>
              <p className="mt-1 text-sm text-gray-600">
                {isRu ? "Напишите нам в WhatsApp или Telegram, ответим быстро." : "Message us on WhatsApp or Telegram, we respond quickly."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-green-600"
              >
                <WhatsAppIcon className="w-5 h-5" />
                WhatsApp
              </a>
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                <Send className="w-5 h-5" />
                Telegram
              </a>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold">{isRu ? "Сотрудничество" : "Collaboration"}</p>
              <p className="mt-1 text-sm text-gray-600">
                {isRu ? "Мы свяжемся и обсудим условия программы." : "We will get in touch and discuss program terms."}
              </p>
            </div>
            <Link
              href={contactLink}
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-black text-white text-sm font-semibold hover:bg-black/90"
            >
              {isRu ? "Оставить заявку" : "Leave a request"}
            </Link>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold">{isRu ? "Обратный звонок" : "Callback"}</p>
              <p className="mt-1 text-sm text-gray-600">
                {isRu ? "Мы перезвоним и ответим на вопросы." : "We will call you back and answer your questions."}
              </p>
            </div>
            <Link
              href={contactLink}
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-gray-300 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              {isRu ? "Заказать звонок" : "Request a call"}
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold">{isRu ? "Наши контакты" : "Our contacts"}</p>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <a href={phone ? `tel:${phone}` : undefined} className="block hover:text-black">
                  {phone || (isRu ? "Телефон не указан" : "Phone not provided")}
                </a>
                <a href={email ? `mailto:${email}` : undefined} className="block hover:text-black">
                  {email || (isRu ? "E-mail не указан" : "E-mail not provided")}
                </a>
              </div>
            </div>
            <Link
              href={contactLink}
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-gray-300 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              {isRu ? "Адреса магазинов" : "Store locations"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
