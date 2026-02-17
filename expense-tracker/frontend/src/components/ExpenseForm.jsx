import { useEffect, useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Other'];

const defaultDate = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ onAdd }) {
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: defaultDate() });
  const [errors, setErrors] = useState({});
  const [warning, setWarning] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!success) return undefined;
    const timeout = setTimeout(() => setSuccess(''), 2000);
    return () => clearTimeout(timeout);
  }, [success]);

  const validate = () => {
    const nextErrors = {};
    if (!/^\d+(\.\d{1,2})?$/.test(form.amount) || Number(form.amount) <= 0) {
      nextErrors.amount = 'Amount must be a positive number with up to 2 decimal places.';
    }
    if (!form.category) nextErrors.category = 'Category is required.';
    if (!form.date) {
      nextErrors.date = 'Date is required.';
    }
    if (form.description.length > 500) {
      nextErrors.description = 'Description must be 500 characters or less.';
    }

    setWarning('');
    if (form.date && form.date > defaultDate()) {
      setWarning('Date is in the future. This is allowed, but please confirm.');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError('');

    try {
      await onAdd(form, idempotencyKey);
      setSuccess('Expense added!');
      setForm({ amount: '', category: 'Food', description: '', date: defaultDate() });
      setIdempotencyKey(crypto.randomUUID());
      setErrors({});
      setWarning('');
    } catch (err) {
      setFormError(err.message || 'Failed to save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Add Expense</h2>
      {success && <p className="flash-success">{success}</p>}
      <label>Amount</label>
      <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      {errors.amount && <small className="error-text">{errors.amount}</small>}

      <label>Category</label>
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
      {errors.category && <small className="error-text">{errors.category}</small>}

      <label>Description</label>
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      {errors.description && <small className="error-text">{errors.description}</small>}

      <label>Date</label>
      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      {errors.date && <small className="error-text">{errors.date}</small>}
      {warning && <small className="warning-text">{warning}</small>}

      <button disabled={submitting} type="submit">{submitting ? 'Saving…' : 'Add Expense'}</button>
      {formError && <p className="error-text">{formError}</p>}
    </form>
  );
}
