import React, { useState } from 'react';
import { Logo } from './Logo';
import { CurrentUser } from '../types';
import { 
  Home, 
  Users, 
  CreditCard, 
  BookOpen, 
  Phone, 
  FileBarChart, 
  LogIn, 
  LogOut, 
  UserCheck, 
  Menu, 
  X,
  FileCheck2,
  Lock,
  Calendar,
  TrendingUp,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: CurrentUser;
  onLogout: () => void;
  onOpenDocsModal: (tab?: 'rules' | 'ledger' | 'committee' | 'logo') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenDocsModal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'year2025', label: '২০২৫ হিসাব', icon: Calendar },
    { id: 'year2026', label: '২০২৬ হিসাব', icon: TrendingUp },
    { id: 'members', label: 'সদস্য তালিকা', icon: Users },
    { id: 'committee', label: 'কমিটি', icon: Users },
    { id: 'payment', label: 'পেমেন্ট', icon: CreditCard },
    { id: 'rules', label: 'নিয়মাবলী', icon: BookOpen },
    { id: 'report', label: 'রিপোর্ট', icon: FileBarChart },
    { id: 'contact', label: 'যোগাযোগ', icon: Phone },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-800/15 shadow-xs transition-all">
      {/* Top micro-bar for announcement and society badge */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate text-emerald-100 font-medium">
              একতা সাথে থাকি, উন্নতির পথে • মধ্য মুজির কান্দি, মতলব উত্তর, চাঁদপুর
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('rules')}
              className="text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              সমিতির নিয়ম নীতিমালা
            </button>
            <span className="text-emerald-500">|</span>
            <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-sans" title="Firebase Cloud Firestore ডাটাবেস সক্রিয় ও রিয়েল-টাইম সংযুক্ত">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <Cloud className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-semibold text-emerald-200">ক্লাউড ডাটাবেস লাইভ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Brand with circular logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none group py-1"
          >
            <Logo size={46} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-emerald-950 tracking-tight leading-tight group-hover:text-emerald-800 transition-colors">
                  ভাই-বন্ধু সমবায় সমিতি
                </span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  ২০২৫
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium hidden sm:block">
                মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 relative ${
                    isActive
                      ? 'text-emerald-900 bg-emerald-50 font-bold shadow-xs'
                      : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-500'}`} />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Auth / User Portal Button */}
          <div className="hidden lg:flex items-center gap-2">
            {currentUser.role === 'guest' ? (
              <button
                onClick={() => handleNavClick('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  activeTab === 'login'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                    : 'bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-white border-transparent shadow-sm'
                }`}
              >
                <LogIn className="w-4 h-4" />
                লগইন
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin' : 'profile')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-950 text-xs font-bold transition-all shadow-xs"
                >
                  {currentUser.role === 'admin' ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>অ্যাডমিন প্যানেল</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{currentUser.name} (প্রোফাইল)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  title="লগআউট"
                  className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-stone-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser.role !== 'guest' && (
              <span className="text-[11px] font-bold px-2 py-1 bg-emerald-100 text-emerald-900 rounded-md border border-emerald-200">
                {currentUser.role === 'admin' ? 'অ্যাডমিন' : currentUser.name.slice(0, 8)}
              </span>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-900 hover:bg-emerald-50 border border-emerald-800/20"
              aria-label="মেনু খুলুন"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 shadow-xl px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white font-bold shadow-xs'
                      : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-700'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDocsModal('rules');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold"
            >
              <FileCheck2 className="w-4 h-4 text-amber-700" />
              মূল দলিল ও খাতার ছবি দেখুন
            </button>

            {currentUser.role === 'guest' ? (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                সদস্য / অ্যাডমিন লগইন
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin' : 'profile')}
                  className="flex-1 py-2.5 px-3 bg-emerald-900 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  {currentUser.role === 'admin' ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      অ্যাডমিন প্যানেল প্রবেশ
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-300" />
                      {currentUser.name} (প্রোফাইল)
                    </>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  লগআউট
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
