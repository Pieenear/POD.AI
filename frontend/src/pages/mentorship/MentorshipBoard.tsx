import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Logo } from '../../components/shared/Logo';
import { Link } from 'react-router-dom';
import {
  FileText,
  User,
  ArrowLeft,
  LogOut,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const MentorshipBoard: React.FC = () => {
  const { logout } = useAuth();
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [roundsDetails, setRoundsDetails] = useState('');
  const [tips, setTips] = useState('');

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentorship/experiences');
      setExperiences(res.data.data.experiences || []);
    } catch {
      showNotice('Failed to load mentorship experiences logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmitExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role || !roundsDetails) return;

    try {
      const payload = { company, role, difficulty, roundsDetails, tips };
      const res = await api.post('/mentorship/experiences', payload);
      setExperiences(prev => [res.data.data.experience, ...prev]);
      showNotice('Interview experience review published!');

      // Reset
      setCompany('');
      setRole('');
      setDifficulty('Medium');
      setRoundsDetails('');
      setTips('');
    } catch {
      showNotice('Failed to publish experience review', 'error');
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-150';
      case 'Hard':
        return 'bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-450 border-rose-150';
      default:
        return 'bg-amber-50 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400 border-amber-150';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-455'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard">
            <Logo size="sm" subtitle="Alumni Mentorship Registry" />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-xs font-bold transition-all gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Console Home
            </Link>
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-sm font-medium transition-colors gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-white dark:bg-slate-900 border-b py-8 text-left">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight">Interview Logs & Alumni Reviews</h2>
          <p className="text-sm text-indigo-650 dark:text-indigo-400 font-semibold">Audit candidate experiences shared directly by placed senior students and alumni.</p>
        </div>
      </section>

      {/* Content Layout Grid */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Form: Submit Review */}
        <aside className="md:col-span-1 space-y-4 text-left">
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-base border-b pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Share Your Interview Experience
            </h3>

            <form onSubmit={handleSubmitExperience} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-705 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-705 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                  Role / Position
                </label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Software Engineer Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-705 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-705 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                  Interview Rounds Details
                </label>
                <textarea
                  rows={4}
                  required
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Detail round sequences, online coding tests, and HR discussions..."
                  value={roundsDetails}
                  onChange={(e) => setRoundsDetails(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-705 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                  Prep Recommendations & Tips
                </label>
                <textarea
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Key topics to study, books/websites suggestions..."
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all mt-2 shadow-sm shadow-indigo-650/15"
              >
                Publish Experience Logs
              </button>
            </form>
          </div>
        </aside>

        {/* Right Panel: Experiences logs feed */}
        <section className="md:col-span-2 space-y-4 text-left">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2.5 text-muted-foreground text-xs font-semibold">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span>Loading alumni experiences logs...</span>
            </div>
          ) : experiences.length > 0 ? (
            experiences.map((exp) => (
              <div key={exp._id} className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base leading-snug">{exp.company}</h4>
                    <p className="text-xs text-indigo-655 dark:text-indigo-400 font-semibold">{exp.role}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getDifficultyColor(exp.difficulty)}`}>
                    {exp.difficulty} Diff
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="space-y-1">
                    <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Rounds & Processes
                    </span>
                    <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-wrap pl-4.5 bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100/50 dark:border-slate-800/55">{exp.roundsDetails}</p>
                  </div>

                  {exp.tips && (
                    <div className="space-y-1 pt-1">
                      <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Preparation Tips
                      </span>
                      <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-wrap pl-4.5 bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100/50 dark:border-slate-800/55">{exp.tips}</p>
                    </div>
                  )}
                </div>

                {/* Footer author details */}
                <div className="border-t pt-3 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-0.5"><User className="h-3 w-3" /> Shared By: {exp.authorName}</span>
                  <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                </div>

              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
              <FileText className="h-8 w-8 text-slate-300" />
              No interview experiences shared yet. Be the first to share!
            </div>
          )}
        </section>

      </main>

    </div>
  );
};
export default MentorshipBoard;
