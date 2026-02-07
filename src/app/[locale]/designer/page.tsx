import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import ContactWays from "@/components/sections/ContactWays";
import { Locale } from "@/localization/config";
import type { Metadata } from "next";
import { use } from "react";

type Props = { params: Promise<{ locale: string }> };

export default function DesignerPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const introLines = isRu
    ? [
        "Программа для дизайнеров и декораторов.",
        "Подбираем ковры под концепцию проекта и бюджет.",
        "Помогаем с демонстрацией и примеркой в интерьере.",
      ]
    : [
        "A program for designers and decorators.",
        "We select rugs for your project concept and budget.",
        "We help with demonstrations and interior try-ons.",
      ];

  const steps = isRu
    ? ["Бриф и требования", "Подбор моделей", "Демонстрация", "Согласование и заказ"]
    : ["Brief and requirements", "Model selection", "Demonstration", "Approval and order"];

  const blocks = isRu
    ? [
        {
          t: "Салон в Русской Европе",
          d: "Ковры можно посмотреть и потрогать вживую, оценить качество и палитру.",
        },
        {
          t: "Более 100 ковров в наличии",
          d: "Быстрые сроки под проекты и съемки.",
        },
        {
          t: "Ковры для фотосъемки",
          d: "Привезем, расстелем и заберем после съемки.",
        },
        {
          t: "Демонстрация в интерьере",
          d: "Сравните несколько ковров у клиента дома.",
        },
        {
          t: "Экспертный подбор",
          d: "Подберем варианты по стилю, фактуре и бюджету.",
        },
        {
          t: "Индивидуальное ателье",
          d: "Разработаем уникальный дизайн под ваш проект.",
        },
      ]
    : [
        {
          t: "Rug salon in Russkaya Evropa",
          d: "See and touch rugs in person, check quality and palette.",
        },
        {
          t: "Over 100 rugs in stock",
          d: "Fast lead times for projects and shoots.",
        },
        {
          t: "Rugs for photo shoots",
          d: "We deliver, lay out, and pick up after the shoot.",
        },
        {
          t: "Home demonstration",
          d: "Compare multiple rugs in the client's interior.",
        },
        {
          t: "Expert selection",
          d: "We match style, texture, and budget.",
        },
        {
          t: "Custom atelier",
          d: "We design a unique rug for your project.",
        },
      ];

  const faq = isRu
    ? [
        {
          q: "Есть ли комиссия для дизайнеров?",
          a: "Да, условия обсуждаются индивидуально по проекту.",
        },
        {
          q: "Можно ли взять ковры на примерку?",
          a: "Да, доступна демонстрация в интерьере.",
        },
        {
          q: "Сколько времени занимает подбор?",
          a: "Обычно 1-3 дня в зависимости от брифа.",
        },
      ]
    : [
        {
          q: "Is there a designer commission?",
          a: "Yes, terms are discussed individually per project.",
        },
        {
          q: "Can we take rugs for a try-on?",
          a: "Yes, home demonstration is available.",
        },
        {
          q: "How fast is the selection?",
          a: "Usually 1-3 days depending on the brief.",
        },
      ];

  return (
    <>
      <Banner filter={isRu ? "Дизайнерам" : "For designers"} image="/static/image3.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isRu ? "Программа для дизайнеров" : "Program for designers"}
            </h1>
            <div className="mt-3 space-y-2 text-gray-700 leading-relaxed">
              {introLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold">{isRu ? "Этапы работы" : "How we work"}</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                {steps.map((step, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500">{isRu ? "Шаг" : "Step"} {i + 1}</p>
                    <p className="mt-1 font-semibold">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {blocks.map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold text-gray-900">{item.t}</p>
                  {item.d ? <p className="mt-2 text-sm text-gray-600">{item.d}</p> : null}
                </div>
              ))}
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
              title={isRu ? "Связаться с нами" : "Contact us"}
              subtitle={
                isRu
                  ? "Оставьте контакты, расскажем об условиях и поможем с подбором."
                  : "Leave your contacts and we will share cooperation details."
              }
              source="DESIGNER"
              withCity
              withComment
            />
          </div>
        </div>
      </section>

      <ContactWays />

      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koenigcarpet.ru";
  const url = `${baseUrl}/${locale}/designer`;

  const title = locale === "ru" ? "Программа для дизайнеров" : "Program for designers";
  const description =
    locale === "ru"
      ? "Сотрудничество для дизайнеров и декораторов: подбор ковров, демонстрации, ателье."
      : "Cooperation for designers and decorators: selection, demonstrations, and custom atelier.";

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
