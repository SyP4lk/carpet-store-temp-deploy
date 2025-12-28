"use client";

import { FC, ReactNode } from "react";
import { LocaleContext } from "@/context/localeContext";
import { Dictionary } from "@/localization/dictionary";

type LocaleProviderProps = {
  children: ReactNode;
  dictionary: Dictionary;
};

export const LocaleProvider: FC<LocaleProviderProps> = ({ children, dictionary }) => {
  return (
    <LocaleContext.Provider value={{ dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
};
