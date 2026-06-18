export function IndicatorBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
