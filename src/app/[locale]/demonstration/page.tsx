import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import { use } from "react";

type Props = { params: Promise<{ locale: string }> };

export default function DemonstrationPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const steps = isRu
    ? ["Оставляете заявку", "Согласуем время и подбор", "Привозим варианты", "Вы выбираете дома"]
    : ["Send a request", "Confirm time and selection", "We bring options", "You choose at home"];

  const bring = isRu
    ? [
        { t: "Подбор под интерьер", d: "Учитываем стиль, размеры и палитру." },
        { t: "Несколько вариантов", d: "Покажем несколько моделей для сравнения." },
        { t: "Консультация", d: "Поможем выбрать по материалам и уходу." },
      ]
    : [
        { t: "Interior-based selection", d: "We consider style, size and palette." },
        { t: "Multiple options", d: "Compare several models." },
        { t: "Consultation", d: "Help with materials and care." },
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
                ? "Привезем несколько подходящих вариантов, чтобы вы увидели ковер в своем интерьере и приняли решение без спешки."
                : "We can bring several suitable options so you can see the carpet in your interior and decide comfortably."}
            </p>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Как это работает" : "How it works"}</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                {steps.map((s, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500">Step {i + 1}</p>
                    <p className="mt-1 font-semibold">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Что привозим" : "What we bring"}</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {bring.map((x, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="font-semibold">{x.t}</p>
                    <p className="mt-1 text-sm text-gray-600">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "FAQ" : "FAQ"}</h2>
              <div className="mt-4 space-y-3">
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold">{isRu ? "Сколько вариантов можно привезти?" : "How many options can you bring?"}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {isRu
                      ? "Обычно подбираем несколько вариантов для сравнения. Точное количество уточним при заявке."
                      : "Usually we curate several options for comparison. The exact number is confirmed when you request."}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold">{isRu ? "Это платно?" : "Is it paid?"}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {isRu
                      ? "Условия зависят от региона и адреса. Подтвердим при обращении."
                      : "Terms depend on region and address. We will confirm after your request."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <LeadForm
              title={isRu ? "Записаться на демонстрацию" : "Book a demo"}
              subtitle={isRu ? "Оставьте контакты - согласуем город, адрес и удобное время." : "Leave contacts - we will confirm city, address and time."}
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
