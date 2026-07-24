import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Logo } from '../../components/shared/Logo';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowRight, 
  Cpu, 
  FileText, 
  Award, 
  Server, 
  Sparkles, 
  RefreshCw
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Interactive matcher state
  const [simState, setSimState] = useState<'idle' | 'parsing' | 'matching' | 'complete'>('idle');
  const [simProgress, setSimProgress] = useState(0);

  useEffect(() => {
    if (simState === 'parsing') {
      setSimProgress(0);
      const interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSimState('matching');
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(interval);
    } else if (simState === 'matching') {
      setSimProgress(0);
      const interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSimState('complete');
            return 100;
          }
          return prev + 15;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [simState]);

  const handleStartSim = () => setSimState('parsing');
  const handleResetSim = () => {
    setSimState('idle');
    setSimProgress(0);
  };

  return (
    <div className="min-h-screen bg-background premium-gradient overflow-hidden flex flex-col antialiased selection:bg-accent/25 selection:text-foreground">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <Link to="/" className="text-primary hover:text-primary transition-colors">Home</Link>
            <Link to="/for-institutions" className="hover:text-primary transition-colors">For Institutions</Link>
            <Link to="/for-institutions#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 text-xs tracking-wide uppercase transition-all shadow-sm shadow-primary/10 gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg hover:bg-secondary text-foreground px-4 text-sm font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-5 text-sm font-semibold transition-colors shadow-md shadow-primary/10 gap-1.5"
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
      <section className="relative py-20 md:py-28 overflow-hidden text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
        
        <div className="container mx-auto px-6 max-w-5xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary/5 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span>Simpler. Faster. Cheaper. No per-student fees.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-4xl mx-auto">
            Recruitment software your placement cell will actually enjoy using.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Go live in days, import students via clean CSVs, and host virtual recruiter drives with zero IT setup. The lightweight replacement for bloated placement portals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="h-12 inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-8 text-base font-semibold shadow-lg shadow-primary/10 transition-transform hover:scale-[1.01]"
            >
              Book a Free Demo
            </Link>
            <Link
              to="/for-institutions#pricing"
              className="h-12 inline-flex items-center justify-center rounded-xl border bg-background hover:bg-secondary text-foreground px-8 text-base font-semibold transition-transform hover:scale-[1.01]"
            >
              See Pricing
            </Link>
          </div>

          {/* Interactive CSS Dashboard Mockup (Visual) */}
          <div className="w-full max-w-4xl mx-auto pt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl -z-10 rounded-full" />
            <div className="glass-panel rounded-2xl border p-4 sm:p-5 shadow-2xl relative overflow-hidden text-left text-xs font-semibold">
              <div className="flex items-center gap-1.5 border-b pb-3 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground font-mono ml-2">careerflow-dashboard-preview</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-secondary/30 space-y-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Placement Rate</span>
                  <p className="text-3xl font-black text-primary">84.6%</p>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+5.4% vs last drive</span>
                </div>
                <div className="p-4 rounded-xl border bg-secondary/30 space-y-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Verified Recruiters</span>
                  <p className="text-3xl font-black text-accent">48 active</p>
                  <span className="text-[10px] text-slate-500 font-medium">9 pending verification</span>
                </div>
                <div className="p-4 rounded-xl border bg-secondary/30 space-y-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Student Registry</span>
                  <p className="text-3xl font-black text-slate-800 dark:text-white">1,240</p>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">98% profile score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Why Institutions Switch */}
      <section className="py-24 border-t bg-slate-500/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">Why CRUIT</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Built to replace enterprise bloat</h2>
            <p className="text-muted-foreground">We skip the complex setups and per-student licensing markups. Simple pricing, light screens.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-2xl border space-y-4 text-left">
              <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Live in Days</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Import students via clean CSV files, build customized MCQs, and list companies instantly. Your campus placement cell goes live within 3 business days.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border space-y-4 text-left">
              <div className="h-10 w-10 bg-accent/10 text-accent border border-accent/20 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Transparent Flat Rates</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pay one flat subscription price. We do not tax your placement cells based on candidate counts or active recruiter partnerships. No setup overhead.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border space-y-4 text-left">
              <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">No IT Team Needed</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hosted securely in AWS cloud facilities. We manage compliance, daily backups, encryption, and scaling so you don't need local system admins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: How It Works */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">3-Step Timeline</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Streamlining placements from start to finish</h2>
            <p className="text-muted-foreground">A clean operational workflow with fewer menu layers and clicks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="space-y-3 text-left p-4.5">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-base font-extrabold">Register & Upload Students</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Onboard your college, upload candidate details via standard spreadsheets, and let candidates build structured portfolios with toggle-switched resume checklists.
              </p>
            </div>

            <div className="space-y-3 text-left p-4.5">
              <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="text-base font-extrabold">Invite Hiring Partners</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Recruiters register, list active job drives, schedule compiler-checked tests or MCQs, and review matching applicants sorted by score compatibility.
              </p>
            </div>

            <div className="space-y-3 text-left p-4.5">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="text-base font-extrabold">Track Outplacement Outcomes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Approve offers directly, output branch analytics indices, and calculate overall university recruitment ratios instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Matcher Demo */}
      <section className="py-20 border-t bg-slate-500/5 relative">
        <div className="container mx-auto px-6 max-w-4xl relative">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">Interactive Demo</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Test the AI Screening Engine</h2>
            <p className="text-muted-foreground">Simulate resume-to-job requirement calculations and check candidate compatibility metrics.</p>
          </div>

          <div className="glass-panel rounded-2xl border shadow-2xl p-6 md:p-8 overflow-hidden relative text-left">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-primary to-accent" />
            <AnimatePresence mode="wait">
              {simState === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-8 space-y-5 text-center"
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/20">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold">Simulate Screening Pipeline</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">Test parser speed and metrics with standard candidate profile data.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-dashed bg-slate-500/5 max-w-sm w-full flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-accent/10 text-accent rounded-lg flex items-center justify-center text-xs font-mono font-bold">PDF</div>
                      <div>
                        <p className="text-xs font-bold">Resume_Alex_Mercer.pdf</p>
                        <p className="text-[10px] text-muted-foreground">142 KB • Software Focus</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Vetted</span>
                  </div>
                  <button
                    onClick={handleStartSim}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    Simulate Screening Execution
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {simState === 'parsing' && (
                <motion.div
                  key="parsing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center space-y-5 text-center"
                >
                  <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold">Step 1: Extracting Candidate Credentials</h3>
                    <p className="text-xs text-muted-foreground">Parsing text layout nodes and mapping key capabilities...</p>
                  </div>
                  <div className="w-full max-w-xs bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-100" style={{ width: `${simProgress}%` }} />
                  </div>
                </motion.div>
              )}

              {simState === 'matching' && (
                <motion.div
                  key="matching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center space-y-5 text-center"
                >
                  <Cpu className="h-10 w-10 text-accent animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold">Step 2: Core Compatibility Match</h3>
                    <p className="text-xs text-muted-foreground">Aligning profile weights to target job description metrics...</p>
                  </div>
                  <div className="w-full max-w-xs bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full transition-all duration-100" style={{ width: `${simProgress}%` }} />
                  </div>
                </motion.div>
              )}

              {simState === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase">Scoring Matrix Completed</span>
                      <h3 className="text-lg font-black mt-0.5">Vetted Placement Profile Result</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary rounded">Software Engineer</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="p-4 bg-secondary/35 rounded-xl border flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] uppercase font-black text-muted-foreground">Compatibility Score</span>
                      <p className="text-3xl font-black text-primary my-2">94%</p>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Compatible</span>
                    </div>
                    <div className="sm:col-span-2 space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-black text-muted-foreground">Skills Confirmed</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {['React', 'TypeScript', 'Go', 'AWS Suite', 'Data Structures'].map((t) => (
                            <span key={t} className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-secondary/20 rounded-lg border text-xxs leading-relaxed text-muted-foreground">
                        Candidate ranks in top 6% of institutional benchmark test logs. Highly recommended for campus interview loops.
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button onClick={handleResetSim} className="px-3.5 py-1.5 rounded-lg border hover:bg-secondary font-bold text-xs">Test Again</button>
                    <Link to="/register" className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs flex items-center gap-1">Register Account <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 3: Testimonial & Case Study Block */}
      <section className="py-24 border-t bg-secondary/20 relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="text-xs uppercase font-extrabold tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">Zenith Institute Case Study</span>
              <h2 className="text-3xl font-extrabold tracking-tight">Digitized placement cells boost outplacement outcomes</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By transitioning their operations from spreadsheets to our lightweight dashboard, Zenith Tech saved weeks of coordination work, unified student verification, and successfully placed 850 students with 38 global employers.
              </p>
              <div className="grid grid-cols-3 gap-4 border-y py-5 text-xs font-semibold">
                <div>
                  <p className="text-2xl font-black text-primary">1,200+</p>
                  <p className="text-xxs text-muted-foreground mt-0.5">Students Active</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-accent">45+</p>
                  <p className="text-xxs text-muted-foreground mt-0.5">Drives Conducted</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-500">34%</p>
                  <p className="text-xxs text-muted-foreground mt-0.5">Placement Increase</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-2xl border shadow-lg text-left relative">
              <span className="text-6xl text-primary/15 font-serif absolute -top-4 -left-2 leading-none">“</span>
              <blockquote className="space-y-4 relative">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium italic">
                  CRUIT completely digitized our placement operations. Instead of dealing with chaotic email lists, we now match, screen, and test students instantly. Recruiters love the speed, and we have live outcomes analytics.
                </p>
                <footer className="flex items-center gap-3 pt-4 border-t text-xxs">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white font-extrabold">AT</div>
                  <div>
                    <p className="font-bold text-foreground">Dr. Aris Thorne</p>
                    <p className="text-muted-foreground">Placement Officer, Zenith Tech</p>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 border-t bg-card text-card-foreground text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-primary/5 to-accent/5 blur-3xl -z-10 rounded-full" />
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ditch the enterprise bloat today.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Get your college live in days with transparent flat monthly rates. Zero hardware, zero IT setup.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/register" className="h-11 px-6 inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md transition-all active:scale-95">
              Launch Portal Free
            </Link>
            <Link to="/for-institutions" className="h-11 px-6 inline-flex items-center justify-center rounded-xl border bg-background hover:bg-secondary text-foreground font-semibold transition-all">
              Explore Institutional Features
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-slate-900 text-slate-300 text-xxs text-left">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-3">
              <Logo size="sm" />
              <p className="text-slate-400 leading-relaxed max-w-xs">
                Lightweight digital campus placement cell and career matching portal. Go live in days.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-400 uppercase tracking-wider">Product</h4>
              <ul className="space-y-1.5">
                <li><Link to="/for-institutions" className="hover:text-white">For Institutions</Link></li>
                <li><Link to="/for-institutions#pricing" className="hover:text-white">Pricing Model</Link></li>
                <li><Link to="/login" className="hover:text-white">Student Hub Login</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-400 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-1.5">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Support desk</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between text-slate-500 gap-4">
            <span>© 2026 CRUIT. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-400">LinkedIn</a>
              <a href="#" className="hover:text-slate-400">Twitter</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
