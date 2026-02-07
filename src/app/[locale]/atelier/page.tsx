import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import type { Metadata } from "next";
import { use } from "react";
import { CheckCircle2 } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export default function AtelierPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const items = isRu
    ? [
        { t: "Размер и форма", d: "Подбираем под планировку и мебель." },
        { t: "Цвет и палитра", d: "Согласуем с интерьером и текстилем." },
        { t: "Материалы", d: "Шерсть, вискоза, смешанные варианты." },
        { t: "Эскиз и согласование", d: "Покажем визуализацию до производства." },
      ]
    : [
        { t: "Size and shape", d: "Fit to your layout and furniture." },
        { t: "Color palette", d: "Match the interior and textiles." },
        { t: "Materials", d: "Wool, viscose, mixed options." },
        { t: "Sketch approval", d: "Preview before production." },
      ];

  const steps = isRu
    ? ["Заявка и бриф", "Подбор дизайна и расчет", "Производство", "Доставка"]
    : ["Request and brief", "Design and estimate", "Production", "Delivery"];
  const stepLabel = isRu ? "Шаг" : "Step";

  const benefits = isRu
    ? [
        "Библиотека дизайнов и фактур",
        "Срок изготовления от 14 дней",
        "Фото и видео отчеты по этапам",
        "Художники и технологи с опытом",
        "Премиальные материалы",
        "Доставка и аккуратная примерка",
      ]
    : [
        "Design and texture library",
        "Production from 14 days",
        "Photo and video updates",
        "Experienced artists and technologists",
        "Premium materials",
        "Delivery and careful fitting",
      ];

  const faq = isRu
    ? [
        {
          q: "Можно ли сделать нестандартную форму?",
          a: "Да, мы изготавливаем ковры любой формы и размера.",
        },
        {
          q: "Сколько занимает производство?",
          a: "Срок зависит от сложности, в среднем от 14 дней.",
        },
        {
          q: "Можно ли повторить рисунок из вашего каталога?",
          a: "Да, адаптируем любые модели под ваш интерьер.",
        },
        {
          q: "Как согласовать цвет?",
          a: "Подберем палитру и сделаем предварительную визуализацию.",
        },
      ]
    : [
        {
          q: "Can you make a custom shape?",
          a: "Yes, we produce rugs in any shape and size.",
        },
        {
          q: "How long does production take?",
          a: "It depends on complexity, usually from 14 days.",
        },
        {
          q: "Can you recreate a catalog design?",
          a: "Yes, we adapt any model to your interior.",
        },
        {
          q: "How do we approve colors?",
          a: "We select a palette and prepare a preview.",
        },
      ];

  return (
    <>
      <Banner filter={isRu ? "Ковры на заказ" : "Custom rugs"} image="/static/image5.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isRu ? "Ковер на заказ под ваш интерьер" : "Custom rugs for your interior"}
            </h1>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Создаем уникальные ковры по вашему проекту или адаптируем модели из нашей библиотеки дизайнов."
                : "We create unique rugs from your concept or adapt models from our design library."}
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Учитываем размер, форму, материалы и цветовую гамму, чтобы ковер идеально вписался в пространство."
                : "We consider size, shape, materials, and color palette so the rug fits the space perfectly."}
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((x, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold">{x.t}</p>
                  <p className="mt-1 text-sm text-gray-600">{x.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Как это работает" : "How it works"}</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                {steps.map((s, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500">{stepLabel} {i + 1}</p>
                    <p className="mt-1 font-semibold">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold">{isRu ? "Почему ателье удобно" : "Why the atelier is convenient"}</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((text, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold">FAQ</h2>
              <div className="mt-4 space-y-4">
                {faq.map((item, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="font-semibold text-gray-900">{item.q}</p>
                    <p className="mt-2 text-sm text-gray-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <LeadForm
              title={isRu ? "Рассчитать стоимость" : "Get a quote"}
              subtitle={
                isRu
                  ? "Оставьте контакты, чтобы обсудить размеры и материалы."
                  : "Leave your contacts to discuss size and materials."
              }
              source="ATELIER"
              withCity
              withComment
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koenigcarpet.ru";
  const url = `${baseUrl}/${locale}/atelier`;

  const title = locale === "ru" ? "Ковры на заказ" : "Custom rugs";
  const description =
    locale === "ru"
      ? "Ковры на заказ с учетом размера, формы, материалов и цвета. Ателье Koenig Carpet."
      : "Custom rugs tailored to size, shape, materials, and color. Koenig Carpet atelier.";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Koenig Carpet",
        },
      ],
      locale,
      siteName: "Koenig Carpet",
    },
  };
}
