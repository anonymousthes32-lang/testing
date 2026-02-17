function toCents(amount) {
  const [whole, frac = ''] = String(amount).split('.');
  const normalizedFrac = (frac + '00').slice(0, 2);
  return Number(whole) * 100 + Number(normalizedFrac);
}

function centsToDecimalString(cents) {
  return (cents / 100).toFixed(2);
}

function mapExpense(row) {
  return {
    id: row.id,
    amount: centsToDecimalString(row.amount),
    category: row.category,
    description: row.description,
    date: row.date,
    created_at: row.created_at,
    idempotency_key: row.idempotency_key,
  };
}

function createExpenseService(db) {
  const insertStmt = db.prepare(`
    INSERT INTO expenses (amount, category, description, date, idempotency_key)
    VALUES (@amount, @category, @description, @date, @idempotency_key)
  `);

  const findById = db.prepare('SELECT * FROM expenses WHERE id = ?');
  const findByKey = db.prepare('SELECT * FROM expenses WHERE idempotency_key = ?');

  function createExpense({ amount, category, description, date, idempotencyKey }) {
    const payload = {
      amount: toCents(amount),
      category,
      description: description || '',
      date,
      idempotency_key: idempotencyKey || null,
    };

    try {
      const result = insertStmt.run(payload);
      const row = findById.get(result.lastInsertRowid);
      return { expense: mapExpense(row), wasDuplicate: false };
    } catch (error) {
      if (idempotencyKey && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        const existing = findByKey.get(idempotencyKey);
        if (existing) return { expense: mapExpense(existing), wasDuplicate: true };
      }
      throw error;
    }
  }

  function listExpenses({ category, sort } = {}) {
    const sortDirection = sort === 'date_asc' ? 'ASC' : 'DESC';
    const hasCategory = typeof category === 'string' && category.trim().length > 0;

    const whereClause = hasCategory ? 'WHERE LOWER(category) = LOWER(?)' : '';
    const params = hasCategory ? [category.trim()] : [];

    const rows = db.prepare(`
      SELECT * FROM expenses
      ${whereClause}
      ORDER BY date ${sortDirection}, id DESC
    `).all(...params);

    const totalCents = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      ${whereClause}
    `).get(...params).total;

    return {
      data: rows.map(mapExpense),
      total: centsToDecimalString(totalCents),
      count: rows.length,
    };
  }

  function getCategorySummary() {
    const rows = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `).all();

    return rows.map((row) => ({
      category: row.category,
      total: centsToDecimalString(row.total),
      count: row.count,
    }));
  }

  function getExpensesByCategory(category) {
    const rows = db.prepare(`
      SELECT * FROM expenses
      WHERE LOWER(category) = LOWER(?)
      ORDER BY date DESC, id DESC
    `).all(category);

    const totalCents = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE LOWER(category) = LOWER(?)
    `).get(category).total;

    return {
      data: rows.map(mapExpense),
      total: centsToDecimalString(totalCents),
      count: rows.length,
    };
  }

  return { createExpense, listExpenses, getCategorySummary, getExpensesByCategory };
}

module.exports = { createExpenseService, toCents, centsToDecimalString };
