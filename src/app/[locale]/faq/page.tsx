import FaqAccordion from '@/components/pages/faq/faqAccordion'
import Banner from '@/components/shared/banner'
import Footer from '@/components/shared/footer'
import { Locale } from '@/localization/config'
import { getDictionary } from '@/localization/dictionary'
import React, { FC, use } from 'react'

type Props = {
    params: Promise<{ locale: Locale }>
}

const Faq: FC<Props> = ({ params }) => {
    const pathParams = use(params)

    const dict = use(getDictionary(pathParams.locale))
    return (
        <>
            <Banner filter={dict.faq.faq} image="/static/image1.png" />
            <FaqAccordion />
            <Footer />
        </>
    )
}


export default Faq
