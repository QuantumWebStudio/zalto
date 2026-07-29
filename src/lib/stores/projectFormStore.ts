import { create } from "zustand";
import type { GenerationItem } from "@/components/GenerationProgress";
import type { FormErrors } from "@/lib/validation";

export type FormPhase = "form" | "generating";

interface ProjectFormState {
  companyName: string;
  brandColor: string;
  logoDataUrl: string | null;
  logoError: string | undefined;
  topics: string[];
  errors: FormErrors;
  submitError: string | null;
  isSubmitting: boolean;
  phase: FormPhase;
  items: GenerationItem[];

  setCompanyName: (value: string) => void;
  setBrandColor: (value: string) => void;
  setLogoDataUrl: (value: string | null) => void;
  setLogoError: (value: string | undefined) => void;
  setTopics: (value: string[]) => void;
  setErrors: (value: FormErrors) => void;
  setSubmitError: (value: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  setPhase: (value: FormPhase) => void;
  setItems: (value: GenerationItem[]) => void;
  updateItem: (index: number, patch: Partial<GenerationItem>) => void;
  reset: () => void;
}

const initialState = {
  companyName: "",
  brandColor: "#003161",
  logoDataUrl: null,
  logoError: undefined,
  topics: [""],
  errors: {},
  submitError: null,
  isSubmitting: false,
  phase: "form" as FormPhase,
  items: [] as GenerationItem[],
};

export const useProjectFormStore = create<ProjectFormState>((set) => ({
  ...initialState,

  setCompanyName: (companyName) => set({ companyName }),
  setBrandColor: (brandColor) => set({ brandColor }),
  setLogoDataUrl: (logoDataUrl) => set({ logoDataUrl }),
  setLogoError: (logoError) => set({ logoError }),
  setTopics: (topics) => set({ topics }),
  setErrors: (errors) => set({ errors }),
  setSubmitError: (submitError) => set({ submitError }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setPhase: (phase) => set({ phase }),
  setItems: (items) => set({ items }),
  updateItem: (index, patch) =>
    set((state) => ({
      items: state.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    })),
  reset: () => set(initialState),
}));
