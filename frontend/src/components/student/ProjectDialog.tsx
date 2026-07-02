import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(1, 'Project description is required'),
  techString: z.string().min(1, 'Technologies list is required (comma-separated)'),
  link: z.string().optional().or(z.literal('')),
  githubLink: z.string().optional().or(z.literal(''))
});

type ProjectFields = z.infer<typeof projectSchema>;

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
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
  } = useForm<ProjectFields>({
    resolver: zodResolver(projectSchema)
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        techString: initialData.technologies ? initialData.technologies.join(', ') : '',
        link: initialData.link || '',
        githubLink: initialData.githubLink || ''
      });
    } else {
      reset({
        title: '',
        description: '',
        techString: '',
        link: '',
        githubLink: ''
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: ProjectFields) => {
    // Convert techString to technologies array
    const technologies = data.techString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    onSave({
      title: data.title,
      description: data.description,
      technologies,
      link: data.link,
      githubLink: data.githubLink
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in text-left">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {initialData ? 'Edit Project' : 'Add Project'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Project Title
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.title ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. CareerFlow Placement Platform"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              className={`block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none ${
                errors.description ? 'border-rose-455' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="Provide a brief summary of features and implementation details..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-rose-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Technologies (comma-separated)
            </label>
            <input
              type="text"
              className={`block w-full px-3 py-2.5 border rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                errors.techString ? 'border-rose-450' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. React, TypeScript, Node.js, Express, MongoDB"
              {...register('techString')}
            />
            {errors.techString && (
              <p className="text-xs text-rose-500">{errors.techString.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Live Demo URL (Optional)
              </label>
              <input
                type="url"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                placeholder="https://my-app.vercel.app"
                {...register('link')}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                GitHub Repository URL (Optional)
              </label>
              <input
                type="url"
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                placeholder="https://github.com/user/my-app"
                {...register('githubLink')}
              />
            </div>
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
export default ProjectDialog;
