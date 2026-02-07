import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import type { Metadata } from "next";
import { use } from "react";
import Image from "next/image";

type Props = { params: Promise<{ locale: string }> };

export default function DemonstrationPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const stepLabel = isRu ? "Шаг" : "Step";
  const stepShort = isRu
    ? ["Выбор", "Заявка", "Выезд", "Оплата"]
    : ["Select", "Request", "Visit", "Checkout"];

  const demoSteps = isRu
    ? [
        "Выберите несколько ковров самостоятельно или вместе с консультантом. Каждый ковер должен стоить не менее 30000 рублей.",
        "Оставьте заявку на демонстрацию или оформите заказ через корзину. Мы свяжемся с вами.",
        "Эксперт-декоратор привезет ковры, расстелет и поможет сравнить варианты.",
        "Оставьте понравившиеся ковры и оплатите. Остальные мы вернем бесплатно.",
      ]
    : [
        "Choose several rugs yourself or with our consultant. Each rug should cost at least 30,000 rubles.",
        "Submit a demo request or place an order via the cart. We will contact you.",
        "An expert decorator brings the rugs, lays them out, and helps you compare.",
        "Keep and pay for the rugs you like. We return the rest for free.",
      ];

  const demoImages = [
    "/services/demo-step-1.jpg",
    "/services/demo-step-2.jpg",
    "/services/demo-step-3.jpg",
    "/services/demo-step-4.jpg",
  ];

  const mistakes = isRu
    ? [
        { value: "57%", text: "Покупателей ошиблись с размером ковра" },
        { value: "74%", text: "Покупателей ожидали другие цвета" },
        { value: "15%", text: "Покупателей думали, что ковёр будет другим на ощупь" },
      ]
    : [
        { value: "57%", text: "Customers chose the wrong rug size" },
        { value: "74%", text: "Customers expected different colors" },
        { value: "15%", text: "Customers thought the rug would feel different" },
      ];

  const benefits = isRu
    ? [
        {
          t: "До 3 вариантов",
          d: "Выбирайте до трех ковров для сравнения.",
        },
        {
          t: "Любые размеры",
          d: "Проверьте, как размер смотрится именно в вашем интерьере.",
        },
        {
          t: "Эксперт-декоратор",
          d: "Поможет подобрать по стилю и мебели.",
        },
        {
          t: "Бесплатно",
          d: "Доставка, демонстрация и вывоз - бесплатно.",
        },
        {
          t: "В комфортной обстановке",
          d: "Вы выбираете дома, без спешки.",
        },
        {
          t: "Тактильное сравнение",
          d: "Оцените ворс и фактуру вживую.",
        },
      ]
    : [
        {
          t: "Up to 3 options",
          d: "Compare up to three rugs.",
        },
        {
          t: "Any sizes",
          d: "See how sizes look in your interior.",
        },
        {
          t: "Expert decorator",
          d: "Helps match style and furniture layout.",
        },
        {
          t: "Free of charge",
          d: "Delivery, demo, and pickup are free.",
        },
        {
          t: "Comfortable setting",
          d: "Make the decision at home without rush.",
        },
        {
          t: "Tactile comparison",
          d: "Feel the pile and texture in person.",
        },
      ];

  const faq = isRu
    ? [
        {
          q: "Сколько ковров можно взять на демонстрацию?",
          a: "До трех ковров из наличия.",
        },
        {
          q: "Сколько стоит услуга?",
          a: "Демонстрация бесплатная при стоимости ковров от 30000 рублей.",
        },
        {
          q: "В какие дни возможен выезд?",
          a: "Мы согласуем удобное время после заявки.",
        },
      ]
    : [
        {
          q: "How many rugs can I try?",
          a: "Up to three rugs from stock.",
        },
        {
          q: "Is the service paid?",
          a: "The demo is free for rugs priced from 30,000 rubles.",
        },
        {
          q: "When can the visit happen?",
          a: "We agree on a convenient time after your request.",
        },
      ];

  return (
    <>
      <Banner filter={isRu ? "Демонстрация" : "Demonstration"} image="/static/image4.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isRu ? "Демонстрация ковров у вас дома" : "Home demonstration"}
            </h1>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Привезем несколько вариантов, чтобы вы увидели ковер в своем интерьере и приняли решение спокойно."
                : "We bring several options so you can see the rug in your interior and decide comfortably."}
            </p>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Как проходит демонстрация" : "How the demo works"}</h2>
              <div className="mt-6 relative">
                <div className="absolute left-0 right-0 top-5 h-px bg-gray-200" />

                <div className="grid grid-cols-4 gap-2">
                  {stepShort.map((label, i) => (
                    <div key={i} className="flex flex-col items-center text-center relative z-10">
                      <div className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-sm font-semibold text-gray-900">
                        {i + 1}
                      </div>
                      <div className="mt-2 text-xs text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {demoSteps.map((text, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={demoImages[i]}
                        alt={isRu ? `Демонстрация шаг ${i + 1}` : `Demo step ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-gray-500">{stepLabel} {i + 1}</p>
                      <p className="mt-2 text-sm text-gray-700">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold">
                {isRu ? "Каких ошибок поможет избежать демонстрация?" : "What mistakes does the demo help avoid?"}
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mistakes.map((item, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="mt-2 text-sm text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-gray-700">
                {isRu
                  ? "Эти ошибки практически исключены, если сравнить ковры дома."
                  : "These mistakes are largely avoided when you compare rugs at home."}
              </p>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold">{isRu ? "Преимущества демонстрации" : "Demo benefits"}</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((item, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="font-semibold text-gray-900">{item.t}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.d}</p>
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
              title={isRu ? "Записаться на демонстрацию" : "Book a demo"}
              subtitle={
                isRu
                  ? "Оставьте контакты, согласуем город, адрес и время."
                  : "Leave your contacts and we will confirm city, address, and time."
              }
              source="DEMO"
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
  const url = `${baseUrl}/${locale}/demonstration`;

  const title = locale === "ru" ? "Демонстрация ковров" : "Home demonstration";
  const description =
    locale === "ru"
      ? "Бесплатная демонстрация ковров у вас дома. Сравните несколько вариантов и выберите лучший."
      : "Free rug demonstration at home. Compare several options and choose the best.";

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
