import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCategorySummary } from '../api/client';

const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export const CATEGORY_COLORS = {
  Food: '#F97316',
  Transport: '#3B82F6',
  Housing: '#8B5CF6',
  Entertainment: '#EC4899',
  Health: '#10B981',
  Shopping: '#F59E0B',
  Other: '#6B7280',
};

export default function Dashboard({ onSelectCategory }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchCategorySummary()
      .then((summary) => { if (mounted) setData(summary); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const total = useMemo(() => data.reduce((sum, item) => sum + Number(item.total), 0), [data]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!data.length) return <div className="card">No data yet. Add expenses to see your dashboard.</div>;

  return (
    <div className="card">
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data.map((item) => ({ ...item, value: Number(item.total) }))}
              dataKey="value"
              nameKey="category"
              innerRadius={70}
              outerRadius={110}
              onClick={(entry) => onSelectCategory(entry.category)}
            >
              {data.map((item) => <Cell key={item.category} fill={CATEGORY_COLORS[item.category] || '#9ca3af'} />)}
            </Pie>
            <Tooltip formatter={(value, name) => {
              const pct = total ? Math.round((Number(value) / total) * 100) : 0;
              return [`${formatter.format(Number(value))} (${pct}%)`, name];
            }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <table className="table">
        <thead><tr><th>Category</th><th>Total Spent</th><th># of Expenses</th><th>% of Total</th></tr></thead>
        <tbody>
          {data.map((item) => {
            const pct = total ? Math.round((Number(item.total) / total) * 100) : 0;
            return (
              <tr key={item.category} onClick={() => onSelectCategory(item.category)} className="clickable">
                <td>{item.category}</td>
                <td>{formatter.format(Number(item.total))}</td>
                <td>{item.count}</td>
                <td>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
