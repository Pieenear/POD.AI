import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import {
  ArrowLeft,
  Save,
  Palette,
  Download,
  Trash2
} from 'lucide-react';

type ResumeTheme = 'minimal-clean' | 'sleek-dark' | 'emerald-executive';

export const ResumeEditor: React.FC = () => {
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ResumeTheme>('minimal-clean');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editable Form fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  
  // Lists
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [educationList, setEducationList] = useState<any[]>([]);
  const [currentEdu, setCurrentEdu] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    description: ''
  });

  const [experienceList, setExperienceList] = useState<any[]>([]);
  const [currentExp, setCurrentExp] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [currentProj, setCurrentProj] = useState({
    title: '',
    description: '',
    technologiesString: '',
    githubLink: '',
    link: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      const data = res.data.data.profile;
      setProfile(data);
      setHeadline(data.headline || '');
      setBio(data.bio || '');
      setSkills(data.skills || []);
      setEducationList(data.education || []);
      setExperienceList(data.experience || []);
      setProjectsList(data.projects || []);
    } catch {
      showNotice('Failed to download student profile.', 'error');
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

  // Add sub-fields helpers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (skills.includes(skillInput.trim())) {
      setSkillInput('');
      return;
    }
    setSkills(prev => [...prev, skillInput.trim()]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleAddEducation = () => {
    if (!currentEdu.institution || !currentEdu.degree) {
      showNotice('Institution and Degree are required.', 'error');
      return;
    }
    setEducationList(prev => [...prev, { ...currentEdu }]);
    setCurrentEdu({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: ''
    });
  };

  const handleRemoveEducation = (idx: number) => {
    setEducationList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddExperience = () => {
    if (!currentExp.company || !currentExp.position) {
      showNotice('Company and Position are required.', 'error');
      return;
    }
    setExperienceList(prev => [...prev, { ...currentExp }]);
    setCurrentExp({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  const handleRemoveExperience = (idx: number) => {
    setExperienceList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddProject = () => {
    if (!currentProj.title || !currentProj.description) {
      showNotice('Title and Description are required.', 'error');
      return;
    }
    const techs = currentProj.technologiesString
      ? currentProj.technologiesString.split(',').map(t => t.trim()).filter(t => t !== '')
      : [];
    setProjectsList(prev => [...prev, { ...currentProj, technologies: techs }]);
    setCurrentProj({
      title: '',
      description: '',
      technologiesString: '',
      githubLink: '',
      link: ''
    });
  };

  const handleRemoveProject = (idx: number) => {
    setProjectsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        headline,
        bio,
        skills,
        education: educationList,
        experience: experienceList,
        projects: projectsList
      };

      await api.put('/student/profile', payload);
      showNotice('Resume configurations saved successfully!');
    } catch {
      showNotice('Failed to update student resume profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-sm font-bold text-muted-foreground">Loading Resume Canvas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col print:bg-white print:p-0">
      
      {/* Print styles overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-canvas, #resume-canvas * {
            visibility: visible;
          }
          #resume-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, section.no-print, div.no-print, button.no-print, form.no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm no-print ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-805' : 'bg-rose-50 border-rose-200 text-rose-805'
        }`}>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md no-print">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/dashboard" className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">CF</Link>
            <span className="font-bold text-base">CareerFlow AI <span className="text-muted-foreground text-xs font-normal">Resume Canvas</span></span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-xs font-bold transition-all gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Profile Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Title Sub Bar */}
      <section className="bg-white dark:bg-slate-900 border-b py-6 text-left no-print">
        <div className="container mx-auto px-6 max-w-6xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Interactive Resume Editor & Stylesheet Builder</h2>
            <p className="text-xs text-muted-foreground">Pre-fill details, choose a formatted layout, and generate a printable PDF resume.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-foreground px-4 text-xs font-bold gap-1.5 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" /> Export PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 text-xs font-bold gap-1.5 transition-all shadow-sm"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </section>

      {/* Main split dashboard view */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 text-left text-xs">
        
        {/* Left Side: Forms input (no-print) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          
          {/* Theme Selector */}
          <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
              <Palette className="h-4 w-4 text-indigo-500" />
              Select Layout Template
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['minimal-clean', 'sleek-dark', 'emerald-executive'] as ResumeTheme[]).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTheme(t)}
                  className={`py-2 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                    selectedTheme === t ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700' : 'hover:bg-slate-50'
                  }`}
                >
                  {t.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Headline and Bio */}
            <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Header Summary</h3>
              
              <div className="space-y-1">
                <label className="font-bold text-[9px] uppercase tracking-wider text-slate-450">Professional Headline</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[9px] uppercase tracking-wider text-slate-450">About / Bio</label>
                <textarea
                  rows={2}
                  className="block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Core Expertise Skills</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="block w-full px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                  placeholder="e.g. Docker"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="h-8.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors font-bold text-xs"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="text-rose-500 hover:text-rose-700 ml-0.5 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Education Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Institution"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs"
                  value={currentEdu.institution}
                  onChange={(e) => setCurrentEdu(prev => ({ ...prev, institution: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Degree"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs"
                  value={currentEdu.degree}
                  onChange={(e) => setCurrentEdu(prev => ({ ...prev, degree: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs"
                  value={currentEdu.fieldOfStudy}
                  onChange={(e) => setCurrentEdu(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="CGPA / Grade"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs"
                  value={currentEdu.grade}
                  onChange={(e) => setCurrentEdu(prev => ({ ...prev, grade: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="h-8 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors font-bold text-xs"
              >
                Add Education Item
              </button>
              {educationList.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-lg text-[10px] leading-none">
                      <span>{edu.degree} — {edu.institution} ({edu.grade})</span>
                      <button type="button" onClick={() => handleRemoveEducation(idx)} className="text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Work Experience</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs"
                  value={currentExp.company}
                  onChange={(e) => setCurrentExp(prev => ({ ...prev, company: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Position"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs"
                  value={currentExp.position}
                  onChange={(e) => setCurrentExp(prev => ({ ...prev, position: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs col-span-2"
                  value={currentExp.location}
                  onChange={(e) => setCurrentExp(prev => ({ ...prev, location: e.target.value }))}
                />
                <textarea
                  rows={2}
                  placeholder="Describe your role"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs col-span-2 resize-none"
                  value={currentExp.description}
                  onChange={(e) => setCurrentExp(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="h-8 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors font-bold text-xs"
              >
                Add Experience Item
              </button>
              {experienceList.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t">
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-lg text-[10px] leading-none">
                      <span>{exp.position} at {exp.company}</span>
                      <button type="button" onClick={() => handleRemoveExperience(idx)} className="text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Key Projects</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Project Title"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs col-span-2"
                  value={currentProj.title}
                  onChange={(e) => setCurrentProj(prev => ({ ...prev, title: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Technologies (comma split)"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs col-span-2"
                  value={currentProj.technologiesString}
                  onChange={(e) => setCurrentProj(prev => ({ ...prev, technologiesString: e.target.value }))}
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  className="block w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs col-span-2 resize-none"
                  value={currentProj.description}
                  onChange={(e) => setCurrentProj(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="h-8 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors font-bold text-xs"
              >
                Add Project Item
              </button>
              {projectsList.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t">
                  {projectsList.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-lg text-[10px] leading-none">
                      <span>{p.title}</span>
                      <button type="button" onClick={() => handleRemoveProject(idx)} className="text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Right Side: LIVE PREVIEW STYLESHEET CANVAS */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border p-8 rounded-2xl shadow-md min-h-[800px] print:border-none print:shadow-none flex flex-col justify-between">
          <div id="resume-canvas" className="space-y-6">
            
            {/* Theme header styling */}
            {selectedTheme === 'minimal-clean' && (
              <div className="space-y-4">
                <div className="border-b pb-4 text-center">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{profile?.userId?.name || 'Candidate Name'}</h1>
                  <p className="text-xs text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1">{headline}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{profile?.userId?.email} • {profile?.portfolio || 'Portfolio link'}</p>
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-550 border-b pb-0.5">Professional Summary</h4>
                  <p className="text-xs leading-relaxed font-medium">{bio}</p>
                </div>
              </div>
            )}

            {selectedTheme === 'sleek-dark' && (
              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-6 rounded-xl text-center space-y-1">
                  <h1 className="text-2xl font-black">{profile?.userId?.name || 'Candidate Name'}</h1>
                  <p className="text-xs text-slate-300 uppercase tracking-widest font-extrabold">{headline}</p>
                  <p className="text-[9px] text-slate-400">{profile?.userId?.email} • {profile?.github || 'GitHub'}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-650 dark:text-indigo-400 border-b pb-0.5">About</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium">{bio}</p>
                </div>
              </div>
            )}

            {selectedTheme === 'emerald-executive' && (
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-600 pl-4 py-1">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{profile?.userId?.name || 'Candidate Name'}</h1>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">{headline}</p>
                  <p className="text-[10px] text-muted-foreground">{profile?.userId?.email} • {profile?.linkedin || 'LinkedIn'}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-705 border-b pb-0.5">Summary</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium">{bio}</p>
                </div>
              </div>
            )}

            {/* Common structured sections */}
            
            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-2">
                <h4 className={`font-extrabold uppercase text-[10px] tracking-wider border-b pb-0.5 ${
                  selectedTheme === 'emerald-executive' ? 'text-emerald-700' : 'text-slate-550'
                }`}>Core Skills & Technical Toolkit</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-800 dark:text-slate-200 font-semibold rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {experienceList.length > 0 && (
              <div className="space-y-3">
                <h4 className={`font-extrabold uppercase text-[10px] tracking-wider border-b pb-0.5 ${
                  selectedTheme === 'emerald-executive' ? 'text-emerald-700' : 'text-slate-550'
                }`}>Professional Work Experience</h4>
                <div className="space-y-4">
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline font-bold text-xs">
                        <span>{exp.position} — <span className="text-indigo-650 dark:text-indigo-400 font-extrabold">{exp.company}</span></span>
                        <span className="text-[10px] text-muted-foreground">{exp.location}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic font-medium">Dates: {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}</p>
                      {exp.description && <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projectsList.length > 0 && (
              <div className="space-y-3">
                <h4 className={`font-extrabold uppercase text-[10px] tracking-wider border-b pb-0.5 ${
                  selectedTheme === 'emerald-executive' ? 'text-emerald-700' : 'text-slate-550'
                }`}>Projects & Open Source Contributions</h4>
                <div className="grid grid-cols-1 gap-4">
                  {projectsList.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline font-bold text-xs">
                        <span>{p.title}</span>
                        {p.githubLink && <span className="text-[10px] text-indigo-600 font-medium lowercase font-mono">{p.githubLink}</span>}
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">{p.description}</p>
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.technologies.map((t: string) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 border font-semibold text-slate-500">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {educationList.length > 0 && (
              <div className="space-y-3">
                <h4 className={`font-extrabold uppercase text-[10px] tracking-wider border-b pb-0.5 ${
                  selectedTheme === 'emerald-executive' ? 'text-emerald-700' : 'text-slate-550'
                }`}>Education History</h4>
                <div className="space-y-3">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline font-bold text-xs">
                        <span>{edu.degree} ({edu.fieldOfStudy})</span>
                        <span className="text-[10px] text-muted-foreground">{edu.grade ? `CGPA: ${edu.grade}` : ''}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="pt-8 border-t border-dashed text-center text-muted-foreground text-[10px] uppercase tracking-wider font-extrabold no-print">
            Generated via CareerFlow AI Printable PDF Stylesheet.
          </div>
        </div>

      </main>
    </div>
  );
};
export default ResumeEditor;
