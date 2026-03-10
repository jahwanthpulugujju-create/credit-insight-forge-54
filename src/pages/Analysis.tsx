import { BarChart3 } from 'lucide-react';

export default function Analysis() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">Analysis</h1>
      <p className="text-muted-foreground text-sm mb-8">AI-powered credit analysis and scoring</p>
      <div className="metric-card text-center py-16">
        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-display font-semibold text-lg mb-2">Coming in Phase 3</h3>
        <p className="text-muted-foreground text-sm">Credit scoring and Five Cs analysis will appear here.</p>
      </div>
    </div>
  );
}
