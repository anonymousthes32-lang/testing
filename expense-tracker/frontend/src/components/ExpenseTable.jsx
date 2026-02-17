const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

function SkeletonRows() {
  return [...Array(3)].map((_, i) => (
    <tr key={i}>
      <td colSpan="4"><div className="skeleton" /></td>
    </tr>
  ));
}

export default function ExpenseTable({ expenses, isLoading }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {isLoading && <SkeletonRows />}
          {!isLoading && expenses.length === 0 && (
            <tr><td colSpan="4">No expenses found for this filter.</td></tr>
          )}
          {!isLoading && expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
              <td>{expense.description || '—'}</td>
              <td>{formatter.format(Number(expense.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
