import { useEffect, useState } from 'react';
import { getPortfolio } from '../services/api';
import type { PortfolioApiResponse } from '../types/portfolio';

export function usePortfolio() {
  const [data, setData] = useState<PortfolioApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPortfolio()
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError('Impossible de charger le portfolio.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    data,
    loading,
    error,
  };
}