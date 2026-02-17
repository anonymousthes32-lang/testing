import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { fetchMonthlyCategoryBreakdown } from '../api/client';
import { CATEGORY_COLORS } from './dashboardConstants';
import { formatCurrency, formatMonthFull } from '../utils/format';

export default function MonthCategoryView({ month, onSelectCategory, onBack }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchMonthlyCategoryBreakdown(month)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [month]);

  const monthTotal = useMemo(() => data.reduce((sum, item) => sum + Number(item.total), 0), [data]);
  const monthLabel = formatMonthFull(month);

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!data.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🗂️</div>
        <div className="empty-title">No data for {monthLabel}</div>
      </div>
    );
  }

  return (
    <>
      <div className="drilldown-header card">
        <button className="btn-back" type="button" onClick={onBack}>← All Months</button>
        <div className="drilldown-title">{monthLabel}</div>
        <div className="drilldown-stats">
          <div className="drilldown-stat">
            <span className="drilldown-stat-value">{formatCurrency(monthTotal)}</span>
            <span className="drilldown-stat-label">Total Spent</span>
          </div>
          <div className="drilldown-stat">
            <span className="drilldown-stat-value">{data.length}</span>
            <span className="drilldown-stat-label">Categories</span>
          </div>
        </div>
      </div>

      <div className="card chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data.map((item) => ({ ...item, value: Number(item.total) }))}
              dataKey="value"
              nameKey="category"
              innerRadius={60}
              outerRadius={100}
              onClick={(slice) => {
                if (slice?.payload?.category) onSelectCategory(slice.payload.category);
              }}
            >
              <Label
                position="center"
                value={formatCurrency(monthTotal)}
                style={{ fontSize: '1.1rem', fill: '#f8fafc', fontWeight: 700 }}
              />
              {data.map((item) => (
                <Cell key={item.category} fill={CATEGORY_COLORS[item.category] || '#6B7280'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, payload) => [
                `${formatCurrency(value)} (${payload?.payload?.percent ?? 0}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="summary-grid">
        {data.map((item) => (
          <button key={item.category} type="button" className="summary-tile" onClick={() => onSelectCategory(item.category)}>
            <div className="summary-head">
              <span className="dot" style={{ background: CATEGORY_COLORS[item.category] || '#6B7280' }} />
              <strong>{item.category}</strong>
            </div>
            <div className="summary-total">{formatCurrency(item.total)}</div>
            <div className="summary-meta">{item.count} expenses · {item.percent}% of month</div>
            <div className="month-card-bar">
              <div className="month-card-bar-fill" style={{ width: `${item.percent}%` }} />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
