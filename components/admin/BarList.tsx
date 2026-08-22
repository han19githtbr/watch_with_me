// components/admin/BarList.tsx

interface BarListItem {
  label: string;
  count: number;
}

interface BarListProps {
  items: BarListItem[];
  emptyLabel?: string;
}

export default function BarList({ items, emptyLabel = 'Sem dados suficientes ainda.' }: BarListProps) {
  if (items.length === 0) {
    return <p className="text-gray-500 text-sm">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-center justify-between text-sm mb-1 gap-3">
            <span className="text-gray-200 truncate">{item.label}</span>
            <span className="text-gray-400 shrink-0">{item.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-netflix-red"
              style={{ width: `${Math.max(6, (item.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
