"use client";

import { createContext, useContext } from "react";
import type { FormContextValue } from "./types";

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error(
      "Form field components must be used within a <Form> component",
    );
  }

  return context;
}

export { FormContext };
