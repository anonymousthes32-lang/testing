import React, { useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import FilterBar from './components/FilterBar';
import TotalBadge from './components/TotalBadge';
import Dashboard from './components/Dashboard';
import CategoryDrillDown from './components/CategoryDrillDown';
import { useExpenses } from './hooks/useExpenses';
import './styles.css';

export default function App() {
  const { expenses, total, isLoading, error, filters, setFilters, addExpense } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const listView = selectedCategory === null;
  const dashboardView = selectedCategory === '__dashboard';

  return (
    <div className="container">
      <header className="header">
        <h1>💸 Expense Tracker</h1>
        {listView ? (
          <button type="button" onClick={() => setSelectedCategory('__dashboard')}>Dashboard</button>
        ) : (
          <button type="button" onClick={() => setSelectedCategory(null)}>List View</button>
        )}
      </header>

      {listView && (
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

      {dashboardView && <Dashboard onSelectCategory={setSelectedCategory} />}
      {!listView && !dashboardView && (
        <CategoryDrillDown category={selectedCategory} onBack={() => setSelectedCategory('__dashboard')} />
      )}
    </div>
  );
}
