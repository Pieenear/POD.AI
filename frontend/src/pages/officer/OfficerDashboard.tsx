import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { NoticeCreateDialog } from '../../components/officer/NoticeCreateDialog';
import { AdminUserManagement } from '../../components/officer/AdminUserManagement';
import { UserRole } from '../../context/AuthContext';
import {
  Building2,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Sliders,
  Download,
  Users,
  Check,
  LogOut,
  Clock,
  BarChart3
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'students' | 'notices' | 'rules' | 'admin'>('overview');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dialog controls
  const [noticeOpen, setNoticeOpen] = useState(false);

  // Filter states
  const [studentBranchFilter, setStudentBranchFilter] = useState('');
  const [studentCgpaFilter, setStudentCgpaFilter] = useState('');

  // Rules form states
  const [minCgpa, setMinCgpa] = useState(0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [allowedBranchesString, setAllowedBranchesString] = useState('');

  const fetchOfficerData = async () => {
    try {
      setLoading(true);
      // Stats
      const statsRes = await api.get('/officer/stats');
      setStats(statsRes.data.data.stats);

      // Companies
      const compRes = await api.get('/officer/companies');
      setCompanies(compRes.data.data.companies || []);

      // Students
      const studRes = await api.get('/officer/students');
      setStudents(studRes.data.data.students || []);

      // Notices
      const noticeRes = await api.get('/officer/notices');
      setNotices(noticeRes.data.data.notices || []);

      // Rules
      const rulesRes = await api.get('/officer/rules');
      const rulesData = rulesRes.data.data.rules;
      setRules(rulesData);
      setMinCgpa(rulesData.minCgpa ?? 0);
      setMaxBacklogs(rulesData.maxBacklogs ?? 0);
      setAllowedBranchesString(rulesData.allowedBranches ? rulesData.allowedBranches.join(', ') : '');

    } catch (err) {
      showNotice('Failed to load officer dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Company Verification Approval
  const handleVerifyCompany = async (companyId: string, currentStatus: boolean) => {
    try {
      const res = await api.put(`/officer/companies/${companyId}/verify`, { isVerified: !currentStatus });
      setCompanies(prev => prev.map(c => (c._id === companyId ? res.data.data.company : c)));
      showNotice(`Company verified status set to ${!currentStatus}`);
      
      // Update statistics
      const statsRes = await api.get('/officer/stats');
      setStats(statsRes.data.data.stats);
    } catch {
      showNotice('Failed to update company verification status', 'error');
    }
  };

  // Publish Notice
  const handleSaveNotice = async (noticeData: any) => {
    try {
      const res = await api.post('/officer/notices', noticeData);
      setNotices(prev => [res.data.data.notice, ...prev]);
      showNotice('Notice broadcasted successfully');
    } catch {
      showNotice('Failed to publish notice', 'error');
    }
  };

  // Remove Notice
  const handleRemoveNotice = async (noticeId: string) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    try {
      await api.delete(`/officer/notices/${noticeId}`);
      setNotices(prev => prev.filter(n => n._id !== noticeId));
      showNotice('Notice deleted successfully');
    } catch {
      showNotice('Failed to remove notice', 'error');
    }
  };

  // Save Global Eligibility Rules
  const handleSaveRules = async () => {
    try {
      const parsedBranches = allowedBranchesString
        ? allowedBranchesString.split(',').map(b => b.trim()).filter(b => b !== '')
        : [];
      
      const payload = {
        minCgpa: Number(minCgpa),
        maxBacklogs: Number(maxBacklogs),
        allowedBranches: parsedBranches
      };

      const res = await api.put('/officer/rules', payload);
      setRules(res.data.data.rules);
      showNotice('Global placement rules updated');
    } catch {
      showNotice('Failed to save eligibility rules', 'error');
    }
  };

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    // Define headers and map values
    const headers = ['Student Name', 'Email Address', 'Branch / Major', 'CGPA Score', 'Active Backlogs', 'Registration Verified'];
    const rows = filteredStudents.map(s => [
      s.name,
      s.email,
      s.branch,
      s.cgpa,
      s.backlogs,
      s.isVerified ? 'Yes' : 'No'
    ]);

    // Build comma delimited string
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    // Create browser file trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Student_Placement_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredStudents = students.filter(student => {
    const matchesBranch = studentBranchFilter
      ? student.branch?.toLowerCase().includes(studentBranchFilter.toLowerCase())
      : true;
    const matchesCgpa = studentCgpaFilter
      ? student.cgpa >= parseFloat(studentCgpaFilter)
      : true;
    return matchesBranch && matchesCgpa;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse-slow">Loading Placement Cell Console...</p>
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

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">CF</div>
            <span className="font-bold text-base">CareerFlow AI <span className="text-muted-foreground text-xs font-normal">Placement Officer</span></span>
          </div>

          <div className="flex items-center gap-4">
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

      {/* College Info Section */}
      <section className="bg-white dark:bg-slate-900 border-b py-8 text-left">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">University Placement Console</h2>
            <p className="text-sm text-indigo-650 dark:text-indigo-400 font-semibold">TPO Coordinator Workspace</p>
          </div>

          <div className="flex rounded-lg border bg-slate-100/50 dark:bg-slate-900/50 p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'companies' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Recruiters ({companies.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'students' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Student Registry
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'notices' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Notice Board
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'rules' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Criteria Rules
            </button>
            {(user?.role === UserRole.COLLEGE_ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'admin' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Admin Control
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Contents Panel */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl">
        
        {/* Tab 1: Analytics Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 text-left">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Students</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black">{stats?.totalStudents || 0}</span>
                  <Users className="h-4 w-4 text-indigo-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Corporate Partners</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black">{stats?.totalCompanies || 0}</span>
                  <Building2 className="h-4 w-4 text-violet-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Placed Ratio</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black">{stats?.placedPercentage || 0}%</span>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Verification</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black">{stats?.pendingApprovals || 0}</span>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Placement Announcements */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base border-b pb-2 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Active Notices
                </h3>
                <div className="space-y-3">
                  {notices.length > 0 ? (
                    notices.slice(0, 3).map((n) => (
                      <div key={n._id} className="p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/10 space-y-1">
                        <h4 className="font-bold text-xs">{n.title}</h4>
                        <p className="text-[10px] text-muted-foreground max-w-sm truncate">{n.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground">No active notices published.</div>
                  )}
                </div>
              </div>

              {/* Partner Approvals Status */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base border-b pb-2 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Recruiters Onboarding
                </h3>
                <div className="space-y-3">
                  {companies.length > 0 ? (
                    companies.slice(0, 3).map((c) => (
                      <div key={c._id} className="flex items-center justify-between p-3 rounded-lg border text-xs">
                        <div>
                          <p className="font-bold">{c.name}</p>
                          <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-medium">{c.industry || 'General'}</p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          c.isVerified ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                        }`}>
                          {c.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground">No onboarding recruiters requests.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Department-wise Placement Statistics (SVG analytics chart) */}
            <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-base border-b pb-2 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Department-wise Placement Ratio Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Visual Bar Graph */}
                <div className="space-y-4">
                  {stats?.branchMetrics?.map((m: any) => (
                    <div key={m.branch} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{m.branch} Department</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{m.placedCount} / {m.totalCount} Placed ({m.ratio}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${m.ratio}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* SVG Radial/Donut chart representation */}
                <div className="flex items-center justify-center">
                  <div className="relative h-44 w-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="70"
                        className="stroke-slate-100 dark:stroke-slate-850"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="70"
                        className="stroke-indigo-650"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * (stats?.placedPercentage || 64)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-850 dark:text-white">{stats?.placedPercentage || 64}%</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Placed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Recruiter Management */}
        {activeTab === 'companies' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl text-left space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-bold">Partner Recruiters Registry</h3>
              <p className="text-xs text-muted-foreground">Audit company registration details and manage verification statuses.</p>
            </div>

            <div className="border rounded-xl overflow-hidden bg-background">
              {companies.length > 0 ? (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3">Company Name</th>
                      <th className="px-6 py-3">Website</th>
                      <th className="px-6 py-3">Headquarters</th>
                      <th className="px-6 py-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {companies.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                        <td className="px-6 py-4 font-bold">{c.name}</td>
                        <td className="px-6 py-4">
                          {c.website ? (
                            <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                              {c.website.replace('https://', '').replace('http://', '')}
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">{c.location || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleVerifyCompany(c._id, c.isVerified)}
                            className={`inline-flex h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-extrabold transition-all gap-1 ${
                              c.isVerified
                                ? 'border-emerald-200/50 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450'
                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {c.isVerified ? 'Verified Partner' : 'Approve Company'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
                  <Building2 className="h-8 w-8 text-slate-300" />
                  No recruiters registered yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Student Directory */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl text-left space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold">Student Placement Registry</h3>
                <p className="text-xs text-muted-foreground">Search student records and export rosters for recruiter shortlists.</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-foreground px-3.5 text-xs font-semibold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Filter by Branch / Major
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. CSE"
                  value={studentBranchFilter}
                  onChange={(e) => setStudentBranchFilter(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Filter Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 7.5"
                  value={studentCgpaFilter}
                  onChange={(e) => setStudentCgpaFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden bg-background">
              {filteredStudents.length > 0 ? (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Branch</th>
                      <th className="px-6 py-3">CGPA Score</th>
                      <th className="px-6 py-3 text-right">Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                        <td className="px-6 py-4 font-bold">{s.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{s.email}</td>
                        <td className="px-6 py-4 font-bold text-indigo-650 dark:text-indigo-400">{s.branch}</td>
                        <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-250">
                          {s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {s.resumeUrl ? (
                            <a
                              href={s.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View PDF
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">No Resume Uploaded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
                  <Users className="h-8 w-8 text-slate-300" />
                  No student records match the specified filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Notices Board */}
        {activeTab === 'notices' && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl text-left space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">Placement Announcement Broadcasts</h3>
                <p className="text-xs text-muted-foreground">Manage notice updates and alerts broadcasted across the student panel.</p>
              </div>
              <button
                onClick={() => setNoticeOpen(true)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-xs font-semibold gap-1.5 shadow-sm shadow-indigo-600/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Publish Announcement
              </button>
            </div>

            <div className="space-y-4">
              {notices.length > 0 ? (
                notices.map((n) => (
                  <div key={n._id} className="border p-5 rounded-2xl hover:border-slate-350 dark:hover:border-slate-750 transition-colors flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-extrabold text-base">{n.title}</h4>
                        <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pt-0.5">
                          <span>Audience: {n.targetAudience}</span>
                          <span>•</span>
                          <span>By: {n.createdBy?.name || 'TPO'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-wrap">{n.body}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveNotice(n._id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5">
                  <FileText className="h-8 w-8 text-slate-300" />
                  No announcements published yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Placement Eligibility Rules */}
        {activeTab === 'rules' && (
          <div className="bg-white dark:bg-slate-900 border p-8 rounded-2xl max-w-xl mx-auto text-left space-y-6 shadow-sm">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold flex items-center gap-1.5">
                <Sliders className="h-5 w-5 text-indigo-500" />
                Global Placement Policies
              </h3>
              <p className="text-sm text-muted-foreground">Define criteria limits governing default students registration checks.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Global Minimum CGPA Requirement
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="e.g. 6.00"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Global Max Active Backlogs
                </label>
                <input
                  type="number"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="e.g. 0"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Target Eligible Branches (comma list)
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="e.g. CSE, IT, ECE (leave blank for all)"
                  value={allowedBranchesString}
                  onChange={(e) => setAllowedBranchesString(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveRules}
                  className="h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                >
                  Save Global Rules
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Admin Control User Registry Dashboard */}
        {activeTab === 'admin' && (user?.role === UserRole.COLLEGE_ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
          <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm">
            <AdminUserManagement />
          </div>
        )}
      </main>

      {/* Notice form overlay */}
      <NoticeCreateDialog
        isOpen={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        onSave={handleSaveNotice}
      />
    </div>
  );
};
export default OfficerDashboard;
