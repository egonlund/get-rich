import { Prediction } from "@/types/OraclePredictions";
import { create } from "zustand";

interface OracleStore {
  prediction?: Prediction;
  setPrediction: (data: Prediction) => void;
  loadFromLocalStorage: (option: string) => Prediction | undefined;
}

export const useOracleStore = create<OracleStore>((set) => ({
  oracleData: undefined,

  setPrediction: (prediction: Prediction) => {
    set({ prediction: prediction });
    localStorage.setItem(`oracle:${prediction.option.value}`, JSON.stringify(prediction));
  },

  loadFromLocalStorage: (option) => {
    const stored = localStorage.getItem(`oracle:${option}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      set({ prediction: parsed });
      return parsed;
    }
    return undefined;
  },
}));
