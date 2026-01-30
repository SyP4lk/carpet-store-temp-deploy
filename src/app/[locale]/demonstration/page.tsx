import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
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
        "Выберите несколько ковров сами или вместе с нашим консультантом. На сайте или в магазине. Обратите внимание, что каждый ковёр должен стоить не менее 30000 рублей.",
        "Оформите заказ через корзину на сайте или оставьте заявку на демонстрацию ковров. Наш консультант свяжется с вами.",
        "Выберите удобное время, и эксперт-декоратор привезёт ковры к вам домой, расстелет ковры, расставит мебель, поможет определиться с выбором.",
        "Оставьте и оплатите ковры, которые вам понравились. Остальные мы бесплатно вернем в магазин.",
      ]
    : [
        "Choose several rugs yourself or together with our consultant. On the website or in the store. Please note that each rug must cost at least 30,000 rubles.",
        "Place an order through the website cart or leave a request for a rug demo. Our consultant will contact you.",
        "Choose a convenient time, and an expert decorator will bring the rugs to your home, lay them out, arrange the furniture, and help you decide.",
        "Keep and pay for the rugs you like. We will return the rest to the store for free.",
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
          t: "Выбор из 3-х вариантов",
          d: "До трех ковров для сравнения, каждый стоимостью от 30000 рублей.",
        },
        {
          t: "Любые размеры",
          d: "Сравните, как разные размеры смотрятся именно в вашем интерьере.",
        },
        {
          t: "Выезд профессионального декоратора",
          d: "Эксперт поможет подобрать ковры под стиль и расстановку мебели.",
        },
        {
          t: "Совершенно бесплатно",
          d: "Доставка, демонстрация и обратный вывоз - бесплатно.",
        },
        {
          t: "В комфортной обстановке",
          d: "Вы выбираете без спешки у себя дома.",
        },
        {
          t: "Тактильное удовольствие",
          d: "Потрогайте ворс и оцените фактуру вживую.",
        },
      ]
    : [
        {
          t: "Choose from 3 options",
          d: "Up to three rugs to compare, each priced from 30,000 rubles.",
        },
        {
          t: "Any sizes",
          d: "See how different sizes look in your own interior.",
        },
        {
          t: "Professional decorator visit",
          d: "An expert helps select rugs for the style and furniture layout.",
        },
        {
          t: "Completely free",
          d: "Delivery, demo, and pickup are free.",
        },
        {
          t: "In a comfortable setting",
          d: "Choose at home without rush.",
        },
        {
          t: "Tactile pleasure",
          d: "Feel the pile and assess the texture in person.",
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
                ? "Привезем несколько подходящих вариантов, чтобы вы увидели ковер в своем интерьере и приняли решение без спешки."
                : "We can bring several suitable options so you can see the rug in your interior and decide comfortably."}
            </p>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{isRu ? "Как проходит демонстрация" : "How the demo works"}</h2>
              <div className="mt-6 relative">
                  {/* Линия проходит через центр кружков */}
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
                {isRu ? "Каких ошибок поможет избежать демонстрация?" : "What mistakes does the home demo help you avoid?"}
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
                  ? "Эти ошибки выбора полностью исключены с нашей бесплатной услугой демонстрации ковров у вас дома!"
                  : "These selection mistakes are completely eliminated with our free at-home rug demo!"}
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
          </div>

          <div>
            <LeadForm
              title={isRu ? "Записаться на демонстрацию" : "Book a demo"}
              subtitle={isRu ? "Оставьте контакты - согласуем город, адрес и удобное время." : "Leave your contacts - we will confirm city, address and time."}
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
