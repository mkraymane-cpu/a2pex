import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/constants';
import Badge from '../ui/Badge';

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const imageUrl = resolveImageUrl(primaryImage?.url);
  const hasDiscount = product.discountPercent > 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-kit transition-all duration-300 hover:-translate-y-1.5 hover:shadow-kit-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${product.clubName} ${product.kitType} kit ${product.season}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <ImageOff size={36} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <Badge tone="light">{product.kitType}</Badge>
          {hasDiscount && <Badge tone="green">-{product.discountPercent}%</Badge>}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <Badge tone="light">Out of stock</Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
          {product.brand} &middot; {product.season}
        </p>
        <h3 className="mt-1 truncate font-display text-xl tracking-wide text-ink">
          {product.clubName}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-base font-semibold text-ink">
            {formatPrice(product.finalPrice)}
          </span>
          {hasDiscount && (
            <span className="font-mono text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
