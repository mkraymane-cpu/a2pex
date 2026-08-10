export default function Badge({ children, tone = 'dark' }) {
  const tones = {
    dark: 'bg-ink text-paper',
    green: 'bg-pitch text-ink',
    outline: 'border border-ink/20 text-ink',
    light: 'bg-white/90 text-ink backdrop-blur-sm',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
