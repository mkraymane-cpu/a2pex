import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import { fetchProducts, deleteProduct } from '../../api/products';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/constants';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({ search: search || undefined, page, limit: 12, sort: 'newest' });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.clubName} — ${product.kitType} ${product.season}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-ink">Products</h1>
          <p className="mt-1 text-sm text-gray-500">{pagination.total} kit{pagination.total !== 1 ? 's' : ''} in the catalog</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus size={16} />
          Add kit
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by club, league, brand..."
          className="input-field max-w-sm"
        />
      </form>

      {loading ? (
        <Loader label="Loading products" />
      ) : products.length === 0 ? (
        <EmptyState
          title="No football kits available."
          description="Add your first kit to get the storefront started."
          action={<Link to="/admin/products/new" className="btn-primary">Add kit</Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 font-mono text-[11px] uppercase tracking-widest text-gray-400">
                <th className="px-4 py-3">Kit</th>
                <th className="hidden px-4 py-3 sm:table-cell">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="hidden px-4 py-3 md:table-cell">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const img = p.images?.[0];
                return (
                  <tr key={p.id} className="text-sm">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {img?.url ? (
                            <img src={resolveImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <ImageOff size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{p.clubName}</p>
                          <p className="font-mono text-xs text-gray-400">{p.kitType} &middot; {p.season}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">{p.brand}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-ink">{formatPrice(p.finalPrice)}</span>
                      {p.discountPercent > 0 && (
                        <span className="ml-1.5 font-mono text-xs text-gray-400 line-through">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={`font-mono ${p.stockQuantity <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
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
