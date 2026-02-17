export default function FilterBar({ expenses, filters, setFilters }) {
  const categories = [...new Set(expenses.map((expense) => expense.category))];

  return (
    <div className="card filter-bar">
      <select
        value={filters.category}
        onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
      >
        <option value="">All</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setFilters((prev) => ({
          ...prev,
          sort: prev.sort === 'date_desc' ? 'date_asc' : 'date_desc',
        }))}
      >
        {filters.sort === 'date_desc' ? 'Newest First' : 'Oldest First'}
      </button>

      <button type="button" className="link" onClick={() => setFilters({ category: '', sort: 'date_desc' })}>
        Reset Filters
      </button>
    </div>
  );
}
