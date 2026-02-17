const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function TotalBadge({ total, count }) {
  return <div className="card"><strong>Total:</strong> {formatter.format(Number(total))} ({count} expenses)</div>;
}
