import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Building2, FileText, AlertTriangle, TrendingUp, Plus, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Stats {
  companies: number;
  documents: number;
  reports: number;
  avgScore: number;
}

interface RiskDist {
  name: string;
  value: number;
  color: string;
}

interface RecentCompany {
  id: string;
  company_name: string;
  sector: string;
  created_at: string;
  credit_grade?: string | null;
  total_score?: number | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ companies: 0, documents: 0, reports: 0, avgScore: 0 });
  const [riskDist, setRiskDist] = useState<RiskDist[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<RecentCompany[]>([]);

  useEffect(() => {
    const load = async () => {
      const [cRes, dRes, rRes, scoresRes, risksRes] = await Promise.all([
        supabase.from('companies').select('id, company_name, sector, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }),
        supabase.from('credit_scores').select('company_id, total_score, credit_grade'),
        supabase.from('risk_signals').select('severity'),
      ]);

      const companies = cRes.data ?? [];
      const scores = scoresRes.data ?? [];
      const risks = risksRes.data ?? [];

      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + (s.total_score || 0), 0) / scores.length)
        : 0;

      setStats({
        companies: companies.length,
        documents: dRes.count ?? 0,
        reports: rRes.count ?? 0,
        avgScore,
      });

      // Risk distribution
      const low = risks.filter(r => r.severity === 'low').length;
      const medium = risks.filter(r => r.severity === 'medium').length;
      const high = risks.filter(r => r.severity === 'high').length;
      setRiskDist([
        { name: 'Low', value: low, color: 'hsl(142, 71%, 45%)' },
        { name: 'Medium', value: medium, color: 'hsl(38, 92%, 50%)' },
        { name: 'High', value: high, color: 'hsl(0, 72%, 51%)' },
      ].filter(r => r.value > 0));

      // Recent companies with scores
      const scoreMap = new Map(scores.map(s => [s.company_id, s]));
      setRecentCompanies(companies.map(c => ({
        ...c,
        credit_grade: scoreMap.get(c.id)?.credit_grade,
        total_score: scoreMap.get(c.id)?.total_score,
      })));
    };
    load();
  }, []);

  const cards = [
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'hsl(var(--accent))' },
    { label: 'Documents', value: stats.documents, icon: FileText, color: 'hsl(var(--primary))' },
    { label: 'Reports Generated', value: stats.reports, icon: FileText, color: 'hsl(var(--risk-low))' },
    { label: 'Avg Credit Score', value: stats.avgScore || '—', icon: Shield, color: 'hsl(var(--risk-medium))' },
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

      {/* Stats Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Risk Distribution */}
        <div className="metric-card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Risk Distribution
          </h2>
          {riskDist.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={riskDist} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4}>
                    {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {riskDist.map(r => (
                  <div key={r.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-sm">{r.name}: <span className="font-semibold">{r.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No risk signals detected yet.</p>
          )}
        </div>

        {/* Recent Companies */}
        <div className="metric-card lg:col-span-2">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Recent Companies
          </h2>
          {recentCompanies.length > 0 ? (
            <div className="space-y-2">
              {recentCompanies.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/companies/${c.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.company_name}</p>
                      <p className="text-xs text-muted-foreground">{c.sector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.credit_grade ? (
                      <span className={`risk-badge-${c.total_score && c.total_score >= 70 ? 'low' : c.total_score && c.total_score >= 55 ? 'medium' : 'high'}`}>
                        Grade {c.credit_grade} ({c.total_score})
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not scored</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No companies yet. Start by onboarding a new company.</p>
          )}
        </div>
      </div>
    </div>
  );
}
