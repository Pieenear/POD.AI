import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';

export const StudentJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
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

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId?._id === jobId);
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

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Placement Drives...</p>
      </div>
    );
  }

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
          <span className="text-[10px] text-muted-foreground">{filteredJobs.length} openings found</span>
        </div>

      </div>

      {/* Drives Table */}
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
                  const applied = hasApplied(job._id);
                  const isEligible = job.isEligible !== false;
                  return (
                    <tr key={job._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{job.companyId?.name || 'Company'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{job.title}</td>
                      <td className="px-6 py-4 text-foreground">{job.salaryRange || 'Unspecified'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(job.deadline).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {isEligible ? (
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">Eligible</span>
                        ) : (
                          <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">Ineligible</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {applied ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-lg">Applied</span>
                        ) : (
                          <button
                            disabled={applyingJobId === job._id || !isEligible}
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

    </div>
  );
};
export default StudentJobs;
