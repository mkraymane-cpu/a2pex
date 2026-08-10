import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center shrink-0" aria-label="A2PEX Kits home">
          <img src="/logo-wordmark.png" alt="A2PEX Kits" className="h-6 w-auto sm:h-7" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="btn-ghost">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search club, league, brand..."
                  className="w-56 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-paper placeholder:text-gray-400 focus:border-pitch focus:outline-none"
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="rounded-full p-2.5 text-paper transition-colors hover:bg-white/10"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          <Link
            to="/cart"
            aria-label="Open cart"
            className="relative rounded-full p-2.5 text-paper transition-colors hover:bg-white/10"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-pitch px-1 font-mono text-[10px] font-bold text-ink">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-full p-2.5 text-paper transition-colors hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-ink px-4 py-4 md:hidden animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search club, league, brand..."
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-paper placeholder:text-gray-400 focus:border-pitch focus:outline-none"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 font-body text-sm font-semibold uppercase tracking-wide text-paper hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
