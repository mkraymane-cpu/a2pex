import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { createOrder } from '../api/orders';

const initialForm = { customerName: '', email: '', phone: '', address: '', city: '', notes: '' };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Add a kit before checking out.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Shop kits</Link>
      </div>
    );
  }

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
      };
      const order = await createOrder(payload);
      clearCart();
      navigate('/order-confirmation', { state: { order } });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const message = err.response?.data?.message;
      setErrors(apiErrors || (message ? [message] : ['Something went wrong. Please try again.']));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl tracking-wide text-ink">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customerName" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Full name</label>
              <input id="customerName" name="customerName" autoComplete="name" required value={form.customerName} onChange={handleChange('customerName')} className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Email</label>
              <input id="email" name="email" autoComplete="email" required type="email" value={form.email} onChange={handleChange('email')} className="input-field" placeholder="you@example.com" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Phone</label>
              <input id="phone" name="phone" autoComplete="tel" required value={form.phone} onChange={handleChange('phone')} className="input-field" placeholder="+212 6 00 00 00 00" />
            </div>
            <div>
              <label htmlFor="city" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">City</label>
              <input id="city" name="city" autoComplete="address-level2" value={form.city} onChange={handleChange('city')} className="input-field" placeholder="Fès" />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Delivery address</label>
            <input id="address" name="address" autoComplete="street-address" required value={form.address} onChange={handleChange('address')} className="input-field" placeholder="Street, building, apartment" />
          </div>

          <div>
            <label htmlFor="notes" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Order notes (optional)</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange('notes')} rows={3} className="input-field resize-none" placeholder="Delivery instructions, gift note, etc." />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto sm:px-10">
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl tracking-wide text-ink">Order Summary</h2>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.clubName} <span className="text-gray-400">&times;{item.quantity}</span>
                  <span className="ml-1 font-mono text-xs text-gray-400">({item.size})</span>
                </span>
                <span className="font-mono text-ink">{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-gray-100 pt-5 font-body text-base font-semibold text-ink">
            <span>Total</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
