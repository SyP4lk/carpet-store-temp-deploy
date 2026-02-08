import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import VrPreview from "@/components/pages/services/VrPreview";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import type { Metadata } from "next";
import { use } from "react";

type Props = { params: Promise<{ locale: string }> };

export default function VrPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const benefits = isRu
    ? [
        "Загрузка фото комнаты за пару секунд",
        "Поиск ковра по артикулу из каталога",
        "Масштаб, поворот и перспектива для реалистичного вида",
        "Режим сравнения двух ковров",
        "Скачивание результата в PNG",
      ]
    : [
        "Upload a room photo in seconds",
        "Search by carpet article from the catalog",
        "Scale, rotation, and perspective controls",
        "Compare two rugs side by side",
        "Download the result as PNG",
      ];

  const steps = isRu
    ? [
        "Загрузите фото комнаты и выберите угол обзора.",
        "Введите артикул ковра и выберите размер.",
        "Настройте положение, перспективу и тень.",
        "Сохраните результат и отправьте его дизайнеру или семье.",
      ]
    : [
        "Upload a room photo and pick the best angle.",
        "Enter the rug article and select a size.",
        "Adjust position, perspective, and shadow.",
        "Save the result and share it with your designer or family.",
      ];

  const faq = isRu
    ? [
        {
          q: "Нужна ли регистрация?",
          a: "Нет, сервис работает в браузере без регистрации.",
        },
        {
          q: "Можно ли сравнить два ковра?",
          a: "Да, включите режим сравнения и добавьте второй ковер.",
        },
        {
          q: "Сохраняются ли фотографии?",
          a: "Нет, все остается на вашем устройстве.",
        },
        {
          q: "Что делать, если нужного артикула нет?",
          a: "Оставьте заявку, мы подберем аналог и добавим в подборку.",
        },
      ]
    : [
        {
          q: "Do I need to register?",
          a: "No, the tool works in the browser without registration.",
        },
        {
          q: "Can I compare two rugs?",
          a: "Yes, enable compare mode and add a second rug.",
        },
        {
          q: "Are photos stored anywhere?",
          a: "No, everything stays on your device.",
        },
        {
          q: "What if I cannot find a product code?",
          a: "Leave a request and we will suggest alternatives.",
        },
      ];

  return (
    <>
      <Banner filter={isRu ? "VR примерка" : "VR try on"} image="/static/image2.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isRu ? "Виртуальная примерка ковра" : "Virtual rug try-on"}
            </h1>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Загрузите фото комнаты, найдите ковер по артикулу и примеряйте его в интерьере. Настраивайте размер, поворот, тень и перспективу, чтобы получить реалистичный результат."
                : "Upload a room photo, search a rug by article, and place it in your interior. Adjust size, rotation, shadow, and perspective for a realistic result."}
            </p>

            <div className="mt-8">
              <VrPreview locale={locale} />
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Преимущества сервиса" : "Why it is useful"}</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((text, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Как пользоваться" : "How it works"}</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                {steps.map((step, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500">{isRu ? "Шаг" : "Step"} {i + 1}</p>
                    <p className="mt-2 text-sm text-gray-700">{step}</p>
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
              title={isRu ? "Нужна помощь с подбором?" : "Need help choosing?"}
              subtitle={
                isRu
                  ? "Оставьте контакты - подберем варианты и поможем с примеркой."
                  : "Leave your contacts and we will help with the selection."
              }
              source="VR"
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
  const url = `${baseUrl}/${locale}/vr`;

  const title =
    locale === "ru" ? "Виртуальная примерка ковра" : "Virtual rug try-on";
  const description =
    locale === "ru"
      ? "Загрузите фото комнаты и примеряйте ковер в интерьере. Масштаб, поворот, перспектива, сравнение двух ковров."
      : "Upload a room photo and try rugs in your interior. Scale, rotation, perspective, and compare mode.";

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
