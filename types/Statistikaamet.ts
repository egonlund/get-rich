export interface EconomicActivitiesResponse {
    title: string;
    variables: { code: string; text: string; values: string[]; valueTexts: string[] }[];
}

export interface SalaryResponse {
    title: string;
    dimension: {
      Vaatlusperiood: {
        category: {
          index: { [key: string]: number };
          label: { [key: string]: string };
        };
      };
    };
    value: number[];
  }