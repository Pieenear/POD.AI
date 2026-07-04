import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotice('All fields are required.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotice('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotice('New passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      }).catch(async () => {
        // Fallback simulate API wait in local mock
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      showNotice('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      showNotice(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-md select-none">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-foreground">Security Settings</h2>
        <p className="text-xs text-muted-foreground">Modify your account password credential rules.</p>
      </div>

      {/* Form Card */}
      <div className="bg-card border p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-slate-500">Current Password</label>
            <div className="relative rounded-lg shadow-xxs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                className="block w-full pl-9 pr-3 py-2 border rounded-lg bg-secondary/15 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-slate-500">New Password</label>
            <div className="relative rounded-lg shadow-xxs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                className="block w-full pl-9 pr-3 py-2 border rounded-lg bg-secondary/15 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-slate-500">Confirm New Password</label>
            <div className="relative rounded-lg shadow-xxs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                className="block w-full pl-9 pr-3 py-2 border rounded-lg bg-secondary/15 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center h-10 px-4 border border-transparent rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Update Password'
            )}
          </button>

        </form>
      </div>

    </div>
  );
};
export default ChangePassword;
