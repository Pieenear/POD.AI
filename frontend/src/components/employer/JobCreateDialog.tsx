import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
  location: z.string().min(1, 'Location is required'),
  salaryRange: z.string().optional().or(z.literal('')),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract']),
  minCgpa: z.number().min(0).max(10),
  allowedBranchesString: z.string().optional().or(z.literal('')),
  maxBacklogs: z.number().min(0),
  deadline: z.string().min(1, 'Application deadline is required'),
  requirementsString: z.string().optional().or(z.literal('')),
  skillsRequiredString: z.string().optional().or(z.literal(''))
});

type JobFields = z.infer<typeof jobSchema>;

interface JobCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const JobCreateDialog: React.FC<JobCreateDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<JobFields>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      salaryRange: '',
      type: 'full-time',
      minCgpa: 0,
      allowedBranchesString: '',
      maxBacklogs: 0,
      deadline: '',
      requirementsString: '',
      skillsRequiredString: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
      };

      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        location: initialData.location || '',
        salaryRange: initialData.salaryRange || '',
        type: initialData.type || 'full-time',
        minCgpa: initialData.eligibility?.minCgpa ?? 0,
        allowedBranchesString: initialData.eligibility?.allowedBranches ? initialData.eligibility.allowedBranches.join(', ') : '',
        maxBacklogs: initialData.eligibility?.maxBacklogs ?? 0,
        deadline: formatDate(initialData.deadline),
        requirementsString: initialData.requirements ? initialData.requirements.join(', ') : '',
        skillsRequiredString: initialData.skillsRequired ? initialData.skillsRequired.join(', ') : ''
      });
    } else {
      reset({
        title: '',
        description: '',
        location: '',
        salaryRange: '',
        type: 'full-time',
        minCgpa: 0,
        allowedBranchesString: '',
        maxBacklogs: 0,
        deadline: '',
        requirementsString: '',
        skillsRequiredString: ''
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: JobFields) => {
    const parseCommaSeparated = (str?: string) => {
      if (!str) return [];
      return str.split(',').map(s => s.trim()).filter(s => s !== '');
    };

    onSave({
      title: data.title,
      description: data.description,
      location: data.location,
      salaryRange: data.salaryRange,
      type: data.type,
      eligibility: {
        minCgpa: data.minCgpa,
        allowedBranches: parseCommaSeparated(data.allowedBranchesString),
        maxBacklogs: data.maxBacklogs
      },
      deadline: data.deadline,
      requirements: parseCommaSeparated(data.requirementsString),
      skillsRequired: parseCommaSeparated(data.skillsRequiredString)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-fade-in text-left my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {initialData ? 'Edit Job Opening' : 'Post New Job Opening'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Job Title
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.title ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Associate Software Engineer"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Job Description
            </label>
            <textarea
              rows={4}
              className={`block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none ${
                errors.description ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="Outline the responsibilities, project scope, and team settings..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-rose-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.location ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                }`}
                placeholder="e.g. San Francisco, CA"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-xs text-rose-500">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Salary Package
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                placeholder="e.g. $80,000 - $100,000"
                {...register('salaryRange')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Job Type
              </label>
              <select
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                {...register('type')}
              >
                <option value="full-time">Full-Time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Placement Eligibility Sub-section */}
          <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/10 space-y-4">
            <h4 className="font-bold text-xs text-indigo-650 dark:text-indigo-400 uppercase tracking-widest border-b pb-1">
              Campus Recruitment Eligibility Rules
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Minimum CGPA / Grade
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="e.g. 7.5 (0 to disable)"
                  {...register('minCgpa', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Max Active Backlogs
                </label>
                <input
                  type="number"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="e.g. 0"
                  {...register('maxBacklogs', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Allowed Branches (comma list)
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  placeholder="e.g. CSE, IT, ECE (leave blank for all)"
                  {...register('allowedBranchesString')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Skills Required (comma list)
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                placeholder="e.g. React, Node.js, AWS"
                {...register('skillsRequiredString')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Application Deadline
              </label>
              <input
                type="date"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.deadline ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
                }`}
                {...register('deadline')}
              />
              {errors.deadline && (
                <p className="text-xs text-rose-500">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Recruitment Requirements (comma list)
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              placeholder="e.g. Excellent communication, Algorithms familiarity"
              {...register('requirementsString')}
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
              Post Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default JobCreateDialog;
