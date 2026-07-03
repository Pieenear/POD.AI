import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Trash2, ShieldAlert, CheckCircle, AlertCircle, Search } from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/officer/users');
      setUsers(res.data.data.users || []);
    } catch {
      showNotice('Failed to load user accounts registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/officer/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => (u._id === userId ? { ...u, role: newRole } : u)));
      showNotice(`User authorization role updated to ${newRole}`);
    } catch {
      showNotice('Failed to update user authorization role', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this user account? All associated profile records will be lost.')) return;
    
    try {
      await api.delete(`/officer/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      showNotice('User account permanently deleted successfully');
    } catch {
      showNotice('Failed to remove user account', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });

  const availableRoles = [
    { value: 'student', label: 'Student' },
    { value: 'employer', label: 'Employer' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'placement_officer', label: 'Placement Officer' },
    { value: 'college_admin', label: 'College Admin' }
  ];

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5 text-indigo-500" />
            Institutional User Roster Settings
          </h3>
          <p className="text-xs text-muted-foreground">Manage college-wide access levels and delete accounts.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-850/50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-650 border-t-transparent" />
            <span>Loading database registrants...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Account User Name</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">System Access Role</th>
                <th className="px-6 py-3 text-right">Settings Control</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                  <td className="px-6 py-4 font-bold">{u.name}</td>
                  <td className="px-6 py-4 text-slate-550 font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                      className="px-2.5 py-1 border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 rounded font-semibold text-[11px] focus:outline-none"
                    >
                      {availableRoles.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Permanently Delete User Account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No accounts registry matched your search query.
          </div>
        )}
      </div>

    </div>
  );
};
export default AdminUserManagement;
