const express = require('express');
const cors = require('cors');
const { db } = require('./db');
const { createExpenseService } = require('./services/expenseService');
const { createExpensesRouter } = require('./routes/expenses');

function buildAllowedOrigins() {
  const configured = process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN;
  if (!configured) return ['http://localhost:5173'];
  return configured.split(',').map((origin) => origin.trim()).filter(Boolean);
}

function createApp(database = db) {
  const app = express();
  const expenseService = createExpenseService(database);
  const allowedOrigins = buildAllowedOrigins();

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  }));
  app.use(express.json());

  app.use('/expenses', createExpensesRouter(expenseService));

  app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
