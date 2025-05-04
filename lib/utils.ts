import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATISTIKAAMET_AVG_MONTHLY_GROSS_SALARIES_URL = "https://andmed.stat.ee/api/v1/et/stat/PA103";
