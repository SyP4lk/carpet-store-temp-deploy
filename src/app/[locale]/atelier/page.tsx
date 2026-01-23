import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import { use } from "react";

type Props = { params: Promise<{ locale: string }> };

export default function AtelierPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const items = isRu
    ? [
        { t: "Размер и форма", d: "Подбираем под вашу планировку и мебель." },
        { t: "Цвет и палитра", d: "Сочетаем с интерьером и текстилем." },
        { t: "Материалы", d: "Шерсть, вискоза, смесовые варианты." },
        { t: "Эскиз и согласование", d: "Макет перед производством." },
      ]
    : [
        { t: "Size and shape", d: "Fit to your layout and furniture." },
        { t: "Color palette", d: "Match to your interior." },
        { t: "Materials", d: "Wool, viscose, mixed." },
        { t: "Sketch approval", d: "Preview before production." },
      ];

  const steps = isRu
    ? ["Заявка и пожелания", "Подбор и макет", "Производство", "Доставка"]
    : ["Request", "Design draft", "Production", "Delivery"];

  return (
    <>
      <Banner filter={isRu ? "Ателье" : "Atelier"} image="/static/image5.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isRu ? "Ковер на заказ под ваш интерьер" : "Custom carpet for your interior"}
            </h1>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Сделаем ковер по индивидуальным параметрам - размер, форма, цвет и материалы. Подходит для нестандартных помещений и сложных проектов."
                : "We create custom carpets - size, shape, colors and materials. Perfect for non-standard spaces and interior projects."}
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
                    <p className="text-xs font-semibold text-gray-500">Step {i + 1}</p>
                    <p className="mt-1 font-semibold">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <LeadForm
              title={isRu ? "Рассчитать стоимость" : "Get a quote"}
              subtitle={isRu ? "Оставьте контакты - уточним размеры и предложим варианты." : "Leave contacts - we will уточнить details and offer options."}
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
