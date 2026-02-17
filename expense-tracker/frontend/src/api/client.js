const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.errors?.join(', ') || data?.error || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export async function createExpense(payload, idempotencyKey) {
  const response = await fetch(`${BASE}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  const result = await parseResponse(response);
  return result.data;
}

export async function fetchExpenses({ category, sort } = {}) {
  const url = new URL(`${BASE}/expenses`);
  if (category) url.searchParams.set('category', category);
  if (sort) url.searchParams.set('sort', sort);

  const response = await fetch(url.toString());
  return parseResponse(response);
}

export async function fetchCategorySummary() {
  const response = await fetch(`${BASE}/expenses/summary`);
  const result = await parseResponse(response);
  return result.data;
}

export async function fetchByCategory(category) {
  const response = await fetch(`${BASE}/expenses/category/${encodeURIComponent(category)}`);
  return parseResponse(response);
}
