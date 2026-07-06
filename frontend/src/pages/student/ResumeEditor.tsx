import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';
import { EducationDialog } from '../../components/student/EducationDialog';
import { ExperienceDialog } from '../../components/student/ExperienceDialog';
import { ProjectDialog } from '../../components/student/ProjectDialog';
import {
  User,
  GraduationCap,
  Code,
  FileText,
  Plus,
  Trash2,
  Edit,
  Upload,
  AlertCircle,
  CheckCircle,
  Award,
  X,
  Paperclip,
  Users,
  Briefcase,
  BookOpen,
  Shield,
  Info,
  UserCheck,
  FileSignature,
  Palette,
  Download,
  Eye,
  Save
} from 'lucide-react';

type ResumeTheme = 'minimal-clean' | 'sleek-dark' | 'emerald-executive';

// Custom Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between py-1.5 cursor-pointer">
    <span className="text-xs font-semibold text-slate-700 dark:text-slate-355">{label}</span>
    <div className="relative inline-flex items-center">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-9 h-5 bg-secondary/75 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
    </div>
  </label>
);

export const ResumeEditor: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ResumeTheme>('minimal-clean');

  // Toggle options for sections to include in resume
  const [generateFields, setGenerateFields] = useState({
    profilePicture: true,
    briefSummary: true,
    contactDetails: true,
    keyExpertise: true,
    education: true,
    awards: true,
    internship: true,
    project: true,
    achievements: true,
    certification: true
  });

  // Vertical Navigation Tabs (15 categories + 1 preview canvas)
  const [activeTab, setActiveTab] = useState<
    | 'basic'
    | 'contact'
    | 'family'
    | 'education'
    | 'attachments'
    | 'experience'
    | 'internship'
    | 'projects'
    | 'publications'
    | 'seminars'
    | 'certifications'
    | 'responsibility'
    | 'other_details'
    | 'references'
    | 'placement_policy'
    | 'preview'
  >('basic');

  // Dialog controls
  const [eduOpen, setEduOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);

  const [editingEdu, setEditingEdu] = useState<any>(null);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [editingProj, setEditingProj] = useState<any>(null);
  const [expandedSemEdu, setExpandedSemEdu] = useState<number[]>([]);

  // Basic Info Form States
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [photo, setPhoto] = useState('');
  
  // Contact States
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');

  // Family Details States
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');

  // Projects & Publications tab states
  const [publicationsText, setPublicationsText] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Skills & Development tab states
  const [skillInput, setSkillInput] = useState('');
  const [certificationsText, setCertificationsText] = useState('');
  const [responsibilityText, setResponsibilityText] = useState('');
  const [seminarsText, setSeminarsText] = useState('');

  // Documents & Policy tab states
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [referencesText, setReferencesText] = useState('');
  const [otherDetailsText, setOtherDetailsText] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      const data = res.data.data.profile;
      setProfile(data);

      setEnrollmentNumber(data.enrollmentNumber || '');
      setFirstName(data.firstName || '');
      setMiddleName(data.middleName || '');
      setLastName(data.lastName || '');
      setCourse(data.course || '');
      setSpecialization(data.specialization || '');
      setGender(data.gender || '');
      if (data.dob) {
        setDob(new Date(data.dob).toISOString().split('T')[0]);
      } else {
        setDob('');
      }
      setBloodGroup(data.bloodGroup || '');
      setMaritalStatus(data.maritalStatus || '');
      setMedicalHistory(data.medicalHistory || '');
      setPhoto(data.photo || '');

      setPhone(data.contactDetails?.phone || '');
      setAltPhone(data.contactDetails?.altPhone || '');
      setAddress(data.contactDetails?.address || '');
      setCity(data.contactDetails?.city || '');
      setStateName(data.contactDetails?.state || '');
      setZip(data.contactDetails?.zip || '');

      setFatherName(data.familyDetails?.fatherName || '');
      setMotherName(data.familyDetails?.motherName || '');

      setGithub(data.github || '');
      setLinkedin(data.linkedin || '');
      setPortfolio(data.portfolio || '');
      setPublicationsText(data.bio || '');

      const certNames = data.certifications?.map((c: any) => typeof c === 'object' && c !== null ? c.name : c) || [];
      setCertificationsText(certNames.join(', ') || '');
      setResponsibilityText(data.positionsOfResponsibility?.join(', ') || '');
      setReferencesText(data.references || '');
      setSeminarsText(data.seminars || '');
      setOtherDetailsText(data.otherDetails || '');
      setPolicyAgreed(data.policyAgreed || false);

    } catch (err) {
      showNotice('Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleToggle = (key: keyof typeof generateFields) => {
    setGenerateFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const capitalize = (str?: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const candidateName = profile
    ? capitalize(`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile?.userId?.name)
    : 'Candidate Name';

  // Save Handlers per Tab
  const handleSaveBasicSection = async (type: 'basic' | 'contact' | 'family') => {
    try {
      const payload = {
        enrollmentNumber,
        firstName,
        middleName,
        lastName,
        course,
        specialization,
        gender,
        dob: dob ? new Date(dob) : undefined,
        bloodGroup,
        maritalStatus,
        medicalHistory,
        photo,
        contactDetails: { phone, altPhone, address, city, state: stateName, zip },
        familyDetails: { fatherName, motherName }
      };
      const res = await api.put('/student/profile', payload);
      setProfile(res.data.data.profile);
      const label = type === 'basic' ? 'Basic details' : type === 'contact' ? 'Contact details' : 'Family details';
      showNotice(`${label} saved successfully.`);
    } catch {
      showNotice('Failed to save details', 'error');
    }
  };

  const handleSaveProjectsPublications = async () => {
    try {
      const payload = {
        bio: publicationsText,
        github,
        linkedin,
        portfolio
      };
      const res = await api.put('/student/profile', payload);
      setProfile(res.data.data.profile);
      showNotice('Projects & Publications saved successfully.');
    } catch {
      showNotice('Failed to save projects & publications', 'error');
    }
  };

  const handleSaveSkillsDevelopment = async () => {
    try {
      const certObjects = certificationsText ? certificationsText.split(',').map(c => ({ name: c.trim(), issuingOrganization: 'Self', issueDate: new Date() })).filter(c => c.name) : [];
      const roles = responsibilityText ? responsibilityText.split(',').map(r => r.trim()).filter(Boolean) : [];
      const payload = {
        certifications: certObjects,
        positionsOfResponsibility: roles,
        seminars: seminarsText
      };
      const res = await api.put('/student/profile', payload);
      setProfile(res.data.data.profile);
      showNotice('Skills & Development saved successfully.');
    } catch {
      showNotice('Failed to save skills & development metrics', 'error');
    }
  };

  const handleSaveDocumentsSection = async (type: 'other' | 'references' | 'policy') => {
    try {
      const payload = {
        references: referencesText,
        otherDetails: otherDetailsText,
        policyAgreed
      };
      const res = await api.put('/student/profile', payload);
      setProfile(res.data.data.profile);
      const label = type === 'other' ? 'Other details' : type === 'references' ? 'References' : 'Placement policy';
      showNotice(`${label} updated successfully.`);
    } catch {
      showNotice('Failed to save details.', 'error');
    }
  };

  // Base64 Image Upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      showNotice('Image file must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPhoto(base64);
      try {
        const res = await api.put('/student/profile', { photo: base64 });
        setProfile(res.data.data.profile);
        showNotice('Profile picture uploaded.');
      } catch {
        showNotice('Failed to upload image.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const getCategorizedAttachments = () => {
    const academics = {
      currentCourse: [] as { name: string; url: string }[],
      otherDegree: [] as { name: string; url: string }[],
      twelfth: [] as { name: string; url: string }[],
      diploma: [] as { name: string; url: string }[],
      tenth: [] as { name: string; url: string }[]
    };

    const certificates = {
      experience: [] as { name: string; url: string }[],
      internship: [] as { name: string; url: string }[],
      assessment: [] as { name: string; url: string }[],
      responsibility: [] as { name: string; url: string }[],
      other: [] as { name: string; url: string }[]
    };

    const projectsList = [] as { name: string; url: string }[];
    const identityProofsList = [] as { name: string; url: string }[];

    // 1. Academic Records from Education
    if (profile?.education) {
      profile.education.forEach((edu: any) => {
        const deg = (edu.degree || '').toLowerCase();
        
        if (deg.includes('10th') || deg.includes('secondary') || deg.includes('school') || deg.includes('matric')) {
          if (edu.marksheetUrl) {
            academics.tenth.push({ name: `[Marksheet] Marksheet X.png`, url: edu.marksheetUrl });
          }
        } else if (deg.includes('12th') || deg.includes('higher secondary') || deg.includes('hsc') || deg.includes('intermediate')) {
          if (edu.marksheetUrl) {
            academics.twelfth.push({ name: `[Marksheet] Marksheet XII.png`, url: edu.marksheetUrl });
          }
        } else if (deg.includes('diploma')) {
          if (edu.marksheetUrl) {
            academics.diploma.push({ name: `[Marksheet] Diploma Marksheet.pdf`, url: edu.marksheetUrl });
          }
        } else if (deg.includes('ug') || deg.includes('pg') || deg.includes('b.tech') || deg.includes('btech') || deg.includes('degree') || deg.includes('graduate') || deg.includes('master') || deg.includes('bachelor') || deg.includes('b.sc') || deg.includes('bsc') || deg.includes('bca') || deg.includes('mca')) {
          if (edu.semesters) {
            edu.semesters.forEach((sem: any) => {
              if (sem.marksheetUrl) {
                academics.currentCourse.push({
                  name: `[Marksheet] result sem ${sem.semester || sem.year}.pdf`,
                  url: sem.marksheetUrl
                });
              }
            });
          }
          if (edu.marksheetUrl) {
            academics.otherDegree.push({ name: `[Marksheet] Degree Certificate - ${edu.degree}.pdf`, url: edu.marksheetUrl });
          }
        } else {
          if (edu.marksheetUrl) {
            academics.otherDegree.push({ name: `[Marksheet] Certificate - ${edu.degree}.pdf`, url: edu.marksheetUrl });
          }
        }
      });
    }

    // 2. Experience & Internships
    if (profile?.experience) {
      profile.experience.forEach((exp: any) => {
        const company = exp.company || 'Company';
        if (exp.marksheetUrl) {
          if (exp.experienceType === 'internship') {
            certificates.internship.push({
              name: `${profile.firstName || 'Student'} ${company}-Offer Letter.pdf`,
              url: exp.marksheetUrl
            });
          } else {
            certificates.experience.push({
              name: `${profile.firstName || 'Student'} ${company}-Experience Letter.pdf`,
              url: exp.marksheetUrl
            });
          }
        }
      });
    }

    // 3. Assessment / Certifications
    if (profile?.certifications) {
      profile.certifications.forEach((cert: any) => {
        if (cert.credentialUrl) {
          certificates.assessment.push({
            name: `${cert.issuingOrganization || 'Assessment'}-${cert.name}.pdf`,
            url: cert.credentialUrl
          });
        }
      });
    }

    // 4. Other Attachments / Resume versions
    if (profile?.resumes) {
      profile.resumes.forEach((res: any, idx: number) => {
        certificates.other.push({
          name: `[Resume] Version ${idx + 1}.pdf`,
          url: `http://localhost:5000${res.url}`
        });
      });
    }

    return { academics, certificates, projectsList, identityProofsList };
  };

  // Skill tag handlers
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const tag = skillInput.trim();
    if (profile.skills.includes(tag)) {
      setSkillInput('');
      return;
    }
    const updated = [...profile.skills, tag];
    try {
      const res = await api.put('/student/profile', { skills: updated });
      setProfile(res.data.data.profile);
      setSkillInput('');
      showNotice(`Added skill: ${tag}`);
    } catch {
      showNotice('Failed to add skill', 'error');
    }
  };

  const handleRemoveSkill = async (tag: string) => {
    const updated = profile.skills.filter((s: string) => s !== tag);
    try {
      const res = await api.put('/student/profile', { skills: updated });
      setProfile(res.data.data.profile);
      showNotice(`Removed skill: ${tag}`);
    } catch {
      showNotice('Failed to remove skill', 'error');
    }
  };

  // Education CRUD handlers
  const saveEducation = async (formData: any) => {
    let updated = [...profile.education];
    if (editingEdu !== null) {
      updated = updated.map((edu, idx) => (idx === editingEdu ? formData : edu));
    } else {
      updated.push(formData);
    }
    try {
      const res = await api.put('/student/profile', { education: updated });
      setProfile(res.data.data.profile);
      showNotice('Education credentials updated');
    } catch {
      showNotice('Failed to save education details', 'error');
    }
    setEditingEdu(null);
  };

  const removeEducation = async (idx: number) => {
    const updated = profile.education.filter((_: any, i: number) => i !== idx);
    try {
      const res = await api.put('/student/profile', { education: updated });
      setProfile(res.data.data.profile);
      showNotice('Education deleted');
    } catch {
      showNotice('Failed to remove education credential', 'error');
    }
  };

  // Experience CRUD handlers
  const saveExperience = async (formData: any) => {
    let updated = [...profile.experience];
    if (editingExp !== null) {
      updated = updated.map((exp, idx) => (idx === editingExp ? formData : exp));
    } else {
      updated.push(formData);
    }
    try {
      const res = await api.put('/student/profile', { experience: updated });
      setProfile(res.data.data.profile);
      showNotice('Work experience details updated');
    } catch {
      showNotice('Failed to save experience', 'error');
    }
    setEditingExp(null);
  };

  const removeExperience = async (idx: number) => {
    const updated = profile.experience.filter((_: any, i: number) => i !== idx);
    try {
      const res = await api.put('/student/profile', { experience: updated });
      setProfile(res.data.data.profile);
      showNotice('Work experience deleted');
    } catch {
      showNotice('Failed to delete work experience', 'error');
    }
  };

  // Projects CRUD handlers
  const saveProject = async (formData: any) => {
    let updated = [...profile.projects];
    if (editingProj !== null) {
      updated = updated.map((proj, idx) => (idx === editingProj ? formData : proj));
    } else {
      updated.push(formData);
    }
    try {
      const res = await api.put('/student/profile', { projects: updated });
      setProfile(res.data.data.profile);
      showNotice('Software project updated');
    } catch {
      showNotice('Failed to save project details', 'error');
    }
    setEditingProj(null);
  };

  const removeProject = async (idx: number) => {
    const updated = profile.projects.filter((_: any, i: number) => i !== idx);
    try {
      const res = await api.put('/student/profile', { projects: updated });
      setProfile(res.data.data.profile);
      showNotice('Project deleted');
    } catch {
      showNotice('Failed to remove project details', 'error');
    }
  };

  // Resume Upload
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
      showNotice('Resume uploaded successfully.');
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to upload resume', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Resume Builder...</p>
      </div>
    );
  }

  const sidebarLinks = [
    { id: 'basic', label: 'Basic Details', icon: User },
    { id: 'contact', label: 'Contact Details', icon: UserCheck },
    { id: 'family', label: 'Family Details', icon: Users },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'attachments', label: 'Attachments / Resume', icon: Paperclip },
    { id: 'experience', label: 'Professional Experience', icon: Briefcase },
    { id: 'internship', label: 'Internships', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'publications', label: 'Publications / Research', icon: BookOpen },
    { id: 'seminars', label: 'Seminars & Workshops', icon: GraduationCap },
    { id: 'certifications', label: 'Certifications / Skills', icon: Award },
    { id: 'responsibility', label: 'Positions of Responsibility', icon: Shield },
    { id: 'other_details', label: 'Other Details', icon: Info },
    { id: 'references', label: 'References', icon: FileSignature },
    { id: 'placement_policy', label: 'Placement Policy', icon: FileText },
    { id: 'preview', label: 'Preview & Export', icon: Eye }
  ];

  return (
    <div className="space-y-6 text-left max-w-6xl relative select-none">
      
      {/* Print stylesheet overrides */}
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
          header, aside, .no-print, button, form {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in no-print ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Grid wrapper splits layout to vertical navigation sidebar + active category editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Category links (no-print) */}
        <div className="md:col-span-3 bg-card border rounded-2xl p-4 space-y-2 shadow-sm no-print">
          <p className="text-[10px] uppercase font-black text-slate-400 px-3 tracking-widest">Profile Sections</p>
          <div className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              const isPreview = link.id === 'preview';
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                    isActive
                      ? isPreview 
                        ? 'bg-accent text-white font-extrabold shadow-sm'
                        : 'bg-primary/10 text-primary font-extrabold'
                      : isPreview
                        ? 'text-accent hover:bg-accent/5 font-extrabold border border-accent/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-secondary/40 font-semibold'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-current' : isPreview ? 'text-accent' : 'text-slate-450'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active form view content card */}
        <div className="md:col-span-9 bg-card border rounded-2xl p-6 shadow-sm min-h-[500px] relative">
          
          {/* Header Action Buttons for standard forms */}
          {activeTab !== 'preview' && (
            <div className="absolute top-6 right-6 flex gap-2 no-print z-20">
              <input 
                type="file" 
                ref={resumeInputRef} 
                accept=".pdf" 
                className="hidden" 
                disabled={uploadingResume}
                onChange={handleUploadResumeFile} 
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                className="px-3 py-1.5 border border-border text-slate-650 hover:bg-secondary/50 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                {uploadingResume ? 'Uploading...' : 'Upload Resume'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Generate Resume
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('attachments')}
                className="px-3 py-1.5 border border-border text-slate-650 hover:bg-secondary/50 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                All Resumes
              </button>
            </div>
          )}

          {/* Section 1: Basic Details */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Basic Details</h3>
                <p className="text-xxs text-muted-foreground">General student identification records and photo avatar.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="h-28 w-28 rounded-2xl border bg-secondary/15 overflow-hidden shadow-inner flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {photo ? (
                      <img src={photo} alt="Student avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  <label className="px-3 py-1.5 border border-border hover:bg-secondary/50 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">First Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Middle Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={middleName} onChange={e => setMiddleName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Last Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Enrollment Number</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={enrollmentNumber} onChange={e => setEnrollmentNumber(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Degree Course</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={course} onChange={e => setCourse(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Specialization</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Gender</label>
                    <select className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Date of Birth</label>
                    <input type="date" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Blood Group</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" placeholder="e.g. O+" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-450">Marital Status</label>
                    <select className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)}>
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <label className="text-[9px] uppercase font-black text-slate-450">Medical History / Allergies</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" placeholder="none" value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={() => handleSaveBasicSection('basic')}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Basic Details
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Contact Details */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Contact Details</h3>
                <p className="text-xxs text-muted-foreground">Permanent address coordinates and candidate mobile numbers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">Primary Mobile Number</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">Alternative Mobile Number</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={altPhone} onChange={e => setAltPhone(e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-black text-slate-450">Residential Address</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">City</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">State</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={stateName} onChange={e => setStateName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">ZIP Postal Code</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={zip} onChange={e => setZip(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={() => handleSaveBasicSection('contact')}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Contact Details
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Family Details */}
          {activeTab === 'family' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Family Details</h3>
                <p className="text-xxs text-muted-foreground">General details concerning parents or guardians.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">Father's Full Name</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={fatherName} onChange={e => setFatherName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">Mother's Full Name</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground" value={motherName} onChange={e => setMotherName(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={() => handleSaveBasicSection('family')}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Family Details
                </button>
              </div>
            </div>
          )}

          {/* Section 4: Education */}
          {activeTab === 'education' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b pb-3 pr-40">
                <div>
                  <h3 className="text-base font-extrabold">Education</h3>
                  <p className="text-xxs text-muted-foreground">Manage your high school and collegiate academic records.</p>
                </div>
                <button
                  onClick={() => { setEditingEdu(null); setEduOpen(true); }}
                  className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Academic Level
                </button>
              </div>

              {profile?.education?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {profile.education.map((edu: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border bg-secondary/15 space-y-3 text-xs font-semibold animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-left">
                          <p className="text-sm font-bold text-foreground">{edu.degree}</p>
                          <p className="text-primary font-bold">{edu.institution}</p>
                          <p className="text-xxs text-slate-450 italic font-medium">Class of {edu.graduationYear}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setEditingEdu(idx); setEduOpen(true); }}
                            className="p-1 text-slate-500 hover:text-primary hover:bg-primary/5 rounded transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeEducation(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Display Semesters Info if present */}
                      {edu.semesters && edu.semesters.length > 0 && (
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Semester-wise Marksheets & CGPA</span>
                            <button
                              onClick={() => {
                                setExpandedSemEdu(prev => 
                                  prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                                );
                              }}
                              className="text-[10px] text-primary hover:underline font-bold"
                            >
                              {expandedSemEdu.includes(idx) ? 'Collapse Details' : 'Expand Semesters'}
                            </button>
                          </div>

                          {expandedSemEdu.includes(idx) && (
                            <div className="overflow-x-auto border rounded-lg bg-card mt-2">
                              <table className="min-w-full divide-y divide-border text-xxs font-semibold">
                                <thead className="bg-secondary/40 text-[9px] uppercase tracking-wider text-slate-500">
                                  <tr>
                                    <th className="px-3 py-2 text-left">Sem</th>
                                    <th className="px-3 py-2 text-left">CGPA / Marks</th>
                                    <th className="px-3 py-2 text-left">Backlogs</th>
                                    <th className="px-3 py-2 text-center">Marksheet File</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {edu.semesters.map((sem: any, sIdx: number) => (
                                    <tr key={sIdx} className="hover:bg-secondary/10">
                                      <td className="px-3 py-2 font-bold">{sem.semester}</td>
                                      <td className="px-3 py-2">{sem.cgpa || 'N/A'}</td>
                                      <td className="px-3 py-2">{sem.backlogs !== undefined ? sem.backlogs : 0}</td>
                                      <td className="px-3 py-2 text-center">
                                        {sem.marksheetUrl ? (
                                          <a href={sem.marksheetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] text-indigo-650 hover:underline">
                                            <FileText className="h-3 w-3" /> View
                                          </a>
                                        ) : (
                                          <span className="text-slate-400 italic">No File</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  No academic credentials listed yet.
                </div>
              )}
            </div>
          )}

          {/* Section 5: Attachments */}
          {activeTab === 'attachments' && (() => {
            const { academics, certificates, projectsList, identityProofsList } = getCategorizedAttachments();
            return (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-extrabold">Attachments</h3>
                    <p className="text-xxs text-muted-foreground">Manage profile attachments, academic records, and certificates.</p>
                  </div>
                  
                  <label className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-sm">
                    {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                    <input type="file" accept=".pdf" className="hidden" disabled={uploadingResume} onChange={handleUploadResumeFile} />
                  </label>
                </div>

                {/* Category 1: Academic Records */}
                <div className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Academic Records</h4>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('education')}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-4 pl-2">
                    {/* Current Course Marksheets */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Course Marksheets</p>
                      {academics.currentCourse.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {academics.currentCourse.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Marksheets available.</p>
                      )}
                    </div>

                    {/* Other Degree */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Other Degree</p>
                      {academics.otherDegree.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {academics.otherDegree.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>

                    {/* 12th */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">12th</p>
                      {academics.twelfth.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {academics.twelfth.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>

                    {/* Diploma */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diploma</p>
                      {academics.diploma.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {academics.diploma.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>

                    {/* 10th */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">10th</p>
                      {academics.tenth.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {academics.tenth.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic mt-2">*All academic relevant attachments can be updated from the Education tab on the left.</p>
                </div>

                {/* Category 2: Certificates */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Certificates</h4>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('experience')}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-4 pl-2">
                    {/* Professional Experience */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Professional Experience</p>
                      {certificates.experience.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {certificates.experience.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>

                    {/* Internship Certificates */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Internship Certificates</p>
                      {certificates.internship.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {certificates.internship.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>

                    {/* Assessment Certificates */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assessment Certificates</p>
                      {certificates.assessment.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {certificates.assessment.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>

                    {/* Position of Responsibility Certificates */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Position of Responsibility Certificates</p>
                      {certificates.responsibility.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {certificates.responsibility.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>

                    {/* Other Attachments */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Other Attachments / Resumes</p>
                      {certificates.other.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {certificates.other.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4.5 w-4.5 text-primary" />
                                <span className="truncate text-foreground font-bold">{file.name}</span>
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic pl-2">No Attachments available.</p>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic mt-2">*Attachments of the certificates can be updated from their respective tabs on the left.</p>
                </div>

                {/* Category 3: Projects */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Projects</h4>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('projects')}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      + Add
                    </button>
                  </div>

                  {projectsList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                      {projectsList.map((file, fIdx) => (
                        <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4.5 w-4.5 text-primary" />
                            <span className="truncate text-foreground font-bold">{file.name}</span>
                          </div>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-2">
                      <p className="text-[10px] text-muted-foreground italic">No Attachments available.</p>
                    </div>
                  )}
                </div>

                {/* Category 4: Identity Proofs */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Identity Proofs</h4>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('basic')}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      + Add
                    </button>
                  </div>

                  {identityProofsList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                      {identityProofsList.map((file, fIdx) => (
                        <div key={fIdx} className="p-3 bg-secondary/15 rounded-xl border flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4.5 w-4.5 text-primary" />
                            <span className="truncate text-foreground font-bold">{file.name}</span>
                          </div>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">Download</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-2">
                      <p className="text-[10px] text-muted-foreground italic">No Attachments available.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Section 6: Professional Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b pb-3 pr-40">
                <div>
                  <h3 className="text-base font-extrabold">Professional Experience</h3>
                  <p className="text-xxs text-muted-foreground">List historical full-time job employment details.</p>
                </div>
                <button
                  onClick={() => { setEditingExp(null); setExpOpen(true); }}
                  className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Experience
                </button>
              </div>

              {profile?.experience?.filter((exp: any) => exp.experienceType === 'job' || !exp.experienceType).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {profile.experience
                    .filter((exp: any) => exp.experienceType === 'job' || !exp.experienceType)
                    .map((exp: any, idx: number) => {
                      const realIndex = profile.experience.indexOf(exp);
                      return (
                        <div key={idx} className="p-4 rounded-xl border bg-secondary/15 flex justify-between items-center text-xs font-semibold animate-fade-in">
                          <div className="space-y-1 text-left">
                            <p className="text-sm font-bold text-foreground">{exp.position}</p>
                            <p className="text-primary font-bold">{exp.company} • {exp.location}</p>
                            <p className="text-xxs text-slate-450 font-medium italic">
                              {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                            </p>
                            {exp.cgpa && (
                              <p className="text-xxs text-slate-400 font-medium">Performance Rating / CGPA: {exp.cgpa}</p>
                            )}
                            {exp.marksheetUrl && (
                              <a
                                href={exp.marksheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-[10px] text-indigo-655 hover:underline bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-105 dark:border-indigo-895"
                              >
                                <FileText className="h-3.5 w-3.5" /> View Marksheet/Offer Letter
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setEditingExp(realIndex); setExpOpen(true); }}
                              className="p-1 text-slate-500 hover:text-primary hover:bg-primary/5 rounded transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeExperience(realIndex)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  No work experience entries added.
                </div>
              )}
            </div>
          )}

          {/* Section 7: Internships */}
          {activeTab === 'internship' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b pb-3 pr-40">
                <div>
                  <h3 className="text-base font-extrabold">Internships</h3>
                  <p className="text-xxs text-muted-foreground">Log your structured short-term internship positions.</p>
                </div>
                <button
                  onClick={() => { setEditingExp(null); setExpOpen(true); }}
                  className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Internship
                </button>
              </div>

              {profile?.experience?.filter((exp: any) => exp.experienceType === 'internship').length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {profile.experience
                    .filter((exp: any) => exp.experienceType === 'internship')
                    .map((exp: any, idx: number) => {
                      const realIndex = profile.experience.indexOf(exp);
                      return (
                        <div key={idx} className="p-4 rounded-xl border bg-secondary/15 flex justify-between items-center text-xs font-semibold animate-fade-in">
                          <div className="space-y-1 text-left">
                            <p className="text-sm font-bold text-foreground">{exp.position}</p>
                            <p className="text-primary font-bold">{exp.company} • {exp.location}</p>
                            <p className="text-xxs text-slate-450 font-medium italic">
                              {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                            </p>
                            {exp.cgpa && (
                              <p className="text-xxs text-slate-400 font-medium">CGPA / Performance Mark: {exp.cgpa}</p>
                            )}
                            {exp.marksheetUrl && (
                              <a
                                href={exp.marksheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-[10px] text-indigo-655 hover:underline bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-105 dark:border-indigo-895"
                              >
                                <FileText className="h-3.5 w-3.5" /> View Marksheet/Offer Letter
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setEditingExp(realIndex); setExpOpen(true); }}
                              className="p-1 text-slate-500 hover:text-primary hover:bg-primary/5 rounded transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeExperience(realIndex)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  No internship roles logged.
                </div>
              )}
            </div>
          )}

          {/* Section 8: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center border-b pb-3 pr-40">
                <div>
                  <h3 className="text-base font-extrabold">Projects</h3>
                  <p className="text-xxs text-muted-foreground">Showcase software repositories or key engineering projects.</p>
                </div>
                <button
                  onClick={() => { setEditingProj(null); setProjOpen(true); }}
                  className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              </div>

              {profile?.projects?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {profile.projects.map((proj: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border bg-secondary/15 text-xs font-semibold animate-fade-in space-y-2 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-foreground">{proj.title}</p>
                          <p className="text-xxs text-slate-500 font-medium">{proj.description}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setEditingProj(idx); setProjOpen(true); }}
                            className="p-1 text-slate-500 hover:text-primary hover:bg-primary/5 rounded transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeProject(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map((t: string) => (
                            <span key={t} className="text-[9px] bg-secondary border text-slate-650 px-2 py-0.5 rounded font-bold">{t}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 text-xxs pt-1">
                        {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">GitHub Repository</a>}
                        {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-accent hover:underline font-bold">Live Demo</a>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  No projects added yet.
                </div>
              )}
            </div>
          )}

          {/* Section 9: Publications / Research */}
          {activeTab === 'publications' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Publications / Research / White Papers</h3>
                <p className="text-xxs text-muted-foreground">List academic journal articles, patents, or research publications.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-450">Publications List</label>
                <textarea
                  rows={8}
                  placeholder="Format: Title, Journal/Conference, Year (comma split or markdown list)"
                  className="w-full border rounded-lg p-2.5 bg-secondary/15 font-semibold text-xs text-foreground"
                  value={publicationsText}
                  onChange={e => setPublicationsText(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={handleSaveProjectsPublications}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Publications
                </button>
              </div>
            </div>
          )}

          {/* Section 10: Seminars & Workshops */}
          {activeTab === 'seminars' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Seminars / Training / Workshops</h3>
                <p className="text-xxs text-muted-foreground">List professional development workshops or instructional seminars attended.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-450">Seminars / Training Details</label>
                <textarea
                  rows={8}
                  placeholder="Format: Seminar Name - Provider / Organizer (Year)"
                  className="w-full border rounded-lg p-2.5 bg-secondary/15 font-semibold text-xs text-foreground"
                  value={seminarsText}
                  onChange={e => setSeminarsText(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={handleSaveSkillsDevelopment}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Seminars Info
                </button>
              </div>
            </div>
          )}

          {/* Section 11: Certifications / Skills */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Certifications & Vetted Skills</h3>
                <p className="text-xxs text-muted-foreground">Vetted skills matrix and accredited professional certificates.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-slate-450">Professional Skills</label>
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2 bg-secondary/15 font-semibold text-xs text-foreground"
                      placeholder="e.g. Kubernetes, React, Python"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                    />
                    <button type="submit" className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs rounded-xl border">
                      Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile?.skills?.map((s: string) => (
                      <span key={s} className="inline-flex items-center gap-1 bg-secondary/40 border text-[10px] font-bold px-2 py-0.5 rounded-full text-foreground shadow-sm">
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="text-rose-500 hover:text-rose-700 ml-0.5 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-450">Certifications (comma separated)</label>
                  <textarea
                    rows={4}
                    placeholder="e.g. AWS Certified Solutions Architect, Google Professional Cloud Architect"
                    className="w-full border rounded-lg p-2.5 bg-secondary/15 font-semibold text-xs text-foreground"
                    value={certificationsText}
                    onChange={e => setCertificationsText(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={handleSaveSkillsDevelopment}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Certifications
                </button>
              </div>
            </div>
          )}

          {/* Section 12: Positions of Responsibility */}
          {activeTab === 'responsibility' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Positions of Responsibility</h3>
                <p className="text-xxs text-muted-foreground">List leadership roles held in college, clubs, or organizations.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-450">Leadership Roles (comma separated)</label>
                <textarea
                  rows={6}
                  placeholder="e.g. Student Senate Chairperson, Hackathon Organizer, Secretary of Coding Club"
                  className="w-full border rounded-lg p-2.5 bg-secondary/15 font-semibold text-xs text-foreground"
                  value={responsibilityText}
                  onChange={e => setResponsibilityText(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={handleSaveSkillsDevelopment}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Leadership Info
                </button>
              </div>
            </div>
          )}

          {/* Section 13: Other Details */}
          {activeTab === 'other_details' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Other Details</h3>
                <p className="text-xxs text-muted-foreground">Additional profile records, achievements, or extracurricular summaries.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-450">Extra-Curricular Achievements</label>
                <textarea
                  rows={8}
                  placeholder="State details about extracurricular honors, sports participation, or community service..."
                  className="w-full border rounded-lg p-2.5 bg-secondary/15 font-semibold text-xs text-foreground"
                  value={otherDetailsText}
                  onChange={e => setOtherDetailsText(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={() => handleSaveDocumentsSection('other')}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Extra details
                </button>
              </div>
            </div>
          )}

          {/* Section 14: References */}
          {activeTab === 'references' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">References</h3>
                <p className="text-xxs text-muted-foreground">List details of mentors or professional references.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-450">Professional References</label>
                <textarea
                  rows={8}
                  placeholder="Format: Reference Name, Designation, Organization (Contact Email/Phone)"
                  className="w-full border rounded-lg p-2.5 bg-secondary/15 font-semibold text-xs text-foreground"
                  value={referencesText}
                  onChange={e => setReferencesText(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={() => handleSaveDocumentsSection('references')}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save References
                </button>
              </div>
            </div>
          )}

          {/* Section 15: Placement Policy */}
          {activeTab === 'placement_policy' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b pb-3 pr-40">
                <h3 className="text-base font-extrabold">Placement Policy</h3>
                <p className="text-xxs text-muted-foreground">Acknowledge agreement to CareerFlow rules and policies.</p>
              </div>

              <div className="p-4 bg-secondary/15 rounded-xl border space-y-4 text-xs font-semibold leading-relaxed">
                <p className="text-foreground">By checking the box below, you confirm that all details provided (academic score, history backlogs, experience letters, and resume copies) are authentic and correct to the best of your knowledge.</p>
                
                <label className="flex items-center gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={policyAgreed}
                    onChange={e => setPolicyAgreed(e.target.checked)}
                  />
                  <span className="text-xs text-foreground font-bold">I agree to the institutional placement terms.</span>
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={() => handleSaveDocumentsSection('policy')}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Submit Agreement
                </button>
              </div>
            </div>
          )}

          {/* Section 16: Resume Template & Live Preview Export */}
          {activeTab === 'preview' && (
            <div className="space-y-6 animate-fade-in text-left no-print">
              <div className="border-b pb-3 flex justify-between items-center pr-2">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Preview & PDF Export</h3>
                  <p className="text-xxs text-muted-foreground">Select layout templates, configure visibility blocks, and download as PDF.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-secondary text-foreground px-4 text-xs font-bold gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="h-4 w-4" /> Export PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs leading-relaxed font-semibold">
                
                {/* Configuration Columns */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Theme Selectors */}
                  <div className="bg-card border p-5 rounded-2xl shadow-sm space-y-3">
                    <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-primary" />
                      Select Layout Template
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {(['minimal-clean', 'sleek-dark', 'emerald-executive'] as ResumeTheme[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTheme(t)}
                          className={`py-2 px-3 rounded-lg border text-[9px] font-extrabold uppercase tracking-wider transition-all text-center ${
                            selectedTheme === t ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-secondary/40 border-border text-slate-655'
                          }`}
                        >
                          {t.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Config Block Switchers */}
                  <div className="bg-card border p-5 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-primary" />
                      Configure Visible Sections
                    </h3>
                    <div className="divide-y divide-border border rounded-xl p-3 bg-secondary/15">
                      <ToggleSwitch checked={generateFields.profilePicture} onChange={() => handleToggle('profilePicture')} label="Include Profile Picture" />
                      <ToggleSwitch checked={generateFields.briefSummary} onChange={() => handleToggle('briefSummary')} label="Include Bio Summary" />
                      <ToggleSwitch checked={generateFields.contactDetails} onChange={() => handleToggle('contactDetails')} label="Include Contact Info" />
                      <ToggleSwitch checked={generateFields.keyExpertise} onChange={() => handleToggle('keyExpertise')} label="Include Key Skills" />
                      <ToggleSwitch checked={generateFields.education} onChange={() => handleToggle('education')} label="Include Education" />
                      <ToggleSwitch checked={generateFields.awards} onChange={() => handleToggle('awards')} label="Include Awards & Honors" />
                      <ToggleSwitch checked={generateFields.internship} onChange={() => handleToggle('internship')} label="Include Internships" />
                      <ToggleSwitch checked={generateFields.project} onChange={() => handleToggle('project')} label="Include Projects" />
                      <ToggleSwitch checked={generateFields.certification} onChange={() => handleToggle('certification')} label="Include Certifications" />
                    </div>
                  </div>
                </div>

                {/* Interactive Dynamic Live Preview Canvas */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border p-8 rounded-2xl shadow-md min-h-[600px] flex flex-col justify-between text-left text-slate-800 dark:text-slate-200">
                  <div id="resume-canvas" className="space-y-6">
                    
                    {/* Theme 1: Minimal Clean */}
                    {selectedTheme === 'minimal-clean' && (
                      <div className="space-y-4">
                        <div className="border-b pb-4 text-center">
                          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{candidateName}</h1>
                          {generateFields.briefSummary && <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">{course || 'Degree Specialization'}</p>}
                          {generateFields.contactDetails && (
                            <p className="text-[10px] text-muted-foreground mt-2">
                              {profile?.userId?.email} • {portfolio || 'Portfolio'} • {phone || 'Phone'}
                            </p>
                          )}
                        </div>
                        {generateFields.briefSummary && otherDetailsText && (
                          <div className="space-y-1">
                            <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 border-b pb-0.5">Professional Summary</h4>
                            <p className="text-xs leading-relaxed font-medium">{otherDetailsText}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Theme 2: Sleek Dark */}
                    {selectedTheme === 'sleek-dark' && (
                      <div className="space-y-4">
                        <div className="bg-slate-900 text-white p-5 rounded-xl text-center space-y-1">
                          <h1 className="text-2xl font-black">{candidateName}</h1>
                          {generateFields.briefSummary && <p className="text-xs text-slate-350 uppercase tracking-widest font-extrabold">{course || 'Specialization'}</p>}
                          {generateFields.contactDetails && (
                            <p className="text-[9px] text-slate-400">
                              {profile?.userId?.email} • {github || 'GitHub'}
                            </p>
                          )}
                        </div>
                        {generateFields.briefSummary && otherDetailsText && (
                          <div className="space-y-1">
                            <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-primary border-b pb-0.5">About Candidate</h4>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{otherDetailsText}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Theme 3: Emerald Executive */}
                    {selectedTheme === 'emerald-executive' && (
                      <div className="space-y-4">
                        <div className="border-l-4 border-emerald-600 pl-4 py-1">
                          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{candidateName}</h1>
                          {generateFields.briefSummary && <p className="text-xs text-emerald-700 dark:text-emerald-455 font-bold uppercase tracking-widest">{course || 'Degree Course'}</p>}
                          {generateFields.contactDetails && (
                            <p className="text-[10px] text-muted-foreground">
                              {profile?.userId?.email} • {linkedin || 'LinkedIn'}
                            </p>
                          )}
                        </div>
                        {generateFields.briefSummary && otherDetailsText && (
                          <div className="space-y-1">
                            <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-emerald-700 border-b pb-0.5">Executive Summary</h4>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{otherDetailsText}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Core Skills */}
                    {generateFields.keyExpertise && profile?.skills?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 border-b pb-0.5">Core Expertise Toolkit</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {profile.skills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-850 dark:text-slate-200 font-bold rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Professional Work Experience */}
                    {generateFields.internship && profile?.experience?.filter((e: any) => e.experienceType === 'job' || !e.experienceType).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 border-b pb-0.5">Professional Work Experience</h4>
                        <div className="space-y-4">
                          {profile.experience
                            .filter((exp: any) => exp.experienceType === 'job' || !exp.experienceType)
                            .map((exp: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-xs">
                                  <span className="text-slate-900 dark:text-slate-100">{exp.position} — <span className="text-primary font-extrabold">{exp.company}</span></span>
                                  <span className="text-[10px] text-muted-foreground">{exp.location}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic font-medium">Dates: {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Internships list */}
                    {generateFields.internship && profile?.experience?.filter((e: any) => e.experienceType === 'internship').length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 border-b pb-0.5">Internship Placements</h4>
                        <div className="space-y-4">
                          {profile.experience
                            .filter((exp: any) => exp.experienceType === 'internship')
                            .map((exp: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-xs">
                                  <span className="text-slate-900 dark:text-slate-100">{exp.position} — <span className="text-primary font-extrabold">{exp.company}</span></span>
                                  <span className="text-[10px] text-muted-foreground">{exp.location}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic font-medium">Dates: {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Projects list */}
                    {generateFields.project && profile?.projects?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 border-b pb-0.5">Key Projects & Open Source</h4>
                        <div className="space-y-4">
                          {profile.projects.map((p: any, idx: number) => (
                            <div key={idx} className="space-y-1 text-left">
                              <div className="flex justify-between items-baseline font-bold text-xs">
                                <span className="text-slate-950 dark:text-slate-50">{p.title}</span>
                              </div>
                              <p className="text-xs text-slate-650 dark:text-slate-350 leading-normal font-medium">{p.description}</p>
                              {p.technologies && p.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {p.technologies.map((t: string) => (
                                    <span key={t} className="text-[9px] px-2 py-0.5 rounded bg-secondary font-bold text-slate-500">{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education list */}
                    {generateFields.education && profile?.education?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 border-b pb-0.5">Education History</h4>
                        <div className="space-y-3">
                          {profile.education.map((edu: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline font-bold text-xs">
                                <span className="text-slate-905 dark:text-slate-105">{edu.degree}</span>
                                <span className="text-[10px] text-muted-foreground">{edu.graduationYear ? `Grad: ${edu.graduationYear}` : ''}</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">{edu.institution}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="pt-8 border-t border-dashed text-center text-muted-foreground text-[9px] uppercase tracking-wider font-extrabold">
                    Generated via CareerFlow AI Printable PDF Stylesheet.
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Dialog Modals */}
      <EducationDialog
        isOpen={eduOpen}
        onClose={() => setEduOpen(false)}
        onSave={saveEducation}
        initialData={editingEdu !== null ? profile?.education[editingEdu] : undefined}
      />
      <ExperienceDialog
        isOpen={expOpen}
        onClose={() => setExpOpen(false)}
        onSave={saveExperience}
        initialData={editingExp !== null ? profile?.experience[editingExp] : undefined}
      />
      <ProjectDialog
        isOpen={projOpen}
        onClose={() => setProjOpen(false)}
        onSave={saveProject}
        initialData={editingProj !== null ? profile?.projects[editingProj] : undefined}
      />

      {/* Profile picture Lightbox modal */}
      {isLightboxOpen && photo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fade-in no-print" onClick={() => setIsLightboxOpen(false)}>
          <div className="relative max-w-lg max-h-[85vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
            <button 
              type="button" 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={photo} alt="Student Profile Lightbox" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};

export default ResumeEditor;
