"use client";

import {ReactNode} from "react";
import {ThemeProvider} from "./ThemeProvider";
import {Toaster} from "@/components/ui/toaster";

export  function Providers({children}: { children: ReactNode }) {

  return (
      <ThemeProvider>
        {children}
        <Toaster/>
      </ThemeProvider>
  );
}
