import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pitch/10">
          <CheckCircle2 size={32} className="text-pitch" />
        </div>
        <h1 className="mt-5 font-display text-4xl tracking-wide text-ink">Order placed</h1>
        <p className="mt-2 text-gray-500">
          Thanks, {order.customerName.split(' ')[0]} — order <span className="font-mono text-ink">#{order.id}</span> has
          been received.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-mono text-xs uppercase tracking-widest text-gray-400">Order details</h2>
        <div className="mt-4 space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.clubName} <span className="text-gray-400">&times;{item.quantity}</span>
                <span className="ml-1 font-mono text-xs text-gray-400">({item.size})</span>
              </span>
              <span className="font-mono text-ink">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-gray-100 pt-5 font-body text-base font-semibold text-ink">
          <span>Order total</span>
          <span className="font-mono">{formatPrice(order.totalAmount)}</span>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-5 text-sm text-gray-500">
          <p>{order.address}{order.city ? `, ${order.city}` : ''}</p>
          <p>{order.phone}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/shop" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
