import { formatarMoeda } from "@/store/TransactionContext";

export function CustomPieTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { cor: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "oklch(0.22 0.03 255)", border: "1px solid oklch(0.30 0.04 255)" }}>
      <p className="font-bold text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{formatarMoeda(item.value)}</p>
    </div>
  );
}