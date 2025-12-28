import { FC, Fragment, useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => document.documentElement.classList.add("dark1"), []);
  return <Fragment>{children}</Fragment>;
};

export default ThemeProvider;
