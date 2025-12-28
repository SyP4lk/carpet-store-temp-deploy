'use client'

import { useEffect } from 'react'
import { Locale } from '@/localization/config'

export default function LangSetter({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
