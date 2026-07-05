import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import api from '../../config/api';
import { 
  Briefcase, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Award,
  AlertCircle
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [eligibleJobs, setEligibleJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Setup Modal States
  const [setupFirstName, setSetupFirstName] = useState('');
  const [setupLastName, setSetupLastName] = useState('');
  const [setupEnrollment, setSetupEnrollment] = useState('');
  const [setupCourse, setSetupCourse] = useState('');
  const [setupSchool, setSetupSchool] = useState('');
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Helper for capitalization
  const capitalize = (str?: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Populate Setup Modal inputs when student profile is loaded
  useEffect(() => {
    if (studentProfile) {
      const nameParts = (user?.name || '').trim().split(/\s+/);
      const defaultFirst = nameParts[0] || '';
      const defaultLast = nameParts.slice(1).join(' ') || '';

      setSetupFirstName(studentProfile.firstName || defaultFirst);
      setSetupLastName(studentProfile.lastName || defaultLast);
      setSetupEnrollment(studentProfile.enrollmentNumber || '');
      setSetupCourse(studentProfile.course || '');
      setSetupSchool(studentProfile.specialization || '');
    }
  }, [studentProfile, user]);

  const isProfileIncomplete = studentProfile && (
    !studentProfile.course || 
    !studentProfile.specialization ||
    !studentProfile.enrollmentNumber ||
    !studentProfile.firstName ||
    !studentProfile.lastName
  );

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupFirstName.trim()) return setSetupError('First Name is required');
    if (!setupLastName.trim()) return setSetupError('Last Name is required');
    if (!setupEnrollment.trim()) return setSetupError('Enrollment Number is required');
    if (!setupSchool.trim()) return setSetupError('School is required');
    if (!setupCourse.trim()) return setSetupError('Department is required');
    
    const enrollUpper = setupEnrollment.trim().toUpperCase();
    if (!/^[A-Z0-9]{5,25}$/.test(enrollUpper)) {
      return setSetupError('Please enter a valid enrollment number (e.g. ADT23SOCB1571)');
    }

    try {
      setSetupSubmitting(true);
      setSetupError(null);

      const updatedEducation = [...(studentProfile.education || [])];
      const defaultEdu = {
        institution: "My Institution",
        degree: "Degree (UG/PG)",
        fieldOfStudy: setupCourse.trim(),
        startDate: new Date(),
        current: true
      };

      if (updatedEducation.length === 0) {
        updatedEducation.push(defaultEdu);
      } else {
        updatedEducation[0] = {
          ...updatedEducation[0],
          fieldOfStudy: setupCourse.trim()
        };
      }

      const payload = {
        firstName: setupFirstName.trim(),
        lastName: setupLastName.trim(),
        enrollmentNumber: enrollUpper,
        course: setupCourse.trim(),
        specialization: setupSchool.trim(),
        education: updatedEducation
      };

      const res = await api.put('/student/profile', payload);
      setStudentProfile(res.data.data.profile);
      await checkAuth();
      await fetchDashboardData();
    } catch (err: any) {
      setSetupError(err.response?.data?.message || 'Failed to save setup details. Please try again.');
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    if (!user || user.role !== UserRole.STUDENT) return;
    try {
      setLoading(true);
      
      const profileRes = await api.get('/student/profile');
      setStudentProfile(profileRes.data.data.profile);

      const assessRes = await api.get('/assessments');
      setAssessments(assessRes.data.data.assessments || []);

      const jobsRes = await api.get('/student/jobs');
      setEligibleJobs(jobsRes.data.data.jobs || []);

      const appsRes = await api.get('/student/applications');
      setApplications(appsRes.data.data.applications || []);

      const interviewsRes = await api.get('/student/interviews');
      setInterviews(interviewsRes.data.data.interviews || []);

      const offersRes = await api.get('/student/offers').catch(() => ({ data: { data: { offers: [] } } }));
      setOffers(offersRes.data.data.offers || []);

    } catch (err) {
      console.error('Failed to load student dashboard details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Quick Apply handler
  const handleQuickApply = async (jobId: string) => {
    try {
      setApplyingJobId(jobId);
      await api.post('/student/applications', { jobId });
      await fetchDashboardData();
      alert('Application submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplyingJobId(null);
    }
  };

  // Redirect admin roles
  if (user && user.role !== UserRole.STUDENT) {
    return <Navigate to="/officer" replace />;
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Placement Console...</p>
      </div>
    );
  }

  // Get upcoming assessment
  const upcomingAssessment = assessments.find(a => !a.completed);

  return (
    <div className="space-y-8 text-left">
      
      {/* Greeting Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground">Hello, {capitalize(user?.name)} 👋</h1>
            <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Vetted Student</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xxs font-bold text-muted-foreground">
            <span className="bg-secondary/55 px-2.5 py-1 rounded">CGPA: {studentProfile?.education?.[0]?.grade || 'N/A'}</span>
            <span className="bg-secondary/55 px-2.5 py-1 rounded">Course: {studentProfile?.course || 'Computer Science'}</span>
            {studentProfile?.skills?.slice(0, 3).map((s: string) => (
              <span key={s} className="bg-primary/5 text-primary px-2.5 py-1 rounded border border-primary/10">{s}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 flex gap-3">
          <Link
            to="/profile/resume-builder"
            className="h-10 px-5 inline-flex items-center justify-center rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs shadow-sm shadow-accent/10 gap-1.5 transition-transform hover:scale-[1.01]"
          >
            <FileText className="h-4 w-4" />
            Generate Resume
          </Link>
          <Link
            to="/profile"
            className="h-10 px-5 inline-flex items-center justify-center rounded-xl border bg-background hover:bg-secondary text-foreground font-bold text-xs transition-colors"
          >
            Update Profile
          </Link>
        </div>
      </div>

      {/* Grid: 3 metrics counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Eligible count widget */}
        <div 
          onClick={() => navigate('/jobs')}
          className="bg-card text-card-foreground border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-36 cursor-pointer hover:border-primary transition-all relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eligible Opportunities</span>
            <Briefcase className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-primary">{String(eligibleJobs.length).padStart(2, '0')}</span>
              <span className="text-xxs text-muted-foreground font-bold leading-none">Open Drives</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">Positions matching your branch and GPA credentials.</p>
          </div>
        </div>

        {/* Applications Counter */}
        <div 
          onClick={() => navigate('/jobs')}
          className="bg-card text-card-foreground border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-36 cursor-pointer hover:border-primary transition-all relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Applications</span>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-slate-800 dark:text-white">{applications.length}</p>
            <p className="text-xxs text-muted-foreground font-bold">Drives applied</p>
          </div>
        </div>

        {/* Interviews Counter */}
        <div 
          onClick={() => navigate('/interviews')}
          className="bg-card text-card-foreground border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-36 cursor-pointer hover:border-primary transition-all relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interviews</span>
            <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-slate-800 dark:text-white">{interviews.length}</p>
            <p className="text-xxs text-muted-foreground font-bold">Scheduled slots</p>
          </div>
        </div>

        {/* Offers Counter */}
        <div 
          onClick={() => navigate('/offers')}
          className="bg-card text-card-foreground border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-36 cursor-pointer hover:border-primary transition-all relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Offers Released</span>
            <Award className="h-4.5 w-4.5 text-accent" />
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-slate-800 dark:text-white">{offers.length}</p>
            <p className="text-xxs text-muted-foreground font-bold">Job offers</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recommended Jobs Table (Spans 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-secondary/15">
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Recommended Openings</h3>
                <p className="text-[10px] text-muted-foreground">Select openings matching your credentials and skills.</p>
              </div>
              <Link to="/jobs" className="text-xxs font-bold text-primary hover:underline flex items-center gap-0.5">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            {eligibleJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-left">
                  <thead>
                    <tr className="border-b bg-secondary/10 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-6 py-3">Company</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Package</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {eligibleJobs.slice(0, 4).map((job) => {
                      const alreadyApplied = applications.some(app => app.jobId?._id === job._id);
                      return (
                        <tr key={job._id} className="hover:bg-secondary/25 transition-colors">
                          <td className="px-6 py-4 text-foreground font-bold">{job.companyId?.name || 'Company'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{job.title}</td>
                          <td className="px-6 py-4 text-foreground">{job.salaryRange || 'Unspecified'}</td>
                          <td className="px-6 py-4 text-right">
                            {alreadyApplied ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded">Applied</span>
                            ) : (
                              <button
                                disabled={applyingJobId === job._id}
                                onClick={() => handleQuickApply(job._id)}
                                className="px-3 py-1 bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-bold rounded shadow-sm disabled:opacity-50"
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
              <div className="p-8 text-center text-xs text-muted-foreground">
                No active placement recommendations matching your eligibility. Complete your profile details!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Assessment Widget (Spans 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card text-card-foreground border p-5 rounded-2xl shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-accent/5 blur-xl -z-10 rounded-full" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-550 border-b pb-2.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" />
              Upcoming Assessment
            </h3>
            {upcomingAssessment ? (
              <div className="space-y-4 pt-3.5">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {upcomingAssessment.type}
                  </span>
                  <p className="font-bold text-sm text-foreground">{upcomingAssessment.title}</p>
                  <p className="text-xxs text-primary font-bold">{upcomingAssessment.companyId?.name || 'Partner Recruiter'}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-xl space-y-1.5 text-xxs font-bold text-muted-foreground border">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-foreground">{upcomingAssessment.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing:</span>
                    <span className="text-foreground">{upcomingAssessment.passingMarks}% score</span>
                  </div>
                </div>
                <Link
                  to={`/assessments/${upcomingAssessment._id}`}
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-center font-bold text-xs rounded-xl block shadow-sm shadow-primary/10 transition-transform active:scale-95"
                >
                  Start Test
                </Link>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                <p>All pending assessments completed.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {isProfileIncomplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl space-y-6 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/10">CF</div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Complete Profile Setup</h2>
              <p className="text-xxs text-muted-foreground leading-normal">
                Welcome to CareerFlow AI! Please enter your basic details to configure your placement console.
              </p>
            </div>

            {setupError && (
              <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-800 dark:text-rose-450 text-xs leading-snug">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{setupError}</span>
              </div>
            )}

            <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-lg p-2 bg-secondary/10 focus:ring-1 focus:ring-primary focus:outline-none"
                    value={setupFirstName}
                    onChange={e => setSetupFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-lg p-2 bg-secondary/10 focus:ring-1 focus:ring-primary focus:outline-none"
                    value={setupLastName}
                    onChange={e => setSetupLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Enrollment Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ADT23SOCB1571"
                  className="w-full border rounded-lg p-2 bg-secondary/10 focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  value={setupEnrollment}
                  onChange={e => setSetupEnrollment(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">School</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. School of Technology"
                  className="w-full border rounded-lg p-2 bg-secondary/10 focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  value={setupSchool}
                  onChange={e => setSetupSchool(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Department</label>
                <select
                  required
                  className="w-full border rounded-lg p-2 bg-secondary/15 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  value={setupCourse}
                  onChange={e => setSetupCourse(e.target.value)}
                >
                  <option value="">Select Department</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={setupSubmitting}
                className="w-full h-10 inline-flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/10 mt-2 disabled:opacity-50"
              >
                {setupSubmitting ? 'Saving Details...' : 'Save & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default DashboardHome;
