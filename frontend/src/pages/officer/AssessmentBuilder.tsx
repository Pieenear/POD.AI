import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Logo } from '../../components/shared/Logo';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Code2,
  Sliders,
  Sparkles
} from 'lucide-react';

interface JobItem {
  _id: string;
  title: string;
  companyId?: {
    _id: string;
    name: string;
  };
}

export const AssessmentBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingMarks, setPassingMarks] = useState(50);
  const [assessmentType, setAssessmentType] = useState<'mcq' | 'coding' | 'mixed'>('mcq');

  // MCQs states
  const [mcqList, setMcqList] = useState<any[]>([]);
  const [currentMcqText, setCurrentMcqText] = useState('');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number>(0);

  // Coding states
  const [codingList, setCodingList] = useState<any[]>([]);
  const [currentCodeText, setCurrentCodeText] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [correctCode, setCorrectCode] = useState('');
  
  // Test cases states
  const [testCases, setTestCases] = useState<Array<{ input: string; expectedOutput: string }>>([]);
  const [currentTestInput, setCurrentTestInput] = useState('');
  const [currentTestOutput, setCurrentTestOutput] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assessments/jobs');
      setJobs(res.data.data.jobs || []);
      if (res.data.data.jobs?.length > 0) {
        setSelectedJobId(res.data.data.jobs[0]._id);
      }
    } catch {
      showNotice('Failed to retrieve active job openings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddMcq = () => {
    if (!currentMcqText.trim()) {
      showNotice('MCQ question text is required', 'error');
      return;
    }
    const emptyOptions = mcqOptions.some(opt => !opt.trim());
    if (emptyOptions) {
      showNotice('All 4 MCQ option inputs must be filled.', 'error');
      return;
    }

    const newQuestion = {
      questionText: currentMcqText,
      options: [...mcqOptions],
      correctOptionIndex: correctOption
    };

    setMcqList(prev => [...prev, newQuestion]);
    // Reset inputs
    setCurrentMcqText('');
    setMcqOptions(['', '', '', '']);
    setCorrectOption(0);
    showNotice('MCQ question added to builder pipeline.');
  };

  const handleRemoveMcq = (idx: number) => {
    setMcqList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddTestCase = () => {
    if (!currentTestInput.trim() || !currentTestOutput.trim()) {
      showNotice('Test case input and expected output are required.', 'error');
      return;
    }
    setTestCases(prev => [...prev, { input: currentTestInput, expectedOutput: currentTestOutput }]);
    setCurrentTestInput('');
    setCurrentTestOutput('');
  };

  const handleRemoveTestCase = (idx: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddCoding = () => {
    if (!currentCodeText.trim()) {
      showNotice('Coding challenge description is required.', 'error');
      return;
    }
    if (testCases.length === 0) {
      showNotice('Add at least one test case for this challenge.', 'error');
      return;
    }

    const newChallenge = {
      questionText: currentCodeText,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      correctCodeSnippet: correctCode,
      testCases: [...testCases]
    };

    setCodingList(prev => [...prev, newChallenge]);
    // Reset inputs
    setCurrentCodeText('');
    setInputFormat('');
    setOutputFormat('');
    setSampleInput('');
    setSampleOutput('');
    setCorrectCode('');
    setTestCases([]);
    showNotice('Coding challenge added to builder pipeline.');
  };

  const handleRemoveCoding = (idx: number) => {
    setCodingList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...mcqOptions];
    updated[idx] = val;
    setMcqOptions(updated);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedJobId) {
      showNotice('Title and Job assignment are required fields.', 'error');
      return;
    }

    if (assessmentType === 'mcq' && mcqList.length === 0) {
      showNotice('Add at least one MCQ question to publish MCQ assessment.', 'error');
      return;
    }

    if (assessmentType === 'coding' && codingList.length === 0) {
      showNotice('Add at least one Coding challenge to publish Coding assessment.', 'error');
      return;
    }

    if (assessmentType === 'mixed' && mcqList.length === 0 && codingList.length === 0) {
      showNotice('Add at least one question or challenge to publish mixed assessment.', 'error');
      return;
    }

    // Find linked company
    const linkedJob = jobs.find(j => j._id === selectedJobId);
    const companyId = linkedJob?.companyId?._id;

    if (!companyId) {
      showNotice('Selected job does not contain a valid linked company ID.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title,
        jobId: selectedJobId,
        companyId,
        type: assessmentType,
        mcqQuestions: assessmentType !== 'coding' ? mcqList : [],
        codingQuestions: assessmentType !== 'mcq' ? codingList : [],
        duration: Number(duration),
        passingMarks: Number(passingMarks)
      };

      await api.post('/assessments', payload);
      showNotice('Assessment published successfully!');
      setTimeout(() => {
        navigate('/officer');
      }, 1500);
    } catch {
      showNotice('Failed to publish assessment configurations.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-455'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/dashboard">
              <Logo size="sm" subtitle="Placement Assessments" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/officer"
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-xs font-bold transition-all gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Officer Home
            </Link>
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="inline-flex h-9 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-sm font-medium transition-colors gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub Header */}
      <section className="bg-white dark:bg-slate-900 border-b py-8 text-left">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-2xl font-bold tracking-tight">Interactive Assessment Builder</h2>
          <p className="text-sm text-indigo-650 dark:text-indigo-400 font-semibold">Author timed MCQ & code tests linked to campus recruitment drives.</p>
        </div>
      </section>

      {/* Main Grid content */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <span className="text-xs text-muted-foreground font-semibold">Loading placement drive openings...</span>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left text-xs">
            
            {/* Left: General Assessment Parameters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold flex items-center gap-1.5 border-b pb-2">
                  <Sliders className="h-4 w-4 text-indigo-500" />
                  Parameters
                </h3>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Assessment Title</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. TCS Aptitude Test 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Target Recruitment Drive</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.companyId?.name || 'Company'} - {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Passing Score (%)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={100}
                      className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Assessment Type</label>
                  <select
                    value={assessmentType}
                    onChange={(e: any) => setAssessmentType(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="mcq">MCQ Questions Only</option>
                    <option value="coding">Coding Exercises Only</option>
                    <option value="mixed">Mixed (MCQ + Coding)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-sm shadow-indigo-600/10 mt-4 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  {submitting ? 'Publishing...' : 'Publish Assessment'}
                </button>
              </div>
            </div>

            {/* Right: Question builders */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* MCQ Question Creator */}
              {(assessmentType === 'mcq' || assessmentType === 'mixed') && (
                <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold flex items-center gap-1.5 border-b pb-2">
                    <HelpCircle className="h-4 w-4 text-violet-500" />
                    MCQ Question Builder
                  </h3>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Question Text</label>
                    <textarea
                      rows={2}
                      className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      placeholder="e.g. Which of the following data structures has constant lookup complexity in average cases?"
                      value={currentMcqText}
                      onChange={(e) => setCurrentMcqText(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {mcqOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-550 text-[10px]">Option {String.fromCharCode(65 + oIdx)}</label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={correctOption === oIdx}
                              onChange={() => setCorrectOption(oIdx)}
                              className="text-indigo-650 focus:ring-indigo-500 h-3 w-3"
                            />
                            <span className="text-[10px] font-bold text-slate-500">Correct</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                          value={opt}
                          onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMcq}
                    className="h-9 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-all flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Question to Test
                  </button>

                  {/* Added MCQs preview */}
                  {mcqList.length > 0 && (
                    <div className="pt-4 border-t space-y-2">
                      <p className="font-extrabold text-[10px] uppercase tracking-widest text-slate-500">Buffered MCQs ({mcqList.length})</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {mcqList.map((m, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 border rounded-xl flex items-start justify-between gap-3 text-[11px] leading-relaxed">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{idx + 1}. {m.questionText}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                Options: {m.options.join(' | ')}
                                <span className="ml-2 font-bold text-emerald-650 dark:text-emerald-400"> (Correct: Option {String.fromCharCode(65 + m.correctOptionIndex)})</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMcq(idx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Coding Exercise Creator */}
              {(assessmentType === 'coding' || assessmentType === 'mixed') && (
                <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold flex items-center gap-1.5 border-b pb-2">
                    <Code2 className="h-4 w-4 text-indigo-500" />
                    Coding Challenge Builder
                  </h3>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Problem Description</label>
                    <textarea
                      rows={3}
                      className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      placeholder="e.g. Write a function reverseString(str) that takes a string input and returns the reversed string."
                      value={currentCodeText}
                      onChange={(e) => setCurrentCodeText(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-550 text-[10px]">Input Format</label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                        placeholder="e.g. A single string str"
                        value={inputFormat}
                        onChange={(e) => setInputFormat(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-550 text-[10px]">Output Format</label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                        placeholder="e.g. Reversed output string"
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-550 text-[10px]">Sample Input</label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                        placeholder="e.g. hello"
                        value={sampleInput}
                        onChange={(e) => setSampleInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-550 text-[10px]">Sample Output</label>
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none"
                        placeholder="e.g. olleh"
                        value={sampleOutput}
                        onChange={(e) => setSampleOutput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Reference Solution / Code Snippet</label>
                    <textarea
                      rows={4}
                      className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={`function reverseString(str) {\n  return str.split('').reverse().join('');\n}`}
                      value={correctCode}
                      onChange={(e) => setCorrectCode(e.target.value)}
                    />
                  </div>

                  {/* Test Cases Sub-Form */}
                  <div className="p-4.5 bg-slate-50 dark:bg-slate-850 border rounded-2xl space-y-3">
                    <p className="font-extrabold text-[10px] uppercase tracking-widest text-slate-500">Test Cases ({testCases.length})</p>
                    
                    <div className="flex gap-3">
                      <div className="flex-grow space-y-1">
                        <label className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Input Parameters</label>
                        <input
                          type="text"
                          className="block w-full px-2.5 py-1.5 border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-xs"
                          placeholder="e.g. javascript"
                          value={currentTestInput}
                          onChange={(e) => setCurrentTestInput(e.target.value)}
                        />
                      </div>
                      <div className="flex-grow space-y-1">
                        <label className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Expected Output</label>
                        <input
                          type="text"
                          className="block w-full px-2.5 py-1.5 border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-xs"
                          placeholder="e.g. tpircsavaj"
                          value={currentTestOutput}
                          onChange={(e) => setCurrentTestOutput(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="h-8.5 px-3 self-end rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all text-[11px]"
                      >
                        Add Case
                      </button>
                    </div>

                    {/* Test cases list */}
                    {testCases.length > 0 && (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pt-2">
                        {testCases.map((tc, tcIdx) => (
                          <div key={tcIdx} className="flex justify-between items-center text-[10px] bg-white dark:bg-slate-900 p-2 border rounded-lg font-medium leading-none">
                            <span>Case {tcIdx + 1}: Input: <code className="bg-slate-100 p-0.5 rounded">{tc.input}</code> | Expected: <code className="bg-slate-100 p-0.5 rounded">{tc.expectedOutput}</code></span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTestCase(tcIdx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCoding}
                    className="h-9 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-all flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Challenge to Test
                  </button>

                  {/* Added coding challenges preview */}
                  {codingList.length > 0 && (
                    <div className="pt-4 border-t space-y-2">
                      <p className="font-extrabold text-[10px] uppercase tracking-widest text-slate-500">Buffered Challenges ({codingList.length})</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {codingList.map((c, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 border rounded-xl flex items-start justify-between gap-3 text-[11px] leading-relaxed">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{idx + 1}. {c.questionText}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                Test cases: {c.testCases.length} loaded
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoding(idx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </form>
        )}
      </main>
    </div>
  );
};
export default AssessmentBuilder;
