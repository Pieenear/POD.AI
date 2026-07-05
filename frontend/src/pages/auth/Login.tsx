import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/shared/ThemeToggle';
import { Mail, Lock, AlertCircle, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../../config/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return setForgotError('Email is required');
    try {
      setForgotSubmitting(true);
      setForgotError(null);
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  // Check for institution query parameter
  const searchParams = new URLSearchParams(location.search);
  const institutionName = searchParams.get('inst') || searchParams.get('institution') || null;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema)
  });

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onSubmit = async (data: LoginFields) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const userProfile = await login(data.email, data.password);
      if (userProfile.role === UserRole.EMPLOYER || userProfile.role === UserRole.RECRUITER) {
        navigate('/employer', { replace: true });
      } else if (userProfile.role === UserRole.PLACEMENT_OFFICER || userProfile.role === UserRole.COLLEGE_ADMIN) {
        navigate('/officer', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row antialiased select-none">
      
      {/* Left side: Form Panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-between py-10 px-6 sm:px-12 lg:px-20 relative bg-background">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between w-full mb-8">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto space-y-8 my-auto">
          
          {/* Branded Institution Card vs Standard Logo */}
          {institutionName ? (
            <div className="p-4 rounded-xl border bg-secondary/35 text-left space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  {institutionName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">{institutionName}</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Campus Placement Console</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal pt-1.5 border-t border-dashed">
                Already a Member? Please proceed to access your placement dashboard.
              </p>
            </div>
          ) : (
            <div className="text-left space-y-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/10">CF</div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Sign In</h2>
              <p className="text-xs text-muted-foreground">Access your CareerFlow AI workspace.</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 flex items-start gap-2.5 text-rose-800 dark:text-rose-450 text-xs text-left">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5 text-left" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email Field */}
            <div className="space-y-1.5">
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setForgotEmail('');
                    setForgotSuccess(false);
                    setForgotError(null);
                    setForgotPasswordOpen(true);
                  }}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center h-10 px-4 border border-transparent rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center text-xs font-semibold">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="text-center text-[10px] text-muted-foreground">
          <span>CareerFlow AI Securify. Bank-grade 256-bit SSL encryption.</span>
        </div>

      </div>

      {/* Right side: Brand Panel (Only on md and up) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 text-white flex-col justify-between p-12 lg:p-20 relative select-none">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] -z-10" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center font-black text-xxs">CF</div>
          <span className="font-extrabold text-sm uppercase tracking-wider text-slate-300">CareerFlow AI Portal</span>
        </div>

        {/* Middle Testimonial */}
        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Recruitment software that doesn't require a training manual.
          </h2>
          <blockquote className="space-y-3 border-l-2 border-accent pl-4">
            <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
              "Zenith Tech went live in 3 days. We managed 1,200 candidates and placed 84% of them without an IT engineer. It's clean, lightweight, and saves weeks of data entry."
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

      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 space-y-4 text-left animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Reset Password</h3>
              <p className="text-xxs text-muted-foreground">
                Enter your registered email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0 text-emerald-500" />
                  <span>If an account exists, a reset link has been dispatched to your email inbox.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full h-9 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/95 transition-all"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {forgotError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-2.5 rounded-lg text-xxs font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu"
                    className="block w-full px-3 py-2 border rounded-lg bg-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-foreground"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    disabled={forgotSubmitting}
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 h-9 rounded-lg text-xs font-bold border hover:bg-secondary transition-all text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-4 h-9 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                  >
                    {forgotSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
export default Login;
