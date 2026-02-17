const express = require('express');
const { validateExpense } = require('../middleware/validate');

function createExpensesRouter(expenseService) {
  const router = express.Router();

  router.post('/', validateExpense, (req, res, next) => {
    try {
      const idempotencyKey = req.get('X-Idempotency-Key');
      const result = expenseService.createExpense({
        ...req.body,
        idempotencyKey,
      });
      return res.status(result.wasDuplicate ? 200 : 201).json({ data: result.expense });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/', (req, res, next) => {
    try {
      const { category, sort } = req.query;
      const result = expenseService.listExpenses({ category, sort });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/summary', (req, res, next) => {
    try {
      const data = expenseService.getCategorySummary();
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/category/:category', (req, res, next) => {
    try {
      const result = expenseService.getExpensesByCategory(req.params.category);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { createExpensesRouter };
