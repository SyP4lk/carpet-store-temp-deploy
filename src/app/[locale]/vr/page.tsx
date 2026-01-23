import Banner from "@/components/shared/banner";
import Footer from "@/components/shared/footer";
import VrPreview from "@/components/pages/services/VrPreview";
import LeadForm from "@/components/pages/services/LeadForm";
import { Locale } from "@/localization/config";
import { use } from "react";

type Props = { params: Promise<{ locale: string }> };

export default function VrPage({ params }: Props) {
  const locale = use(params).locale as Locale;
  const isRu = locale === "ru";

  return (
    <>
      <Banner filter={isRu ? "Примерка" : "Try on"} image="/static/image2.png" />

      <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isRu ? "Виртуальная примерка ковра" : "Virtual carpet try-on"}
            </h1>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {isRu
                ? "Загрузите фото комнаты, вставьте артикул ковра и посмотрите, как он выглядит в интерьере. На следующем этапе добавим перемещение, масштаб, поворот, тень и сравнение двух ковров."
                : "Upload a room photo, paste a carpet article and preview it in your interior. Next stage will add move, scale, rotate, shadow and compare mode."}
            </p>

            <div className="mt-8">
              <VrPreview />
            </div>
          </div>

          <div>
            <LeadForm
              title={isRu ? "Нужна помощь с выбором?" : "Need help choosing?"}
              subtitle={isRu ? "Оставьте контакты - мы поможем подобрать ковер и подскажем артикул." : "Leave contacts - we will help you pick a carpet and article."}
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
