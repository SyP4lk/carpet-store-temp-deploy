  import Banner from "@/components/shared/banner";
  import Footer from "@/components/shared/footer";
  import { use } from "react";
  import { getDictionary } from "@/localization/dictionary";
  import { Locale } from "@/localization/config";
  import Image from "next/image";

  type AboutProps = {
    params: Promise<{ locale: string }>;
  };

  const About = ({ params }: AboutProps) => {
    const locale = use(params).locale as Locale;
    const dict = use(getDictionary(locale));

    const salonImages = [
      "/salon/IMG_3488-1.jpg",
      "/salon/photo_2025-09-13_13-50-10.jpg",
      "/salon/IMG_3450-1.jpg",
      "/salon/IMG_3481-1.jpg",
      "/salon/IMG_3502-1.jpg",
      "/salon/IMG_3467-1.jpg",
      "/salon/IMG_3483-1.jpg",
      "/salon/IMG_3522-1.jpg",
      "/salon/IMG_3485-1.jpg",
      "/salon/IMG_3466-1.jpg",
      "/salon/IMG_3464-1.jpg",
    ];

    return (
      <div className="flex flex-col">
        <Banner filter={dict.footer["about-us"]} image="/static/image1.png" />

        <section className="px-6 md:px-24 py-12 bg-white text-gray-800">
          <div className="max-w-5xl mx-auto">
            {/* About Text */}
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-center">{dict.footer["about-us"]}</h2>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Мы уверены, что главное в нашей работе — это потребности клиента и профессиональное
  отношение к каждому заказу.
                  Наш многолетний опыт в дизайнерской сфере позволяет нам быть экспертами высокого
  уровня, а результаты нашей работы подтверждают это.
                </p>

                <p>
                  Мы следим за последними тенденциями в интерьерном дизайне и постоянно расширяем свои
  знания и навыки.
                  Посещаем ведущие мероприятия в сфере дизайна, а наши партнеры — крупнейшие и надежные
   производители текстиля.
                  Два раза в год обновляем коллекции, чтобы предлагать клиентам и дизайнерам самые
  актуальные идеи и решения.
                </p>

                <p>
                  Благодаря собственному цеху, собственным проектам и квалифицированной команде мы
  можем реализовать даже самые сложные заказы.
                  Нам приятно, что нам доверяют, а коллеги ценят наше мнение. Мы гордимся партнерскими
  отношениями, которые помогают решать любые задачи.
                </p>

                <p>
                  Главное для нас — внимательное отношение к клиентам, желание развиваться и находить
  правильные решения.
                  Основные принципы нашей работы — честность, профессионализм и искреннее уважение к
  людям. Именно на них строится наша история успеха!
                </p>
              </div>
            </div>

            {/* Salon Gallery */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-8 text-center">Наш салон</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salonImages.map((src, index) => (
                  <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg 
  shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={src}
                      alt={`Фото салона ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  };

  export default About;
