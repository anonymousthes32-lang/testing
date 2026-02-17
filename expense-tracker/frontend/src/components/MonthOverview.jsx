import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatCurrencyShort, formatMonthFull, formatMonthShort } from '../utils/format';

export default function MonthOverview({ data, isLoading, error, onSelectMonth }) {
  const [activeBar, setActiveBar] = useState(null);

  const maxTotal = useMemo(() => {
    if (!data.length) return 0;
    return Math.max(...data.map((item) => Number(item.total)));
  }, [data]);

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return <div className="error-banner">{error}</div>;

  if (!data.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <div className="empty-title">No expenses recorded yet</div>
        <div className="empty-sub">Add your first expense to see monthly trends</div>
      </div>
    );
  }

  return (
    <>
      <div className="chart-container card">
        <div className="chart-title">Monthly Spend — All Time</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data.map((item) => ({ ...item, totalNum: Number(item.total) }))}
            onMouseMove={(state) => {
              const hovered = state?.activePayload?.[0]?.payload?.month;
              setActiveBar(hovered || null);
            }}
            onMouseLeave={() => setActiveBar(null)}
            onClick={(event) => {
              if (event?.activePayload?.[0]?.payload?.month) {
                onSelectMonth(event.activePayload[0].payload.month);
              }
            }}
          >
            <XAxis dataKey="month" tickFormatter={formatMonthShort} />
            <YAxis tickFormatter={formatCurrencyShort} />
            <Tooltip
              formatter={(value, name, payload) => [formatCurrency(value), 'Total']}
              labelFormatter={(month, payload) => `${formatMonthFull(month)} · ${payload?.[0]?.payload?.count || 0} expenses`}
            />
            <Bar dataKey="totalNum" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.month}
                  fill="var(--accent)"
                  opacity={activeBar && activeBar !== entry.month ? 0.6 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="month-cards-grid">
        {data.map((item) => (
          <button key={item.month} type="button" className="month-card" onClick={() => onSelectMonth(item.month)}>
            <div className="month-card-name">{formatMonthFull(item.month)}</div>
            <div className="month-card-total">{formatCurrency(item.total)}</div>
            <div className="month-card-count">{item.count} expenses</div>
            <div className="month-card-bar">
              <div
                className="month-card-bar-fill"
                style={{ width: `${maxTotal ? (Number(item.total) / maxTotal) * 100 : 0}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
