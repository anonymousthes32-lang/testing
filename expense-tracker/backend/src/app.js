const express = require('express');
const cors = require('cors');
const { db } = require('./db');
const { createExpenseService } = require('./services/expenseService');
const { createExpensesRouter } = require('./routes/expenses');

function createApp(database = db) {
  const app = express();
  const expenseService = createExpenseService(database);

  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());

  app.use('/expenses', createExpensesRouter(expenseService));

  app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
