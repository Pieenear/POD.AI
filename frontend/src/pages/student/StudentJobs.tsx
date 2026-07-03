import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink,
  LogOut,
  Building2,
  Lock,
  ArrowLeft
} from 'lucide-react';

export const StudentJobs: React.FC = () => {
  const { logout } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'applications' | 'interviews' | 'notices'>('listings');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchStudentJobsData = async () => {
    try {
      setLoading(true);
      
      // Fetch available jobs (with eligibility indicators parsed on backend)
      const jobsRes = await api.get('/student/jobs');
      setJobs(jobsRes.data.data.jobs || []);

      // Fetch student applications
      const appsRes = await api.get('/student/applications');
      setApplications(appsRes.data.data.applications || []);

      // Fetch interviews
      const interviewsRes = await api.get('/student/interviews');
      setInterviews(interviewsRes.data.data.interviews || []);

      // Fetch eligible notices
      const noticesRes = await api.get('/student/notices');
      setNotices(noticesRes.data.data.notices || []);

    } catch (err) {
      showNotice('Failed to retrieve placement jobs details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentJobsData();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Submit Application
  const handleApply = async (jobId: string) => {
    try {
      await api.post('/student/applications', { jobId });
      showNotice('Application submitted successfully! AI alignment evaluation complete.');
      
      // Refresh lists
      const appsRes = await api.get('/student/applications');
      setApplications(appsRes.data.data.applications || []);
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to submit application', 'error');
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId?._id === jobId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offered':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-455 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-200';
      case 'interviewing':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200';
      case 'shortlisted':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse-slow">Loading Placements Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-450'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/dashboard" className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">CF</Link>
            <span className="font-bold text-base">CareerFlow AI <span className="text-muted-foreground text-xs font-normal">Student Jobs Directory</span></span>
          </div>

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

      {/* Banner */}
      <section className="bg-white dark:bg-slate-900 border-b py-8 text-left">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Active Placement Drives</h2>
            <p className="text-sm text-indigo-650 dark:text-indigo-400 font-semibold">Verify eligibility and apply directly to corporate recruiting drives.</p>
          </div>

          <div className="flex rounded-lg border bg-slate-100/50 dark:bg-slate-900/50 p-1">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'listings' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Jobs Feed ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'applications' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'interviews' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Interview Schedules ({interviews.length})
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'notices' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Notices Board ({notices.length})
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl">
        
        {/* Tab 1: Available Jobs Feed */}
        {activeTab === 'listings' && (
          <div className="space-y-4 text-left">
            {jobs.length > 0 ? (
              jobs.map((job) => {
                const applied = hasApplied(job._id);
                return (
                  <div key={job._id} className="bg-white dark:bg-slate-900 border p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm relative group">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-655 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-50 dark:border-indigo-950/20 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base leading-snug">{job.title}</h4>
                          <p className="text-xs text-muted-foreground">{job.companyId?.name}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-0.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                        <span className="flex items-center gap-0.5"><DollarSign className="h-4 w-4" /> {job.salaryRange || 'N/A'}</span>
                        <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-full capitalize">{job.type}</span>
                      </div>

                      {/* Eligibility Rules */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 border bg-slate-50/50 dark:bg-slate-800/10 rounded">
                          Required GPA: {job.eligibility?.minCgpa || '0'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 border bg-slate-50/50 dark:bg-slate-800/10 rounded">
                          Target branches: {job.eligibility?.allowedBranches?.length > 0 ? job.eligibility.allowedBranches.join(', ') : 'All Branches'}
                        </span>
                      </div>

                      {/* Eligibility error indicator if not eligible */}
                      {!job.isEligible && !applied && (
                        <div className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-450 bg-rose-500/5 p-2 border border-rose-200/50 rounded-lg max-w-md">
                          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{job.ineligibleReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      {applied ? (
                        <span className="inline-flex h-9 items-center gap-1.5 px-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200">
                          <CheckCircle className="h-4 w-4" />
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(job._id)}
                          disabled={!job.isEligible}
                          className="h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-40"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
                <Briefcase className="h-8 w-8 text-slate-300" />
                No active placement openings currently posted. Check back soon!
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Applications Tracker */}
        {activeTab === 'applications' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl text-left space-y-4 shadow-sm">
            <h3 className="font-bold text-base border-b pb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" />
              Your Applications History
            </h3>
            
            <div className="space-y-4">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app._id} className="border p-5 rounded-2xl hover:border-slate-350 dark:hover:border-slate-750 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                    <div className="space-y-2 flex-grow">
                      <div>
                        <h4 className="font-extrabold text-base leading-snug">{app.jobId?.title}</h4>
                        <p className="text-xs text-indigo-650 dark:text-indigo-400 font-semibold">{app.jobId?.companyId?.name} • {app.jobId?.location}</p>
                      </div>

                      {/* Display application evaluation matching if shortlisted/applied */}
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                        <span>AI Score Relevance: {app.aiMatchScore}%</span>
                        <span>•</span>
                        <span>Submitted on: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>

                      {app.feedback && (
                        <p className="text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100/50 dark:border-slate-800/80">
                          <span className="font-bold text-[10px] text-indigo-600 block uppercase tracking-wider mb-0.5">Recruiter Feedback:</span>
                          {app.feedback}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className={`inline-flex px-3.5 py-1.5 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-slate-300" />
                  You have not submitted any job applications yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Interviews agenda */}
        {activeTab === 'interviews' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl text-left space-y-4 shadow-sm">
            <h3 className="font-bold text-base border-b pb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Scheduled Interview Slot Agenda
            </h3>

            <div className="space-y-4">
              {interviews.length > 0 ? (
                interviews.map((int) => (
                  <div key={int._id} className="border p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-350 transition-colors">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-extrabold text-base leading-snug">{int.title}</h4>
                        <p className="text-xs text-indigo-655 dark:text-indigo-400 font-semibold">{int.companyId?.name} • {int.jobId?.title}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-0.5 font-bold"><Calendar className="h-4 w-4 text-indigo-600" /> {new Date(int.date).toLocaleString()}</span>
                        <span>•</span>
                        <span>Duration: {int.duration} mins</span>
                        <span>•</span>
                        <span className="capitalize">{int.type} session</span>
                      </div>

                      {/* Display Meeting Links */}
                      {int.type === 'online' ? (
                        <a
                          href={int.linkOrLocation}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1.5"
                        >
                          Join Meeting Video Link
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <div className="text-xs font-medium text-slate-650 dark:text-slate-300 pt-1.5">
                          <span className="font-bold">Location Venue:</span> {int.linkOrLocation}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 uppercase tracking-widest">
                        {int.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Calendar className="h-8 w-8 text-slate-300" />
                  No upcoming interview slots scheduled.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Notices Board */}
        {activeTab === 'notices' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl text-left space-y-4 shadow-sm">
            <h3 className="font-bold text-base border-b pb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" />
              Eligible Campus Announcements
            </h3>

            <div className="space-y-4">
              {notices.length > 0 ? (
                notices.map((n) => (
                  <div key={n._id} className="border p-5 rounded-2xl flex flex-col justify-between gap-3 text-left">
                    <div>
                      <h4 className="font-extrabold text-base leading-snug">{n.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                        Published by: {n.createdBy?.name || 'Placement Cell'} • {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-wrap">{n.body}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-slate-300" />
                  No announcements matching your branch profile.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
export default StudentJobs;
