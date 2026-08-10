import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ImageOff, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { fetchProductByIdOrSlug, fetchRelatedProducts } from '../api/products';
import { resolveImageUrl } from '../utils/constants';
import { formatPrice } from '../utils/formatPrice';
import { useCart } from '../hooks/useCart';
import SizeSelector from '../components/product/SizeSelector';
import ProductGrid from '../components/product/ProductGrid';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';

export default function ProductPage() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setSelectedSize(null);
    setQuantity(1);
    setActiveImage(0);

    fetchProductByIdOrSlug(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        return fetchRelatedProducts(data.id);
      })
      .then((rel) => !cancelled && rel && setRelated(rel))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else console.error('Failed to load product:', err);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <Loader label="Loading kit" fullHeight />;

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Kit not found</h1>
        <p className="mt-2 text-gray-500">This product doesn't exist or has been removed.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Back to shop</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: null }];
  const hasDiscount = product.discountPercent > 0;
  const maxQty = Math.min(product.stockQuantity, 10);

  const handleAddToCart = () => {
    if (!selectedSize || !product.inStock) return;
    addItem(product, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 font-mono text-xs uppercase tracking-widest text-gray-400">
        <Link to="/shop" className="hover:text-pitch">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.clubName}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {images[activeImage]?.url ? (
              <img
                src={resolveImageUrl(images[activeImage].url)}
                alt={`${product.clubName} ${product.kitType} kit`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <ImageOff size={48} />
              </div>
            )}
            {hasDiscount && (
              <div className="absolute left-4 top-4">
                <Badge tone="green">-{product.discountPercent}% off</Badge>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === i ? 'border-pitch' : 'border-transparent'
                  }`}
                >
                  {img.url ? (
                    <img src={resolveImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <ImageOff size={18} className="text-gray-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-gray-400">
            {product.brand} &middot; {product.league || 'Uncategorized'} &middot; {product.season}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-ink sm:text-5xl">
            {product.clubName}
          </h1>
          <p className="mt-1 font-body text-sm font-semibold uppercase tracking-wide text-pitch">
            {product.kitType} Kit
          </p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold text-ink">
              {formatPrice(product.finalPrice)}
            </span>
            {hasDiscount && (
              <span className="font-mono text-base text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-xs uppercase tracking-widest text-gray-500">Size</label>
            </div>
            <SizeSelector sizes={product.sizes} selected={selectedSize} onSelect={setSelectedSize} />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500">Qty</label>
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 text-gray-500 hover:text-ink disabled:opacity-30"
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-mono text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="p-2.5 text-gray-500 hover:text-ink disabled:opacity-30"
                disabled={quantity >= maxQty}
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="font-mono text-xs text-gray-400">
              {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || !selectedSize}
            className="btn-primary mt-8 w-full sm:w-auto sm:px-10"
          >
            {justAdded ? (
              <>
                <Check size={18} /> Added to cart
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                {product.inStock ? 'Add to cart' : 'Out of stock'}
              </>
            )}
          </button>
          {!selectedSize && product.inStock && (
            <p className="mt-2 font-mono text-xs text-gray-400">Select a size to continue.</p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-3xl tracking-wide text-ink">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
