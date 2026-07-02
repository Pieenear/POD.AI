import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  current: z.boolean(),
  grade: z.string().optional().or(z.literal(''))
});

type EducationFields = z.infer<typeof educationSchema>;

interface EducationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const EducationDialog: React.FC<EducationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<EducationFields>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      current: false
    }
  });

  const isCurrent = watch('current');

  useEffect(() => {
    if (initialData) {
      // Format dates to YYYY-MM-DD for input compatibility
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
        grade: initialData.grade || ''
      });
    } else {
      reset({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: false,
        grade: ''
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: EducationFields) => {
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in text-left">
        
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
              <input
                type="text"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.degree ? 'border-rose-450 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="e.g. B.Tech / M.S."
                {...register('degree')}
              />
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
