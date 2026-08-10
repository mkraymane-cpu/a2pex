import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ImageOff, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatPrice';
import { resolveImageUrl } from '../utils/constants';
import EmptyState from '../components/ui/EmptyState';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Your cart is empty."
          description="Browse the shop and add a kit to get started."
          action={
            <Link to="/shop" className="btn-primary">
              Shop kits
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl tracking-wide text-ink">Your Cart</h1>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-gray-400">
        {items.length} line item{items.length !== 1 ? 's' : ''}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const imageUrl = resolveImageUrl(item.image);
            return (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.clubName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <ImageOff size={22} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/product/${item.slug}`}
                        className="font-display text-lg tracking-wide text-ink hover:text-pitch"
                      >
                        {item.clubName}
                      </Link>
                      <p className="font-mono text-xs uppercase tracking-widest text-gray-400">
                        {item.brand} &middot; {item.kitType} &middot; {item.season} &middot; Size {item.size}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      aria-label="Remove item"
                      className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 text-gray-500 hover:text-ink disabled:opacity-30"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        disabled={item.quantity >= (item.maxStock || 99)}
                        className="p-2 text-gray-500 hover:text-ink disabled:opacity-30"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="font-mono text-sm font-semibold text-ink">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl tracking-wide text-ink">Order Summary</h2>
          <div className="mt-5 space-y-2.5 border-b border-gray-100 pb-5 font-body text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="font-mono text-ink">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between font-body text-base font-semibold text-ink">
            <span>Total</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
            Checkout <ArrowRight size={16} />
          </button>
          <Link to="/shop" className="mt-3 block text-center font-body text-sm text-gray-500 hover:text-ink">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
