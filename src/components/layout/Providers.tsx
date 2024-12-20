"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      {/* <Toaster/> */}
    </ThemeProvider>
  );
}
