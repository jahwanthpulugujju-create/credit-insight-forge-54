import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  IndianRupee,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  cin: string | null;
  pan: string | null;
  sector: string;
  subsector: string | null;
  headquarters: string | null;
  annual_turnover: number | null;
  total_assets: number | null;
  revenue: number | null;
  ebitda: number | null;
  debt_levels: number | null;
  loan_type: string | null;
  loan_amount: number | null;
  loan_tenure: number | null;
  interest_rate: number | null;
  purpose_of_loan: string | null;
  created_at: string;
}

interface DocStats {
  total: number;
  pending: number;
  approved: number;
  corrected: number;
  rejected: number;
  unclassified: number;
}

const formatCurrency = (val: number | null) => {
  if (!val) return '—';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const loanTypeLabels: Record<string, string> = {
  working_capital: 'Working Capital',
  term_loan: 'Term Loan',
  project_finance: 'Project Finance',
  trade_finance: 'Trade Finance',
  other: 'Other',
};

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [docStats, setDocStats] = useState<DocStats>({ total: 0, pending: 0, approved: 0, corrected: 0, rejected: 0, unclassified: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      const [companyRes, docsRes] = await Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).single(),
        supabase.from('documents').select('id').eq('company_id', companyId),
      ]);

      if (companyRes.data) setCompany(companyRes.data);

      const docs = docsRes.data ?? [];
      const docIds = docs.map(d => d.id);

      let classifications: { document_id: string; status: string }[] = [];
      if (docIds.length > 0) {
        const { data } = await supabase
          .from('document_classifications')
          .select('document_id, status')
          .in('document_id', docIds);
        classifications = data ?? [];
      }

      const classMap = new Map(classifications.map(c => [c.document_id, c.status]));

      setDocStats({
        total: docs.length,
        pending: classifications.filter(c => c.status === 'pending').length,
        approved: classifications.filter(c => c.status === 'approved').length,
        corrected: classifications.filter(c => c.status === 'corrected').length,
        rejected: classifications.filter(c => c.status === 'rejected').length,
        unclassified: docs.filter(d => !classMap.has(d.id)).length,
      });

      setLoading(false);
    };

    fetchData();
  }, [companyId]);

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">Loading…</div>;
  }

  if (!company) {
    return <div className="text-center py-16 text-muted-foreground">Company not found.</div>;
  }

  const debtEquity = company.debt_levels && company.total_assets
    ? (company.debt_levels / (company.total_assets - company.debt_levels)).toFixed(2)
    : null;

  const ebitdaMargin = company.ebitda && company.revenue
    ? ((company.ebitda / company.revenue) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/companies')} className="shrink-0 mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-display font-bold">{company.company_name}</h1>
            <Badge variant="secondary" className="text-xs">{company.sector}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {[company.subsector, company.headquarters].filter(Boolean).join(' • ') || 'No details'}
            {company.cin && <span className="ml-3 text-xs opacity-60">CIN: {company.cin}</span>}
          </p>
        </div>
        <Button
          onClick={() => navigate(`/companies/${companyId}/documents`)}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Upload className="w-4 h-4 mr-2" /> Upload Documents
        </Button>
      </div>

      {/* Document Stats */}
      <div>
        <h2 className="section-title mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Document Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="metric-card text-center">
            <div className="text-2xl font-display font-bold">{docStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Uploaded</p>
          </div>
          <div className="metric-card text-center">
            <div className="text-2xl font-display font-bold text-risk-medium">{docStats.pending + docStats.unclassified}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs Review</p>
          </div>
          <div className="metric-card text-center">
            <div className="text-2xl font-display font-bold text-risk-low">{docStats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved</p>
          </div>
          <div className="metric-card text-center">
            <div className="text-2xl font-display font-bold text-accent">{docStats.corrected}</div>
            <p className="text-xs text-muted-foreground mt-1">Corrected</p>
          </div>
          <div className="metric-card text-center">
            <div className="text-2xl font-display font-bold text-risk-high">{docStats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Rejected</p>
          </div>
        </div>
        {docStats.total === 0 && (
          <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            No documents uploaded yet.{' '}
            <button
              onClick={() => navigate(`/companies/${companyId}/documents`)}
              className="text-accent hover:underline font-medium"
            >
              Upload now →
            </button>
          </p>
        )}
      </div>

      {/* Financial Snapshot */}
      <div>
        <h2 className="section-title mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Financial Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Annual Turnover', value: formatCurrency(company.annual_turnover), icon: IndianRupee },
            { label: 'Revenue', value: formatCurrency(company.revenue), icon: BarChart3 },
            { label: 'EBITDA', value: formatCurrency(company.ebitda), icon: TrendingUp },
            { label: 'Total Assets', value: formatCurrency(company.total_assets), icon: Building2 },
          ].map(item => (
            <div key={item.label} className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-lg font-display font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <div className="metric-card">
            <span className="text-xs text-muted-foreground">Debt Levels</span>
            <p className="text-lg font-display font-bold mt-1">{formatCurrency(company.debt_levels)}</p>
          </div>
          <div className="metric-card">
            <span className="text-xs text-muted-foreground">Debt/Equity Ratio</span>
            <p className="text-lg font-display font-bold mt-1">{debtEquity ?? '—'}</p>
          </div>
          <div className="metric-card">
            <span className="text-xs text-muted-foreground">EBITDA Margin</span>
            <p className="text-lg font-display font-bold mt-1">{ebitdaMargin ? `${ebitdaMargin}%` : '—'}</p>
          </div>
        </div>
      </div>

      {/* Loan Request */}
      {company.loan_type && (
        <div>
          <h2 className="section-title mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4" /> Loan Request
          </h2>
          <div className="metric-card space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Loan Type</span>
                <p className="text-sm font-semibold mt-0.5">{loanTypeLabels[company.loan_type] || company.loan_type}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Loan Amount</span>
                <p className="text-sm font-semibold mt-0.5">{formatCurrency(company.loan_amount)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Tenure</span>
                <p className="text-sm font-semibold mt-0.5">{company.loan_tenure ? `${company.loan_tenure} months` : '—'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Interest Rate</span>
                <p className="text-sm font-semibold mt-0.5">{company.interest_rate ? `${company.interest_rate}%` : '—'}</p>
              </div>
            </div>
            {company.purpose_of_loan && (
              <div>
                <span className="text-xs text-muted-foreground">Purpose</span>
                <p className="text-sm mt-0.5">{company.purpose_of_loan}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
