const request = require('supertest');
const { beforeEach, describe, expect, test } = require('vitest');
const { createDb } = require('../src/db');
const { createApp } = require('../src/app');

let db;
let app;

beforeEach(() => {
  db = createDb(':memory:');
  app = createApp(db);
});

describe('expenses API', () => {
  test('POST /expenses creates a new expense and returns 201', async () => {
    const response = await request(app).post('/expenses').send({
      amount: '100.50',
      category: 'Food',
      description: 'Lunch',
      date: '2025-01-10',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.amount).toBe('100.50');
  });

  test('POST /expenses with same idempotency key returns same record', async () => {
    const key = 'abc-123';
    const payload = { amount: '25.00', category: 'Food', description: '', date: '2025-01-10' };

    const first = await request(app).post('/expenses').set('X-Idempotency-Key', key).send(payload);
    const second = await request(app).post('/expenses').set('X-Idempotency-Key', key).send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.data.id).toBe(first.body.data.id);
  });

  test('POST /expenses with negative amount returns 422', async () => {
    const response = await request(app).post('/expenses').send({
      amount: '-4.00', category: 'Food', date: '2025-01-10',
    });
    expect(response.status).toBe(422);
  });

  test('POST /expenses with missing date returns 422', async () => {
    const response = await request(app).post('/expenses').send({ amount: '10.00', category: 'Food' });
    expect(response.status).toBe(422);
  });

  test('GET /expenses returns all sorted by date desc by default', async () => {
    await request(app).post('/expenses').send({ amount: '10.00', category: 'Food', date: '2025-01-01' });
    await request(app).post('/expenses').send({ amount: '10.00', category: 'Food', date: '2025-01-15' });

    const response = await request(app).get('/expenses');
    expect(response.status).toBe(200);
    expect(response.body.data[0].date).toBe('2025-01-15');
  });

  test('GET /expenses?category=Food returns only Food expenses', async () => {
    await request(app).post('/expenses').send({ amount: '10.00', category: 'Food', date: '2025-01-01' });
    await request(app).post('/expenses').send({ amount: '12.00', category: 'Health', date: '2025-01-02' });

    const response = await request(app).get('/expenses?category=Food');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].category).toBe('Food');
  });

  test('GET /expenses/summary returns correct totals per category', async () => {
    await request(app).post('/expenses').send({ amount: '10.00', category: 'Food', date: '2025-01-01' });
    await request(app).post('/expenses').send({ amount: '15.50', category: 'Food', date: '2025-01-02' });

    const response = await request(app).get('/expenses/summary');
    expect(response.status).toBe(200);
    const food = response.body.data.find((item) => item.category === 'Food');
    expect(food.total).toBe('25.50');
  });

  test('GET /expenses/category/Food returns only Food expenses with total', async () => {
    await request(app).post('/expenses').send({ amount: '9.00', category: 'Food', date: '2025-01-01' });
    await request(app).post('/expenses').send({ amount: '11.00', category: 'Transport', date: '2025-01-01' });

    const response = await request(app).get('/expenses/category/Food');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.total).toBe('9.00');
  });
});
