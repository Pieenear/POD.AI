import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Database, 
  Cpu, 
  BarChart3
} from 'lucide-react';

export const ForInstitutions: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Accordion active index
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How long does it take to go live?',
      a: 'Zenith and other major colleges went live in less than 3 days. Since CRUIT is hosted on secure cloud systems, you do not need to install hardware or write configurations. Just import your student CSV to begin.'
    },
    {
      q: 'Are there hidden per-student licensing fees?',
      a: 'No. CRUIT offers transparent, flat monthly tiers. You pay one clean rate regardless of how many students register or how many companies participate. We do not charge per-student taxations.'
    },
    {
      q: 'Do we need a dedicated IT operations team?',
      a: 'Not at all. The entire server operations, daily backups, databases, security patches, and scaling are managed entirely by our secure AWS cloud infrastructure.'
    },
    {
      q: 'Can we run programming and MCQ assessments?',
      a: 'Yes. Our platform has a built-in assessment engine that supports technical multiple-choice formats, psycho-metrics, and compiler-checked coding questions with auto-plagiarism score reports.'
    }
  ];


  return (
    <div className="min-h-screen bg-background premium-gradient flex flex-col antialiased selection:bg-accent/25 selection:text-foreground">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-extrabold text-xl tracking-tight text-foreground">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/10">CF</div>
            <span>Career<span className="text-primary font-black">Flow</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/for-institutions" className="text-primary hover:text-primary transition-colors">For Institutions</Link>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <Link to="/dashboard" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 text-xs tracking-wide uppercase transition-all shadow-sm shadow-primary/10 gap-1.5">
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg hover:bg-secondary text-foreground px-4 text-sm font-semibold transition-colors">Sign In</Link>
                <Link to="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-5 text-sm font-semibold transition-colors shadow-md shadow-primary/10 gap-1.5">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 overflow-hidden text-center relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
        <div className="container mx-auto px-6 max-w-4xl space-y-6">
          <span className="text-xs uppercase font-extrabold tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">For Placement Cells</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Digital Placement Infrastructure, <br />
            Built for Modern Universities
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ditch the spreadsheet mess. Empower your college placement cell to verify student data, run assessments, match recruiters, and export live reports.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/register" className="h-12 inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-8 text-base font-semibold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]">
              Launch Portal Free
            </Link>
            <a href="#pricing" className="h-12 inline-flex items-center justify-center rounded-xl border bg-background hover:bg-secondary text-foreground px-8 text-base font-semibold transition-all hover:scale-[1.01]">
              View Flat Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Feature Breakdown (Alternating) */}
      <section className="py-16 border-t bg-slate-500/5">
        <div className="container mx-auto px-6 max-w-5xl space-y-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">Full Administrative Capability</h2>
            <p className="text-muted-foreground">Every component is engineered to operate seamlessly with zero IT overhead.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold">Vetted Student Directory</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter and verify candidate records. Organize batches by academic department, branch field-of-study, or minimum CGPA credentials. Student details are locked until admin verification, preventing profile tampering.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border shadow-md space-y-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-primary">Student Database Mock</span>
              <div className="space-y-2">
                {['Alex Mercer (CSE) - 9.2 CGPA', 'Sarah Connor (ECE) - 8.4 CGPA', 'Jane Doe (MECH) - 7.9 CGPA'].map((student, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/35 text-xs font-semibold">
                    <span>{student}</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded">Vetted</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left md:flex-row-reverse">
            <div className="glass-panel p-6 rounded-2xl border shadow-md space-y-4 md:order-last">
              <span className="text-[10px] uppercase font-black tracking-widest text-accent">Automated Matching Console</span>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Frontend Developer Role Match</span>
                  <span className="text-primary">94% Core Match</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-primary rounded-full" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 w-10 bg-accent/10 text-accent border border-accent/20 rounded-xl flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold">Recruiter Screening Matcher</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Provide hiring partners with automated recommendations. Our matching tool screens student profile capabilities and assessment scores to recommend candidates, saving recruiters hours of catalog searching.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold">Comprehensive Outcome Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitor and export university outcome parameters instantly. Chart placement indices by branch, calculate historical average salaries, and identify key institutional skill gaps flagged during exams.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border shadow-md text-center flex flex-col justify-center items-center">
              <div className="h-28 w-28 rounded-full border-8 border-primary border-t-transparent flex items-center justify-center relative">
                <span className="text-xl font-black text-slate-800 dark:text-white">84.6%</span>
              </div>
              <span className="text-xxs uppercase tracking-wider font-extrabold text-muted-foreground mt-3">Batch Placement Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">Transparent Pricing</span>
            <h2 className="text-3xl font-extrabold tracking-tight">One Clean Flat Rate</h2>
            <p className="text-muted-foreground">No per-student fees, no onboarding setups, and no hidden databases upgrade pricing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="glass-panel rounded-2xl border p-6 flex flex-col justify-between hover:border-slate-350 transition-colors shadow-sm text-left">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black">Starter Suite</h3>
                  <p className="text-xs text-muted-foreground mt-1">For single colleges and schools.</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-black">₹14,999</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ month</span>
                </div>
                <ul className="space-y-2 text-xxs text-slate-600 dark:text-slate-300 pt-4 border-t">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Up to 500 Active Students</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 10 Registered Recruiter Drives</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Standard Outcomes Reports</li>
                </ul>
              </div>
              <Link to="/register" className="w-full mt-8 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl text-center block transition-colors">Get Started</Link>
            </div>

            {/* Growth */}
            <div className="glass-panel rounded-2xl border border-primary/30 p-6 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-md text-left relative">
              <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-[9px] font-black uppercase tracking-widest shadow-sm">Popular Choice</span>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black">Growth System</h3>
                  <p className="text-xs text-muted-foreground mt-1">For large departments & universities.</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-black">₹29,999</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ month</span>
                </div>
                <ul className="space-y-2 text-xxs text-slate-600 dark:text-slate-300 pt-4 border-t">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Unlimited Registered Students</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Unlimited Recruiter Drives</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Vetted Assessment MCQ Engine</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Premium Analytics Export</li>
                </ul>
              </div>
              <Link to="/register" className="w-full mt-8 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl text-center block transition-transform hover:scale-[1.01]">Launch growth Tier</Link>
            </div>

            {/* Enterprise */}
            <div className="glass-panel rounded-2xl border p-6 flex flex-col justify-between hover:border-slate-350 transition-colors shadow-sm text-left">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black">Enterprise Matrix</h3>
                  <p className="text-xs text-muted-foreground mt-1">For campus systems and networks.</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-black">Custom Flat</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ annual</span>
                </div>
                <ul className="space-y-2 text-xxs text-slate-600 dark:text-slate-300 pt-4 border-t">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Custom API & LDAP integrations</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Dedicated secure DB cluster</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> SLA Uptime Logs Guarantee</li>
                </ul>
              </div>
              <Link to="/register" className="w-full mt-8 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl text-center block transition-colors">Contact Relations</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t bg-slate-500/5">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">Common Queries</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Institutional FAQs</h2>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-card text-card-foreground border rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 font-bold text-xs sm:text-sm flex justify-between items-center text-left"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <Minus className="h-4 w-4 text-accent" /> : <Plus className="h-4 w-4 text-primary" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-dashed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 border-t bg-card text-card-foreground text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-accent/5 blur-3xl -z-10 rounded-full" />
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to Digitize Your Campus?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Create an admin account, upload your student list, and invite companies to participate in drives. No setup fees, cancel anytime.
          </p>
          <div className="pt-2">
            <Link to="/register" className="h-11 px-8 inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md shadow-primary/10 transition-transform active:scale-95">
              Launch Portal Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-900 text-slate-300 text-xxs">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row items-center justify-between text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 CRUIT. Vetted Platform. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Support Helpdesk</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default ForInstitutions;
