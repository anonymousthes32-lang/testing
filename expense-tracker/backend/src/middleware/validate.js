function isValidCalendarDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

function validateExpense(req, res, next) {
  const { amount, category, description, date } = req.body;
  const errors = [];

  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else {
    const amountStr = String(amount).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
      errors.push('amount must be a positive number with at most 2 decimal places');
    } else if (Number(amountStr) <= 0) {
      errors.push('amount must be greater than 0');
    }
  }

  if (typeof category !== 'string' || category.trim().length === 0) {
    errors.push('category is required');
  } else if (category.trim().length > 100) {
    errors.push('category must be at most 100 characters');
  } else {
    req.body.category = category.trim();
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push('description must be a string');
    } else if (description.length > 500) {
      errors.push('description must be at most 500 characters');
    }
  }

  if (typeof date !== 'string' || date.length === 0) {
    errors.push('date is required');
  } else if (!isValidCalendarDate(date)) {
    errors.push('date must be a real date in YYYY-MM-DD format');
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  if (description === undefined || description === null) {
    req.body.description = '';
  }

  return next();
}

module.exports = { validateExpense };
