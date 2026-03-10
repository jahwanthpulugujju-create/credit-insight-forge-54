import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Upload,
  BarChart3,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Companies', icon: Building2, path: '/companies' },
  { label: 'Upload Documents', icon: Upload, path: '/upload' },
  { label: 'Analysis', icon: BarChart3, path: '/analysis' },
  { label: 'Risk Signals', icon: AlertTriangle, path: '/risk-signals' },
  { label: 'Reports', icon: FileText, path: '/reports' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, hasRole } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40" style={{ background: 'hsl(var(--sidebar-bg))' }}>
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--sidebar-active))' }}>
          <Shield className="w-5 h-5" style={{ color: 'hsl(var(--accent-foreground))' }} />
        </div>
        <div>
          <h1 className="font-display text-base font-bold" style={{ color: 'hsl(var(--sidebar-active))' }}>
            Intelli-Credit
          </h1>
          <p className="text-[10px] tracking-wider uppercase" style={{ color: 'hsl(var(--sidebar-fg) / 0.5)' }}>
            Credit Intelligence
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-link w-full ${active ? 'active' : ''}`}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {item.label}
            </button>
          );
        })}

        {hasRole('admin') && (
          <button
            onClick={() => navigate('/admin')}
            className={`sidebar-link w-full ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <Shield className="w-4.5 h-4.5 shrink-0" />
            Admin
          </button>
        )}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button
          onClick={signOut}
          className="sidebar-link w-full opacity-70 hover:opacity-100"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
