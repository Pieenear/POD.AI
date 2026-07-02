import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Cpu, FileText, BarChart3, Users } from 'lucide-react';

export const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background premium-gradient overflow-hidden flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">CF</div>
            <span>CareerFlow <span className="text-indigo-600 dark:text-indigo-400">AI</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Insights</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium transition-colors gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-foreground px-4 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium transition-colors gap-1.5 shadow-sm shadow-indigo-600/20"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 backdrop-blur-sm">
            <Cpu className="h-3 w-3" />
            <span>AI-First Placement System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            The Smart Placement Hub for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Next-Gen Campus Hiring
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect students, placement cells, and recruiters in an unified, enterprise-grade portal. Powered by AI resume reviews, matchmaking, and candidate ranking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="h-12 inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-base font-semibold shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.02]"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="h-12 inline-flex items-center justify-center rounded-xl border bg-background hover:bg-muted text-foreground px-8 text-base font-semibold transition-all hover:scale-[1.02]"
            >
              Request Demo
            </Link>
          </div>
        </motion.div>

        {/* Feature Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl mx-auto mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl -z-10 rounded-full" />
          <div className="glass-panel rounded-2xl border p-4 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Window header */}
            <div className="flex items-center gap-2 pb-4 border-b mb-6">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <div className="ml-4 h-4 w-40 rounded-full bg-muted" />
            </div>

            {/* Dashboard Mock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-4">
                <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800/40 p-4 border border-dashed flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground font-bold uppercase">Resume Rating</span>
                    <Cpu className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-extrabold">92%</span>
                    <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">+4% vs last draft</span>
                  </div>
                </div>
                <div className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800/40 p-4 border flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground font-bold uppercase">Application Flow</span>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded bg-muted overflow-hidden">
                      <div className="h-full w-4/5 bg-indigo-600" />
                    </div>
                    <div className="h-2 w-full rounded bg-muted overflow-hidden">
                      <div className="h-full w-3/5 bg-violet-500" />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">80 Completed • 24 Pending</span>
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl bg-slate-100 dark:bg-slate-800/40 p-6 border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base">Placement Officer Dashboard</h3>
                    <p className="text-xs text-muted-foreground">College of Technology and Sciences</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full">Phase 1 Active</span>
                </div>
                <div className="space-y-3 flex-grow">
                  {[
                    { label: 'Student Data Upload', status: 'Completed', color: 'text-emerald-500' },
                    { label: 'Employer Verification Portal', status: 'Active', color: 'text-emerald-500' },
                    { label: 'AI Resume Score Checker', status: 'Configured', color: 'text-indigo-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className={`text-xs font-bold ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Everything you need, built to scale</h2>
            <p className="text-muted-foreground">An modular approach built specifically to meet the high standards of corporate campus recruiters and institutions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border space-y-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">AI Resume Review</h3>
              <p className="text-sm text-muted-foreground">Upload and instantly parse resumes. Get customized ratings, keyword metrics, and recommendations based on target job description alignments.</p>
            </div>
            <div className="p-6 rounded-2xl bg-background border space-y-4">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold"> h-Real-Time Analytics</h3>
              <p className="text-sm text-muted-foreground">Monitor hiring percentages, department rankings, average salaries, and placement rate statistics in modular dashboards.</p>
            </div>
            <div className="p-6 rounded-2xl bg-background border space-y-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Enterprise RBAC</h3>
              <p className="text-sm text-muted-foreground">Role-based controls supporting Student, Employer, Recruiter, Placement Officer, College Admin, and Super Admin modules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-xs">CF</div>
            <span>© 2026 CareerFlow AI. All rights reserved.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
