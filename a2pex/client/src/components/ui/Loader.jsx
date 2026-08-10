export default function Loader({ label = 'Loading', fullHeight = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 ${
        fullHeight ? 'min-h-[50vh]' : ''
      }`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-pitch" />
      <p className="font-mono text-xs uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  );
}
