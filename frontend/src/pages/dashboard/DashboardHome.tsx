import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import api from '../../config/api';
import { BadgesList } from '../../components/student/BadgesList';
import { LogOut, GraduationCap, Building2, Briefcase, Network, Cpu, FileText, CheckCircle, Clock } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === UserRole.STUDENT) {
      api.get('/student/profile')
        .then((res) => {
          setProfile(res.data.data.profile);
        })
        .catch(() => {});

      api.get('/assessments')
        .then((res) => {
          setAssessments(res.data.data.assessments || []);
        })
        .catch(() => {});
    }
  }, [user]);

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case UserRole.STUDENT:
        return <GraduationCap className="h-5 w-5 text-indigo-500" />;
      case UserRole.EMPLOYER:
        return <Building2 className="h-5 w-5 text-violet-500" />;
      case UserRole.RECRUITER:
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case UserRole.PLACEMENT_OFFICER:
        return <Network className="h-5 w-5 text-amber-500" />;
      default:
        return <Cpu className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatRole = (role?: string) => {
    if (!role) return '';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Generate simulated stats per role
  const getStats = () => {
    if (!user) return [];
    
    switch (user.role) {
      case UserRole.STUDENT:
        return [
          { label: 'Resume Rating', value: '88%', change: '+4% this week', desc: 'AI Review Rating' },
          { label: 'Saved Jobs', value: '12', change: '3 new added', desc: 'Bookmarked openings' },
          { label: 'Applications', value: '4', change: '1 in review', desc: 'Active submissions' }
        ];
      case UserRole.EMPLOYER:
        return [
          { label: 'Job Postings', value: '5', change: '1 active drive', desc: 'Open roles posted' },
          { label: 'Candidates Match', value: '84', change: '+12 new fits', desc: 'AI recommended fits' },
          { label: 'Verification', value: 'Pending', change: 'Awaiting admin', desc: 'Company status' }
        ];
      case UserRole.PLACEMENT_OFFICER:
        return [
          { label: 'Students Registered', value: '312', change: '98% profile score', desc: 'Active batch strength' },
          { label: 'Partner Brands', value: '45', change: '+3 this month', desc: 'Participating companies' },
          { label: 'Offers Released', value: '18', change: 'Placement rate: 42%', desc: 'Pending responses' }
        ];
      default:
        return [
          { label: 'User Count', value: '1,248', change: '+4% this week', desc: 'System total' },
          { label: 'System Uptime', value: '99.9%', change: 'All services green', desc: 'Hosting status' },
          { label: 'AI Match Queries', value: '12.4K', change: 'Avg latency: 120ms', desc: 'API requests' }
        ];
    }
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Dashboard Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">CF</div>
            <span className="font-bold text-base hidden sm:inline">CareerFlow AI <span className="text-muted-foreground text-xs font-normal">Console</span></span>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === UserRole.STUDENT && (
              <>
                <Link
                  to="/jobs"
                  className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-foreground px-3.5 text-xs font-bold transition-all"
                >
                  Search Jobs
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 text-xs font-bold transition-all shadow-sm shadow-indigo-650/10"
                >
                  My Profile
                </Link>
              </>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-slate-100/50 dark:bg-slate-900/50 text-xs font-medium">
              {getRoleIcon(user?.role)}
              <span>{formatRole(user?.role)}</span>
            </div>
            <Link
              to="/forum"
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Forum
            </Link>
            <Link
              to="/mentorship"
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              Interview Logs
            </Link>
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3 text-sm font-medium transition-colors gap-1.5"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-grow container mx-auto px-6 py-10 space-y-8">
        
        {/* Welcome Section */}
        <section className="p-8 rounded-2xl border bg-white dark:bg-slate-900/40 relative overflow-hidden shadow-sm backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-indigo-500/5 to-transparent -z-10" />
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Active Workspace</span>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name || 'User'}!</h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              You are signed in to CareerFlow AI under the email <span className="text-foreground font-medium">{user?.email}</span>. Use the console to control resources.
            </p>
          </div>
        </section>

        {/* Student Achievements Badges Panel */}
        {user?.role === UserRole.STUDENT && (
          <section className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm text-left">
            <BadgesList unlockedBadges={profile?.badges || []} />
          </section>
        )}

        {/* Student Active Assessments Panel */}
        {user?.role === UserRole.STUDENT && assessments.length > 0 && (
          <section className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm text-left space-y-4">
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-rose-500 animate-pulse" />
                Pending Recruitment Assessments
              </h3>
              <p className="text-xs text-muted-foreground">Complete drive tests requested by corporate hiring managers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assessments.map((a) => (
                <div key={a._id} className="p-4.5 border rounded-2xl flex flex-col justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-350 transition-colors">
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm">{a.title}</p>
                    <p className="text-[11px] font-semibold text-indigo-650 dark:text-indigo-400">{a.companyId?.name || 'Company'} — {a.jobId?.title || 'Job Drive'}</p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <span>Duration: {a.duration} mins</span>
                      <span>•</span>
                      <span>Pass Mark: {a.passingMarks}%</span>
                    </div>
                  </div>
                  <Link
                    to={`/assessments/${a._id}`}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/10 transition-colors w-28 shrink-0 text-center"
                  >
                    Start Test
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900/50 border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <span className="text-3xl font-black">{stat.value}</span>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="text-emerald-500 font-semibold">{stat.change}</span>
                  <span>{stat.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Platform Modules (Future Roadmap Preview) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Active Platform Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Phase 1 Integration */}
            <div className="border bg-white dark:bg-slate-900/30 p-6 rounded-2xl flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base flex items-center gap-2">
                  Authentication & RBAC
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">Live</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Session control, user registrations, JWT verification with refresh token rotation cookies, and college placement cell RBAC constraints.
                </p>
              </div>
            </div>

            {/* Phase 2 Integration Mocked */}
            <div className="border border-dashed bg-slate-50/50 dark:bg-slate-900/5 p-6 rounded-2xl flex gap-4 opacity-75">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <FileText className="h-5 w-5 animate-pulse-slow" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base flex items-center gap-2">
                  AI Resume Matcher
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full">Phase 2</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automatic PDF extraction, candidate match ratings against job description parameters, and resume structure improvements.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};
