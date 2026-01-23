import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import { use } from "react";

type Props = { params: Promise<{ locale: string }> };

export default function DesignerPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const benefits = isRu
    ? [
        { t: "Выгодные условия", d: "Предложим формат сотрудничества под ваш проект." },
        { t: "Помощь с подбором", d: "Быстро подберем варианты под стиль и бюджет." },
        { t: "Материалы для согласования", d: "Фото, характеристики, размеры, артикулы." },
        { t: "Поддержка на всех этапах", d: "От запроса до доставки и замены при необходимости." },
      ]
    : [
        { t: "Flexible terms", d: "We will propose a cooperation model for your project." },
        { t: "Selection support", d: "Fast подбор options by style and budget." },
        { t: "Approval materials", d: "Photos, specs, sizes, articles." },
        { t: "End-to-end support", d: "From request to delivery." },
      ];

  const steps = isRu
    ? ["Оставляете заявку", "Уточняем задачи и условия", "Подбираем варианты", "Сопровождаем до результата"]
    : ["Send a request", "Clarify needs and terms", "Select options", "Support to final result"];

  return (
    <>
      <Banner filter={isRu ? "Дизайнерам" : "Designers"} image="/static/image3.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isRu ? "Сотрудничество для дизайнеров" : "Program for designers"}
            </h1>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Поможем подобрать ковры для ваших проектов и дадим удобный формат взаимодействия. Детали партнерства уточним после согласования условий с вами."
                : "We help you choose carpets for your projects and offer a convenient cooperation format. Final terms will be уточнены after agreement."}
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((x, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold">{x.t}</p>
                  <p className="mt-1 text-sm text-gray-600">{x.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Как начать" : "How to start"}</h2>
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
              <h2 className="text-2xl font-bold">{isRu ? "FAQ" : "FAQ"}</h2>
              <div className="mt-4 space-y-3">
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold">{isRu ? "Какие условия сотрудничества?" : "What are the terms?"}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {isRu
                      ? "Условия зависят от формата проекта. После заявки мы уточним детали и предложим варианты."
                      : "Terms depend on the project format. After your request we will clarify details and propose options."}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold">{isRu ? "Можно ли получить подбор под проект?" : "Can you curate options?"}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {isRu
                      ? "Да, подберем несколько вариантов по стилю, размеру и бюджету."
                      : "Yes, we will propose several options by style, size and budget."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <LeadForm
              title={isRu ? "Стать партнером" : "Become a partner"}
              subtitle={isRu ? "Оставьте контакты - мы свяжемся и обсудим условия." : "Leave contacts - we will reach out and discuss terms."}
              source="DESIGNER"
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
