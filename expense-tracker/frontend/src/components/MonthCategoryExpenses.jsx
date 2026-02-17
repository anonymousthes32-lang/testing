import { useEffect, useState } from 'react';
import { fetchMonthCategoryExpenses } from '../api/client';
import { formatCurrency, formatDate, formatMonthFull } from '../utils/format';

export default function MonthCategoryExpenses({ month, category, onBack }) {
  const [result, setResult] = useState({ expenses: [], total: '0.00', count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchMonthCategoryExpenses(month, category)
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [month, category]);

  const monthLabel = formatMonthFull(month);

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="card">
      <button className="btn-back" type="button" onClick={onBack}>← {monthLabel} Categories</button>
      <div className="drilldown-title">
        <em>{category}</em>
        <span className="muted-inline"> · {monthLabel}</span>
      </div>
      <div className="drilldown-stats simple">
        <span className="drilldown-stat-value">{formatCurrency(result.total)}</span>
        <span className="drilldown-stat-label">Total</span>
        <span className="drilldown-stat-value">{result.count}</span>
        <span className="drilldown-stat-label">Expenses</span>
      </div>

      {!result.expenses.length ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-title">No expenses found</div>
          <div className="empty-sub">{category} · {monthLabel}</div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Description</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
          </thead>
          <tbody>
            {result.expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{formatDate(expense.date)}</td>
                <td className={`desc-cell ${expense.description ? '' : 'empty'}`}>{expense.description || '—'}</td>
                <td className="amount-cell">{formatCurrency(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
