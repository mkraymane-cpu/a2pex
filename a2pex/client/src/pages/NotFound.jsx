import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <span className="font-display text-8xl text-gray-200">404</span>
      <h1 className="mt-2 font-display text-3xl tracking-wide text-ink">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
