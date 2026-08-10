import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="kit-stripes absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink via-ink/95 to-surface"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-6 select-none font-display text-[16rem] leading-none text-white/[0.05] sm:text-[24rem]"
        aria-hidden="true"
      >
        9
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-pitch/20 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <p className="label-eyebrow animate-fade-up">A2PEX Kits &middot; Verified Club Gear</p>

        <h1
          className="mt-4 max-w-3xl font-display text-6xl leading-[0.95] tracking-tight text-paper sm:text-7xl lg:text-8xl animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          WEAR THE
          <br />
          CREST YOU
          <br />
          <span className="text-pitch">BELIEVE IN.</span>
        </h1>

        <p
          className="mt-6 max-w-md font-body text-base leading-relaxed text-gray-300 animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          Every kit listed here is real stock we've added ourselves — club, season and size,
          nothing generated. If it's on the site, it's on the shelf.
        </p>

        <div
          className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          <Link to="/shop" className="btn-primary">
            Shop the collection
            <ArrowRight size={16} />
          </Link>
          <Link to="/shop?sort=newest" className="btn-ghost border border-white/15">
            Latest arrivals
          </Link>
        </div>
      </div>

      <div className="relative h-2 w-full overflow-hidden">
        <div
          className="h-full w-[200%] animate-stripe-drift"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, #10B981 0px, #10B981 22px, #111827 22px, #111827 44px)',
          }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
