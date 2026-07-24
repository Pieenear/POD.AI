import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Logo } from '../../components/shared/Logo';
import { Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle, GraduationCap, Building2, ShieldCheck, Briefcase, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  institutionName: z.string().min(2, 'Institution Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole, {
    message: 'Please select a valid role'
  }),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
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
      role: UserRole.STUDENT,
      agreeTerms: false
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFields) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // Pass name, email, password, role to auth signup
      await signup(data.name, data.email, data.password, data.role);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong during sign up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: UserRole.STUDENT, label: 'Student', icon: GraduationCap, desc: 'Practice tests & match jobs' },
    { value: UserRole.PLACEMENT_OFFICER, label: 'Institution Admin', icon: Building2, desc: 'Digitize placements & outcome analytics' },
    { value: UserRole.RECRUITER, label: 'Recruiter', icon: Briefcase, desc: 'Post openings & run virtual drives' }
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a verification link to your email address. Please click the link to activate your account.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full h-11 inline-flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary/95 transition-colors shadow-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row antialiased select-none">
      
      {/* Left side: Form Panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-between py-10 px-6 sm:px-12 lg:px-20 relative bg-background">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between w-full mb-6">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto space-y-6 my-auto">
          <div className="text-left space-y-2">
            <Logo size="lg" />
            <h2 className="text-2xl font-black text-foreground tracking-tight pt-2">Create Account</h2>
            <p className="text-xs text-muted-foreground">Join CRUIT and launch your workspace.</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-800 dark:text-rose-455 text-xs text-left">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4 text-left" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Role cards selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setValue('role', opt.value)}
                      className={`text-left p-2.5 border rounded-xl transition-all duration-200 flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border bg-secondary/15 hover:border-slate-350'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold block leading-none">{opt.label}</span>
                        <span className="text-[8px] text-muted-foreground block line-clamp-1 leading-tight">{opt.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name field */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative rounded-lg shadow-xxs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  disabled={isSubmitting}
                  className={`block w-full pl-9 pr-3 py-2 border rounded-lg bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all ${
                    errors.name ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : 'border-border'
                  }`}
                  placeholder="John Doe"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] text-rose-500 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Institution Name field */}
            <div className="space-y-1">
              <label htmlFor="institutionName" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Institution Name
              </label>
              <div className="relative rounded-lg shadow-xxs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  id="institutionName"
                  type="text"
                  disabled={isSubmitting}
                  className={`block w-full pl-9 pr-3 py-2 border rounded-lg bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all ${
                    errors.institutionName ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : 'border-border'
                  }`}
                  placeholder="Zenith Institute of Tech"
                  {...register('institutionName')}
                />
              </div>
              {errors.institutionName && (
                <p className="text-[10px] text-rose-500 font-semibold">{errors.institutionName.message}</p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xxs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  disabled={isSubmitting}
                  className={`block w-full pl-9 pr-3 py-2 border rounded-lg bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all ${
                    errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : 'border-border'
                  }`}
                  placeholder="name@university.edu"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-rose-500 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
             <div className="space-y-1">
              <label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <div className="relative rounded-lg shadow-xxs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isSubmitting}
                  className={`block w-full pl-9 pr-10 py-2 border rounded-lg bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all ${
                    errors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : 'border-border'
                  }`}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-rose-500 font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="agreeTerms"
                type="checkbox"
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/10 mt-0.5 cursor-pointer"
                {...register('agreeTerms')}
              />
              <label htmlFor="agreeTerms" className="text-[10px] text-muted-foreground font-semibold leading-tight cursor-pointer">
                I agree to CRUIT's Terms of Service and Privacy Policy.
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-[10px] text-rose-500 font-semibold">{errors.agreeTerms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center h-10 px-4 border border-transparent rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-xs font-semibold">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="text-center text-[10px] text-muted-foreground">
          <span>CRUIT Securify. Bank-grade 256-bit SSL encryption.</span>
        </div>

      </div>

      {/* Right side: Brand Panel (Only on md and up) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 text-white flex-col justify-between p-12 lg:p-20 relative select-none">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] -z-10" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <Logo size="sm" subtitle="Portal" />
        </div>

        {/* Middle Testimonial */}
        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Connecting talent and opportunity with 3.4x higher efficiency.
          </h2>
          <blockquote className="space-y-3 border-l-2 border-accent pl-4">
            <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
              "We went live in days, and our students were matching with top employers immediately. The compiler-checked assessment tools removed manual verification overhead entirely."
            </p>
            <footer className="text-[10px] font-bold text-slate-400">
              — Dr. Aris Thorne, Zen Placement cell
            </footer>
          </blockquote>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>ISO 27001</span>
          </div>
          <span>•</span>
          <span>SOC2 Type II</span>
          <span>•</span>
          <span>AWS Cloud Secure</span>
        </div>
      </div>

    </div>
  );
};
export default Register;
