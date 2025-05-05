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

  if (!res.ok) {
    throw new Error(`Failed to fetch salaries: ${res.status}`);
  }

  const response = await res.json() as SalaryResponse;
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
      setError(false);
      setLoading(true);

      try {
        const salaryData = await fetchAverageMonthlyGrossSalaries(option);

        if (salaryData.some((item) => item.value == null)) {
          setError(true);
          return;
        }

        const request: PredictionsRequest = {
          topic: option.valueText,
          salaryData: salaryData,
        };

        const response: PredictionResponse = await fetchOraclePredictions(request);
        const completeSalaryData = [...salaryData, ...response.predictions];

        setPrediction({
          option,
          salaries: completeSalaryData,
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
        className={`w-full my-2 p-4 text-center text-lg font-bold bg-red-300 rounded-md text-red-900 transition-all duration-500 ease-in-out
          ${error ? '' : 'hidden'}`}>
        <p>Palun vali teine valdkond! Minu nähtavus on hägustunud &quot;{option.valueText}&quot; valdkonna suhtes...</p>
      </div>

      {/* Loading */}
      <div
        className={`my-4 flex flex-col items-center transition-all duration-500 ease-in-out
          ${loading ? '' : 'hidden'}`}>
        <div className="text-4xl font-bold text-white">
          <q>Ma olen vana mees, anna aega atra seada...</q>
        </div>
        <div className="my-4 w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>

      {/* Oracle Predictions */}
      <div
        className={`transition-all duration-500 ease-in-out
          ${!error && !loading ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex md:flex-row flex-col md:gap-4 items-stretch shadow">
          <div className="border-8 border-purple-900 rounded-lg my-4 bg-white md:w-1/2 flex flex-col justify-center">
            <div className="text-center">
              <h1 className="text-4xl leading-12 my-4 font-bold">
                Mina kui tööturu prohvet näen <br /><span className="text-purple-700">&quot;{option.valueText}&quot;</span><br /> puhul suuri arenguid ...
              </h1>
              <p className="m-4 p-4 bg-purple-300 rounded-lg">{prediction?.trend}</p>
            </div>

            <div className="text-center">
              <h1 className="text-4xl leading-12 my-4 font-bold">
                Soovid tuleviku palka?<br />Las ma pajatan <span className="text-purple-700">Sulle</span>, mis oskusi pead arendama ...
              </h1>
              <ul className="m-4 p-4 bg-purple-300 rounded-lg">
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