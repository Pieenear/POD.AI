import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, FileText } from 'lucide-react';
import api from '../../config/api';

const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Job position is required'),
  location: z.string().optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  current: z.boolean(),
  description: z.string().optional().or(z.literal('')),
  cgpa: z.string().optional().or(z.literal('')),
  marksheetUrl: z.string().optional().or(z.literal('')),
  experienceType: z.enum(['job', 'internship'])
});

type ExperienceFields = z.infer<typeof experienceSchema>;

interface ExperienceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const ExperienceDialog: React.FC<ExperienceDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ExperienceFields>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      current: false,
      cgpa: '',
      marksheetUrl: '',
      experienceType: 'job'
    }
  });

  const isCurrent = watch('current');
  const marksheetUrlVal = watch('marksheetUrl');

  useEffect(() => {
    if (initialData) {
      const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
      };

      reset({
        company: initialData.company || '',
        position: initialData.position || '',
        location: initialData.location || '',
        startDate: formatDate(initialData.startDate),
        endDate: formatDate(initialData.endDate),
        current: !!initialData.current,
        description: initialData.description || '',
        cgpa: initialData.cgpa || '',
        marksheetUrl: initialData.marksheetUrl || '',
        experienceType: initialData.experienceType || 'job'
      });
    } else {
      reset({
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        cgpa: '',
        marksheetUrl: '',
        experienceType: 'job'
      });
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

  if (!isOpen) return null;

  const onSubmit = (data: ExperienceFields) => {
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in text-left">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {initialData ? 'Edit Work Experience' : 'Add Work Experience'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Experience Type
            </label>
            <select
              className="block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 border-slate-200 dark:border-slate-800 text-xs font-semibold"
              {...register('experienceType')}
            >
              <option value="job">Job / Employment</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Company Name
              </label>
              <input
                type="text"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.company ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="e.g. Google"
                {...register('company')}
              />
              {errors.company && (
                <p className="text-xs text-rose-500">{errors.company.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Role / Position
              </label>
              <input
                type="text"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.position ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="e.g. Software Engineer Intern"
                {...register('position')}
              />
              {errors.position && (
                <p className="text-xs text-rose-500">{errors.position.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              placeholder="e.g. San Francisco, CA (or Remote)"
              {...register('location')}
            />
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
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors disabled:opacity-40"
                {...register('endDate')}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              id="current-job"
              type="checkbox"
              className="rounded border-slate-300 dark:border-slate-750 text-indigo-600 focus:ring-indigo-500"
              {...register('current')}
            />
            <label htmlFor="current-job" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              I am currently working in this role
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                CGPA / Performance Rating
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                placeholder="e.g. 4.5/5 or Excellent"
                {...register('cgpa')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Experience Certificate / Marksheet
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Description / Responsibilities
            </label>
            <textarea
              rows={4}
              className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none"
              placeholder="Detail your responsibilities and achievements (e.g., Optimized database queries reducing latency by 20%...)"
              {...register('description')}
            />
          </div>

          {/* Actions */}
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
export default ExperienceDialog;
