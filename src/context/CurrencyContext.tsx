"use client";

import { createContext, useContext, ReactNode } from 'react';

interface CurrencyContextType {
  eurToRubRate: number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  eurToRubRate: 105 // Дефолтный курс
});

export function CurrencyProvider({
  children,
  eurToRubRate
}: {
  children: ReactNode;
  eurToRubRate: number;
}) {
  return (
    <CurrencyContext.Provider value={{ eurToRubRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}