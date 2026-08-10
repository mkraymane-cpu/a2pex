import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import CategoryList from '../components/CategoryList';
import ProductGrid from '../components/product/ProductGrid';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [categoriesRes, featuredRes, latestRes] = await Promise.all([
          fetchCategories(),
          fetchProducts({ featured: 'true', limit: 8 }),
          fetchProducts({ sort: 'newest', limit: 8 }),
        ]);
        if (cancelled) return;
        setCategories(categoriesRes);
        setFeatured(featuredRes.products);
        setLatest(latestRes.products);
        setCatalogTotal(latestRes.pagination.total);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {loading ? (
          <Loader label="Loading catalog" />
        ) : catalogTotal === 0 ? (
          <EmptyState
            title="No football kits available."
            description="This catalog is waiting for its first kit. Log into the admin dashboard to add one."
            action={
              <Link to="/admin/login" className="btn-secondary">
                Go to admin dashboard
              </Link>
            }
          />
        ) : (
          <div className="space-y-16">
            {categories.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl tracking-wide text-ink">Categories</h2>
                <CategoryList categories={categories} />
              </section>
            )}

            {featured.length > 0 && (
              <section>
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <p className="label-eyebrow">Handpicked</p>
                    <h2 className="font-display text-3xl tracking-wide text-ink">Featured Kits</h2>
                  </div>
                  <Link to="/shop" className="hidden items-center gap-1 font-body text-sm font-semibold text-ink hover:text-pitch sm:flex">
                    View all <ArrowRight size={15} />
                  </Link>
                </div>
                <ProductGrid products={featured} />
              </section>
            )}

            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="label-eyebrow">Just added</p>
                  <h2 className="font-display text-3xl tracking-wide text-ink">Latest Kits</h2>
                </div>
                <Link to="/shop?sort=newest" className="hidden items-center gap-1 font-body text-sm font-semibold text-ink hover:text-pitch sm:flex">
                  View all <ArrowRight size={15} />
                </Link>
              </div>
              <ProductGrid products={latest} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
