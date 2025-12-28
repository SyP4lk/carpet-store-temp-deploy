import { createContext } from "react";
import { Dictionary } from "@/localization/dictionary";

export type LocaleContextType = {
  dictionary: Dictionary | undefined
};

export const LocaleContext = createContext<LocaleContextType>({ dictionary: undefined });
