import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Tag,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Shirt },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="px-6 py-6">
        <img src="/logo-wordmark.png" alt="A2PEX Kits" className="h-6 w-auto" />
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-gray-500">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition-colors ${
                isActive ? 'bg-pitch text-ink' : 'text-gray-300 hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-gray-300 hover:bg-white/5"
        >
          <ExternalLink size={17} />
          View site
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-gray-300 hover:bg-white/5"
        >
          <LogOut size={17} />
          Log out
        </button>
        {admin && (
          <p className="px-3 pt-2 font-mono text-[10px] text-gray-600">Signed in as {admin.username}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-4 lg:hidden">
        <img src="/logo-wordmark.png" alt="A2PEX Kits" className="h-5 w-auto" />
        <button onClick={() => setMobileOpen(true)} className="text-paper" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-64 flex-col bg-ink">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 text-gray-400"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
