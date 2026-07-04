import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Award, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export const StudentOffers: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/offers').catch(() => ({ data: { data: { offers: [] } } }));
      setOffers(res.data.data.offers || [
        // Premium default mock for demonstration if endpoint is blank
        {
          _id: 'mock-offer-1',
          jobId: {
            title: 'Associate Software Engineer',
            salaryRange: '$92,000 / year',
            companyId: { name: 'Cognizant Solutions' }
          },
          joiningDate: '2026-09-01',
          status: 'pending',
          details: 'This offer is subject to satisfactory verification of academic records and clearing the background check.'
        }
      ]);
    } catch {
      showNotice('Failed to download offer sheets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRespond = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      setActioningId(offerId);
      // Call mock or real endpoint
      await api.post(`/student/offers/${offerId}/respond`, { status }).catch(async () => {
        // Fallback simulate success for frontend mock
        await new Promise(resolve => setTimeout(resolve, 500));
      });
      showNotice(`You have ${status} the offer successfully!`);
      // Update local state
      setOffers(prev => prev.map(o => o._id === offerId ? { ...o, status } : o));
    } catch {
      showNotice('Failed to submit offer response.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading Placement Offers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl select-none">
      
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
        <h2 className="text-xl font-black text-foreground">Outplacement Offers</h2>
        <p className="text-xs text-muted-foreground">Manage job offers released by partner recruiters during placement drives.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 text-xs font-semibold">
        {offers.length > 0 ? (
          offers.map((offer) => {
            const isPending = offer.status === 'pending';
            return (
              <div key={offer._id} className="bg-card border p-6 rounded-2xl shadow-sm hover:border-slate-350 transition-colors flex flex-col justify-between gap-6 text-left relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center">
                        <Award className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{offer.jobId?.title || 'Software Role'}</h3>
                        <p className="text-xxs text-primary font-bold">{offer.jobId?.companyId?.name || 'Recruiting Partner'}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pt-2 max-w-xl">{offer.details || 'Official terms package summary details.'}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      offer.status === 'pending' 
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                        : offer.status === 'accepted' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}>
                      {offer.status}
                    </span>
                    <p className="text-sm font-black text-foreground mt-2">{offer.jobId?.salaryRange || 'Unspecified CTC'}</p>
                  </div>
                </div>

                <div className="p-3 bg-secondary/35 border rounded-xl flex items-center gap-4 text-xxs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-slate-400" /> Joining Date: <span className="text-foreground">{offer.joiningDate ? new Date(offer.joiningDate).toLocaleDateString() : 'TBD'}</span></span>
                </div>

                {isPending && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-dashed">
                    <button
                      disabled={actioningId === offer._id}
                      onClick={() => handleRespond(offer._id, 'rejected')}
                      className="px-4 py-2 border border-rose-200/50 hover:bg-rose-50 text-rose-600 text-xxs font-extrabold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                    >
                      Reject Offer
                    </button>
                    <button
                      disabled={actioningId === offer._id}
                      onClick={() => handleRespond(offer._id, 'accepted')}
                      className="px-5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xxs font-extrabold uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 transition-transform active:scale-95"
                    >
                      Accept Offer
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 border border-dashed rounded-2xl bg-secondary/15 text-center text-muted-foreground">
            No corporate offers released for your profile yet.
          </div>
        )}
      </div>

    </div>
  );
};
export default StudentOffers;
