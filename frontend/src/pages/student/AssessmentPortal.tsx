import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Logo } from '../../components/shared/Logo';
import {
  ArrowLeft,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  Send
} from 'lucide-react';

export const AssessmentPortal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Take test state variables
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const [timeLeft, setTimeLeft] = useState(3600); // dynamic duration tracking in seconds
  const [activeQuestionTab, setActiveQuestionTab] = useState<'mcq' | 'coding'>('mcq');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Student answer rosters
  const [mcqAnswers, setMcqAnswers] = useState<Array<{ questionIndex: number; selectedOptionIndex: number }>>([]);
  const [codingAnswers, setCodingAnswers] = useState<Array<{ questionIndex: number; code: string }>>([]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assessments/${id}`);
      const data = res.data.data;
      setAssessment(data.assessment);
      setHasSubmitted(data.hasSubmitted);
      if (data.hasSubmitted) {
        setSubmissionResult(data.submission);
      } else {
        // Init rosters
        const durationSecs = (data.assessment.duration || 60) * 60;
        setTimeLeft(durationSecs);

        const initialMcqs = (data.assessment.mcqQuestions || []).map((_: any, idx: number) => ({
          questionIndex: idx,
          selectedOptionIndex: -1
        }));
        setMcqAnswers(initialMcqs);

        const initialCoding = (data.assessment.codingQuestions || []).map((_: any, idx: number) => ({
          questionIndex: idx,
          code: `// Complete the code block below\nfunction solution() {\n  \n}`
        }));
        setCodingAnswers(initialCoding);

        if (data.assessment.mcqQuestions?.length === 0 && data.assessment.codingQuestions?.length > 0) {
          setActiveQuestionTab('coding');
        }
      }
    } catch {
      showNotice('Failed to download assessment details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (loading || hasSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, hasSubmitted, timeLeft]);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleMcqSelect = (qIdx: number, oIdx: number) => {
    setMcqAnswers(prev => prev.map(ans => ans.questionIndex === qIdx ? { ...ans, selectedOptionIndex: oIdx } : ans));
  };

  const handleCodeChange = (qIdx: number, val: string) => {
    setCodingAnswers(prev => prev.map(ans => ans.questionIndex === qIdx ? { ...ans, code: val } : ans));
  };

  const triggerAutoSubmit = () => {
    showNotice('Assessment session time expired! Submitting answers automatically...', 'error');
    handleSubmitSubmitAction(true);
  };

  const handleSubmitSubmitAction = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Are you sure you want to finish and submit your assessment?')) return;

    try {
      setSubmitting(true);
      // Clean up unselected MCQs
      const filteredMcqs = mcqAnswers.filter(ans => ans.selectedOptionIndex !== -1);
      
      const payload = {
        mcqAnswers: filteredMcqs,
        codingAnswers
      };

      const res = await api.post(`/assessments/${id}/submit`, payload);
      setSubmissionResult(res.data.data.submission);
      setHasSubmitted(true);
      showNotice(res.data.message || 'Assessment submitted and evaluated.');
    } catch {
      showNotice('Failed to submit assessment answers.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse-slow">Loading Assessment Portal Session...</p>
        </div>
      </div>
    );
  }

  // Submitted / Results View
  if (hasSubmitted && submissionResult) {
    const isPassed = submissionResult.result === 'pass';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link to="/dashboard">
                <Logo size="sm" subtitle="Session Terminated" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-xs font-bold transition-all gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Console Home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Results Body */}
        <main className="flex-grow container mx-auto px-6 py-12 max-w-2xl flex flex-col items-center justify-center text-center">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl p-10 shadow-lg space-y-6 w-full relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-2 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center border ${
              isPassed ? 'bg-emerald-550/10 border-emerald-205 text-emerald-600' : 'bg-rose-550/10 border-rose-205 text-rose-600'
            }`}>
              <Award className="h-9 w-9" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black">{isPassed ? 'Assessment Cleared!' : 'Assessment Incompleted'}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-extrabold">{assessment?.title}</p>
            </div>

            <div className="py-6 border-y flex justify-around items-center">
              <div>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{submissionResult.score}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Your Score</p>
              </div>
              <div className="border-l h-8 border-slate-200 dark:border-slate-800" />
              <div>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{assessment?.passingMarks}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Required to Pass</p>
              </div>
              <div className="border-l h-8 border-slate-200 dark:border-slate-800" />
              <div>
                <p className={`text-base font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>{submissionResult.result}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1.5">Result Status</p>
              </div>
            </div>

            <div className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border">
              {isPassed ? (
                <span>🎉 Congratulations! You have satisfied the eligibility criteria for the next rounds. Your recruitment application status has been upgraded to <strong>Shortlisted</strong>. Keep an eye on your Interview Tracker.</span>
              ) : (
                <span>You did not meet the minimal passing criteria threshold. Don't worry! Review the recommended skills on your Dashboard page and continue preparation.</span>
              )}
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex h-10 items-center justify-center px-6 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/10 transition-colors"
              >
                Go to Dashboard Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Questions Taking View
  const mcqQuestions = assessment?.mcqQuestions || [];
  const codingQuestions = assessment?.codingQuestions || [];
  const totalQuestions = activeQuestionTab === 'mcq' ? mcqQuestions.length : codingQuestions.length;
  const activeQuestion = activeQuestionTab === 'mcq' ? mcqQuestions[currentQuestionIndex] : codingQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border bg-white shadow-lg flex items-center gap-2 text-xs">
          <span>{notification.text}</span>
        </div>
      )}

      {/* Timer Bar Header */}
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{assessment?.title}</span>
            <span className="hidden sm:inline text-xs text-muted-foreground border-l pl-4 font-semibold">{assessment?.companyId?.name}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-rose-600 font-mono text-sm font-black border border-rose-200/50 bg-rose-50/50 px-3 py-1.5 rounded-full dark:bg-rose-950/10">
              <Clock className="h-4 w-4 animate-pulse" />
              <span>Time Left: {formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => handleSubmitSubmitAction(false)}
              disabled={submitting}
              className="inline-flex h-9 items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 rounded-lg text-xs gap-1.5 shadow-sm shadow-indigo-600/10 transition-colors shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Assessment
            </button>
          </div>
        </div>
      </header>

      {/* Tabs list (MCQ / Coding toggle) */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl flex flex-col gap-6 text-left text-xs">
        
        {/* Toggle selectors */}
        <div className="flex gap-2">
          {mcqQuestions.length > 0 && (
            <button
              onClick={() => {
                setActiveQuestionTab('mcq');
                setCurrentQuestionIndex(0);
              }}
              className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                activeQuestionTab === 'mcq'
                  ? 'bg-indigo-600 border-indigo-650 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:border-slate-800'
              }`}
            >
              MCQ Questions ({mcqQuestions.length})
            </button>
          )}
          {codingQuestions.length > 0 && (
            <button
              onClick={() => {
                setActiveQuestionTab('coding');
                setCurrentQuestionIndex(0);
              }}
              className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                activeQuestionTab === 'coding'
                  ? 'bg-indigo-600 border-indigo-650 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:border-slate-800'
              }`}
            >
              Coding Challenges ({codingQuestions.length})
            </button>
          )}
        </div>

        {/* Content Box */}
        {totalQuestions > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Sidebar list indicator */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border rounded-2xl p-4.5 space-y-3">
              <p className="font-extrabold text-[10px] text-slate-550 uppercase tracking-widest">Question Navigation</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }).map((_, qIdx) => {
                  const isActive = currentQuestionIndex === qIdx;
                  
                  // Check answered status
                  let isAnswered = false;
                  if (activeQuestionTab === 'mcq') {
                    isAnswered = mcqAnswers[qIdx]?.selectedOptionIndex !== -1;
                  } else {
                    isAnswered = codingAnswers[qIdx]?.code.trim().length > 50; // simple typing check
                  }

                  return (
                    <button
                      key={qIdx}
                      onClick={() => setCurrentQuestionIndex(qIdx)}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-extrabold text-xs border transition-all ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-650 text-white shadow-sm'
                          : isAnswered
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-850 dark:border-slate-800'
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Question Body */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6.5 shadow-sm space-y-6 min-h-[380px] flex flex-col justify-between">
                
                {/* Question Details Header */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-b pb-3">
                    <span className="font-bold text-xs uppercase tracking-widest text-indigo-650 dark:text-indigo-400">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold">Value: 100 Marks</span>
                  </div>

                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">{activeQuestion.questionText}</p>

                  {/* MCQ Options Rendering */}
                  {activeQuestionTab === 'mcq' && activeQuestion.options && (
                    <div className="space-y-3 pt-2">
                      {activeQuestion.options.map((opt: string, oIdx: number) => {
                        const isSelected = mcqAnswers[currentQuestionIndex]?.selectedOptionIndex === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleMcqSelect(currentQuestionIndex, oIdx)}
                            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all font-semibold ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-805 dark:bg-indigo-950/25 dark:border-indigo-800'
                                : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-indigo-600 border-indigo-650 text-white' : 'bg-white border-slate-300 text-slate-550 dark:bg-slate-800'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Coding Editor Area */}
                  {activeQuestionTab === 'coding' && (
                    <div className="space-y-4 pt-2">
                      {/* Specifications */}
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border">
                        {activeQuestion.inputFormat && <div>Input Format: <span className="text-slate-800 dark:text-slate-200 font-medium normal-case block mt-0.5">{activeQuestion.inputFormat}</span></div>}
                        {activeQuestion.outputFormat && <div>Output Format: <span className="text-slate-800 dark:text-slate-200 font-medium normal-case block mt-0.5">{activeQuestion.outputFormat}</span></div>}
                      </div>

                      {/* Sample Preview cases */}
                      {activeQuestion.sampleTestCase && activeQuestion.sampleTestCase.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-850 p-3 border rounded-lg text-[10px] font-bold text-slate-500 font-mono">
                          <div>Sample Input: <code className="block mt-0.5 text-slate-800 dark:text-slate-200 bg-white p-1 rounded font-medium">{activeQuestion.sampleTestCase[0].input}</code></div>
                          <div>Sample Output: <code className="block mt-0.5 text-slate-800 dark:text-slate-200 bg-white p-1 rounded font-medium">{activeQuestion.sampleTestCase[0].expectedOutput}</code></div>
                        </div>
                      )}

                      {/* Code editor */}
                      <div className="space-y-1">
                        <label className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">Write Solution Code</label>
                        <textarea
                          rows={12}
                          className="block w-full px-4.5 py-3.5 border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                          placeholder="// JavaScript code block goes here..."
                          value={codingAnswers[currentQuestionIndex]?.code || ''}
                          onChange={(e) => handleCodeChange(currentQuestionIndex, e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Question Controls footer */}
                <div className="flex justify-between border-t pt-4">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="h-9 px-4 rounded-lg border hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1 font-bold transition-all text-[11px]"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="h-9 px-4 rounded-lg border hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1 font-bold transition-all text-[11px]"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground border border-dashed rounded-2xl bg-white">
            No questions are listed in this assessment type category.
          </div>
        )}

      </main>
    </div>
  );
};
export default AssessmentPortal;
