import { Link } from 'react-router-dom';

export default function CategoryList({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/shop?category=${cat.slug}`}
          className="group flex shrink-0 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 transition-colors hover:border-ink hover:bg-ink"
        >
          <span className="font-body text-sm font-semibold text-ink group-hover:text-paper">
            {cat.name}
          </span>
          <span className="font-mono text-xs text-gray-400 group-hover:text-pitch">
            {cat.productCount}
          </span>
        </Link>
      ))}
    </div>
  );
}
