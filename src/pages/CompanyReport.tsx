import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Download,
} from 'lucide-react';

interface ReportData {
  id: string;
  report_type: string;
  recommendation: string | null;
  content: {
    executive_summary?: string;
    company_overview?: string;
    financial_analysis?: string;
    risk_assessment?: string;
    swot?: {
      strengths?: string[];
      weaknesses?: string[];
      opportunities?: string[];
      threats?: string[];
    };
    credit_score_analysis?: string;
    recommendation_details?: string;
    conditions?: string[];
  } | null;
  created_at: string;
}

interface Company {
  id: string;
  company_name: string;
  sector: string;
  subsector: string | null;
  headquarters: string | null;
}

interface CreditScore {
  total_score: number | null;
  credit_grade: string | null;
  character_score: number | null;
  capacity_score: number | null;
  capital_score: number | null;
  collateral_score: number | null;
  conditions_score: number | null;
  reasoning: any;
}

export default function CompanyReport() {
  const { companyId, reportId } = useParams<{ companyId: string; reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [score, setScore] = useState<CreditScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId || !reportId) return;
    Promise.all([
      supabase.from('reports').select('*').eq('id', reportId).single(),
      supabase.from('companies').select('id, company_name, sector, subsector, headquarters').eq('id', companyId).single(),
      supabase.from('credit_scores').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(1),
    ]).then(([rRes, cRes, sRes]) => {
      setReport(rRes.data as any);
      setCompany(cRes.data);
      setScore(sRes.data?.[0] ?? null);
      setLoading(false);
    });
  }, [companyId, reportId]);

  const handleDownload = () => {
    if (!report || !company) return;
    const content = report.content;
    const text = `
CREDIT ASSESSMENT REPORT
========================
Company: ${company.company_name}
Sector: ${company.sector}
Date: ${new Date(report.created_at).toLocaleDateString('en-IN')}
Recommendation: ${report.recommendation}

EXECUTIVE SUMMARY
${content?.executive_summary || 'N/A'}

COMPANY OVERVIEW
${content?.company_overview || 'N/A'}

FINANCIAL ANALYSIS
${content?.financial_analysis || 'N/A'}

RISK ASSESSMENT
${content?.risk_assessment || 'N/A'}

CREDIT SCORE ANALYSIS
${content?.credit_score_analysis || 'N/A'}
Score: ${score?.total_score || 'N/A'}/100 | Grade: ${score?.credit_grade || 'N/A'}

SWOT ANALYSIS
Strengths: ${content?.swot?.strengths?.join('; ') || 'N/A'}
Weaknesses: ${content?.swot?.weaknesses?.join('; ') || 'N/A'}
Opportunities: ${content?.swot?.opportunities?.join('; ') || 'N/A'}
Threats: ${content?.swot?.threats?.join('; ') || 'N/A'}

RECOMMENDATION
${content?.recommendation_details || 'N/A'}

${content?.conditions?.length ? `CONDITIONS:\n${content.conditions.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Credit_Report_${company.company_name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-16 text-muted-foreground">Loading report…</div>;
  if (!report || !company) return <div className="text-center py-16 text-muted-foreground">Report not found.</div>;

  const content = report.content;
  const recColor = report.recommendation === 'Approve' ? 'bg-risk-low/15 text-risk-low' :
    report.recommendation === 'Conditional Approval' ? 'bg-risk-medium/15 text-risk-medium' :
    'bg-risk-high/15 text-risk-high';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/companies/${companyId}`)} className="shrink-0 mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold">Credit Assessment Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {company.company_name} • Generated {new Date(report.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" /> Download Report
        </Button>
      </div>

      {/* Recommendation Banner */}
      <div className={`metric-card flex items-center justify-between ${recColor} border-0`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Final Recommendation</p>
          <p className="text-2xl font-display font-bold mt-1">{report.recommendation}</p>
        </div>
        {score && (
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Credit Score</p>
            <p className="text-2xl font-display font-bold mt-1">{score.total_score}/100 <span className="text-sm">({score.credit_grade})</span></p>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <div className="metric-card">
        <h2 className="section-title mb-3">Executive Summary</h2>
        <p className="text-sm leading-relaxed">{content?.executive_summary}</p>
      </div>

      {/* Company Overview */}
      <div className="metric-card">
        <h2 className="section-title mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Company Overview
        </h2>
        <p className="text-sm leading-relaxed">{content?.company_overview}</p>
      </div>

      {/* Financial Analysis */}
      <div className="metric-card">
        <h2 className="section-title mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Financial Analysis
        </h2>
        <p className="text-sm leading-relaxed">{content?.financial_analysis}</p>
      </div>

      {/* Risk Assessment */}
      <div className="metric-card">
        <h2 className="section-title mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Risk Assessment
        </h2>
        <p className="text-sm leading-relaxed">{content?.risk_assessment}</p>
      </div>

      {/* Credit Score Analysis */}
      {score && (
        <div className="metric-card">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Credit Score Breakdown
          </h2>
          <p className="text-sm leading-relaxed mb-4">{content?.credit_score_analysis}</p>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Character', score: score.character_score, max: 25 },
              { label: 'Capacity', score: score.capacity_score, max: 25 },
              { label: 'Capital', score: score.capital_score, max: 20 },
              { label: 'Collateral', score: score.collateral_score, max: 15 },
              { label: 'Conditions', score: score.conditions_score, max: 15 },
            ].map(c => {
              const pct = c.score && c.max ? (c.score / c.max) * 100 : 0;
              return (
                <div key={c.label} className="text-center">
                  <p className="text-lg font-display font-bold">{c.score ?? 0}<span className="text-xs text-muted-foreground">/{c.max}</span></p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div className={`h-1.5 rounded-full ${pct >= 70 ? 'bg-risk-low' : pct >= 50 ? 'bg-risk-medium' : 'bg-risk-high'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{c.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SWOT */}
      {content?.swot && (
        <div>
          <h2 className="section-title mb-3">SWOT Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              { title: 'Strengths', items: content.swot.strengths, icon: CheckCircle2, color: 'text-risk-low', bg: 'bg-risk-low/10' },
              { title: 'Weaknesses', items: content.swot.weaknesses, icon: XCircle, color: 'text-risk-high', bg: 'bg-risk-high/10' },
              { title: 'Opportunities', items: content.swot.opportunities, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
              { title: 'Threats', items: content.swot.threats, icon: AlertTriangle, color: 'text-risk-medium', bg: 'bg-risk-medium/10' },
            ] as const).map(section => (
              <div key={section.title} className="metric-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${section.bg}`}>
                    <section.icon className={`w-3.5 h-3.5 ${section.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-sm">{section.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {section.items?.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Details */}
      <div className="metric-card">
        <h2 className="section-title mb-3">Recommendation Details</h2>
        <p className="text-sm leading-relaxed">{content?.recommendation_details}</p>
        {content?.conditions && content.conditions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Conditions</p>
            <ol className="space-y-1">
              {content.conditions.map((c, i) => (
                <li key={i} className="text-sm text-muted-foreground">{i + 1}. {c}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
