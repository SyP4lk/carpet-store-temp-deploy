import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import { use } from "react";
import { CheckCircle2 } from "lucide-react";

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
  const stepLabel = isRu ? "Шаг" : "Step";

  const dreamSteps = isRu
    ? [
        "Выберите модель из каталога или договоритесь о встрече с дизайнером",
        "Выберите цвет и размер будущего ковра",
        "Утвердите образец с консультантом или дизайнером",
        "Следите за созданием ковра по видео и фотографиям",
        "Получите готовый ковёр с доставкой на дом",
      ]
    : [
        "Choose a model from the catalog or arrange a meeting with a designer",
        "Choose the color and size of your future rug",
        "Approve the sample with a consultant or designer",
        "Follow the rug creation with videos and photos",
        "Receive the finished rug with delivery to your home",
      ];

  const convenience = isRu
    ? [
        "Библиотека ковров",
        "Сроки изготовления уникального ковра 14 дней",
        "Наши художники помогут бережно воплотить вашу идею в готовый продукт",
        "Предоставим фото производства ковра с мануфактуры",
        "Двадцатилетний опыт дизайна и производства ковров",
        "Консультации профессиональных дизайнеров по цветовой гамме, рисунку, размеру, материалам, фактурам ворса",
      ]
    : [
        "Rug library",
        "Custom rug production in 14 days",
        "Our artists will carefully turn your idea into a finished product",
        "We provide photo updates from the workshop",
        "20 years of experience in rug design and manufacturing",
        "Consultations with professional designers on colors, patterns, sizes, materials, and pile textures",
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
                ? "В нашем ателье ковров можно разработать уникальный ковёр по вашему эскизу или адаптировать любую модель из библиотеки дизайнов."
                : "In our rug atelier, you can create a unique rug from your sketch or adapt any model from our design library."}
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Сделаем ковер по индивидуальным параметрам - размер, форма, цвет и материалы. Подходит для нестандартных помещений и сложных проектов."
                : "We create custom rugs - size, shape, colors and materials. Perfect for non-standard spaces and interior projects."}
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
              <h2 className="text-2xl font-bold">{isRu ? "Пять шагов к ковру мечты" : "Five steps to your dream rug"}</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {dreamSteps.map((s, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500">{stepLabel} {i + 1}</p>
                    <p className="mt-2 font-semibold text-gray-900">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold">{isRu ? "Почему с нами удобно работать" : "Why working with us is convenient"}</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {convenience.map((text, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <LeadForm
              title={isRu ? "Рассчитать стоимость" : "Get a quote"}
              subtitle={isRu ? "Оставьте контакты - уточним размеры и предложим варианты." : "Leave your contacts - we will clarify sizes and suggest options."}
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
