import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { JobCreateDialog } from '../../components/employer/JobCreateDialog';
import { DriveCreateDialog } from '../../components/employer/DriveCreateDialog';
import { InterviewSchedulerDialog } from '../../components/employer/InterviewSchedulerDialog';
import { CandidateDetailsDialog } from '../../components/employer/CandidateDetailsDialog';
import {
  Building2,
  Briefcase,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  Globe,
  FileText,
  Clock,
  LogOut,
  Users,
  Upload
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'profile' | 'ats'>('overview');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dialog controls
  const [jobOpen, setJobOpen] = useState(false);
  const [driveOpen, setDriveOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  // ATS tracking states
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [schedulerApp, setSchedulerApp] = useState<any>(null);

  // Form states (Company details)
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [docType, setDocType] = useState<'GST' | 'PAN' | 'Incorporation' | 'Other'>('GST');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      
      // Fetch Company profile
      const compRes = await api.get('/employer/company');
      const compData = compRes.data.data.company;
      setCompany(compData);
      setName(compData.name || '');
      setLogoUrl(compData.logoUrl || '');
      setDescription(compData.description || '');
      setWebsite(compData.website || '');
      setIndustry(compData.industry || '');
      setLocation(compData.location || '');

      // Fetch Jobs
      const jobsRes = await api.get('/employer/jobs');
      setJobs(jobsRes.data.data.jobs || []);

      // Fetch Scheduled Drives
      const drivesRes = await api.get('/employer/drives');
      setDrives(drivesRes.data.data.drives || []);

    } catch (err) {
      showNotice('Failed to load employer workspace details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchApplicationsForJob = async (jobId: string) => {
    if (!jobId) {
      setApplications([]);
      return;
    }
    try {
      const res = await api.get(`/employer/jobs/${jobId}/applications`);
      setApplications(res.data.data.applications || []);
    } catch {
      showNotice('Failed to load applications for this job', 'error');
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: string, commentText: string) => {
    try {
      const res = await api.put(`/employer/applications/${appId}/status`, {
        status,
        comments: commentText
      });
      showNotice(`Application stage updated to ${status}`);
      // Refresh list & current detail viewer
      setApplications(prev => prev.map(a => (a._id === appId ? res.data.data.application : a)));
      setSelectedApp(res.data.data.application);
    } catch {
      showNotice('Failed to progress application stage', 'error');
    }
  };

  const handleSaveInterview = async (interviewData: any) => {
    try {
      await api.post('/employer/interviews', interviewData);
      showNotice('Interview slot scheduled successfully!');
      
      // Update local applications timeline to 'interviewing' stage
      setApplications(prev => prev.map(a => {
        if (a._id === interviewData.applicationId) {
          return {
            ...a,
            status: 'interviewing',
            timeline: [
              ...a.timeline,
              { status: 'interviewing', updatedAt: new Date(), comments: `Interview scheduled: "${interviewData.title}"` }
            ]
          };
        }
        return a;
      }));

      if (selectedApp?._id === interviewData.applicationId) {
        setSelectedApp((prev: any) => ({
          ...prev,
          status: 'interviewing',
          timeline: [
            ...prev.timeline,
            { status: 'interviewing', updatedAt: new Date(), comments: `Interview scheduled: "${interviewData.title}"` }
          ]
        }));
      }
    } catch {
      showNotice('Failed to schedule interview round', 'error');
    }
  };

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('doc', file);
    formData.append('docType', docType);

    try {
      setUploadingDoc(true);
      const res = await api.post('/employer/company/verification-doc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCompany(res.data.data.company);
      showNotice('Verification document uploaded successfully.');
    } catch {
      showNotice('Failed to upload verification document.', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Company Profile Update
  const handleSaveCompany = async () => {
    try {
      const payload = { name, logoUrl, description, website, industry, location };
      const res = await api.put('/employer/company', payload);
      setCompany(res.data.data.company);
      showNotice('Company profile updated successfully');
    } catch {
      showNotice('Failed to save company profile', 'error');
    }
  };

  // Job Listing save
  const handleSaveJob = async (jobData: any) => {
    try {
      if (editingJob !== null) {
        // Update
        const res = await api.put(`/employer/jobs/${editingJob._id}`, jobData);
        setJobs(prev => prev.map(j => (j._id === editingJob._id ? res.data.data.job : j)));
        showNotice('Job listing updated successfully');
      } else {
        // Create
        const res = await api.post('/employer/jobs', jobData);
        setJobs(prev => [res.data.data.job, ...prev]);
        showNotice('Job opening posted successfully');
      }
    } catch {
      showNotice('Failed to save job listing', 'error');
    }
    setEditingJob(null);
  };

  const handleDeactivateJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to close this job listing? Applicants will no longer be accepted.')) return;
    try {
      await api.delete(`/employer/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      showNotice('Job listing closed.');
      
      // Refresh drives list too in case status changed
      const drivesRes = await api.get('/employer/drives');
      setDrives(drivesRes.data.data.drives || []);
    } catch {
      showNotice('Failed to close job listing', 'error');
    }
  };

  // Campus Drive Scheduling
  const handleScheduleDrive = async (driveData: any) => {
    try {
      const res = await api.post('/employer/drives', driveData);
      setDrives(prev => [...prev, res.data.data.drive]);
      showNotice('Campus placement drive scheduled successfully');
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to schedule drive', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse-slow">Loading Employer Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* Toast alert */}
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
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">CF</div>
            <span className="font-bold text-base">CareerFlow AI <span className="text-muted-foreground text-xs font-normal">Recruiter Console</span></span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
              company?.isVerified
                ? 'bg-emerald-500/10 border-emerald-200 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-200 text-amber-600 dark:text-amber-400'
            }`}>
              <Building2 className="h-3.5 w-3.5" />
              <span>{company?.isVerified ? 'Verified Partner' : 'Pending Verification'}</span>
            </div>
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

      {/* Corporate Overview Banner */}
      <section className="bg-white dark:bg-slate-900 border-b py-8">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-850">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{company?.name || 'Recruiter'}</h2>
              <p className="text-sm text-indigo-650 dark:text-indigo-400 font-semibold">{company?.industry || 'Setup Industry Tag'} • {company?.location || 'Add Office Location'}</p>
            </div>
          </div>

          <div className="flex rounded-lg border bg-slate-100/50 dark:bg-slate-900/50 p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Console Home
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'jobs' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Job Postings ({jobs.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('ats');
                if (jobs.length > 0 && !selectedJobId) {
                  setSelectedJobId(jobs[0]._id);
                  fetchApplicationsForJob(jobs[0]._id);
                }
              }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'ats' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Applicants Tracking
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'profile' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Company Details
            </button>
          </div>
        </div>
      </section>

      {/* Main Contents Panel */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl">
        
        {/* Tab 1: Overview Console */}
        {activeTab === 'overview' && (
          <div className="space-y-8 text-left">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Jobs</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black">{jobs.length}</span>
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Campus Drives</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black">{drives.length}</span>
                  <Calendar className="h-5 w-5 text-violet-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Eligibility Gate</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {jobs.some(j => j.eligibility?.minCgpa > 0) ? 'Active GPA Rules' : 'GPA Gates Off'}
                  </span>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Scheduled Campus Drives */}
            <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Upcoming Recruitment Schedules
                </h3>
                <button
                  onClick={() => setDriveOpen(true)}
                  disabled={jobs.length === 0}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                  Schedule Drive
                </button>
              </div>

              <div className="border rounded-xl overflow-hidden bg-background">
                {drives.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3">Scheduled Date</th>
                        <th className="px-6 py-3">Job Listing</th>
                        <th className="px-6 py-3">Rounds Count</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {drives.map((drv) => (
                        <tr key={drv._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                          <td className="px-6 py-4 font-bold text-indigo-650 dark:text-indigo-400">
                            {new Date(drv.driveDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 font-semibold">{drv.jobId?.title || 'Unknown Job Listing'}</td>
                          <td className="px-6 py-4 text-muted-foreground font-medium">{drv.rounds?.length || 1} rounds planned</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 border">
                              {drv.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                    <Clock className="h-8 w-8 text-slate-300" />
                    No campus placement drives scheduled. Click 'Schedule Drive' to plan.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Manage Job Listings */}
        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-6 text-left shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">Active Placement Openings</h3>
                <p className="text-xs text-muted-foreground">Post, modify, and close student placement recruitment details.</p>
              </div>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setJobOpen(true);
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-xs font-semibold gap-1.5 shadow-sm shadow-indigo-600/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Job Posting
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job._id} className="border p-5 rounded-2xl hover:border-slate-350 dark:hover:border-slate-750 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left group relative">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium pt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{job.salaryRange || 'N/A'}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">{job.type}</span>
                        </div>
                      </div>

                      {/* Eligibility summary badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border rounded">
                          Min CGPA: {job.eligibility?.minCgpa || '0'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border rounded">
                          Allowed Branches: {job.eligibility?.allowedBranches?.length > 0 ? job.eligibility.allowedBranches.join(', ') : 'All Branches'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border rounded">
                          Max Backlogs: {job.eligibility?.maxBacklogs ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setEditingJob(job);
                          setJobOpen(true);
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 text-xs font-semibold gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeactivateJob(job._id)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-3 text-xs font-semibold gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Close Post
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl flex flex-col items-center justify-center gap-1">
                  <FileText className="h-8 w-8 text-slate-300" />
                  No jobs posted yet. Click 'Add Job Posting' to add.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Company Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 border p-8 rounded-2xl max-w-2xl mx-auto text-left space-y-6 shadow-sm">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold">Company Profile Settings</h3>
              <p className="text-sm text-muted-foreground">Setup details displayed to student applicants and placementsCells officers.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    placeholder="e.g. Google LLC"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Industry
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    placeholder="e.g. Technology / Software"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Website URL
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Globe className="h-4 w-4" />
                    </div>
                    <input
                      type="url"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      placeholder="https://company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Headquarters Location
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                      placeholder="e.g. New York, NY"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Logo Image URL
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="https://images.company.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Company Description
                </label>
                <textarea
                  rows={5}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none"
                  placeholder="Detail your corporate goals, values, and student growth opportunities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCompany}
                  className="h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                >
                  Save Company Details
                </button>
              </div>
            </div>
            
            {/* Corporate Verification Section */}
            <div className="bg-white dark:bg-slate-900 border p-8 rounded-2xl max-w-2xl mx-auto text-left space-y-6 shadow-sm mt-6">
              <div className="border-b pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Corporate Verification Credentials</h3>
                  <p className="text-xs text-muted-foreground">Upload incorporation certificates or tax forms (GST/PAN) to obtain verified partner status.</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                  company?.isVerified 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-250 dark:bg-emerald-950/20' 
                    : 'bg-amber-50 text-amber-600 border-amber-250 dark:bg-amber-950/20'
                }`}>
                  {company?.isVerified ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified Partner
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Pending Approval
                    </>
                  )}
                </span>
              </div>

              {/* Upload Document Form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Select Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                  >
                    <option value="GST">GST Registration Certificate</option>
                    <option value="PAN">PAN Card Statement</option>
                    <option value="Incorporation">Incorporation Certificate</option>
                    <option value="Other">Other Identification Docs</option>
                  </select>
                </div>

                <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/40 dark:bg-slate-900/5 hover:bg-slate-50 transition-colors relative group">
                  <input
                    type="file"
                    disabled={uploadingDoc}
                    onChange={handleUploadDoc}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-650 flex items-center justify-center mb-3">
                    {uploadingDoc ? <Clock className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold">{uploadingDoc ? 'Uploading...' : 'Click to Upload Document File'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">PDF, PNG, or JPG (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs">Uploaded Verification Documents</h4>
                <div className="border rounded-xl bg-background overflow-hidden">
                  {company?.verificationDocs && company.verificationDocs.length > 0 ? (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-[9px] uppercase font-bold text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2">Doc Type</th>
                          <th className="px-4 py-2">File Name</th>
                          <th className="px-4 py-2">Uploaded At</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {company.verificationDocs.map((doc: any, index: number) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                            <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{doc.docType}</td>
                            <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{doc.fileName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={`http://localhost:5000${doc.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-850/70 dark:hover:bg-slate-800 px-2.5 text-[10px] font-bold text-slate-700 dark:text-slate-250 gap-0.5"
                              >
                                View doc
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-[10px] text-muted-foreground">No verification documents uploaded.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: ATS */}
        {activeTab === 'ats' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl text-left space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold">Applicant Tracking System (ATS)</h3>
                <p className="text-xs text-muted-foreground">Select a job listing to view and evaluate matches sorted by AI alignment scores.</p>
              </div>

              <div className="w-full sm:w-64">
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    fetchApplicationsForJob(e.target.value);
                  }}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Select Active Job Listing --</option>
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>{j.title} ({j.location})</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedJobId ? (
              <div className="border rounded-xl overflow-hidden bg-background">
                {applications.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3">Applicant Name</th>
                        <th className="px-6 py-3">Email Address</th>
                        <th className="px-6 py-3 text-center">AI Match Score</th>
                        <th className="px-6 py-3 text-center">Current Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                          <td className="px-6 py-4 font-bold">{app.studentId?.name}</td>
                          <td className="px-6 py-4 text-slate-500">{app.studentId?.email}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              app.aiMatchScore >= 80
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-150 dark:bg-emerald-950/20'
                                : app.aiMatchScore >= 60
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-150 dark:bg-indigo-950/20'
                                : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/10'
                            }`}>
                              {app.aiMatchScore}% Match
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center capitalize font-bold text-slate-600 dark:text-slate-350">
                            {app.status}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setDetailOpen(true);
                              }}
                              className="h-7 px-3 border hover:bg-muted rounded-md text-[10px] font-bold transition-colors inline-flex items-center gap-0.5"
                            >
                              Evaluate Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                    <Users className="h-8 w-8 text-slate-300" />
                    No candidates have applied to this job listing yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5">
                <Briefcase className="h-8 w-8 text-slate-300" />
                Select a job from the dropdown above to manage applicant rosters.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <JobCreateDialog
        isOpen={jobOpen}
        onClose={() => setJobOpen(false)}
        onSave={handleSaveJob}
        initialData={editingJob}
      />
      <DriveCreateDialog
        isOpen={driveOpen}
        onClose={() => setDriveOpen(false)}
        onSave={handleScheduleDrive}
        jobs={jobs}
      />
      <CandidateDetailsDialog
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        application={selectedApp}
        onUpdateStatus={handleUpdateApplicationStatus}
        onTriggerSchedule={(app) => {
          setSchedulerApp(app);
          setSchedulerOpen(true);
        }}
      />
      <InterviewSchedulerDialog
        isOpen={schedulerOpen}
        onClose={() => setSchedulerOpen(false)}
        onSave={handleSaveInterview}
        application={schedulerApp}
      />
    </div>
  );
};
export default EmployerDashboard;
