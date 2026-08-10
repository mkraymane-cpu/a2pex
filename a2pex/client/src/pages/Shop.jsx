import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import SearchBar from '../components/SearchBar';
import Loader from '../components/ui/Loader';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';
import { KIT_TYPES } from '../utils/constants';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'club_asc', label: 'Club: A-Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [form, setForm] = useState({
    club: searchParams.get('club') || '',
    league: searchParams.get('league') || '',
    season: searchParams.get('season') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    kitType: searchParams.get('kitType') || '',
    category: searchParams.get('category') || '',
  });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = Object.fromEntries(searchParams.entries());
    fetchProducts(params)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const applyFilters = (e) => {
    e?.preventDefault();
    const next = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) next.set('search', search);
    Object.entries(form).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    const sort = searchParams.get('sort');
    if (sort) next.set('sort', sort);
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setForm({ club: '', league: '', season: '', brand: '', minPrice: '', maxPrice: '', kitType: '', category: '' });
    const next = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) next.set('search', search);
    setSearchParams(next);
  };

  const handleSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    next.delete('page');
    setSearchParams(next);
  };

  const handleSortChange = (e) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', e.target.value);
    setSearchParams(next);
  };

  const goToPage = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', page);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = Object.values(form).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="label-eyebrow">Catalog</p>
        <h1 className="font-display text-4xl tracking-wide text-ink">Shop All Kits</h1>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar initialValue={searchParams.get('search') || ''} onSearch={handleSearch} />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="btn-secondary flex-1 sm:flex-none"
          >
            <SlidersHorizontal size={16} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <select
            value={searchParams.get('sort') || 'newest'}
            onChange={handleSortChange}
            className="input-field w-auto"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loading && (
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-gray-400">
          {pagination.total} kit{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {loading ? (
        <Loader label="Loading kits" />
      ) : (
        <>
          <ProductGrid
            products={products}
            emptyTitle="No football kits available."
            emptyDescription="No kits matched your search or filters. Try broadening your criteria."
          />

          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-10 w-10 rounded-full font-mono text-sm font-semibold transition-colors ${
                    p === pagination.page
                      ? 'bg-ink text-paper'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setFiltersOpen(false)} />
          <form
            onSubmit={applyFilters}
            className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-6 shadow-2xl animate-fade-in"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide text-ink">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="filter-club" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Club</label>
                <input
                  id="filter-club"
                  type="text"
                  value={form.club}
                  onChange={(e) => setForm({ ...form, club: e.target.value })}
                  placeholder="e.g. Wydad AC"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="filter-league" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">League</label>
                <input
                  id="filter-league"
                  type="text"
                  value={form.league}
                  onChange={(e) => setForm({ ...form, league: e.target.value })}
                  placeholder="e.g. Botola Pro"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="filter-category" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Category</label>
                <select
                  id="filter-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-season" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Season</label>
                <input
                  id="filter-season"
                  type="text"
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  placeholder="e.g. 2025/2026"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="filter-brand" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Brand</label>
                <input
                  id="filter-brand"
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g. Nike"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="filter-kitType" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Kit Type</label>
                <select
                  id="filter-kitType"
                  value={form.kitType}
                  onChange={(e) => setForm({ ...form, kitType: e.target.value })}
                  className="input-field"
                >
                  <option value="">All types</option>
                  {KIT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Price range</span>
                <div className="flex items-center gap-2">
                  <label htmlFor="filter-minPrice" className="sr-only">Minimum price</label>
                  <input
                    id="filter-minPrice"
                    type="number"
                    min="0"
                    value={form.minPrice}
                    onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                    placeholder="Min"
                    className="input-field"
                  />
                  <span className="text-gray-400" aria-hidden="true">&ndash;</span>
                  <label htmlFor="filter-maxPrice" className="sr-only">Maximum price</label>
                  <input
                    id="filter-maxPrice"
                    type="number"
                    min="0"
                    value={form.maxPrice}
                    onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                    placeholder="Max"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button type="button" onClick={clearFilters} className="btn-secondary flex-1">
                Clear
              </button>
              <button type="submit" className="btn-primary flex-1">
                Apply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
