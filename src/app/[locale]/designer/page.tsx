import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import ContactWays from "@/components/sections/ContactWays";
import { Locale } from "@/localization/config";
import { use } from "react";

type Props = { params: Promise<{ locale: string }> };

export default function DesignerPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  const introLines = isRu
    ? [
        "Свяжитесь с нами по вопросам программы лояльности",
        "Мы сотрудничаем с дизайнерами и декораторами",
        "Подберём идеальный ковёр под концепт вашего проекта. Заказчик останется доволен интерьером и нашим высоким уровнем сервиса.",
      ]
    : [
        "Contact us about the loyalty program",
        "We work with designers and decorators",
        "We will select the perfect rug for your project concept. Your client will love the interior and our high level of service.",
      ];

  const blocks = isRu
    ? [
        {
          t: "Посетите наш салон ковров в Русской Европе.",
          d: "Ковры можно потрогать и увидеть вживую, убедиться в их качестве и колористике. Персональный менеджер расскажет всё о коврах и поможет подобрать эксклюзивные модели для вашего проекта.",
        },
        {
          t: "В наличии более 100 ковров. В дизайне более 1600 вариантов.",
        },
        {
          t: "Закажите ковры для фотосъемки",
          d: "Привезём ковры для фотосессии в вашем проекте бесплатно, расстелем в интерьере и сами заберём после съёмки.",
        },
        {
          t: "Закажите демонстрацию ковров в интерьере",
          d: "Уникальная услуга поможет сравнить несколько ковров в интерьере заказчика и выбрать лучший вариант для вашего проекта. Привезём ковры бесплатно и в удобное для вас время.",
        },
        {
          t: "Воспользуйтесь услугами экспертов-декораторов",
          d: "Наши эксперты по коврам всё сделают сами: изучат проект и проведут первичный отбор моделей по вашему техническому заданию, сэкономив ваше время и силы. Вам останется только утвердить подборку ковров.",
        },
        {
          t: "Создайте уникальный ковёр в Ателье",
          d: "Художники разработают персональный дизайн ковра под ваш проект с учётом пожеланий по стилю, цвету, фактуре, материалам и рисунку. Фотоотчёты позволят вам контролировать создание ковра на всех этапах.",
        },
      ]
    : [
        {
          t: "Visit our rug salon in Russkaya Evropa.",
          d: "You can see and touch the rugs in person, check their quality and colors. A personal manager will tell you everything about the rugs and help select exclusive models for your project.",
        },
        {
          t: "Over 100 rugs in stock. More than 1600 design options.",
        },
        {
          t: "Order rugs for a photo shoot",
          d: "We will bring rugs for your project photo shoot for free, lay them out in the interior, and pick them up after the shoot.",
        },
        {
          t: "Order a home rug demo",
          d: "This unique service helps compare several rugs in the client's interior and choose the best option for your project. We bring the rugs for free at a time that suits you.",
        },
        {
          t: "Use expert decorator services",
          d: "Our rug experts will handle everything: review the project and do an initial selection based on your brief, saving your time and effort. You only need to approve the final selection.",
        },
        {
          t: "Create a unique rug in the Atelier",
          d: "Artists will develop a custom rug design for your project, taking into account style, color, texture, materials, and patterns. Photo updates let you monitor the rug creation at every stage.",
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

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {blocks.map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold text-gray-900">{item.t}</p>
                  {item.d ? <p className="mt-2 text-sm text-gray-600">{item.d}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <LeadForm
              title={isRu ? "Связаться с нами" : "Contact us"}
              subtitle={
                isRu
                  ? "Оставьте контакты - расскажем о программе лояльности и подберем формат сотрудничества."
                  : "Leave your contacts - we will share the loyalty program details and propose a cooperation format."
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
