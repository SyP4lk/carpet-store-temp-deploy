import Banner from '@/components/shared/banner';
import Footer from '@/components/shared/footer';
import { Locale } from '@/localization/config';
import { getDictionary } from '@/localization/dictionary';
import React, { FC } from 'react';

type Props = {
  params: Promise<{ locale: Locale }>;
};

const DeliveryReturn: FC<Props> = async ({ params }) => {
  const pathParams = await params;
  const dict = await getDictionary(pathParams.locale);

  return (
    <>
      <Banner filter={dict.footer["delivery-return"]} image="/static/image1.png" />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{dict.footer["delivery-return"]}</h1>
        <div className="prose prose-gray max-w-none">
          <h2 className="text-2xl font-semibold mb-4">
            {pathParams.locale === 'ru' ? 'ДОСТАВКА' : 'DELIVERY'}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {pathParams.locale === 'ru'
              ? 'Стоимость доставки включена в цену ковра.'
              : 'Delivery cost is included in the carpet price.'}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {pathParams.locale === 'ru'
              ? 'Доставка индивидуальных заказов с фабрики осуществляется прямо до нашего салона.'
              : 'Delivery of custom orders from the factory is made directly to our showroom.'}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DeliveryReturn;