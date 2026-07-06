import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import {
  User,
  Award,
  CheckCircle,
  AlertCircle,
  Activity,
  Edit3,
  Lock,
  ChevronRight
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'career_journey' | 'awards' | 'activity'>('summary');

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      setProfile(res.data.data.profile);
    } catch (err) {
      showNotice('Failed to fetch profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const capitalize = (str?: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const candidateName = profile
    ? capitalize(`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile?.userId?.name)
    : 'Student Name';

  // Extract date ranges from education items
  const getDateRange = () => {
    if (profile?.education && profile.education.length > 0) {
      const gradYear = profile.education[0].graduationYear;
      if (gradYear) {
        return `${gradYear - 4} - ${gradYear}`;
      }
    }
    return '2023 - 2027';
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Profile Summary...</p>
      </div>
    );
  }

  // Curated lists matching screenshots
  const expertiseTags = profile?.skills || [];
  const interestTags = profile?.specialization 
    ? [profile.specialization, 'Data Analytics', 'Machine Learning', 'Artificial Intelligence'] 
    : ['Data Analytics', 'Machine Learning', 'Business Intelligence', 'Artificial Intelligence', 'Web Applications'];
  const valueTags = ['Teamwork', 'Adaptability', 'Consistency', 'Time Management', 'Continuous Learning', 'Leadership'];

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

      {/* Grid splits layout into main summary view + actions sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Summary banner and horizontal tabs */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Banner Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
            <div className="h-20 w-20 rounded-full border bg-secondary/15 overflow-hidden flex items-center justify-center shadow-inner">
              {profile?.photo ? (
                <img src={profile.photo} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground">{candidateName}</h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center text-xxs font-extrabold uppercase mt-1">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border">Student</span>
                <span className="text-slate-400 tracking-wider">{getDateRange()}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation links */}
          <div className="border-b flex gap-6 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            {(['summary', 'career_journey', 'awards', 'activity'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-all ${
                  activeTab === tab 
                    ? 'border-b-2 border-primary text-primary font-black' 
                    : 'hover:text-foreground'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[350px]">
            
            {/* Tab 1: Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Profile Bio Description */}
                <div className="space-y-2">
                  <h4 className="text-xxs uppercase font-black tracking-widest text-slate-400">Summary</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {profile?.otherDetails || profile?.bio || 'No profile summary description provided. Click Edit Profile to build your professional canvas.'}
                  </p>
                </div>

                {/* Tags Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                  
                  {/* Expertise */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400">Expertise</h5>
                    {expertiseTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {expertiseTags.map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 text-[10px] font-bold bg-secondary/35 border rounded-full text-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xxs text-muted-foreground italic">No expertise skills added.</p>
                    )}
                  </div>

                  {/* Areas of Interest */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400">Areas of Interest</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {interestTags.map((tag: string) => (
                        <span key={tag} className="px-2.5 py-1 text-[10px] font-bold bg-secondary/35 border rounded-full text-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Values */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400">Values</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {valueTags.map((tag: string) => (
                        <span key={tag} className="px-2.5 py-1 text-[10px] font-bold bg-secondary/35 border rounded-full text-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab 2: Career Journey */}
            {activeTab === 'career_journey' && (
              <div className="space-y-6 animate-fade-in">
                <h4 className="text-xxs uppercase font-black tracking-widest text-slate-400">Career Journey</h4>
                
                {profile?.education && profile.education.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-border space-y-6">
                    {profile.education.map((edu: any, idx: number) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-card flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                        <p className="text-xs font-black text-foreground">{edu.degree}</p>
                        <p className="text-xxs text-primary font-bold">{edu.institution}</p>
                        <p className="text-[10px] text-muted-foreground italic">Class of {edu.graduationYear}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No educational records logged.</p>
                )}
              </div>
            )}

            {/* Tab 3: Awards */}
            {activeTab === 'awards' && (
              <div className="space-y-6 animate-fade-in">
                <h4 className="text-xxs uppercase font-black tracking-widest text-slate-400">Awards & Recognition</h4>
                
                {profile?.certifications && profile.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border bg-secondary/10 flex gap-3 items-start">
                        <Award className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-black text-foreground">{typeof cert === 'object' ? cert.name : cert}</p>
                          {cert.issuingOrganization && (
                            <p className="text-xxs text-slate-500 font-bold">{cert.issuingOrganization}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl bg-secondary/5">
                    No awards or accolades listed.
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Activity */}
            {activeTab === 'activity' && (
              <div className="flex flex-col items-center justify-center min-h-[220px] gap-2 animate-fade-in text-slate-400">
                <Activity className="h-6 w-6 stroke-1" />
                <p className="text-xs font-bold text-muted-foreground">There are no posts.</p>
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Actions column */}
        <div className="lg:col-span-3 space-y-4 no-print">
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-3">
            <button
              onClick={() => navigate('/profile/resume-builder')}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate('/change-password')}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-border text-slate-600 hover:bg-secondary/40 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Change Password
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
