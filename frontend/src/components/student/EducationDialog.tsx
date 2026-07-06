import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, FileText, Trash2, Eye } from 'lucide-react';
import api from '../../config/api';

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  current: z.boolean(),
  grade: z.string().optional().or(z.literal('')),
  marksheetUrl: z.string().optional().or(z.literal(''))
});

type EducationFields = z.infer<typeof educationSchema>;

interface EducationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const defaultSemesters = [
  { year: 1, semester: 'I', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' },
  { year: 1, semester: 'II', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' },
  { year: 2, semester: 'III', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' },
  { year: 2, semester: 'IV', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' },
  { year: 3, semester: 'V', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' },
  { year: 3, semester: 'VI', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' },
  { year: 4, semester: 'VII', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' },
  { year: 4, semester: 'VIII', cgpa: '', closedBacklogs: '', liveBacklogs: '', marksheetUrl: '' }
];

export const EducationDialog: React.FC<EducationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');
  const [semestersState, setSemestersState] = useState<any[]>(defaultSemesters);
  const [uploadingSemIdx, setUploadingSemIdx] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EducationFields>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      current: false,
      grade: '',
      marksheetUrl: ''
    }
  });

  const isCurrent = watch('current');
  const selectedDegree = watch('degree');
  const marksheetUrlVal = watch('marksheetUrl');

  useEffect(() => {
    if (initialData) {
      const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
      };
      
      reset({
        institution: initialData.institution || '',
        degree: initialData.degree || '',
        fieldOfStudy: initialData.fieldOfStudy || '',
        startDate: formatDate(initialData.startDate),
        endDate: formatDate(initialData.endDate),
        current: !!initialData.current,
        grade: initialData.grade || '',
        marksheetUrl: initialData.marksheetUrl || ''
      });

      setSemestersState(initialData.semesters && initialData.semesters.length > 0
        ? initialData.semesters.map((s: any) => ({
            year: s.year,
            semester: s.semester,
            cgpa: s.cgpa !== undefined ? String(s.cgpa) : '',
            closedBacklogs: s.closedBacklogs !== undefined ? String(s.closedBacklogs) : '',
            liveBacklogs: s.liveBacklogs !== undefined ? String(s.liveBacklogs) : '',
            marksheetUrl: s.marksheetUrl || ''
          }))
        : defaultSemesters.map(s => ({ ...s }))
      );
    } else {
      reset({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: false,
        grade: '',
        marksheetUrl: ''
      });
      setSemestersState(defaultSemesters.map(s => ({ ...s })));
    }
    setDocError('');
  }, [initialData, reset, isOpen]);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('document', file);
    setUploadingDoc(true);
    setDocError('');
    try {
      const res = await api.post('/student/document/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValue('marksheetUrl', res.data.url);
    } catch (err: any) {
      setDocError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSemesterUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('document', file);
    setUploadingSemIdx(idx);
    try {
      const res = await api.post('/student/document/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updated = [...semestersState];
      updated[idx].marksheetUrl = res.data.url;
      setSemestersState(updated);
    } catch (err) {
      alert('Failed to upload marksheet');
    } finally {
      setUploadingSemIdx(null);
    }
  };

  const handleSemesterDeleteFile = (idx: number) => {
    const updated = [...semestersState];
    updated[idx].marksheetUrl = '';
    setSemestersState(updated);
  };

  if (!isOpen) return null;

  const onSubmit = (data: EducationFields) => {
    // Process semester details: convert empty inputs to undefined or parse numbers
    const finalSemesters = selectedDegree === 'Degree (UG/PG)'
      ? semestersState.map(s => ({
          year: Number(s.year),
          semester: s.semester,
          cgpa: s.cgpa !== '' ? Number(s.cgpa) : undefined,
          closedBacklogs: s.closedBacklogs !== '' ? Number(s.closedBacklogs) : undefined,
          liveBacklogs: s.liveBacklogs !== '' ? Number(s.liveBacklogs) : undefined,
          marksheetUrl: s.marksheetUrl || undefined
        }))
      : undefined;

    // Calculate aggregates if UG/PG
    let aggregateCgpa: number | undefined = undefined;
    let totalClosedBacklogs: number | undefined = undefined;
    let totalLiveBacklogs: number | undefined = undefined;

    if (selectedDegree === 'Degree (UG/PG)') {
      const validCgpas = finalSemesters!.filter(s => s.cgpa !== undefined).map(s => s.cgpa!);
      if (validCgpas.length > 0) {
        aggregateCgpa = Number((validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2));
      }
      totalClosedBacklogs = finalSemesters!.reduce((acc, s) => acc + (s.closedBacklogs || 0), 0);
      totalLiveBacklogs = finalSemesters!.reduce((acc, s) => acc + (s.liveBacklogs || 0), 0);
    }

    const finalData = {
      ...data,
      semesters: finalSemesters,
      aggregateCgpa,
      totalClosedBacklogs,
      totalLiveBacklogs,
      grade: selectedDegree === 'Degree (UG/PG)' && aggregateCgpa !== undefined ? String(aggregateCgpa) : data.grade
    };

    onSave(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full shadow-xl overflow-hidden animate-fade-in text-left my-8 ${
        selectedDegree === 'Degree (UG/PG)' ? 'max-w-4xl' : 'max-w-lg'
      }`}>
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {initialData ? 'Edit Education' : 'Add Education'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Institution / University
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.institution ? 'border-rose-450 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Stanford University"
              {...register('institution')}
            />
            {errors.institution && (
              <p className="text-xs text-rose-500">{errors.institution.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Degree
              </label>
              <select
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.degree ? 'border-rose-450 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
                {...register('degree')}
              >
                <option value="">Select Level</option>
                <option value="Secondary (10th)">Secondary (10th)</option>
                <option value="Higher Secondary (12th)">Higher Secondary (12th)</option>
                <option value="Degree (UG/PG)">Degree (UG/PG)</option>
              </select>
              {errors.degree && (
                <p className="text-xs text-rose-500">{errors.degree.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Field of Study
              </label>
              <input
                type="text"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.fieldOfStudy ? 'border-rose-450 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="e.g. Computer Science"
                {...register('fieldOfStudy')}
              />
              {errors.fieldOfStudy && (
                <p className="text-xs text-rose-500">{errors.fieldOfStudy.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.startDate ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                }`}
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-xs text-rose-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                disabled={isCurrent}
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.endDate ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                } disabled:opacity-40`}
                {...register('endDate')}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              id="current-edu"
              type="checkbox"
              className="rounded border-slate-300 dark:border-slate-750 text-indigo-600 focus:ring-indigo-500"
              {...register('current')}
            />
            <label htmlFor="current-edu" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              I am currently studying here
            </label>
          </div>

          {/* Conditional Semester-wise table for Degree (UG/PG) */}
          {selectedDegree === 'Degree (UG/PG)' ? (
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-extrabold text-foreground">Semester Academic Details</h4>
              <div className="overflow-x-auto border rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 dark:bg-slate-850 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      <th className="p-3">Year</th>
                      <th className="p-3">Semester</th>
                      <th className="p-3">Aggregate CGPA</th>
                      <th className="p-3">Closed Backlogs</th>
                      <th className="p-3">Live Backlogs</th>
                      <th className="p-3">Marksheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semestersState.map((sem, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/25">
                        <td className="p-3 font-bold text-slate-500">{sem.year}</td>
                        <td className="p-3 font-extrabold text-slate-700 dark:text-slate-300">{sem.semester}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            placeholder="0.00"
                            className="w-20 px-2 py-1 border rounded bg-card focus:outline-none"
                            value={sem.cgpa}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...semestersState];
                              updated[idx].cgpa = val;
                              setSemestersState(updated);
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-16 px-2 py-1 border rounded bg-card focus:outline-none"
                            value={sem.closedBacklogs}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...semestersState];
                              updated[idx].closedBacklogs = val;
                              setSemestersState(updated);
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-16 px-2 py-1 border rounded bg-card focus:outline-none"
                            value={sem.liveBacklogs}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...semestersState];
                              updated[idx].liveBacklogs = val;
                              setSemestersState(updated);
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {sem.marksheetUrl ? (
                              <div className="flex items-center gap-1">
                                <a
                                  href={sem.marksheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View Marksheet"
                                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleSemesterDeleteFile(idx)}
                                  title="Delete Marksheet"
                                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-rose-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <label className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-indigo-650 cursor-pointer">
                                  <Upload className="h-3.5 w-3.5" />
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleSemesterUpload(e, idx)}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="p-1.5 border rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer w-8 h-8">
                                <Upload className="h-4 w-4 text-slate-500" />
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={(e) => handleSemesterUpload(e, idx)}
                                />
                              </label>
                            )}
                            {uploadingSemIdx === idx && (
                              <span className="text-[10px] text-muted-foreground animate-pulse">Uploading...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Aggregates row matching screenshot */}
                    <tr className="bg-slate-100 dark:bg-slate-850 font-bold border-t border-slate-250">
                      <td className="p-3" colSpan={2}>Aggregate CGPA *</td>
                      <td className="p-3">
                        <input
                          type="text"
                          readOnly
                          className="w-20 px-2 py-1 border rounded bg-secondary/35 text-slate-500 font-extrabold focus:outline-none"
                          value={
                            semestersState.map(s => parseFloat(s.cgpa)).filter(n => !isNaN(n)).length > 0
                              ? (semestersState.map(s => parseFloat(s.cgpa)).filter(n => !isNaN(n)).reduce((a, b) => a + b, 0) /
                                 semestersState.map(s => parseFloat(s.cgpa)).filter(n => !isNaN(n)).length).toFixed(2)
                              : '0.00'
                          }
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          readOnly
                          className="w-16 px-2 py-1 border rounded bg-secondary/35 text-slate-500 font-extrabold focus:outline-none"
                          value={semestersState.map(s => parseInt(s.closedBacklogs)).filter(n => !isNaN(n)).reduce((a, b) => a + b, 0)}
                        />
                      </td>
                      <td className="p-3" colSpan={2}>
                        <input
                          type="text"
                          readOnly
                          className="w-16 px-2 py-1 border rounded bg-secondary/35 text-slate-500 font-extrabold focus:outline-none"
                          value={semestersState.map(s => parseInt(s.liveBacklogs)).filter(n => !isNaN(n)).reduce((a, b) => a + b, 0)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Grade (CGPA / Percentage)
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="e.g. 9.1 CGPA or 85%"
                  {...register('grade')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Marksheet File
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors border-slate-200 dark:border-slate-800">
                    <Upload className="h-4 w-4" />
                    {uploadingDoc ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleDocUpload}
                    />
                  </label>
                  {marksheetUrlVal ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <FileText className="h-3.5 w-3.5" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold">No file uploaded</span>
                  )}
                </div>
                {docError && <p className="text-[11px] text-rose-500">{docError}</p>}
              </div>
            </>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 border rounded-lg hover:bg-muted text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EducationDialog;
