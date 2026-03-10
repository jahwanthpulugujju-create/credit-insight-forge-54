import { Building2 } from 'lucide-react';

export default function UploadDocuments() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">Upload Documents</h1>
      <p className="text-muted-foreground text-sm mb-8">Upload financial documents for analysis</p>
      <div className="metric-card text-center py-16">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="font-display font-semibold text-lg mb-2">Coming in Phase 2</h3>
        <p className="text-muted-foreground text-sm">Document upload and AI extraction will be available here.</p>
      </div>
    </div>
  );
}
