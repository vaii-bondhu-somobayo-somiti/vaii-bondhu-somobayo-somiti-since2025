import React, { useState } from 'react';
import { SocietyData } from '../types';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Landmark,
  ShieldCheck,
  Building
} from 'lucide-react';

interface ContactPageProps {
  data: SocietyData;
}

export const ContactPage: React.FC<ContactPageProps> = ({ data }) => {
  const [msgSent, setMsgSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSent(true);
    setName('');
    setPhone('');
    setMessage('');
    setTimeout(() => setMsgSent(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <Phone className="w-4 h-4 text-emerald-700" /> যোগাযোগ ও কার্যালয়
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight">
          যোগাযোগ করুন
        </h1>
        <p className="text-sm text-stone-600">
          যেকোনো তথ্য, চাঁদা পরিশোধ সংক্রান্ত অনুসন্ধান বা পরামর্শের জন্য দায়িত্বপ্রাপ্ত কর্মকর্তাদের সাথে সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Contact Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Office Address Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/30 shadow-xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-emerald-700 block">
                  সমিতির কেন্দ্রীয় কার্যালয়ের ঠিকানা
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-1">
                  ভাই-বন্ধু সমবায় সমিতি
                </h3>
                <p className="text-sm text-stone-700 mt-1 font-semibold">
                  {data?.address || 'মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫'}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  ডাকঘর: ছেঙ্গারচর বাজার, থানা: মতলব উত্তর, জেলা: চাঁদপুর, বাংলাদেশ।
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>অফিস খোলা: প্রতিদিন সকাল ১০টা হতে রাত ৮টা</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>রেজিস্টার্ড সমবায় সমিতি (২০২৫)</span>
              </div>
            </div>
          </div>

          {/* Key Responsible Officers Direct Hotlines */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              গুরুত্বপূর্ণ দায়িত্বপ্রাপ্ত কর্মকর্তাদের জরুরি নম্বর
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              
              {/* President */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase block">সভাপতি</span>
                  <p className="font-bold text-stone-900">রাজন শিকদার</p>
                  <p className="font-mono text-xs text-stone-600">01618629527</p>
                </div>
                <a
                  href="tel:01618629527"
                  className="p-2 bg-emerald-100 text-emerald-800 rounded-xl hover:bg-emerald-200"
                  title="কল করুন"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* General Sec */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">সাধারণ সম্পাদক</span>
                  <p className="font-bold text-stone-900">উজ্জ্বল হোসেন</p>
                  <p className="font-mono text-xs text-stone-600">01687798607</p>
                </div>
                <a
                  href="tel:01687798607"
                  className="p-2 bg-emerald-100 text-emerald-800 rounded-xl hover:bg-emerald-200"
                  title="কল করুন"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Cashier */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">ক্যাশিয়ার (পেমেন্ট)</span>
                  <p className="font-bold text-stone-900">হাছান মাঝি</p>
                  <p className="font-mono text-xs text-stone-600">01880980716</p>
                </div>
                <a
                  href="https://wa.me/8801880980716"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500"
                  title="হোয়াটসঅ্যাপ"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>

              {/* Asst Cashier */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase block">সহকারী ক্যাশিয়ার</span>
                  <p className="font-bold text-stone-900">মোঃ রিয়াদ</p>
                  <p className="font-mono text-xs text-stone-600">01625563839</p>
                </div>
                <a
                  href="https://wa.me/8801625563839"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500"
                  title="হোয়াটসঅ্যাপ"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Contact Message Form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-emerald-950">
              সরাসরি বার্তা বা পরামর্শ পাঠান
            </h3>
            <p className="text-xs text-stone-500">
              সমিতির কার্যক্রম বা হিসাব সংক্রান্ত যেকোনো প্রস্তাবনা বা বার্তা পাঠাতে পারেন
            </p>

            {msgSent && (
              <div className="bg-emerald-50 border border-emerald-500 p-3.5 rounded-2xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! কমিটি শিগগিরই যোগাযোগ করবে।</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-800 mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রাজন শিকদার"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 018..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 font-mono bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">বার্তা বা পরামর্শ *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার বক্তব্য বিস্তারিত লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 bg-white resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                বার্তা পাঠান
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
