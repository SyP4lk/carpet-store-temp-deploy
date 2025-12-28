"use client"

import {useLocale} from "@/hooks/useLocale"
import {localeConfig} from "@/localization/config"
import nProgress from "nprogress"

const LocaleSwitch = ({locale}: {locale: string}) => {
    const [, setLocale] = useLocale()
  return (
    <div className="flex flex-col gap-1 fixed z-50 bottom-4 right-4">
        {
            localeConfig.locales.map((loc, i)=>{
                return(
                    <button key={i} data-active={loc==locale} className="uppercase border p-2 text-black bg-white cursor-pointer
                        data-[active=true]:bg-black data-[active=true]:text-white data-[active=true]:border-black"
                        onClick={()=>{
                            nProgress.start()
                            setLocale(loc)
                        }
                        }>
                        {loc}
                    </button>
                )
            })
        }
    </div>
  )
}

export default LocaleSwitch
