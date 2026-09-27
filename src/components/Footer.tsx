import React from 'react';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, ShieldCheck, HeartHandshake, CheckCircle } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
  onOpenDocsModal: (tab?: 'rules' | 'ledger' | 'committee' | 'logo') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenDocsModal }) => {
  return (
    <footer className="bg-gradient-to-b from-emerald-950 via-stone-950 to-stone-950 text-stone-200 border-t-4 border-amber-500 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo size={60} />
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">
                  ভাই-বন্ধু সমবায় সমিতি
                </h4>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  রেজিস্টার্ড সমবায় সংস্থা • ২০২৫
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              "একতা সাথে থাকি, উন্নতির পথে" — পারস্পরিক সহযোগিতা, সঞ্চয় মনোভাব এবং অর্থনৈতিক স্বচ্ছতার মাধ্যমে আত্মনির্ভরশীল সমৃদ্ধ সমাজ গঠনে অঙ্গীকারবদ্ধ।
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                ১০০% স্বচ্ছ ব্যাংকিং ও সদস্য চালিত
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 pb-2 border-b border-stone-800 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" /> প্রয়োজনীয় লিংক
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavClick('home')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-2"
                >
                  <span className="text-emerald-500">›</span> হোম পেজ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('committee')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-2"
                >
                  <span className="text-emerald-500">›</span> কার্যনির্বাহী ও উপদেষ্টা কমিটি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('members')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-emerald-500">›</span> সদস্য তালিকা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('rules')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-emerald-500">›</span> সমিতির নিয়ম নীতিমালা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('payment')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-2"
                >
                  <span className="text-emerald-500">›</span> চাঁদা পেমেন্ট ও বিকাশ/ব্যাংক হিসাব
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('report')}
                  className="text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-2"
                >
                  <span className="text-emerald-500">›</span> আর্থিক রিপোর্ট ও তহবিল বিবরণী
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles & Schedule */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 pb-2 border-b border-stone-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> সমিতির মূল ধারা
            </h5>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                <span className="font-semibold text-emerald-400 block">মাসিক চাঁদা:</span>
                ২,০০০ টাকা (সঞ্চয়সহ ২,৫০০ টাকা)
              </div>
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                <span className="font-semibold text-emerald-400 block">জমার সময়সীমা:</span>
                প্রতি মাসের ১৫ তারিখের মধ্যে
              </div>
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                <span className="font-semibold text-emerald-400 block">ডাউন পেমেন্ট:</span>
                প্রতি ৬ মাসে সর্বনিম্ন ৫,০০০ টাকা
              </div>
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                <span className="font-semibold text-emerald-400 block">সমিতির মেয়াদ:</span>
                ৫ বছর (২০২৫ হতে ২০৩০)
              </div>
            </div>
          </div>

          {/* Col 4: Address & Contact */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 pb-2 border-b border-stone-800 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> ঠিকানা ও যোগাযোগ
            </h5>
            
            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>মধ্য মুজির কান্দি, পাঠান বাজার, मतলব উত্তর, চাঁদপুর | ২০২৫</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p>ক্যাশিয়ার (হাছান মাঝি): 01880980716</p>
                  <p>সহকারী ক্যাশিয়ার (রিয়াদ): 01625563839</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>bhaibondhu.somobay@gmail.com</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavClick('rules')}
                  className="w-full text-center py-2 px-3 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all text-xs shadow-sm border border-emerald-500/30 cursor-pointer"
                >
                  সমিতির নিয়ম নীতিমালা
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Address Footer requested */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400 text-center md:text-left">
          <div>
            <p className="text-sm font-bold text-emerald-300">
              সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ
            </p>
            <p className="text-stone-400 mt-1">
              ঠিকানা: মধ্য মুজির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫
            </p>
          </div>

          <div className="text-stone-400">
            <p>© ২০২৫ ভাই-বন্ধু সমবায় সমিতি। সর্বস্বত্ব সংরক্ষিত।</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              সুরক্ষিত ও স্বচ্ছ অর্থনৈতিক হিসাব পরিচালন ব্যবস্থা
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
