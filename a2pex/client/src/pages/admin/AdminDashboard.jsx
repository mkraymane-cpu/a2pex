import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, ShoppingBag, AlertTriangle, Clock } from 'lucide-react';
import { fetchProducts } from '../../api/products';
import { fetchOrders } from '../../api/orders';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/ui/Loader';

const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ productCount: 0, orderCount: 0, pendingCount: 0, lowStock: [] });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [productsRes, ordersRes, pendingRes, allProductsRes] = await Promise.all([
          fetchProducts({ limit: 1 }),
          fetchOrders({ limit: 5 }),
          fetchOrders({ status: 'pending', limit: 1 }),
          fetchProducts({ limit: 100 }),
        ]);
        if (cancelled) return;

        const lowStock = allProductsRes.products
          .filter((p) => p.stockQuantity <= LOW_STOCK_THRESHOLD)
          .slice(0, 5);

        setStats({
          productCount: productsRes.pagination.total,
          orderCount: ordersRes.pagination.total,
          pendingCount: pendingRes.pagination.total,
          lowStock,
        });
        setRecentOrders(ordersRes.orders);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader label="Loading dashboard" fullHeight />;

  const cards = [
    { label: 'Total products', value: stats.productCount, icon: Shirt, to: '/admin/products' },
    { label: 'Total orders', value: stats.orderCount, icon: ShoppingBag, to: '/admin/orders' },
    { label: 'Pending orders', value: stats.pendingCount, icon: Clock, to: '/admin/orders?status=pending' },
    { label: 'Low stock kits', value: stats.lowStock.length, icon: AlertTriangle, to: '/admin/products' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">A live snapshot of your catalog and orders.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Icon size={18} className="text-pitch" />
            <p className="mt-3 font-mono text-3xl font-bold text-ink">{value}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wide text-ink">Recent Orders</h2>
            <Link to="/admin/orders" className="font-mono text-xs uppercase tracking-widest text-pitch hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-body text-sm font-medium text-ink">{order.customerName}</p>
                    <p className="font-mono text-xs text-gray-400">#{order.id} &middot; {order.status}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink">
                    {formatPrice(order.totalAmount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wide text-ink">Low Stock</h2>
            <Link to="/admin/products" className="font-mono text-xs uppercase tracking-widest text-pitch hover:underline">
              Manage
            </Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Stock levels look healthy.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-body text-sm font-medium text-ink">{p.clubName}</p>
                    <p className="font-mono text-xs text-gray-400">{p.kitType} &middot; {p.season}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-red-500">
                    {p.stockQuantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
