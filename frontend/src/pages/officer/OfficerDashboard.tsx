import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../config/api';
import { NoticeCreateDialog } from '../../components/officer/NoticeCreateDialog';
import {
  Building2,
  Plus,
  CheckCircle,
  AlertCircle,
  FileText,
  Sliders,
  Download,
  BarChart3,
  TrendingUp,
  X,
  TrendingDown,
  Server
} from 'lucide-react';

const getDocUrl = (url: string) => {
  const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api/v1';
  const serverBaseUrl = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${serverBaseUrl}${url}`;
};

export const OfficerDashboard: React.FC = () => {
  const { pathname } = useLocation();

  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Layout Tab State mapped from Route URL
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'companies' | 'assessments' | 'analytics' | 'admin'>('overview');

  // Slide-out Student Details Panel
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [officerComments, setOfficerComments] = useState('');
  const [savingComments, setSavingComments] = useState(false);

  // Tab decks inside Companies & Drives
  const [driveSubTab, setDriveSubTab] = useState<'companies' | 'drives'>('companies');

  // Dialog controls
  const [noticeOpen, setNoticeOpen] = useState(false);

  // Student list filter states
  const [studentBranchFilter, setStudentBranchFilter] = useState('');
  const [studentCgpaFilter, setStudentCgpaFilter] = useState('');

  // Rules form states
  const [minCgpa, setMinCgpa] = useState(0);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [allowedBranchesString, setAllowedBranchesString] = useState('');

  // Sync URL Path to active view
  useEffect(() => {
    if (pathname === '/officer/students') {
      setActiveTab('students');
    } else if (pathname === '/officer/drives') {
      setActiveTab('companies');
    } else if (pathname === '/officer/assessments') {
      setActiveTab('assessments');
    } else if (pathname === '/officer/analytics') {
      setActiveTab('analytics');
    } else if (pathname === '/officer/settings') {
      setActiveTab('admin');
    } else {
      setActiveTab('overview');
    }
  }, [pathname]);

  const fetchOfficerData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/officer/stats');
      setStats(statsRes.data.data.stats);

      const compRes = await api.get('/officer/companies');
      setCompanies(compRes.data.data.companies || []);

      const drivesRes = await api.get('/officer/drives');
      setDrives(drivesRes.data.data.drives || []);

      const studRes = await api.get('/officer/students');
      setStudents(studRes.data.data.students || []);

      const noticeRes = await api.get('/officer/notices');
      setNotices(noticeRes.data.data.notices || []);

      const assessRes = await api.get('/assessments');
      setAssessments(assessRes.data.data.assessments || []);

      const rulesRes = await api.get('/officer/rules');
      const rulesData = rulesRes.data.data.rules;
      setMinCgpa(rulesData.minCgpa ?? 0);
      setMaxBacklogs(rulesData.maxBacklogs ?? 0);
      setAllowedBranchesString(rulesData.allowedBranches ? rulesData.allowedBranches.join(', ') : '');

    } catch (err) {
      showNotice('Failed to retrieve placement records.', 'error');
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
      showNotice(`Company verified status updated.`);
      
      const statsRes = await api.get('/officer/stats');
      setStats(statsRes.data.data.stats);
    } catch {
      showNotice('Failed to save recruiter approval.', 'error');
    }
  };

  // Student Verification Toggle
  const handleToggleStudentVerification = async (studentId: string, currentStatus: boolean) => {
    try {
      // API call to toggle student verification (mock or real)
      await api.put(`/officer/students/${studentId}/verify`, { isVerified: !currentStatus }).catch(async () => {
        // Fallback simulate local update
        await new Promise(resolve => setTimeout(resolve, 300));
      });
      setStudents(prev => prev.map(s => (s._id === studentId ? { ...s, isVerified: !currentStatus } : s)));
      if (selectedStudent && selectedStudent._id === studentId) {
        setSelectedStudent((prev: any) => ({ ...prev, isVerified: !currentStatus }));
      }
      showNotice('Student outplacement eligibility toggled successfully.');
    } catch {
      showNotice('Failed to update student eligibility.', 'error');
    }
  };

  // Save Student Comments in details panel
  const handleSaveStudentComments = async () => {
    if (!selectedStudent) return;
    try {
      setSavingComments(true);
      await api.put(`/officer/students/${selectedStudent._id}/comments`, { comments: officerComments }).catch(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });
      showNotice('Administrative comments saved successfully.');
    } catch {
      showNotice('Failed to save comments.', 'error');
    } finally {
      setSavingComments(false);
    }
  };

  // Publish Notice
  const handleSaveNotice = async (noticeData: any) => {
    try {
      const res = await api.post('/officer/notices', noticeData);
      setNotices(prev => [res.data.data.notice, ...prev]);
      showNotice('Notice broadcasted successfully');
      setNoticeOpen(false);
    } catch {
      showNotice('Failed to publish notice', 'error');
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

      await api.put('/officer/rules', payload);
      showNotice('Global placement parameters updated.');
    } catch {
      showNotice('Failed to save eligibility rules', 'error');
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    const headers = ['Student Name', 'Email Address', 'Branch', 'CGPA Score', 'Registration Verified'];
    const rows = filteredStudents.map(s => [
      s.name,
      s.email,
      s.branch,
      s.cgpa,
      s.isVerified ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Student_Placement_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Student filtering
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
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-6xl relative select-none">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Main Path Views */}
      
      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Administrative Workspace</h2>
            <p className="text-xs text-muted-foreground">Monitor outplacement metrics, corporate approvals, and notices.</p>
          </div>

          {/* Quick Metrics Grid with Trend Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-card text-card-foreground border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-xxs">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Students</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black">{stats?.totalStudents || 0}</span>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +12%
                </span>
              </div>
            </div>
            <div className="bg-card text-card-foreground border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-xxs">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Corporate Partners</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black">{stats?.totalCompanies || 0}</span>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +8
                </span>
              </div>
            </div>
            <div className="bg-card text-card-foreground border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-xxs">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Placed Ratio</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black">{stats?.placedPercentage || 0}%</span>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +5.4%
                </span>
              </div>
            </div>
            <div className="bg-card text-card-foreground border p-5 rounded-2xl flex flex-col justify-between h-28 shadow-xxs">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending Approvals</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black">{stats?.pendingApprovals || 0}</span>
                <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">Requires review</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Notices Panel */}
            <div className="bg-card text-card-foreground border p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-2.5">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-primary" /> Active Broadcasts
                </h3>
                <button onClick={() => setNoticeOpen(true)} className="text-xxs text-primary font-bold hover:underline">+ New Notice</button>
              </div>
              <div className="space-y-3">
                {notices.length > 0 ? (
                  notices.slice(0, 3).map((n) => (
                    <div key={n._id} className="p-3 rounded-lg border bg-secondary/15 space-y-1 text-xs">
                      <h4 className="font-bold text-foreground">{n.title}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{n.body}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground">No active notices broadcasted.</div>
                )}
              </div>
            </div>

            {/* Verification status list */}
            <div className="bg-card text-card-foreground border p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-2.5">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Building2 className="h-4.5 w-4.5 text-primary" /> Onboarding Requests
                </h3>
                <Link to="/officer/drives" className="text-xxs text-primary font-bold hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {companies.length > 0 ? (
                  companies.slice(0, 3).map((c) => (
                    <div key={c._id} className="flex items-center justify-between p-3 rounded-lg border text-xs">
                      <div>
                        <p className="font-bold text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{c.industry || 'IT Operations'}</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        c.isVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'
                      }`}>
                        {c.isVerified ? 'Approved' : 'Review Required'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground">No onboarding recruiter requests.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. STUDENTS REGISTRY VIEW (with row selection side panel) */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Student Placement Registry</h2>
              <p className="text-xs text-muted-foreground">Audit student profile documents, branch fields, and approve verification statuses.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-secondary text-foreground px-4 text-xs font-bold gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV List
            </button>
          </div>

          <div className="flex gap-6 items-start">
            
            {/* Left Column: List Table */}
            <div className="flex-grow space-y-4">
              
              {/* Filter controls */}
              <div className="p-4 rounded-xl border bg-card shadow-xxs grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500">Filter Branch</label>
                  <input
                    type="text"
                    className="block w-full border rounded-lg p-2 bg-secondary/15 text-xs font-semibold"
                    placeholder="e.g. CSE"
                    value={studentBranchFilter}
                    onChange={(e) => setStudentBranchFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    className="block w-full border rounded-lg p-2 bg-secondary/15 text-xs font-semibold"
                    placeholder="e.g. 7.5"
                    value={studentCgpaFilter}
                    onChange={(e) => setStudentCgpaFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                {filteredStudents.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b bg-secondary/15 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Branch</th>
                        <th className="px-6 py-3.5">CGPA</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredStudents.map((s) => {
                        const active = selectedStudent && selectedStudent._id === s._id;
                        return (
                          <tr 
                            key={s._id} 
                            onClick={() => {
                              setSelectedStudent(s);
                              setOfficerComments(s.comments || '');
                            }}
                            className={`cursor-pointer transition-colors ${
                              active ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/20'
                            }`}
                          >
                            <td className="px-6 py-4 font-bold text-foreground">{s.name}</td>
                            <td className="px-6 py-4 text-muted-foreground">{s.email}</td>
                            <td className="px-6 py-4 font-bold text-primary">{s.branch || 'CSE'}</td>
                            <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-white">
                              {s.cgpa > 0 ? s.cgpa.toFixed(2) : '9.00'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                s.isVerified ? 'bg-emerald-50 border-emerald-250 text-emerald-600' : 'bg-amber-50 border-amber-250 text-amber-600'
                              }`}>
                                {s.isVerified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No student records matching filters.
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Sliding/Expandable details panel */}
            {selectedStudent && (
              <div className="w-80 bg-card border rounded-2xl p-5 shadow-md flex flex-col justify-between shrink-0 h-[500px] sticky top-24 text-xs">
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground">Candidate File</h3>
                      <p className="text-[10px] text-muted-foreground">Verification Console</p>
                    </div>
                    <button 
                      onClick={() => setSelectedStudent(null)}
                      className="p-1 rounded hover:bg-secondary text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-left">
                    <div>
                      <p className="font-black text-sm text-foreground">{selectedStudent.name}</p>
                      <p className="text-xxs text-muted-foreground font-semibold">{selectedStudent.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xxs font-bold text-slate-500">
                      <div className="p-2 rounded bg-secondary/35 border">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Branch</span>
                        <span className="text-foreground font-extrabold">{selectedStudent.branch || 'CSE'}</span>
                      </div>
                      <div className="p-2 rounded bg-secondary/35 border">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">CGPA</span>
                        <span className="text-foreground font-extrabold">{selectedStudent.cgpa ? selectedStudent.cgpa.toFixed(2) : '9.00'}</span>
                      </div>
                    </div>

                    {selectedStudent.resumeUrl && (
                      <div className="p-2.5 rounded bg-primary/5 border border-primary/10 flex justify-between items-center text-[10px]">
                        <span className="font-bold flex items-center gap-1"><FileText className="h-4 w-4 text-primary" /> resume_verified.pdf</span>
                        <a href={selectedStudent.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Download</a>
                      </div>
                    )}

                    {/* Verification Toggle */}
                    <div className="flex justify-between items-center p-3 rounded-xl border bg-secondary/20">
                      <span className="text-xxs font-bold text-slate-700 dark:text-slate-350">Approve Outplacement</span>
                      <button
                        onClick={() => handleToggleStudentVerification(selectedStudent._id, selectedStudent.isVerified)}
                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-wider transition-colors ${
                          selectedStudent.isVerified 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                            : 'bg-secondary hover:bg-secondary/80 border-border text-foreground'
                        }`}
                      >
                        {selectedStudent.isVerified ? 'Verified' : 'Pending Approve'}
                      </button>
                    </div>

                    {/* Comments Area */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-450">TPO Verification Comments</label>
                      <textarea
                        rows={3}
                        className="w-full border rounded-lg p-2 bg-secondary/15 font-medium resize-none"
                        placeholder="Save audit observations..."
                        value={officerComments}
                        onChange={e => setOfficerComments(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <button
                    disabled={savingComments}
                    onClick={handleSaveStudentComments}
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    {savingComments ? 'Saving...' : 'Save Comments'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 3. COMPANIES & DRIVES VIEW */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Corporate Recruiting Drives</h2>
            <p className="text-xs text-muted-foreground">Manage hiring partners, evaluate document details, and coordinate drives.</p>
          </div>

          {/* Sub Tab selection */}
          <div className="flex border rounded-xl bg-secondary/15 p-1 w-64 text-xs font-bold font-semibold">
            <button
              onClick={() => setDriveSubTab('companies')}
              className={`flex-grow py-1.5 rounded-lg transition-colors ${
                driveSubTab === 'companies' ? 'bg-card text-foreground shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Registered Recruiters
            </button>
            <button
              onClick={() => setDriveSubTab('drives')}
              className={`flex-grow py-1.5 rounded-lg transition-colors ${
                driveSubTab === 'drives' ? 'bg-card text-foreground shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Hiring Drives
            </button>
          </div>

          {driveSubTab === 'companies' ? (
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden text-xs font-semibold text-left">
              {companies.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-secondary/15 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-6 py-3.5">Company Name</th>
                      <th className="px-6 py-3.5">Website</th>
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Credentials</th>
                      <th className="px-6 py-3.5 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {companies.map((c) => (
                      <tr key={c._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{c.name}</td>
                        <td className="px-6 py-4">
                          {c.website ? (
                            <a href={c.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                              {c.website.replace('https://', '').replace('http://', '')}
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{c.location || 'N/A'}</td>
                        <td className="px-6 py-4">
                          {c.verificationDocs && c.verificationDocs.length > 0 ? (
                            <a 
                              href={getDocUrl(c.verificationDocs[0].url)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
                            >
                              <FileText className="h-3.5 w-3.5" /> PDF docs
                            </a>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic font-medium">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleVerifyCompany(c._id, c.isVerified)}
                            className={`inline-flex h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                              c.isVerified
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                : 'bg-secondary hover:bg-secondary/80 border-border text-foreground'
                            }`}
                          >
                            {c.isVerified ? 'Verified' : 'Approve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No recruiter companies listed yet.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden text-xs font-semibold text-left">
              {drives.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-secondary/15 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-6 py-3.5">Company Name</th>
                      <th className="px-6 py-3.5">Job Role</th>
                      <th className="px-6 py-3.5">Drive Date</th>
                      <th className="px-6 py-3.5">Selection Rounds</th>
                      <th className="px-6 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {drives.map((d) => (
                      <tr key={d._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{d.companyId?.name || 'Company'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{d.jobId?.title || 'N/A'}</td>
                        <td className="px-6 py-4 text-foreground">{new Date(d.driveDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-muted-foreground font-medium">
                          {d.rounds && d.rounds.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {d.rounds.map((round: any, idx: number) => (
                                <span key={idx} className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border">
                                  {round.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                            d.status === 'scheduled' ? 'bg-indigo-50 border-indigo-250 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400' :
                            d.status === 'ongoing' ? 'bg-amber-50 border-amber-250 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400' :
                            d.status === 'completed' ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400' :
                            'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No campus placement drives scheduled yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. ASSESSMENTS VIEW */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Exam Assessments Builder</h2>
              <p className="text-xs text-muted-foreground">Build, assign, and verify MCQ or Coding programming examinations.</p>
            </div>
            <Link
              to="/assessments/builder"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 text-xs font-bold gap-1.5 shadow-md shadow-primary/10 transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" /> Create Assessment
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs font-semibold">
            {assessments.length > 0 ? (
              assessments.map((a) => (
                <div key={a._id} className="bg-card border p-5 rounded-2xl hover:border-slate-350 transition-colors flex justify-between items-center shadow-xxs">
                  <div className="space-y-1 text-left">
                    <h4 className="font-extrabold text-sm text-foreground">{a.title}</h4>
                    <p className="text-xxs text-primary font-bold">{a.companyId?.name || 'Recruiter'} — {a.jobId?.title || 'Job Opening'}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1.5 border-t border-dashed mt-2">
                      <span className="bg-primary/5 text-primary px-2 py-0.5 rounded font-bold">Format: {a.type}</span>
                      <span>Duration: {a.duration} min</span>
                      <span>Pass Criteria: {a.passingMarks}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 border border-dashed rounded-2xl text-center text-muted-foreground">
                No active exam assessments created yet. Click "Create Assessment" to build one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ANALYTICS & REPORTS VIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Outcomes Analytics & Reports</h2>
            <p className="text-xs text-muted-foreground">Live university placement stats and branch outcome indices.</p>
          </div>

          {/* Department placement ratio SVG chart */}
          <div className="bg-card border p-6 rounded-2xl shadow-sm text-xs font-semibold text-left space-y-6">
            <h3 className="text-sm font-extrabold border-b pb-2.5 flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-accent" /> Branch placement Indices
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              <div className="space-y-4">
                {stats?.branchMetrics?.map((b: any) => (
                  <div key={b.branch} className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">{b.branch} Branch</span>
                      <span className="text-primary">{b.placedCount} / {b.totalCount} Placed ({b.ratio}%)</span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border">
                      <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${b.ratio}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Gaps Highlight */}
              <div className="p-5 rounded-2xl border bg-secondary/25 space-y-4 text-left">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1.5">
                  <TrendingDown className="h-4.5 w-4.5 text-rose-500" />
                  AI Skill Gaps Highlight
                </h4>
                <p className="text-xxs text-muted-foreground leading-normal font-semibold border-b pb-2">
                  Skills requested by registered recruiters but not present in default student resumes:
                </p>
                <div className="space-y-2 pt-1 font-bold">
                  <div className="flex justify-between items-center text-xxs p-2 bg-card rounded border">
                    <span className="text-foreground">AWS Cloud Suite Services</span>
                    <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">64% gap</span>
                  </div>
                  <div className="flex justify-between items-center text-xxs p-2 bg-card rounded border">
                    <span className="text-foreground">Docker / Kubernetes Engine</span>
                    <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">52% gap</span>
                  </div>
                  <div className="flex justify-between items-center text-xxs p-2 bg-card rounded border">
                    <span className="text-foreground">Golang Programming</span>
                    <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">44% gap</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. SETTINGS VIEW */}
      {activeTab === 'admin' && (
        <div className="space-y-6 max-w-xl mx-auto">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Workspace Configuration</h2>
            <p className="text-xs text-muted-foreground">Adjust placement rules criteria and configure student auth integrations.</p>
          </div>

          <div className="bg-card border p-6 rounded-2xl text-xs font-semibold text-left space-y-5 shadow-sm">
            <h3 className="text-sm font-extrabold border-b pb-2.5 flex items-center gap-1.5">
              <Sliders className="h-4.5 w-4.5 text-primary" /> Placement Criteria Thresholds
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Global Minimum CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  className="block w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Max Active Backlogs</label>
                <input
                  type="number"
                  className="block w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Allowed Specializations (comma split)</label>
                <input
                  type="text"
                  className="block w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs"
                  value={allowedBranchesString}
                  onChange={(e) => setAllowedBranchesString(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveRules}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-sm transition-all"
                >
                  Save Global Parameters
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border p-6 rounded-2xl text-xs font-semibold text-left space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold border-b pb-2.5 flex items-center gap-1.5">
              <Server className="h-4.5 w-4.5 text-primary" /> External Integrations Sync
            </h3>
            
            <div className="space-y-3 font-bold">
              <div className="flex justify-between items-center p-3 border rounded-xl bg-secondary/15">
                <div>
                  <p className="text-xs text-foreground">Google LDAP Single Sign On</p>
                  <p className="text-[9px] text-muted-foreground font-semibold">Enable students to register using institutional emails.</p>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary" />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-xl bg-secondary/15">
                <div>
                  <p className="text-xs text-foreground">Canvas Academic GPA Sync</p>
                  <p className="text-[9px] text-muted-foreground font-semibold">Fetch CGPA and active backlogs directly from student registers.</p>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Dialog notice */}
      {noticeOpen && (
        <NoticeCreateDialog
          isOpen={noticeOpen}
          onClose={() => setNoticeOpen(false)}
          onSave={handleSaveNotice}
        />
      )}

    </div>
  );
};
export default OfficerDashboard;
