import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { Clock, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const StudentAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/assessments');
        setAssessments(res.data.data.assessments || []);
      } catch (err) {
        console.error('Failed to fetch student assessments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Assessments Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl select-none">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-foreground">Skill Assessments</h2>
        <p className="text-xs text-muted-foreground">Practice compiler-checked coding questions and MCQ screening tests.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs font-semibold">
        {assessments.length > 0 ? (
          assessments.map((test) => {
            const isCompleted = test.completed === true;
            return (
              <div key={test._id} className="bg-card border p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-350 transition-colors shadow-xxs">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded-full">
                      {test.type}
                    </span>
                    <h3 className="font-extrabold text-sm text-foreground">{test.title}</h3>
                  </div>
                  <p className="text-xxs text-muted-foreground font-bold">{test.companyId?.name || 'Recruiting Partner'}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1.5 border-t border-dashed">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {test.duration} min</span>
                    <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> {test.questions?.length || 0} questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  {isCompleted ? (
                    <div className="text-right space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-xl">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Completed
                      </span>
                      {test.score !== undefined && (
                        <p className="text-[10px] text-muted-foreground">Score: <span className="text-foreground font-bold">{test.score}%</span></p>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={`/assessments/${test._id}`}
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-5 text-xs uppercase tracking-wider gap-1 shadow-sm transition-transform active:scale-95 hover:scale-[1.01]"
                    >
                      Start Test
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 border border-dashed rounded-2xl bg-secondary/15 text-center text-muted-foreground">
            No pending or assigned recruiter assessments listed.
          </div>
        )}
      </div>

    </div>
  );
};
export default StudentAssessments;
