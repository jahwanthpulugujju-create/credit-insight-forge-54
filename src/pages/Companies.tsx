import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  sector: string;
  annual_turnover: number;
  created_at: string;
}

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('companies').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setCompanies(data ?? []);
      setLoading(false);
    });
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Companies</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage borrower entities</p>
        </div>
        <Button onClick={() => navigate('/companies/new')} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" /> New Company
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : companies.length === 0 ? (
        <div className="metric-card text-center py-16">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">No companies yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Start by onboarding your first borrower entity.</p>
          <Button onClick={() => navigate('/companies/new')} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" /> Onboard Company
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {companies.map(c => (
            <div key={c.id} className="metric-card flex items-center justify-between cursor-pointer hover:border-accent/30 transition-colors" onClick={() => navigate(`/companies/${c.id}`)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{c.company_name}</h3>
                  <p className="text-sm text-muted-foreground">{c.sector}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(c.annual_turnover)}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
