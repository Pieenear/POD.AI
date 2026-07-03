import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

const noticeSchema = z.object({
  title: z.string().min(1, 'Notice title is required'),
  body: z.string().min(1, 'Notice body description is required'),
  targetAudience: z.enum(['all', 'students', 'employers']),
  targetBranchesString: z.string().optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal(''))
});

type NoticeFields = z.infer<typeof noticeSchema>;

interface NoticeCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const NoticeCreateDialog: React.FC<NoticeCreateDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<NoticeFields>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      targetAudience: 'all',
      targetBranchesString: '',
      expiresAt: ''
    }
  });

  const audience = watch('targetAudience');

  useEffect(() => {
    reset({
      title: '',
      body: '',
      targetAudience: 'all',
      targetBranchesString: '',
      expiresAt: ''
    });
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: NoticeFields) => {
    const branches = data.targetBranchesString
      ? data.targetBranchesString.split(',').map(s => s.trim()).filter(s => s !== '')
      : [];

    onSave({
      title: data.title,
      body: data.body,
      targetAudience: data.targetAudience,
      targetBranches: branches,
      expiresAt: data.expiresAt || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in text-left">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Publish Notice / Announcement</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Notice Title
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.title ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Schedule for Phase 1 Interview Slot Allotments"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Notice Description / Body
            </label>
            <textarea
              rows={4}
              className={`block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none ${
                errors.body ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="Provide complete announcements details here..."
              {...register('body')}
            />
            {errors.body && (
              <p className="text-xs text-rose-500">{errors.body.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target Audience
              </label>
              <select
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                {...register('targetAudience')}
              >
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="employers">Employers/Recruiters Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                {...register('expiresAt')}
              />
            </div>
          </div>

          {audience === 'students' && (
            <div className="space-y-1.5 animate-slide-down">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Filter Target Branches (comma-separated list)
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                placeholder="e.g. CSE, IT, ECE (leave blank for all student branches)"
                {...register('targetBranchesString')}
              />
            </div>
          )}

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
              Publish Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NoticeCreateDialog;
