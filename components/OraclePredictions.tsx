'use client';

import { useEffect, useState } from "react";
import { ChartComponent } from "./ChartComponent";
import { STATISTIKAAMET_AVG_MONTHLY_GROSS_SALARIES_URL } from "@/lib/utils";
import { useOracleStore } from "@/lib/oracleStore";
import { SalaryResponse } from "@/types/Statistikaamet";
import { PredictionResponse, PredictionsRequest } from "@/types/OraclePredictions";
import { Salary } from "@/types/Salary";
import { EconomicActivity } from "@/types/Option";

interface Props {
  option: EconomicActivity;
}

const mapSalaries = (data: SalaryResponse): Salary[] => {
  const category = data.dimension.Vaatlusperiood.category;
  return Object.keys(category.index).map((key) => ({
    year: category.label[key],
    value: data.value[category.index[key]],
  }));
};

const fetchAverageMonthlyGrossSalaries = async (option: EconomicActivity): Promise<Salary[]> => {
  const postData = {
    query: [
      {
        code: 'Näitaja',
        selection: { filter: 'item', values: ['GR_W_AVG'] },
      },
      {
        code: 'Tegevusala',
        selection: { filter: 'item', values: [option.value] },
      },
    ],
    response: { format: 'json-stat2' },
  };

  const res = await fetch(STATISTIKAAMET_AVG_MONTHLY_GROSS_SALARIES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });

  const response: SalaryResponse = await res.json();
  return mapSalaries(response);
};

const OraclePredictions = ({ option }: Props) => {
  const { prediction, setPrediction, loadFromLocalStorage } = useOracleStore();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchOraclePredictions = async (request: PredictionsRequest) => {
    const response = await fetch('/api/oracle-predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  };

  useEffect(() => {
    const cached = loadFromLocalStorage(option.value);

    const process = async () => {
      if (!option) return;
      setError(false);
      setLoading(true);

      try {
        const salaries = await fetchAverageMonthlyGrossSalaries(option);

        if (salaries.some((item) => item.value === null)) {
          setError(true);
          return;
        }

        const request: PredictionsRequest = {
          topic: option.valueText,
          data: salaries,
        };

        const response: PredictionResponse = await fetchOraclePredictions(request);
        const fullSalaries = [...salaries, ...response.predictions];

        setPrediction({
          option,
          salaries: fullSalaries,
          suggestions: response.suggestions,
          trend: response.trend,
        });
      } catch (err) {
        setError(true);
        throw new Error(`Oracle predictions error: ${err}`)
      } finally {
        setLoading(false);
      }
    };

    if (!cached) {
      process();
    } else {
      setPrediction(cached);
      setError(false);
    }
  }, [option]);

  return (
    <>
      {/* Error */}
      <div
        className={`my-2 w-full p-2 text-center text-lg font-bold bg-red-300 rounded-md text-red-900 transition-all duration-500 ease-in-out
          ${error ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <q>Palun vali teine valdkond! Minu nähtavus on hägustunud selle valdkonna suhtes...</q>
      </div>

      {/* Loading */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col items-center
          ${loading ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="text-2xl font-bold text-white">
          <q>Ma olen vana mees, anna aega atra seada...</q>
        </div>
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>

      {/* Oracle Predictions */}
      <div
        className={`transition-all duration-500 ease-in-out
          ${!error && !loading ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex md:flex-row flex-col md:gap-4 items-stretch shadow">
          <div className="border-8 border-purple-900 rounded-md my-4 bg-white md:w-1/2 flex flex-col justify-center">
            <div className="text-center">
              <h1 className="text-lg my-4 font-bold">
                <q>Mina kui tööturu prohvet näen selles valdkonnas suuri arenguid ...</q>
              </h1>
              <p className="p-2">{prediction?.trend}</p>
            </div>

            <div className="text-center">
              <h1 className="text-lg my-4 font-bold">
                <q>Soovid tuleviku palka? Las ma pajatan Sulle, mis oskusi pead arendama ...</q>
              </h1>
              <ul>
                {prediction?.suggestions.map((suggestion, idx) => (
                  <li className="my-2" key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="my-4 md:w-1/2">
            <ChartComponent option={option.valueText} salaries={prediction?.salaries || []} />
          </div>
        </div>
      </div>
    </>
  );
};

export default OraclePredictions;