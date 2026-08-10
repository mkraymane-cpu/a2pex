import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="kit-stripes bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <img src="/logo-wordmark.png" alt="A2PEX Kits" className="h-6 w-auto" />
            <p className="mt-3 max-w-xs text-sm text-gray-400">
              Authentic club kits, sourced season by season. No filler — every kit on this site is
              real stock, added by hand.
            </p>
          </div>

          <div>
            <h3 className="label-eyebrow mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><Link to="/shop" className="hover:text-pitch">All kits</Link></li>
              <li><Link to="/shop?kitType=Home" className="hover:text-pitch">Home kits</Link></li>
              <li><Link to="/shop?kitType=Away" className="hover:text-pitch">Away kits</Link></li>
              <li><Link to="/shop?kitType=Third" className="hover:text-pitch">Third kits</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="label-eyebrow mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><Link to="/cart" className="hover:text-pitch">Your cart</Link></li>
              <li><a href="mailto:support@a2pex.com" className="hover:text-pitch">Contact us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="label-eyebrow mb-4">A2PEX Kits</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><Link to="/admin/login" className="hover:text-pitch">Admin dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>&copy; {year} A2PEX Kits. All rights reserved.</p>
          <p className="font-mono">Built for the pitch.</p>
        </div>
      </div>
    </footer>
  );
}
