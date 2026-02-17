import { useEffect, useState } from 'react';
import { fetchMonthlyTotals } from '../api/client';
import MonthOverview from './MonthOverview';
import MonthCategoryView from './MonthCategoryView';
import MonthCategoryExpenses from './MonthCategoryExpenses';

export default function Dashboard() {
  const [view, setView] = useState({ level: 1, month: null, category: null });
  const [monthsData, setMonthsData] = useState([]);
  const [monthsLoading, setMonthsLoading] = useState(true);
  const [monthsError, setMonthsError] = useState(null);

  useEffect(() => {
    fetchMonthlyTotals()
      .then(setMonthsData)
      .catch((error) => setMonthsError(error.message))
      .finally(() => setMonthsLoading(false));
  }, []);

  const goToMonth = (month) => setView({ level: 2, month, category: null });
  const goToCategory = (category) => setView((prev) => ({ level: 3, month: prev.month, category }));
  const backToMonths = () => setView({ level: 1, month: null, category: null });
  const backToMonth = () => setView((prev) => ({ level: 2, month: prev.month, category: null }));

  return (
    <div className="dashboard-wrap">
      {view.level === 1 && (
        <MonthOverview
          data={monthsData}
          isLoading={monthsLoading}
          error={monthsError}
          onSelectMonth={goToMonth}
        />
      )}
      {view.level === 2 && (
        <MonthCategoryView
          month={view.month}
          onSelectCategory={goToCategory}
          onBack={backToMonths}
        />
      )}
      {view.level === 3 && (
        <MonthCategoryExpenses
          month={view.month}
          category={view.category}
          onBack={backToMonth}
        />
      )}
    </div>
  );
}
