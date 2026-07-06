import React, { useEffect, useState } from 'react';
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
  Phone,
  Paperclip,
  Users,
  Briefcase,
  BookOpen,
  Shield,
  Info,
  UserCheck,
  FileSignature
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Consolidated Tabs
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
  
  // Contact States (inside Basic Info tab)
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');

  // Family States (collapsible inside Basic Info tab)
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
      setPublicationsText(data.bio || ''); // Reuse bio field for custom publications content

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

  // Section Progress Calculation
  const getProgress = () => {
    let completed = 0;
    if (firstName && enrollmentNumber && course && phone) completed++;
    if (profile?.education?.length > 0 || profile?.experience?.length > 0) completed++;
    if (profile?.projects?.length > 0 || github) completed++;
    if (profile?.skills?.length > 0 || certificationsText) completed++;
    if (policyAgreed && profile?.resumeUrl) completed++;
    return completed;
  };

  const completedCount = getProgress();
  const progressPercent = completedCount * 20;

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
        bio: publicationsText, // Save publications text under the bio string field
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
          // Add semesters marksheets
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
          // If the main degree has a marksheet url, add it as other degree or current course marksheet
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

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Profile Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Progress & Header */}
      <div className="bg-card border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div 
              onClick={() => photo && setIsLightboxOpen(true)}
              className={`h-14 w-14 rounded-full border bg-secondary/55 flex items-center justify-center overflow-hidden ${photo ? 'cursor-zoom-in hover:opacity-85 transition-opacity' : ''}`}
              title={photo ? "Click to view full image" : ""}
            >
              {photo ? <img src={photo} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-7 w-7 text-slate-400" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">{profile?.userId?.name}</h2>
              <p className="text-[10px] text-muted-foreground font-semibold">Verification Enrollment: {enrollmentNumber || 'Unspecified'}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Profile Status: {completedCount}/5 sections complete ({progressPercent}%)
            </span>
            <div className="w-48 bg-secondary h-2 rounded-full overflow-hidden border">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mt-6 text-left">
        {/* Left Column: Vertical Sidebar Navigation */}
        <div className="md:col-span-1 bg-card border rounded-2xl p-4 space-y-1 md:sticky md:top-6 shadow-sm">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-3 mb-2">Profile Sections</p>
          {[
            { id: 'basic', label: 'Basic Details', icon: User },
            { id: 'contact', label: 'Contact Details', icon: Phone },
            { id: 'family', label: 'Family Details', icon: Users },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'attachments', label: 'Attachments / Resume', icon: Paperclip },
            { id: 'experience', label: 'Professional Experience', icon: Briefcase },
            { id: 'internship', label: 'Internships', icon: Award },
            { id: 'projects', label: 'Projects', icon: Code },
            { id: 'publications', label: 'Publications / Research', icon: FileText },
            { id: 'seminars', label: 'Seminars & Workshops', icon: BookOpen },
            { id: 'certifications', label: 'Certifications / Skills', icon: Award },
            { id: 'responsibility', label: 'Positions of Responsibility', icon: Shield },
            { id: 'other_details', label: 'Other Details', icon: Info },
            { id: 'references', label: 'References', icon: UserCheck },
            { id: 'placement_policy', label: 'Placement Policy', icon: FileSignature }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-slate-650 hover:bg-secondary/40 dark:text-slate-400 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Panel Body */}
        <div className="md:col-span-3 bg-card border p-6 rounded-2xl shadow-sm space-y-6">

          {/* Section 1: Basic Details */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Basic Details</h3>
                <p className="text-xxs text-muted-foreground">General student identification records and photo avatar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                {/* Photo Box */}
                <div className="md:col-span-1 flex flex-col items-center gap-2">
                  <div 
                    onClick={() => photo && setIsLightboxOpen(true)}
                    className={`h-24 w-24 rounded-2xl border bg-secondary flex items-center justify-center overflow-hidden ${photo ? 'cursor-zoom-in hover:opacity-85 transition-opacity' : ''}`}
                    title={photo ? "Click to view full image" : ""}
                  >
                    {photo ? <img src={photo} alt="Student" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-slate-400" />}
                  </div>
                  <label className="px-3 py-1.5 rounded-lg border hover:bg-secondary text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>

                {/* Basic Fields */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">First Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Middle Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={middleName} onChange={e => setMiddleName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Last Name</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Enrollment Number</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={enrollmentNumber} onChange={e => setEnrollmentNumber(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Degree Course</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={course} onChange={e => setCourse(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Specialization</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Gender</label>
                    <select className="w-full border rounded-lg p-2 bg-secondary/15 text-xs font-semibold" value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Date of Birth</label>
                    <input type="date" className="w-full border rounded-lg p-2 bg-secondary/10" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Blood Group</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" placeholder="e.g. O+" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-500">Marital Status</label>
                    <select
                      className="w-full border rounded-lg p-2 bg-secondary/15 text-xs font-semibold"
                      value={maritalStatus}
                      onChange={e => setMaritalStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] uppercase font-black text-slate-500">Medical History / Allergies</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" placeholder="e.g. None" value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => handleSaveBasicSection('basic')}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Basic Details
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Contact Details */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Contact Details</h3>
                <p className="text-xxs text-muted-foreground">Manage personal contact information, phone lines, and physical addresses.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">Phone</label>
                  <input type="tel" className="w-full border rounded-lg p-2 bg-secondary/10" placeholder="Primary phone" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">Alternate Phone</label>
                  <input type="tel" className="w-full border rounded-lg p-2 bg-secondary/10" placeholder="Alternate phone" value={altPhone} onChange={e => setAltPhone(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">City</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-500">Address</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">State</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={stateName} onChange={e => setStateName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">Zip Code</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={zip} onChange={e => setZip(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => handleSaveBasicSection('contact')}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Contact Details
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Family Details */}
          {activeTab === 'family' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Family Details</h3>
                <p className="text-xxs text-muted-foreground">Provide guardian or parent contact identification references.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold p-4 rounded-xl border bg-secondary/5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">Father's Name</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={fatherName} onChange={e => setFatherName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">Mother's Name</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10" value={motherName} onChange={e => setMotherName(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => handleSaveBasicSection('family')}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Family Details
                </button>
              </div>
            </div>
          )}

          {/* Section 4: Education */}
          {activeTab === 'education' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-base font-extrabold">Education Details</h3>
                  <p className="text-xxs text-muted-foreground">List academic degrees and grades.</p>
                </div>
                <button
                  onClick={() => { setEditingEdu(null); setEduOpen(true); }}
                  className="px-3 py-1.5 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Degree
                </button>
              </div>

              {profile?.education?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {profile.education.map((edu: any, idx: number) => {
                    const isExpanded = expandedSemEdu.includes(idx);
                    return (
                      <div key={idx} className="p-4 rounded-xl border bg-secondary/15 space-y-3 text-xs font-semibold">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 text-left">
                            <p className="text-sm font-bold text-foreground">{edu.degree} in {edu.fieldOfStudy}</p>
                            <p className="text-muted-foreground">{edu.institution}</p>
                            <p className="text-xxs text-slate-400 font-medium">CGPA / Grade: {edu.grade || 'N/A'}</p>
                            
                            {edu.marksheetUrl && (
                              <a
                                href={edu.marksheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1.5 text-xxs text-indigo-650 hover:underline bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900"
                              >
                                <FileText className="h-3 w-3" /> View/Download Marksheet
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => { setEditingEdu(idx); setEduOpen(true); }} className="p-1.5 rounded bg-card border text-primary"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => removeEducation(idx)} className="p-1.5 rounded bg-card border text-rose-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>

                        {edu.semesters && edu.semesters.length > 0 && (
                          <div className="border-t pt-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedSemEdu(prev =>
                                  isExpanded ? prev.filter(i => i !== idx) : [...prev, idx]
                                );
                              }}
                              className="text-[10px] text-primary hover:underline font-extrabold uppercase tracking-wider flex items-center gap-1"
                            >
                              {isExpanded ? 'Hide Semester Marks' : 'View Semester Marks'} ({edu.semesters.length})
                            </button>

                            {isExpanded && (
                              <div className="mt-2 overflow-x-auto border rounded-lg bg-card shadow-inner">
                                <table className="w-full text-[11px] text-left border-collapse">
                                  <thead>
                                    <tr className="bg-secondary/40 border-b">
                                      <th className="py-1.5 px-2 font-black text-slate-500 uppercase">Sem / Yr</th>
                                      <th className="py-1.5 px-2 font-black text-slate-500 uppercase">CGPA / Grade</th>
                                      <th className="py-1.5 px-2 font-black text-slate-500 uppercase">Closed Backlogs</th>
                                      <th className="py-1.5 px-2 font-black text-slate-500 uppercase">Live Backlogs</th>
                                      <th className="py-1.5 px-2 font-black text-slate-500 uppercase">Marksheet</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y font-medium text-slate-700 dark:text-slate-350">
                                    {edu.semesters.map((sem: any, sIdx: number) => (
                                      <tr key={sIdx}>
                                        <td className="py-1.5 px-2 font-bold">{sem.semester || `Sem ${sem.year}`}</td>
                                        <td className="py-1.5 px-2 font-mono">{sem.cgpa || 'N/A'}</td>
                                        <td className="py-1.5 px-2">{sem.closedBacklogs !== undefined ? sem.closedBacklogs : '0'}</td>
                                        <td className="py-1.5 px-2">{sem.liveBacklogs !== undefined ? sem.liveBacklogs : '0'}</td>
                                        <td className="py-1.5 px-2">
                                          {sem.marksheetUrl ? (
                                            <a
                                              href={sem.marksheetUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-indigo-650 hover:underline font-bold"
                                            >
                                              View File
                                            </a>
                                          ) : (
                                            <span className="text-slate-400">None</span>
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
                    );
                  })}
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
                  
                  {/* Uploader Trigger Button */}
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
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-3">
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
                            <p className="text-xxs text-slate-400 font-medium italic">
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
                                className="inline-flex items-center gap-1 mt-1 text-xxs text-indigo-655 hover:underline bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900"
                              >
                                <FileText className="h-3 w-3" /> View Certificate
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => { setEditingExp(realIndex); setExpOpen(true); }} className="p-1.5 rounded bg-card border text-primary"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => removeExperience(realIndex)} className="p-1.5 rounded bg-card border text-rose-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  No professional experiences listed yet.
                </div>
              )}
            </div>
          )}

          {/* Section 7: Internship */}
          {activeTab === 'internship' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-base font-extrabold">Internships</h3>
                  <p className="text-xxs text-muted-foreground">List historical internships and industrial trainee details.</p>
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
                            <p className="text-xxs text-slate-400 font-medium italic">
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
                                className="inline-flex items-center gap-1 mt-1 text-xxs text-indigo-655 hover:underline bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900"
                              >
                                <FileText className="h-3 w-3" /> View Certificate
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => { setEditingExp(realIndex); setExpOpen(true); }} className="p-1.5 rounded bg-card border text-primary"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => removeExperience(realIndex)} className="p-1.5 rounded bg-card border text-rose-500"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  No internships listed yet.
                </div>
              )}
            </div>
          )}

          {/* Section 8: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-base font-extrabold">Software Projects</h3>
                  <p className="text-xxs text-muted-foreground">List portfolio software projects and repositories.</p>
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
                    <div key={idx} className="p-4 rounded-xl border bg-secondary/15 flex justify-between items-center text-xs font-semibold">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">{proj.title}</p>
                        <p className="text-xxs text-muted-foreground font-normal leading-normal">{proj.description}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditingProj(idx); setProjOpen(true); }} className="p-1.5 rounded bg-card border text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => removeProject(idx)} className="p-1.5 rounded bg-card border text-rose-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  No portfolio projects registered yet.
                </div>
              )}
            </div>
          )}

          {/* Section 9: Publications */}
          {activeTab === 'publications' && (
            <div className="space-y-6 animate-fade-in text-xs font-semibold">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Publications / Research & Links</h3>
                <p className="text-xxs text-muted-foreground">Add published papers, research journals, and coding profile links.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">GitHub Profile URL</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10 font-mono text-[11px]" value={github} onChange={e => setGithub(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">LinkedIn Profile URL</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10 font-mono text-[11px]" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">Portfolio URL</label>
                  <input type="text" className="w-full border rounded-lg p-2 bg-secondary/10 font-mono text-[11px]" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[10px] uppercase font-black text-slate-500">Publications / Research / White Papers Details</label>
                  <textarea rows={4} className="w-full border rounded-lg p-2 bg-secondary/10 font-medium resize-none" placeholder="Provide publication titles, DOI journals, or research paper links..." value={publicationsText} onChange={e => setPublicationsText(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={handleSaveProjectsPublications}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Publications & Links
                </button>
              </div>
            </div>
          )}

          {/* Section 10: Seminars */}
          {activeTab === 'seminars' && (
            <div className="space-y-6 animate-fade-in text-xs font-semibold">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Seminars / Trainings / Workshops</h3>
                <p className="text-xxs text-muted-foreground">List professional development workshops or student bootcamps attended.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Seminars / Trainings / Workshops Attended Details</label>
                <textarea rows={5} className="w-full border rounded-lg p-2 bg-secondary/10 font-medium resize-none" placeholder="Provide seminar summaries or training workshops details..." value={seminarsText} onChange={e => setSeminarsText(e.target.value)} />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleSaveSkillsDevelopment}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Seminars & Workshops
                </button>
              </div>
            </div>
          )}

          {/* Section 11: Certifications */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-fade-in text-xs font-semibold">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Certifications / Skills</h3>
                <p className="text-xxs text-muted-foreground">Manage your core expertise skills and certification credentials.</p>
              </div>

              {/* Skills tag deck */}
              <div className="space-y-3 pb-5 border-b">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Core Expertise Toolkit</h4>
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type skill tag (e.g., Docker) and press Enter"
                    className="w-full max-w-sm border rounded-lg p-2 bg-secondary/10 text-xs font-semibold"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 font-bold text-xs">Add Tag</button>
                </form>
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile?.skills?.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary font-bold text-xs px-3 py-1 rounded-xl">
                      {tag}
                      <button type="button" onClick={() => handleRemoveSkill(tag)} className="text-rose-500 hover:text-rose-700 ml-1 font-bold text-sm leading-none">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-4">
                <label className="text-[10px] uppercase font-black text-slate-500">Certifications & Assessments (Comma split)</label>
                <textarea rows={4} className="w-full border rounded-lg p-2 bg-secondary/10 font-medium resize-none" placeholder="e.g. AWS Solutions Architect, Oracle Java Associate" value={certificationsText} onChange={e => setCertificationsText(e.target.value)} />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleSaveSkillsDevelopment}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Certifications & Skills
                </button>
              </div>
            </div>
          )}

          {/* Section 12: Positions of Responsibility */}
          {activeTab === 'responsibility' && (
            <div className="space-y-6 animate-fade-in text-xs font-semibold">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Positions of Responsibility</h3>
                <p className="text-xxs text-muted-foreground">List extra-curricular leadership positions and roles.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Positions of Responsibility (Comma split)</label>
                <textarea rows={4} className="w-full border rounded-lg p-2 bg-secondary/10 font-medium resize-none" placeholder="e.g. College Club Lead, Event Organizer" value={responsibilityText} onChange={e => setResponsibilityText(e.target.value)} />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleSaveSkillsDevelopment}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Positions of Responsibility
                </button>
              </div>
            </div>
          )}

          {/* Section 13: Other Details */}
          {activeTab === 'other_details' && (
            <div className="space-y-6 animate-fade-in text-xs font-semibold">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Other Details</h3>
                <p className="text-xxs text-muted-foreground">Add any other details or custom descriptions for your profile resume.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Other Details / Additional Notes</label>
                <textarea rows={5} className="w-full border rounded-lg p-2 bg-secondary/10 font-medium resize-none" placeholder="Add other details..." value={otherDetailsText} onChange={e => setOtherDetailsText(e.target.value)} />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => handleSaveDocumentsSection('other')}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save Other Details
                </button>
              </div>
            </div>
          )}

          {/* Section 14: References */}
          {activeTab === 'references' && (
            <div className="space-y-6 animate-fade-in text-xs font-semibold">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Professional References</h3>
                <p className="text-xxs text-muted-foreground">Enter contact references to vet profile credentials.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500">Professional References Details</label>
                <textarea rows={5} className="w-full border rounded-lg p-2 bg-secondary/10 font-medium resize-none" placeholder="Provide contact info of academic or professional references..." value={referencesText} onChange={e => setReferencesText(e.target.value)} />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => handleSaveDocumentsSection('references')}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Save References
                </button>
              </div>
            </div>
          )}

          {/* Section 15: Placement Policy */}
          {activeTab === 'placement_policy' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b pb-3">
                <h3 className="text-base font-extrabold">Placement Policy</h3>
                <p className="text-xxs text-muted-foreground">Review and agree to the institutional corporate hiring policy.</p>
              </div>

              {/* Read-only policy agreement panel and checkbox */}
              <div className="p-5 border rounded-2xl bg-secondary/15 text-xs space-y-3">
                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-accent" />
                  University Placement Policy Acknowledgment
                </h4>
                <div className="p-3 bg-card border rounded-xl text-xxs leading-relaxed text-muted-foreground max-h-32 overflow-y-auto font-medium">
                  <p>1. Candidates must maintain a minimum 75% attendance record during corporate presentation drives.</p>
                  <p className="mt-1.5">2. Responding to assigned interviews or assessments is mandatory once profile is verified by placement cell.</p>
                  <p className="mt-1.5">3. Withdrawing application after shortlist release might suspend placement eligibility privileges.</p>
                </div>
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    id="policyCheck"
                    type="checkbox"
                    className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/10 mt-0.5 cursor-pointer"
                    checked={policyAgreed}
                    onChange={e => setPolicyAgreed(e.target.checked)}
                  />
                  <label htmlFor="policyCheck" className="text-xxs leading-normal font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                    I have read and agree to follow all code of conduct and policy logs listed above.
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => handleSaveDocumentsSection('policy')}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md transition-colors"
                >
                  Agree & Save Policy
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CRUD dialogs */}
      {eduOpen && (
        <EducationDialog
          isOpen={eduOpen}
          onClose={() => { setEduOpen(false); setEditingEdu(null); }}
          onSave={saveEducation}
          initialData={editingEdu !== null ? profile.education[editingEdu] : undefined}
        />
      )}

      {expOpen && (
        <ExperienceDialog
          isOpen={expOpen}
          onClose={() => { setExpOpen(false); setEditingExp(null); }}
          onSave={saveExperience}
          initialData={editingExp !== null ? profile.experience[editingExp] : undefined}
        />
      )}

      {projOpen && (
        <ProjectDialog
          isOpen={projOpen}
          onClose={() => { setProjOpen(false); setEditingProj(null); }}
          onSave={saveProject}
          initialData={editingProj !== null ? profile.projects[editingProj] : undefined}
        />
      )}

      {isLightboxOpen && photo && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img src={photo} alt="Student Full Size" className="max-w-full max-h-[80vh] object-contain" />
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-950/80 text-white rounded-full p-2 transition-colors border border-slate-700/50 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default StudentProfile;
