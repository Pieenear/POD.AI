import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Server
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // 6 Simplified Hubs
  const navItems = [
    { label: 'Dashboard', path: '/officer', icon: LayoutDashboard },
    { label: 'Students', path: '/officer/students', icon: Users },
    { label: 'Companies & Drives', path: '/officer/drives', icon: Building2 },
    { label: 'Assessments', path: '/officer/assessments', icon: FileText },
    { label: 'Analytics & Reports', path: '/officer/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/officer/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg border hover:bg-secondary text-foreground md:hidden transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <Link to="/officer">
              <Logo size="sm" subtitle="Officer" />
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* System Health check status */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-secondary/35 text-[10px] font-bold text-muted-foreground">
              <Server className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>Database Connected</span>
            </div>

            <ThemeToggle />

            {/* Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all relative"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-card text-card-foreground shadow-lg py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b font-bold flex justify-between items-center">
                    <span>Admin Alerts</span>
                    <button 
                      onClick={() => setHasUnread(false)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y">
                    <div className="p-3 hover:bg-secondary/40 space-y-1">
                      <p className="font-bold text-foreground">Pending Company Verification</p>
                      <p className="text-[10px] text-muted-foreground">Infosys HR requested verification approval status logs.</p>
                      <span className="text-[9px] text-slate-400 font-semibold block pt-0.5">3 hours ago</span>
                    </div>
                    <div className="p-3 hover:bg-secondary/40 space-y-1">
                      <p className="font-bold text-foreground">CSV Student List Import Successful</p>
                      <p className="text-[10px] text-muted-foreground">Successfully processed 84 new student profile databases.</p>
                      <span className="text-[9px] text-slate-400 font-semibold block pt-0.5">Yesterday</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-lg border hover:bg-secondary text-sm font-semibold transition-all"
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate text-slate-700 dark:text-slate-200">{user?.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card text-card-foreground shadow-lg py-1.5 z-50 text-xs font-semibold">
                  <button 
                    onClick={() => { setDropdownOpen(false); navigate('/officer/settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                  </button>
                  <hr className="my-1 border-border" />
                  <button 
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary text-rose-600 dark:text-rose-400 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Log Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex relative">
        
        {/* Navigation Sidebar */}
        <aside className={`fixed inset-y-16 left-0 w-64 border-r bg-background/50 backdrop-blur-sm z-30 transition-transform duration-300 md:translate-x-0 md:sticky md:h-[calc(100vh-64px)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full flex flex-col justify-between py-6 px-4 overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active 
                        ? 'bg-primary/5 text-primary border border-primary/20 scale-[1.01]' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-primary' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick stats panel at bottom */}
            <div className="p-4.5 rounded-xl border bg-secondary/30 text-xxs font-semibold space-y-1 text-muted-foreground">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">System Role</span>
              <div className="flex justify-between items-center text-foreground font-bold">
                <span>Placement Officer</span>
                <span className="text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full text-[9px]">Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Click outside backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-16 bg-black/20 backdrop-blur-xxs z-20 md:hidden"
          />
        )}

        {/* Content Outlet */}
        <main className="flex-grow min-w-0 p-6 md:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
export default AdminLayout;
