import { useCallback, useEffect, useState } from 'react';
import { createExpense, fetchExpenses } from '../api/client';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: '', sort: 'date_desc' });

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchExpenses(filters);
      setExpenses(result.data);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to load expenses. Try refreshing.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const addExpense = useCallback(async (payload, key) => {
    await createExpense(payload, key);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { expenses, total, isLoading, error, filters, setFilters, refresh, addExpense };
}
