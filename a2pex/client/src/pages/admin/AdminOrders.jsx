import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Trash2 } from 'lucide-react';
import { fetchOrders, fetchOrderById, updateOrderStatus, deleteOrder } from '../../api/orders';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUSES } from '../../utils/constants';
import Loader from '../../components/ui/Loader';

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [expandedId, setExpandedId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [busyId, setBusyId] = useState(null);

  const status = searchParams.get('status') || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setLoading(true);
    fetchOrders({ status: status || undefined, page, limit: 15 })
      .then((data) => {
        setOrders(data.orders);
        setPagination(data.pagination);
      })
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, [status, page]);

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!orderDetails[orderId]) {
      try {
        const detail = await fetchOrderById(orderId);
        setOrderDetails((prev) => ({ ...prev, [orderId]: detail }));
      } catch (err) {
        console.error('Failed to load order detail:', err);
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setBusyId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      setOrderDetails((prev) =>
        prev[orderId] ? { ...prev, [orderId]: { ...prev[orderId], status: newStatus } } : prev
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
    setBusyId(orderId);
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order.');
    } finally {
      setBusyId(null);
    }
  };

  const setStatusFilter = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value);
    else next.delete('status');
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-ink">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">{pagination.total} order{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <select value={status} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader label="Loading orders" />
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-gray-400">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const detail = orderDetails[order.id];
            return (
              <div key={order.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    <div>
                      <p className="font-body text-sm font-semibold text-ink">
                        #{order.id} &middot; {order.customerName}
                      </p>
                      <p className="font-mono text-xs text-gray-400">{order.email} &middot; {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${STATUS_TONE[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="font-mono text-sm font-semibold text-ink">{formatPrice(order.totalAmount)}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    {!detail ? (
                      <Loader label="Loading order" />
                    ) : (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Contact</p>
                            <p className="mt-1 text-sm text-gray-700">{detail.phone}</p>
                            <p className="text-sm text-gray-700">{detail.address}{detail.city ? `, ${detail.city}` : ''}</p>
                            {detail.notes && <p className="mt-1 text-sm italic text-gray-500">"{detail.notes}"</p>}
                          </div>
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Items</p>
                            <ul className="mt-1 space-y-1">
                              {detail.items?.map((item) => (
                                <li key={item.id} className="flex justify-between text-sm text-gray-700">
                                  <span>{item.clubName} ({item.size}) &times;{item.quantity}</span>
                                  <span className="font-mono">{formatPrice(item.subtotal)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
                          <div className="flex items-center gap-2">
                            <label className="font-mono text-xs uppercase tracking-widest text-gray-500">Status</label>
                            <select
                              value={order.status}
                              disabled={busyId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="input-field w-auto py-2"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={busyId === order.id}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                            Delete order
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setSearchParams({ ...(status ? { status } : {}), page: p })}
              className={`h-9 w-9 rounded-full font-mono text-sm ${
                p === pagination.page ? 'bg-ink text-paper' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
