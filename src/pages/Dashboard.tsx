import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Building2, FileText, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  companies: number;
  pending: number;
  reports: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ companies: 0, pending: 0, reports: 0 });

  useEffect(() => {
    const load = async () => {
      const [c, r] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        companies: c.count ?? 0,
        pending: 0,
        reports: r.count ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'var(--accent)' },
    { label: 'Pending Analysis', value: stats.pending, icon: TrendingUp, color: 'hsl(var(--risk-medium))' },
    { label: 'Reports Generated', value: stats.reports, icon: FileText, color: 'hsl(var(--risk-low))' },
    { label: 'Risk Alerts', value: 0, icon: AlertTriangle, color: 'hsl(var(--risk-high))' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your credit analysis pipeline</p>
        </div>
        <Button onClick={() => navigate('/companies/new')} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" /> New Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(card => (
          <div key={card.label} className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon className="w-4.5 h-4.5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="metric-card">
        <h2 className="section-title mb-4">Recent Activity</h2>
        <p className="text-muted-foreground text-sm">No recent activity yet. Start by onboarding a new company.</p>
      </div>
    </div>
  );
}
