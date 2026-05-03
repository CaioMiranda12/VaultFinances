import { formatarMoeda } from "@/store/TransactionContext";

export function CustomBarTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: "oklch(0.22 0.03 255)", border: "1px solid oklch(0.30 0.04 255)" }}>
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatarMoeda(p.value)}
        </p>
      ))}
    </div>
  );
}