import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchByCategory } from '../api/client';

const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function CategoryDrillDown({ category, onBack }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ data: [], total: '0.00', count: 0 });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchByCategory(category)
      .then((data) => { if (mounted) setResult(data); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [category]);

  const chartData = useMemo(() => result.data.map((item) => ({ date: item.date, amount: Number(item.amount) })), [result.data]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="card">
      <button type="button" onClick={onBack}>← Back to Dashboard</button>
      <h2>{category} — {formatter.format(Number(result.total))} total ({result.count} expenses)</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatter.format(Number(value))} />
            <Bar dataKey="amount" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="table">
        <thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          {result.data.map((item) => (
            <tr key={item.id}><td>{item.date}</td><td>{item.description || '—'}</td><td>{formatter.format(Number(item.amount))}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
