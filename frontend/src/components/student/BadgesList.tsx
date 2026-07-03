import React from 'react';
import { Award, Zap, Calendar, Trophy, Lock } from 'lucide-react';

interface BadgesListProps {
  unlockedBadges: string[];
}

export const BadgesList: React.FC<BadgesListProps> = ({ unlockedBadges = [] }) => {
  const badgeConfig = [
    {
      key: 'profile_pro',
      title: 'Profile Pro',
      desc: 'Achieve an AI profile score of 80% or higher',
      icon: <Award className="h-6 w-6 text-violet-500" />,
      color: 'bg-violet-500/10 border-violet-200 text-violet-750 dark:bg-violet-950/20 dark:border-violet-900 dark:text-violet-400'
    },
    {
      key: 'first_strike',
      title: 'First Strike',
      desc: 'Successfully submit your first job application',
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      color: 'bg-amber-500/10 border-amber-200 text-amber-750 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400'
    },
    {
      key: 'interview_ready',
      title: 'Interview Ready',
      desc: 'Get shortlisted and book your first interview round',
      icon: <Calendar className="h-6 w-6 text-indigo-500" />,
      color: 'bg-indigo-500/10 border-indigo-200 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400'
    },
    {
      key: 'hired',
      title: 'Hired & Placed',
      desc: 'Secure a corporate job placement offer',
      icon: <Trophy className="h-6 w-6 text-emerald-500" />,
      color: 'bg-emerald-500/10 border-emerald-200 text-emerald-750 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
    }
  ];

  const totalUnlocked = badgeConfig.filter(b => unlockedBadges.includes(b.key)).length;

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-base flex items-center gap-1.5">
            <Trophy className="h-5 w-5 text-indigo-500" />
            Placement Milestones Achievements
          </h3>
          <p className="text-xs text-muted-foreground">Unlock rewards by completing placement activities.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-full border border-indigo-200/50">
            {totalUnlocked} / 4 Unlocked
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badgeConfig.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.key);
          return (
            <div
              key={badge.key}
              className={`p-4.5 border rounded-2xl flex items-center gap-4 transition-all relative ${
                isUnlocked
                  ? `${badge.color} shadow-sm`
                  : 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-205 text-slate-400 opacity-60 dark:border-slate-850'
              }`}
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 ${
                isUnlocked ? 'bg-white dark:bg-slate-900 border-current/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                {isUnlocked ? badge.icon : <Lock className="h-5 w-5 text-slate-350 dark:text-slate-600" />}
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold text-sm">{badge.title}</p>
                <p className="text-[11px] leading-snug font-medium text-slate-500 dark:text-slate-400">{badge.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default BadgesList;
