import { EconomicActivity } from "./Option";
import { Salary } from "./Salary";

export interface PredictionsRequest {
    topic: string;
    data: Salary[];
}

export interface PredictionResponse {
    predictions: { year: string; value: number }[];
    suggestions: string[];
    trend: string;
  }
  
  export interface Prediction {
    option: EconomicActivity;
    salaries: Salary[];
    suggestions: string[];
    trend: string;
  }