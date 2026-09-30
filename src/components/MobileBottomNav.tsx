import React from 'react';
import { Home, Users, TrendingUp, CreditCard, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigate
}) => {
  const navItems = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'members', label: 'সদস্য তালিকা', icon: Users },
    { id: 'year2025', label: 'হিসাব চার্ট', icon: TrendingUp },
    { id: 'payment', label: 'পেমেন্ট', icon: CreditCard },
    { id: 'rules', label: 'নিয়মাবলী', icon: BookOpen },
  ];

  return (
    <nav 
      aria-label="মোবাইল নেভিগেশন"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-900/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden px-2 pt-1 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            activeTab === item.id || 
            (item.id === 'year2025' && (activeTab === 'year2025' || activeTab === 'year2026'));

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive 
                  ? 'text-emerald-900 font-extrabold' 
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${
                isActive 
                  ? 'bg-emerald-100 text-emerald-900 scale-105 shadow-2xs' 
                  : 'hover:bg-stone-100'
              }`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                isActive ? 'font-bold text-emerald-950' : 'text-stone-600'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
