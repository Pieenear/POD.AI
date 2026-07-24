import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';

export const StudentJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'drives'>('jobs');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter States
  const [branchFilter, setBranchFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [eligibilityOnly, setEligibilityOnly] = useState(false);

  const fetchJobsData = async () => {
    try {
      setLoading(true);
      const jobsRes = await api.get('/student/jobs');
      setJobs(jobsRes.data.data.jobs || []);

      const drivesRes = await api.get('/student/drives');
      setDrives(drivesRes.data.data.drives || []);

      const appsRes = await api.get('/student/applications');
      setApplications(appsRes.data.data.applications || []);
    } catch {
      showNotice('Failed to retrieve placement drives.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApply = async (jobId: string) => {
    try {
      setApplyingJobId(jobId);
      await api.post('/student/applications', { jobId });
      showNotice('Application submitted successfully!');
      
      const appsRes = await api.get('/student/applications');
      setApplications(appsRes.data.data.applications || []);
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to apply', 'error');
    } finally {
      setApplyingJobId(null);
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    // Branch Filter (match job eligible branches if present)
    if (branchFilter && job.eligibleBranches && job.eligibleBranches.length > 0) {
      const match = job.eligibleBranches.some((b: string) => b.toLowerCase().includes(branchFilter.toLowerCase()));
      if (!match) return false;
    }
    
    // Package Filter (simple package matching, e.g. parse salary range)
    if (packageFilter) {
      const salaryNum = parseInt(job.salaryRange?.replace(/[^0-9]/g, '') || '0');
      const minSalaryReq = parseInt(packageFilter);
      if (salaryNum && salaryNum < minSalaryReq) return false;
    }

    // Eligibility Only Toggle (filters out jobs where student is not eligible)
    if (eligibilityOnly) {
      // If backend parsed isEligible flag
      if (job.isEligible === false) return false;
    }

    return true;
  });

  const filteredDrives = drives.filter(drive => {
    const job = drive.jobId;
    if (!job) return true;

    // Branch Filter (match job eligible branches if present)
    if (branchFilter && job.eligibility?.allowedBranches && job.eligibility.allowedBranches.length > 0) {
      const match = job.eligibility.allowedBranches.some((b: string) => b.toLowerCase().includes(branchFilter.toLowerCase()));
      if (!match) return false;
    }

    // Eligibility Only Toggle (filters out drives where student is not eligible)
    if (eligibilityOnly) {
      if (drive.isEligible === false) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Placement Drives...</p>
      </div>
    );
  }

  const isProfileIncomplete = jobs.some(job => job.profileIncomplete) || drives.some(drive => drive.profileIncomplete);

  return (
    <div className="space-y-6 text-left max-w-5xl select-none">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-foreground">Placement Opportunities</h2>
        <p className="text-xs text-muted-foreground">List of active corporate recruiting drives matching your department profile.</p>
      </div>

      {isProfileIncomplete && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-amber-800 dark:text-amber-400 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1 text-left">
            <h4 className="font-extrabold text-xs">Profile Setup Incomplete</h4>
            <p className="text-xxs leading-normal font-semibold">
              Please complete your department details, field of study, and CGPA grade under <strong>My Profile</strong>. Eligibility gating cannot be calculated with an incomplete profile.
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border bg-card shadow-xxs grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-xs font-semibold">
        
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-black text-slate-500">Filter by Branch</label>
          <input 
            type="text" 
            placeholder="e.g. CSE" 
            className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs"
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase font-black text-slate-500">Min Package ($k)</label>
          <input 
            type="number" 
            placeholder="e.g. 80" 
            className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs"
            value={packageFilter}
            onChange={e => setPackageFilter(e.target.value)}
          />
        </div>

        {/* Eligibility Only Toggle switch */}
        <div className="flex items-center justify-between sm:pt-4 p-2 rounded-lg bg-secondary/25 border">
          <span className="text-xxs font-bold text-slate-700 dark:text-slate-350">Eligible Only</span>
          <div className="relative inline-flex items-center">
            <input 
              type="checkbox" 
              checked={eligibilityOnly} 
              onChange={() => setEligibilityOnly(!eligibilityOnly)} 
              className="sr-only peer" 
            />
            <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary" />
          </div>
        </div>

        <div className="sm:pt-4 text-right">
          <span className="text-[10px] text-muted-foreground">
            {activeTab === 'jobs' ? `${filteredJobs.length} openings found` : `${filteredDrives.length} drives found`}
          </span>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border rounded-xl bg-secondary/15 p-1 w-64 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-grow py-1.5 rounded-lg transition-colors ${
            activeTab === 'jobs' ? 'bg-card text-foreground shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Job Postings ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('drives')}
          className={`flex-grow py-1.5 rounded-lg transition-colors ${
            activeTab === 'drives' ? 'bg-card text-foreground shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Campus Drives ({filteredDrives.length})
        </button>
      </div>

      {activeTab === 'jobs' ? (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          {filteredJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-left">
                <thead>
                  <tr className="border-b bg-secondary/15 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Package</th>
                    <th className="px-6 py-3.5">Deadline</th>
                    <th className="px-6 py-3.5">Eligibility</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredJobs.map((job) => {
                    const app = applications.find(a => a.jobId?._id === job._id);
                    const isEligible = job.isEligible !== false;
                    return (
                      <tr key={job._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{job.companyId?.name || 'Company'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{job.title}</td>
                        <td className="px-6 py-4 text-foreground">{job.salaryRange || 'Unspecified'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(job.deadline).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          {job.profileIncomplete ? (
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25" title={job.ineligibleReason}>Profile Pending</span>
                          ) : isEligible ? (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">Eligible</span>
                          ) : (
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25" title={job.ineligibleReason}>Ineligible</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {app ? (
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border inline-block ${
                              app.status === 'applied' ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800' :
                              app.status === 'shortlisted' ? 'bg-violet-50 border-violet-250 text-violet-705 dark:bg-violet-950/20 dark:border-violet-900 dark:text-violet-400' :
                              app.status === 'interviewing' ? 'bg-indigo-50 border-indigo-250 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400' :
                              app.status === 'offered' ? 'bg-emerald-50 border-emerald-250 text-emerald-750 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-405' :
                              app.status === 'rejected' ? 'bg-rose-50 border-rose-250 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-450' :
                              'bg-slate-50 border-slate-200 text-slate-700'
                            }`}>
                              {app.status}
                            </span>
                          ) : (
                            <button
                              disabled={applyingJobId === job._id || !isEligible || job.profileIncomplete}
                              onClick={() => handleApply(job._id)}
                              className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-[10px] uppercase rounded-lg shadow-sm disabled:opacity-40 disabled:hover:scale-100 transition-all hover:scale-[1.02]"
                            >
                              Apply
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No active recruitment drives match your filter configurations.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden text-left">
          {filteredDrives.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-left">
                <thead>
                  <tr className="border-b bg-secondary/15 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Job Role</th>
                    <th className="px-6 py-3.5">Drive Date</th>
                    <th className="px-6 py-3.5">Rounds</th>
                    <th className="px-6 py-3.5">Eligibility</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDrives.map((drive) => {
                    const job = drive.jobId;
                    const isEligible = drive.isEligible !== false;
                    return (
                      <tr key={drive._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {drive.companyId?.name || 'Company'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {job?.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {new Date(drive.driveDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-medium">
                          {drive.rounds && drive.rounds.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {drive.rounds.map((round: any, idx: number) => (
                                <span key={idx} className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border">
                                  {round.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {drive.profileIncomplete ? (
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25" title={drive.ineligibleReason}>Profile Pending</span>
                          ) : isEligible ? (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">Eligible</span>
                          ) : (
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25" title={drive.ineligibleReason}>Ineligible</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                            drive.status === 'scheduled' ? 'bg-indigo-50 border-indigo-250 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400' :
                            drive.status === 'ongoing' ? 'bg-amber-50 border-amber-250 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400' :
                            drive.status === 'completed' ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400' :
                            'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800'
                          }`}>
                            {drive.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No campus placement drives scheduled.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default StudentJobs;
