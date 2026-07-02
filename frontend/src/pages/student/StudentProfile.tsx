import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { EducationDialog } from '../../components/student/EducationDialog';
import { ExperienceDialog } from '../../components/student/ExperienceDialog';
import { ProjectDialog } from '../../components/student/ProjectDialog';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  FileText,
  Cpu,
  Globe,
  Plus,
  Trash2,
  Edit,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const StudentProfile: React.FC = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'ai'>('profile');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dialog states
  const [eduOpen, setEduOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);

  // Active item to edit
  const [editingEdu, setEditingEdu] = useState<any>(null);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [editingProj, setEditingProj] = useState<any>(null);

  // Form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skillInput, setSkillInput] = useState('');
  
  // Links
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [codeforces, setCodeforces] = useState('');

  // Resume Upload
  const [uploadingResume, setUploadingResume] = useState(false);

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      const data = res.data.data.profile;
      setProfile(data);
      setHeadline(data.headline || '');
      setBio(data.bio || '');
      setGithub(data.github || '');
      setLinkedin(data.linkedin || '');
      setPortfolio(data.portfolio || '');
      setLeetcode(data.codingProfiles?.leetcode || '');
      setCodeforces(data.codingProfiles?.codeforces || '');
    } catch (err) {
      showNotice('Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Profile Save
  const handleSaveProfileText = async () => {
    try {
      const payload = {
        headline,
        bio,
        github,
        linkedin,
        portfolio,
        codingProfiles: { leetcode, codeforces }
      };
      const res = await api.put('/student/profile', payload);
      setProfile(res.data.data.profile);
      showNotice('Profile texts saved successfully');
    } catch {
      showNotice('Failed to update profile text', 'error');
    }
  };

  // Skill Tags Manager
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const tag = skillInput.trim();
    if (profile.skills.includes(tag)) {
      setSkillInput('');
      return;
    }
    const updatedSkills = [...profile.skills, tag];
    try {
      const res = await api.put('/student/profile', { skills: updatedSkills });
      setProfile(res.data.data.profile);
      setSkillInput('');
      showNotice(`Added skill: ${tag}`);
    } catch {
      showNotice('Failed to add skill', 'error');
    }
  };

  const handleRemoveSkill = async (tag: string) => {
    const updatedSkills = profile.skills.filter((s: string) => s !== tag);
    try {
      const res = await api.put('/student/profile', { skills: updatedSkills });
      setProfile(res.data.data.profile);
      showNotice(`Removed skill: ${tag}`);
    } catch {
      showNotice('Failed to remove skill', 'error');
    }
  };

  // Education CRUD
  const saveEducation = async (formData: any) => {
    let updatedEdu = [...profile.education];
    if (editingEdu !== null) {
      updatedEdu = updatedEdu.map((edu, idx) => (idx === editingEdu ? formData : edu));
    } else {
      updatedEdu.push(formData);
    }

    try {
      const res = await api.put('/student/profile', { education: updatedEdu });
      setProfile(res.data.data.profile);
      showNotice('Education list saved successfully');
    } catch {
      showNotice('Failed to update education details', 'error');
    }
    setEditingEdu(null);
  };

  const removeEducation = async (index: number) => {
    const updatedEdu = profile.education.filter((_: any, idx: number) => idx !== index);
    try {
      const res = await api.put('/student/profile', { education: updatedEdu });
      setProfile(res.data.data.profile);
      showNotice('Education credential deleted');
    } catch {
      showNotice('Failed to remove education credential', 'error');
    }
  };

  // Experience CRUD
  const saveExperience = async (formData: any) => {
    let updatedExp = [...profile.experience];
    if (editingExp !== null) {
      updatedExp = updatedExp.map((exp, idx) => (idx === editingExp ? formData : exp));
    } else {
      updatedExp.push(formData);
    }

    try {
      const res = await api.put('/student/profile', { experience: updatedExp });
      setProfile(res.data.data.profile);
      showNotice('Experience history updated');
    } catch {
      showNotice('Failed to update experience details', 'error');
    }
    setEditingExp(null);
  };

  const removeExperience = async (index: number) => {
    const updatedExp = profile.experience.filter((_: any, idx: number) => idx !== index);
    try {
      const res = await api.put('/student/profile', { experience: updatedExp });
      setProfile(res.data.data.profile);
      showNotice('Experience item deleted');
    } catch {
      showNotice('Failed to delete experience item', 'error');
    }
  };

  // Projects CRUD
  const saveProject = async (formData: any) => {
    let updatedProj = [...profile.projects];
    if (editingProj !== null) {
      updatedProj = updatedProj.map((p, idx) => (idx === editingProj ? formData : p));
    } else {
      updatedProj.push(formData);
    }

    try {
      const res = await api.put('/student/profile', { projects: updatedProj });
      setProfile(res.data.data.profile);
      showNotice('Software project updated');
    } catch {
      showNotice('Failed to update projects list', 'error');
    }
    setEditingProj(null);
  };

  const removeProject = async (index: number) => {
    const updatedProj = profile.projects.filter((_: any, idx: number) => idx !== index);
    try {
      const res = await api.put('/student/profile', { projects: updatedProj });
      setProfile(res.data.data.profile);
      showNotice('Project deleted successfully');
    } catch {
      showNotice('Failed to remove project', 'error');
    }
  };

  // Resume Upload handler
  const handleUploadResumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    try {
      const res = await api.post('/student/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data.data.profile);
      showNotice('New resume version uploaded and analyzed.');
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to upload resume file', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  // Explicit AI review request
  const handleTriggerAiScan = async () => {
    try {
      showNotice('Requesting AI assessment...');
      const res = await api.post('/student/resume/ai-score');
      setProfile((prev: any) => ({
        ...prev,
        aiReview: res.data.data.aiReview
      }));
      showNotice('AI assessment completed.');
    } catch {
      showNotice('AI score computation failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse-slow">Loading Student Profile...</p>
        </div>
      </div>
    );
  }

  // AI Circular gauge variables
  const aiScore = profile.aiReview?.score || 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (aiScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* Notifications Alert Bar */}
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
            <span className="font-bold text-base">CareerFlow AI <span className="text-muted-foreground text-xs font-normal">Student Portal</span></span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3 text-sm font-medium transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Profile Overview Banner */}
      <section className="bg-white dark:bg-slate-900 border-b py-8">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black border border-indigo-200/50 dark:border-indigo-800/40">
              {profile.bio ? profile.bio.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{profile.bio || 'Your Name'}</h2>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{profile.headline || 'Add a professional headline'}</p>
            </div>
          </div>

          <div className="flex rounded-lg border bg-slate-100/50 dark:bg-slate-900/50 p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'profile' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'resume' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Resume versions ({profile.resumeVersions.length})
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ai' ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              AI Coach
              {profile.aiReview && (
                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {aiScore}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl">
        
        {/* Tab 1: Profile Info Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Left Column: Metadata Inputs */}
            <div className="space-y-6">
              
              {/* Text Area Card */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base border-b pb-2">Profile Text</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Headline</label>
                    <input
                      type="text"
                      className="block w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Computer Science Student at College"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Bio / Name</label>
                    <input
                      type="text"
                      className="block w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Your name or brief statement"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveProfileText}
                  className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                >
                  Save Text Details
                </button>
              </div>

              {/* Skills Tags Card */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base border-b pb-2">Skills</h3>
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Add new skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border rounded-full group hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-muted-foreground group-hover:text-rose-500 transition-colors"
                        >
                          <ChevronRight className="h-3 w-3 rotate-45" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Social Channels Card */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base border-b pb-2">Social Channels</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GithubIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="url"
                      className="block w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="GitHub Link"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="url"
                      className="block w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="LinkedIn Link"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="url"
                      className="block w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Portfolio Link"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground w-4">LC</span>
                    <input
                      type="url"
                      className="block w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="LeetCode Link"
                      value={leetcode}
                      onChange={(e) => setLeetcode(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground w-4">CF</span>
                    <input
                      type="url"
                      className="block w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Codeforces Link"
                      value={codeforces}
                      onChange={(e) => setCodeforces(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveProfileText}
                  className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                >
                  Save Social Channels
                </button>
              </div>

            </div>

            {/* Right Column: Timelines and details */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Education Timeline */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    Education
                  </h3>
                  <button
                    onClick={() => {
                      setEditingEdu(null);
                      setEduOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
                
                <div className="space-y-4">
                  {profile.education.length > 0 ? (
                    profile.education.map((edu: any, index: number) => (
                      <div key={index} className="flex justify-between items-start py-3 border-b last:border-0 group">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm">{edu.institution}</h4>
                          <p className="text-xs text-muted-foreground">
                            {edu.degree} in {edu.fieldOfStudy} • Grade: {edu.grade || 'N/A'}
                          </p>
                          <span className="text-[10px] text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold">
                            {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                          </span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingEdu(index);
                              setEduOpen(true);
                            }}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeEducation(index)}
                            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">Add your schools and degree specifications.</p>
                  )}
                </div>
              </div>

              {/* Experience Timeline */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-indigo-500" />
                    Experience / Internships
                  </h3>
                  <button
                    onClick={() => {
                      setEditingExp(null);
                      setExpOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
                
                <div className="space-y-6">
                  {profile.experience.length > 0 ? (
                    profile.experience.map((exp: any, index: number) => (
                      <div key={index} className="flex gap-4 items-start py-4 border-b last:border-0 group text-left">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="flex-grow space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm">{exp.position}</h4>
                              <p className="text-xs text-muted-foreground font-medium">{exp.company} • {exp.location || 'Remote'}</p>
                            </div>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingExp(index);
                                  setExpOpen(true);
                                }}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850"
                              >
                               <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => removeExperience(index)}
                                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                            {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -{' '}
                            {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}
                          </span>
                          
                          {exp.description && (
                            <p className="text-xs text-muted-foreground font-normal leading-relaxed pl-1 border-l-2">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">Add previous internships or open-source activities.</p>
                  )}
                </div>
              </div>

              {/* Projects Grid */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Code className="h-4 w-4 text-indigo-500" />
                    Projects
                  </h3>
                  <button
                    onClick={() => {
                      setEditingProj(null);
                      setProjOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.projects.length > 0 ? (
                    profile.projects.map((p: any, index: number) => (
                      <div key={index} className="border p-4 rounded-xl flex flex-col justify-between h-44 hover:border-slate-350 dark:hover:border-slate-700 transition-colors group relative text-left">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 pr-6">{p.title}</h4>
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingProj(index);
                                  setProjOpen(true);
                                }}
                                className="p-1 rounded bg-background border hover:bg-muted text-slate-500"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => removeProject(index)}
                                className="p-1 rounded bg-background border hover:bg-rose-50 hover:text-rose-500 text-slate-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.description}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {p.technologies.slice(0, 3).map((t: string) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                {t}
                              </span>
                            ))}
                            {p.technologies.length > 3 && (
                              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">+{p.technologies.length - 3} more</span>
                            )}
                          </div>
                          
                          <div className="flex gap-3 text-xs font-bold pt-1.5 border-t">
                            {p.githubLink && (
                              <a href={p.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-500">
                                <GithubIcon className="h-3.5 w-3.5" />
                                Code
                              </a>
                            )}
                            {p.link && (
                              <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2 col-span-2">Enter your projects list.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Resume versions Hub Tab */}
        {activeTab === 'resume' && (
          <div className="bg-white dark:bg-slate-900 border p-8 rounded-2xl max-w-3xl mx-auto text-left space-y-8 shadow-sm">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold">Resume Version Manager</h3>
              <p className="text-sm text-muted-foreground">Upload your latest PDF CV drafts to version history. The AI scores every upload.</p>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/35 transition-colors group relative">
              <input
                type="file"
                accept=".pdf"
                disabled={uploadingResume}
                onChange={handleUploadResumeFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {uploadingResume ? <Clock className="h-6 w-6 animate-spin text-indigo-600" /> : <Upload className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">{uploadingResume ? 'Processing Resume...' : 'Click to Upload Resume'}</p>
                <p className="text-xs text-muted-foreground">Supported format: PDF only (Max 5MB)</p>
              </div>
            </div>

            {/* Version History Table */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm">Upload History</h4>
              
              <div className="border rounded-xl overflow-hidden bg-background">
                {profile.resumeVersions.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3">Ver</th>
                        <th className="px-6 py-3">File Name</th>
                        <th className="px-6 py-3">Uploaded At</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {profile.resumeVersions.map((ver: any) => (
                        <tr key={ver.versionNumber} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                          <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">v{ver.versionNumber}</td>
                          <td className="px-6 py-4 font-medium flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="line-clamp-1">{ver.fileName}</span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(ver.uploadedAt).toLocaleDateString()} at {new Date(ver.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={`http://localhost:5000${ver.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-lg border hover:bg-muted px-3 text-xs font-semibold gap-1 text-slate-700 dark:text-slate-300"
                            >
                              Open file
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
                    <FileText className="h-8 w-8 text-slate-300 mb-2" />
                    No files uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Resume Coach Tab */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Left Gauge Box */}
            <div className="bg-white dark:bg-slate-900 border p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">AI Profile Rating</span>
              
              {/* Circular Gauge */}
              <div className="relative h-32 w-32 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black">{aiScore}</span>
                  <span className="text-[10px] text-muted-foreground font-bold">out of 100</span>
                </div>
              </div>

              <div className="space-y-4 w-full">
                <div className="flex justify-between items-center py-2 border-b text-xs font-semibold">
                  <span className="text-slate-500">Grammar:</span>
                  <span className="text-indigo-650 dark:text-indigo-400">{profile.aiReview?.grammarRating || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b text-xs font-semibold">
                  <span className="text-slate-500">Formatting:</span>
                  <span className="text-indigo-650 dark:text-indigo-400">{profile.aiReview?.formattingRating || 'N/A'}</span>
                </div>
                <button
                  onClick={handleTriggerAiScan}
                  className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                >
                  Recalculate AI Rating
                </button>
              </div>
            </div>

            {/* Right Audit Details Box */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Recommendations */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base border-b pb-2 text-indigo-650 dark:text-indigo-400">Actionable Suggestions</h3>
                <ul className="space-y-3">
                  {profile.aiReview?.suggestions && profile.aiReview.suggestions.length > 0 ? (
                    profile.aiReview.suggestions.map((s: string, idx: number) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-350">
                        <AlertCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      All checks passed. Profile is structurally complete!
                    </li>
                  )}
                </ul>
              </div>

              {/* Keywords */}
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-base border-b pb-2">Matching Keywords to Add</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Recruiters run searches filtering for specific tools. Consider adding these keywords to your resume context:
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.aiReview?.keywordMatch && profile.aiReview.keywordMatch.length > 0 ? (
                    profile.aiReview.keywordMatch.map((kw: string) => (
                      <span key={kw} className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-300 rounded-lg">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No matches suggested. Update profile to get suggestions.</span>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Dialog Modals */}
      <EducationDialog
        isOpen={eduOpen}
        onClose={() => setEduOpen(false)}
        onSave={saveEducation}
        initialData={editingEdu !== null ? profile.education[editingEdu] : null}
      />
      <ExperienceDialog
        isOpen={expOpen}
        onClose={() => setExpOpen(false)}
        onSave={saveExperience}
        initialData={editingExp !== null ? profile.experience[editingExp] : null}
      />
      <ProjectDialog
        isOpen={projOpen}
        onClose={() => setProjOpen(false)}
        onSave={saveProject}
        initialData={editingProj !== null ? profile.projects[editingProj] : null}
      />
    </div>
  );
};
export default StudentProfile;
