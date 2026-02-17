import { useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import FilterBar from './components/FilterBar';
import TotalBadge from './components/TotalBadge';
import Dashboard from './components/Dashboard';
import { useExpenses } from './hooks/useExpenses';
import './styles.css';

export default function App() {
  const { expenses, total, isLoading, error, filters, setFilters, addExpense } = useExpenses();
  const [isDashboard, setIsDashboard] = useState(false);

  return (
    <div className="container">
      <header className="header">
        <h1>💸 Expense Tracker</h1>
        {isDashboard ? (
          <button type="button" className="header-btn" onClick={() => setIsDashboard(false)}>List View</button>
        ) : (
          <button type="button" className="header-btn" onClick={() => setIsDashboard(true)}>Dashboard</button>
        )}
      </header>

      {!isDashboard && (
        <div className="layout">
          <ExpenseForm onAdd={addExpense} />
          <section>
            <FilterBar expenses={expenses} filters={filters} setFilters={setFilters} />
            {error && <p className="error-banner">{error}</p>}
            <ExpenseTable expenses={expenses} isLoading={isLoading} />
            <TotalBadge total={total} count={expenses.length} />
          </section>
        </div>
      )}

      {isDashboard && <Dashboard />}
    </div>
  );
}
