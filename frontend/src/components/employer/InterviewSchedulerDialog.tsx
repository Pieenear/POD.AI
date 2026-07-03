import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

const interviewSchema = z.object({
  title: z.string().min(1, 'Interview title is required'),
  date: z.string().min(1, 'Date and time are required'),
  duration: z.coerce.number().min(5, 'Minimum duration is 5 minutes').default(30),
  type: z.enum(['online', 'offline']),
  linkOrLocation: z.string().min(1, 'Meeting link or location details are required')
});

// type InterviewFields = z.infer<typeof interviewSchema>;

interface InterviewSchedulerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  application: any; // Candidate application being interviewed
}

export const InterviewSchedulerDialog: React.FC<InterviewSchedulerDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  application
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      title: 'Technical Interview - Round 1',
      duration: 30,
      type: 'online',
      linkOrLocation: ''
    }
  });

  const interviewType = watch('type');

  useEffect(() => {
    reset({
      title: 'Technical Interview - Round 1',
      date: '',
      duration: 30,
      type: 'online',
      linkOrLocation: ''
    });
  }, [application, reset, isOpen]);

  if (!isOpen || !application) return null;

  const onSubmit = (data: any) => {
    onSave({
      applicationId: application._id,
      title: data.title,
      date: data.date,
      duration: data.duration,
      type: data.type,
      linkOrLocation: data.linkOrLocation
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in text-left">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Schedule Interview</h3>
            <p className="text-xs text-muted-foreground">Candidate: {application.studentId?.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Interview Title
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.title ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Technical Interview - Round 1"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title.message?.toString()}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Date & Time
              </label>
              <input
                type="datetime-local"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                  errors.date ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
                }`}
                {...register('date')}
              />
              {errors.date && (
                <p className="text-xs text-rose-500">{errors.date.message?.toString()}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Duration (mins)
              </label>
              <input
                type="number"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                {...register('duration', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Interview Type
            </label>
            <select
              className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              {...register('type')}
            >
              <option value="online">Online Video Call</option>
              <option value="offline">In-Person (On-Campus / Office)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {interviewType === 'online' ? 'Meeting URL / Link' : 'Office Location / Room'}
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.linkOrLocation ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder={interviewType === 'online' ? 'e.g. https://meet.google.com/abc-xyz' : 'e.g. Building B, Room 402'}
              {...register('linkOrLocation')}
            />
            {errors.linkOrLocation && (
              <p className="text-xs text-rose-500">{errors.linkOrLocation.message?.toString()}</p>
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
              className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default InterviewSchedulerDialog;
