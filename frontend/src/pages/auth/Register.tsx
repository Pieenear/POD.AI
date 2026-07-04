import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle, GraduationCap, Building2, Briefcase, Network } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole, {
    message: 'Please select a valid role'
  })
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: signup } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.STUDENT
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFields) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signup(data.name, data.email, data.password, data.role);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong during sign up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: UserRole.STUDENT, label: 'Student', icon: GraduationCap, desc: 'Find jobs & build portfolio' },
    { value: UserRole.EMPLOYER, label: 'Employer', icon: Building2, desc: 'Post drives & verify hires' },
    { value: UserRole.RECRUITER, label: 'Recruiter', icon: Briefcase, desc: 'Source candidates & schedule' },
    { value: UserRole.PLACEMENT_OFFICER, label: 'Officer', icon: Network, desc: 'Coordinate campus drives' }
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 px-4 premium-gradient relative">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border p-8 rounded-2xl shadow-xl text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to your email address. Please click the link to activate your account.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full h-11 inline-flex items-center justify-center rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 premium-gradient relative">
      
      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-8 my-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/20">CF</div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join CareerFlow and unlock AI placement features</p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl shadow-xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-800 dark:text-rose-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Role cards selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setValue('role', opt.value)}
                      className={`text-left p-3.5 border rounded-xl transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between h-28 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/15 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/40 hover:border-indigo-400 dark:hover:border-indigo-500'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground block line-clamp-1 leading-tight">{opt.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name field */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  disabled={isSubmitting}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-indigo-50/10 dark:bg-indigo-950/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    errors.name ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 dark:border-indigo-900/50'
                  }`}
                  placeholder="John Doe"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  disabled={isSubmitting}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-indigo-50/10 dark:bg-indigo-950/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 dark:border-indigo-900/50'
                  }`}
                  placeholder="johndoe@university.edu"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  disabled={isSubmitting}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-indigo-50/10 dark:bg-indigo-950/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors ${
                    errors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 dark:border-indigo-900/50'
                  }`}
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center h-11 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.01] shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
