import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CreditScore {
  character_score: number | null;
  capacity_score: number | null;
  capital_score: number | null;
  collateral_score: number | null;
  conditions_score: number | null;
}

const getColor = (score: number, max: number) => {
  const pct = (score / max) * 100;
  if (pct >= 70) return 'hsl(var(--risk-low))';
  if (pct >= 50) return 'hsl(var(--risk-medium))';
  return 'hsl(var(--risk-high))';
};

export default function FiveCsChart({ score }: { score: CreditScore }) {
  const data = [
    { name: 'Character', score: score.character_score ?? 0, max: 25 },
    { name: 'Capacity', score: score.capacity_score ?? 0, max: 25 },
    { name: 'Capital', score: score.capital_score ?? 0, max: 20 },
    { name: 'Collateral', score: score.collateral_score ?? 0, max: 15 },
    { name: 'Conditions', score: score.conditions_score ?? 0, max: 15 },
  ];

  return (
    <div className="metric-card">
      <p className="text-xs text-muted-foreground mb-3">Score vs Maximum by Component</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={[0, 25]} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            formatter={(value: number, name: string) => [value, name === 'score' ? 'Score' : 'Max']}
          />
          <Bar dataKey="max" radius={[4, 4, 0, 0]} fill="hsl(var(--muted))" name="Max" />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Score">
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.score, entry.max)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
