import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

const driveSchema = z.object({
  jobId: z.string().min(1, 'Job selection is required'),
  driveDate: z.string().min(1, 'Drive date is required'),
  roundsString: z.string().min(1, 'At least one round description is required (comma-separated)')
});

type DriveFields = z.infer<typeof driveSchema>;

interface DriveCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  jobs: any[]; // Active jobs list to choose from
}

export const DriveCreateDialog: React.FC<DriveCreateDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  jobs
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DriveFields>({
    resolver: zodResolver(driveSchema)
  });

  useEffect(() => {
    reset({
      jobId: jobs.length > 0 ? jobs[0]._id : '',
      driveDate: '',
      roundsString: 'Online Aptitude Test, Technical Interview, HR Interview'
    });
  }, [jobs, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: DriveFields) => {
    const rounds = data.roundsString
      .split(',')
      .map((name, index) => ({
        roundNumber: index + 1,
        name: name.trim()
      }))
      .filter(r => r.name !== '');

    onSave({
      jobId: data.jobId,
      driveDate: data.driveDate,
      rounds
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in text-left">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Schedule Campus Drive</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Job Opening
            </label>
            <select
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.jobId ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
              }`}
              {...register('jobId')}
            >
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.location})
                  </option>
                ))
              ) : (
                <option value="" disabled>No active job postings found</option>
              )}
            </select>
            {errors.jobId && (
              <p className="text-xs text-rose-500">{errors.jobId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Drive Scheduled Date
            </label>
            <input
              type="date"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.driveDate ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
              }`}
              {...register('driveDate')}
            />
            {errors.driveDate && (
              <p className="text-xs text-rose-500">{errors.driveDate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Selection Rounds (comma-separated list)
            </label>
            <textarea
              rows={3}
              className={`block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none ${
                errors.roundsString ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Aptitude Test, Tech Interview, HR Interview"
              {...register('roundsString')}
            />
            {errors.roundsString && (
              <p className="text-xs text-rose-500">{errors.roundsString.message}</p>
            )}
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
              disabled={jobs.length === 0}
              className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Schedule Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DriveCreateDialog;
