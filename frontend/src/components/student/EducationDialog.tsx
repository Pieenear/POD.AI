import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, FileText, Trash2, Eye } from 'lucide-react';
import api from '../../config/api';

const educationSchema = z.object({
  institution: z.string().optional(),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  startYear: z.string().optional(),
  endYear: z.string().min(1, 'Year is required'),
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
      const getYearFromDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return String(new Date(dateStr).getFullYear());
      };
      
      reset({
        institution: initialData.institution || 'MIT School of Computing',
        degree: initialData.degree || '',
        fieldOfStudy: initialData.fieldOfStudy || '',
        startYear: getYearFromDate(initialData.startDate),
        endYear: getYearFromDate(initialData.endDate),
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
        institution: 'MIT School of Computing',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
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
    const startY = data.startYear ? parseInt(data.startYear) : undefined;
    const endY = data.endYear ? parseInt(data.endYear) : undefined;

    let startDateStr = '';
    let endDateStr = '';

    if (selectedDegree === 'Degree (UG/PG)') {
      if (startY) startDateStr = `${startY}-06-01`;
      if (endY) endDateStr = `${endY}-05-31`;
    } else {
      if (endY) {
        startDateStr = `${endY - 1}-06-01`;
        endDateStr = `${endY}-05-31`;
      }
    }

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
      institution: 'MIT School of Computing',
      degree: data.degree,
      fieldOfStudy: selectedDegree === 'Degree (UG/PG)' ? data.fieldOfStudy || 'Computer Science' : (selectedDegree === 'Secondary (10th)' ? 'Secondary Education' : 'Higher Secondary Education'),
      startDate: startDateStr,
      endDate: data.current ? '' : endDateStr,
      current: data.current,
      grade: selectedDegree === 'Degree (UG/PG)' && aggregateCgpa !== undefined ? String(aggregateCgpa) : data.grade,
      marksheetUrl: data.marksheetUrl,
      semesters: finalSemesters,
      aggregateCgpa,
      totalClosedBacklogs,
      totalLiveBacklogs
    };

    onSave(finalData);
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 40 }, (_, i) => String(currentYear + 5 - i));

  const isSchoolEducation = selectedDegree === 'Secondary (10th)' || selectedDegree === 'Higher Secondary (12th)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full shadow-xl overflow-hidden animate-fade-in text-left my-8 ${
        selectedDegree === 'Degree (UG/PG)' ? 'max-w-4xl' : 'max-w-lg'
      }`}>
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-base font-extrabold text-foreground">
            {initialData ? 'Edit Education' : 'Add Education'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          <div className={`${isSchoolEducation ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-4`}>
            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                Degree
              </label>
              <select
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
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
                <p className="text-xxs text-rose-500 font-bold">{errors.degree.message}</p>
              )}
            </div>

            {!isSchoolEducation && selectedDegree !== '' && (
              <div className="space-y-1.5">
                <label className="text-xxs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Field of Study
                </label>
                <input
                  type="text"
                  className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
                    errors.fieldOfStudy ? 'border-rose-450 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="e.g. Computer Science"
                  {...register('fieldOfStudy')}
                />
                {errors.fieldOfStudy && (
                  <p className="text-xxs text-rose-500 font-bold">{errors.fieldOfStudy.message}</p>
                )}
              </div>
            )}
          </div>

          {selectedDegree !== '' && (
            <>
              {isSchoolEducation ? (
                // Only ask for Passing Year for 10th and 12th
                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                    Passing Year
                  </label>
                  <select
                    className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
                      errors.endYear ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    {...register('endYear')}
                  >
                    <option value="">Select Passing Year</option>
                    {yearOptions.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                  {errors.endYear && (
                    <p className="text-xxs text-rose-500 font-bold">{errors.endYear.message}</p>
                  )}
                </div>
              ) : (
                // Ask for Start Year and End Year for Degree
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xxs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                      Start Year
                    </label>
                    <select
                      className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
                        errors.startYear ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                      }`}
                      {...register('startYear')}
                    >
                      <option value="">Select Start Year</option>
                      {yearOptions.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                      End Year
                    </label>
                    <select
                      disabled={isCurrent}
                      className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
                        errors.endYear ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                      } disabled:opacity-40`}
                      {...register('endYear')}
                    >
                      <option value="">Select End Year</option>
                      {yearOptions.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                    {errors.endYear && !isCurrent && (
                      <p className="text-xxs text-rose-500 font-bold">{errors.endYear.message}</p>
                    )}
                  </div>
                </div>
              )}

              {!isSchoolEducation && (
                <div className="flex items-center gap-2 py-1">
                  <input
                    id="current-edu"
                    type="checkbox"
                    className="rounded border-slate-350 text-primary focus:ring-primary h-4 w-4"
                    {...register('current')}
                  />
                  <label htmlFor="current-edu" className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    I am currently studying here
                  </label>
                </div>
              )}

              {/* Grade details and marksheets */}
              <div className={selectedDegree === 'Degree (UG/PG)' ? 'grid grid-cols-2 gap-4 border-t pt-4' : 'grid grid-cols-2 gap-4'}>
                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                    Grade (CGPA / Percentage)
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="e.g. 9.1 CGPA or 85%"
                    {...register('grade')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">
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
              </div>

              {/* Conditional Semester-wise table for Degree (UG/PG) */}
              {selectedDegree === 'Degree (UG/PG)' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Semester Academic Details</h4>
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
                                  const updated = [...semestersState];
                                  updated[idx].cgpa = e.target.value;
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
                                  const updated = [...semestersState];
                                  updated[idx].closedBacklogs = e.target.value;
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
                                  const updated = [...semestersState];
                                  updated[idx].liveBacklogs = e.target.value;
                                  setSemestersState(updated);
                                }}
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <label className="flex items-center gap-1 px-2.5 py-1 border rounded bg-card text-[10px] font-bold cursor-pointer hover:bg-slate-100 transition-colors">
                                  <Upload className="h-3 w-3" />
                                  Upload
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    disabled={uploadingSemIdx !== null}
                                    onChange={(e) => handleSemesterUpload(e, idx)}
                                  />
                                </label>
                                {sem.marksheetUrl && (
                                  <div className="flex items-center gap-1">
                                    <a
                                      href={sem.marksheetUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-primary hover:text-primary/80"
                                      title="View File"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleSemesterDeleteFile(idx)}
                                      className="text-rose-600 hover:text-rose-500"
                                      title="Delete File"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 border rounded-xl hover:bg-muted text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black transition-colors"
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
