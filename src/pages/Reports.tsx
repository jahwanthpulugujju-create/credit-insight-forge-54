import { FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">Reports</h1>
      <p className="text-muted-foreground text-sm mb-8">Generated credit assessment reports</p>
      <div className="metric-card text-center py-16">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-display font-semibold text-lg mb-2">Coming in Phase 8</h3>
        <p className="text-muted-foreground text-sm">Investment and CAM reports will be generated here.</p>
      </div>
    </div>
  );
}
