import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Calendar, Clock, Video, MessageSquare } from 'lucide-react';

export const StudentInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/interviews');
        setInterviews(res.data.data.interviews || []);
      } catch (err) {
        console.error('Failed to load student interviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Interview Calendars...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl select-none">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-foreground">Interview Slots</h2>
        <p className="text-xs text-muted-foreground">Monitor schedules, virtual links, and outcome feedbacks for active job drives.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
        {interviews.length > 0 ? (
          interviews.map((slot) => {
            const dateStr = slot.date ? new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Unscheduled';
            const timeStr = slot.date ? new Date(slot.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <div key={slot._id} className="bg-card border p-5 rounded-2xl flex flex-col justify-between hover:border-slate-350 transition-colors shadow-xxs gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground">{slot.jobId?.title || 'Software Role'}</h3>
                      <p className="text-xxs text-primary font-bold">{slot.jobId?.companyId?.name || 'Recruiting Partner'}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      slot.status === 'scheduled' 
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/25' 
                        : slot.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/25'
                    }`}>
                      {slot.status}
                    </span>
                  </div>

                  <div className="p-3 bg-secondary/35 border rounded-xl space-y-2 text-xxs font-bold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Date: <span className="text-foreground">{dateStr}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>Time: <span className="text-foreground">{timeStr}</span></span>
                    </div>
                    {slot.linkOrLocation && (
                      <div className="flex items-center gap-2 border-t border-dashed pt-2">
                        {slot.type === 'online' ? (
                          <>
                            <Video className="h-4 w-4 text-primary" />
                            <a href={slot.linkOrLocation.startsWith('http') ? slot.linkOrLocation : `https://${slot.linkOrLocation}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">Join Virtual Meeting</a>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 text-slate-400" />
                            <span>Location: <span className="text-foreground">{slot.linkOrLocation}</span></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {slot.feedback && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-2 text-[10px] text-emerald-850">
                    <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black uppercase tracking-wider text-[8px] text-emerald-600">Recruiter Feedback</span>
                      <p className="mt-0.5 leading-relaxed font-medium">{slot.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-12 border border-dashed rounded-2xl bg-secondary/15 text-center text-muted-foreground">
            No scheduled interview slots found for your profile.
          </div>
        )}
      </div>

    </div>
  );
};
export default StudentInterviews;
