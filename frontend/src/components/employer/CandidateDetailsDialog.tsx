import React, { useState } from 'react';
import {
  X,
  User,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface CandidateDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application: any; // Application payload
  onUpdateStatus: (id: string, status: string, comments: string) => void;
  onTriggerSchedule: (app: any) => void;
}

export const CandidateDetailsDialog: React.FC<CandidateDetailsDialogProps> = ({
  isOpen,
  onClose,
  application,
  onUpdateStatus,
  onTriggerSchedule
}) => {
  const [comments, setComments] = useState('');
  
  if (!isOpen || !application) return null;

  const handleStatusChange = (status: string) => {
    onUpdateStatus(application._id, status, comments || `Advanced to status: ${status}`);
    setComments('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offered':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-250';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-250';
      case 'interviewing':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-250';
      case 'shortlisted':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 border-violet-250';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slide-left text-left">
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-none">{application.studentId?.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{application.studentId?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-grow p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          
          {/* AI Matching Insights */}
          <div className="bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400">
                <TrendingUp className="h-4 w-4" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">AI Alignment Match Report</h4>
              </div>
              <div className="h-12 w-12 rounded-full border border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-sm">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{application.aiMatchScore}%</span>
                <span className="text-[7px] font-bold text-muted-foreground uppercase leading-none">Match</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border rounded-xl">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Core Strengths
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-350 list-disc list-inside">
                  {application.aiMatchAnalysis?.strengths?.length > 0 ? (
                    application.aiMatchAnalysis.strengths.map((str: string, i: number) => (
                      <li key={i}>{str}</li>
                    ))
                  ) : (
                    <li>Student profile contains matched general major details.</li>
                  )}
                </ul>
              </div>

              <div className="space-y-1.5 p-3.5 bg-white dark:bg-slate-900 border rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Gaps & Missing Skills
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-350 list-disc list-inside">
                  {application.aiMatchAnalysis?.gaps?.length > 0 ? (
                    application.aiMatchAnalysis.gaps.map((gap: string, i: number) => (
                      <li key={i}>{gap}</li>
                    ))
                  ) : (
                    <li>No significant skills gaps found.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border rounded-xl text-xs">
              <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> AI Recommendations
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-350 list-disc list-inside font-medium">
                {application.aiMatchAnalysis?.recommendations?.length > 0 ? (
                  application.aiMatchAnalysis.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))
                ) : (
                  <li>Ready to advance to interview assessments.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Timeline History */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm border-b pb-1.5">Recruitment Timeline</h4>
            <div className="space-y-3 pl-3 relative border-l border-slate-200 dark:border-slate-800 ml-2">
              {application.timeline?.map((t: any, i: number) => (
                <div key={i} className="relative space-y-1 pl-4 text-xs font-semibold">
                  <div className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-950/20" />
                  <div className="flex justify-between items-center">
                    <span className="capitalize text-slate-900 dark:text-slate-100 font-bold">{t.status}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{t.comments}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Actions Console */}
          <div className="bg-slate-50 dark:bg-slate-900/10 border p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border-b pb-1.5">
              ATS Stage Progression Controls
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider text-[10px]">
                  Internal Recruiter Comments (Optional)
                </label>
                <textarea
                  rows={2}
                  className="block w-full px-3 py-2 border border-slate-250 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Draft internal feedback comments for shortlist/interview rounds..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => handleStatusChange('shortlisted')}
                  disabled={application.status === 'shortlisted'}
                  className="h-8 px-3 rounded-lg border border-violet-200/50 bg-violet-50 text-violet-650 hover:bg-violet-100/50 dark:bg-violet-950/15 dark:text-violet-400 transition-colors font-bold disabled:opacity-40"
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerSchedule(application)}
                  className="h-8 px-3 rounded-lg border border-indigo-200/50 bg-indigo-50 text-indigo-650 hover:bg-indigo-100/50 dark:bg-indigo-950/15 dark:text-indigo-400 transition-colors font-bold flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('offered')}
                  disabled={application.status === 'offered'}
                  className="h-8 px-3 rounded-lg border border-emerald-250/50 bg-emerald-50 text-emerald-650 hover:bg-emerald-100/50 dark:bg-emerald-950/15 dark:text-emerald-400 transition-colors font-bold disabled:opacity-40"
                >
                  Approve Offer
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={application.status === 'rejected'}
                  className="h-8 px-3 rounded-lg border border-rose-250/50 bg-rose-50 text-rose-650 hover:bg-rose-100/50 dark:bg-rose-950/15 dark:text-rose-450 transition-colors font-bold disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Actions Footer */}
        <div className="px-6 py-4 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 border rounded-lg hover:bg-muted text-xs font-semibold transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default CandidateDetailsDialog;
