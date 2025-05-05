'use client';

import React, { useState, useEffect } from 'react';
import OraclePredictions from './OraclePredictions';
import { STATISTIKAAMET_AVG_MONTHLY_GROSS_SALARIES_URL } from '@/lib/utils';
import { EconomicActivitiesResponse } from '@/types/Statistikaamet';
import { EconomicActivity } from '@/types/Option';

const mapEconomicActivities = (data: EconomicActivitiesResponse) => {
  const variable = data.variables.find((v) => v.code === 'Tegevusala');
  if (!variable) return [];

  return variable.values.map((value, index) => ({
    value,
    valueText: variable.valueTexts[index],
  }));
};

const OptionsDropdown = () => {
  const [options, setOptions] = useState<EconomicActivity[]>([]);
  const [selectedOption, setSelectedOption] = useState<EconomicActivity | null>(null);

  const fetchEconomicActivities = async (): Promise<EconomicActivity[]> => {
    const res = await fetch(STATISTIKAAMET_AVG_MONTHLY_GROSS_SALARIES_URL);
    if (!res.ok) {
      throw new Error('Failed to fetch economic actitivites');
    }
    const response = await res.json();
    const economicActivities: EconomicActivity[] = mapEconomicActivities(response);
    return economicActivities;
  };

  useEffect(() => {
    const process = async () => {
      const economicActivities: EconomicActivity[] = await fetchEconomicActivities();
      setOptions(economicActivities);
      setSelectedOption(economicActivities[0])
    }
    process();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption: EconomicActivity | undefined = options.find(opt => opt.value === e.target.value);
    if (selectedOption) {
      setSelectedOption(selectedOption);
    }
  };

  if (!selectedOption) {
    return (
      <div
        className={`my-4 flex flex-col items-center transition-all duration-500 ease-in-out
          ${!selectedOption ? '' : 'hidden'}`}>
        <div className="text-4xl font-bold text-purple-700">
          <q>Oota nüüd natuke, las ma loitsun...</q>
        </div>
        <div className="my-4 w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className='m-4 text-center'><q className='text-2xl text-white font-bold'>Tee oma valik</q></div>
      <select onChange={handleSelectChange} value={selectedOption?.value} className='w-full rounded-md border-8 border-purple-600 bg-purple-200 py-4 text-lg font-bold focus:ring-purple-500 text-center shadow-lg'>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.valueText}
          </option>
        ))}
      </select>
      {selectedOption && <OraclePredictions option={selectedOption} />}
    </>
  )
}

export default OptionsDropdown;