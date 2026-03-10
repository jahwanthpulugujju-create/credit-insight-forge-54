import { AlertTriangle } from 'lucide-react';

export default function RiskSignals() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">Risk Signals</h1>
      <p className="text-muted-foreground text-sm mb-8">AI-detected risk indicators</p>
      <div className="metric-card text-center py-16">
        <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-display font-semibold text-lg mb-2">Coming in Phase 4</h3>
        <p className="text-muted-foreground text-sm">Risk signal detection and secondary research results will show here.</p>
      </div>
    </div>
  );
}
