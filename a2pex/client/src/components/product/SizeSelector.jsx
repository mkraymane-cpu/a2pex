export default function SizeSelector({ sizes, selected, onSelect }) {
  if (!sizes || sizes.length === 0) {
    return <p className="text-sm text-gray-400">No sizes listed for this kit.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => onSelect(size)}
          className={`flex h-11 min-w-[44px] items-center justify-center rounded-lg border px-3 font-mono text-sm font-semibold transition-colors ${
            selected === size
              ? 'border-ink bg-ink text-paper'
              : 'border-gray-200 text-ink hover:border-ink'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
