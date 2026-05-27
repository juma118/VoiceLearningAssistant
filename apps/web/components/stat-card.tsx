export function StatCard({
  label,
  value,
  detail,
  accent = "blue"
}: {
  label: string;
  value: string | number;
  detail: string;
  accent?: "blue" | "green" | "amber";
}) {
  const accents = {
    blue: "from-brand-500 to-sage-300",
    green: "from-sage-400 to-mint-200",
    amber: "from-blush-500 to-blush-300"
  };

  return (
    <div className="card group relative overflow-hidden p-6 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-950/10">
      <div className={`absolute right-5 top-5 h-12 w-12 rounded-2xl bg-gradient-to-br ${accents[accent]} opacity-15`} />
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}
