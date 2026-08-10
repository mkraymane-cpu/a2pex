import { ShirtIcon } from 'lucide-react';

export default function EmptyState({
  title = 'No football kits available.',
  description = 'Nothing has been added to the catalog yet. Check back soon.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
        <ShirtIcon size={26} className="text-gray-400" />
      </div>
      <h3 className="font-display text-2xl tracking-wide text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
