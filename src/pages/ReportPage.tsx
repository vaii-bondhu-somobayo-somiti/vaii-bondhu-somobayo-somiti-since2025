import React from 'react';
import { SocietyData, CurrentUser } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/storage';
import { 
  FileBarChart, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Printer, 
  Lock, 
  Calendar, 
  ArrowUpRight, 
  Coins, 
  CheckCircle2, 
  PieChart as PieChartIcon,
  ShieldCheck
} from 'lucide-react';

interface ReportPageProps {
  data: SocietyData;
  currentUser: CurrentUser;
  onNavigate: (tab: string) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  data,
  currentUser,
  onNavigate
}) => {
  // Financial computations
  const augTotal = data.members.reduce((sum, m) => sum + (m.august || 0), 0);
  const sepTotal = data.members.reduce((sum, m) => sum + (m.september || 0), 0);
  const downPaymentTotal = data.members.reduce((sum, m) => sum + (m.downPayment || 0), 0);
  const fineTotal = data.members.reduce((sum, m) => sum + (m.fine || 0), 0);

  const totalInflow = augTotal + sepTotal + downPaymentTotal + fineTotal;
  const totalExpense = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentBankBalance = data.currentBankBalance;

  // Monthly collection comparison data
  const chartData = [
    { month: 'আগস্ট ২০২৫', collection: augTotal, target: 60000, paidCount: data.members.filter(m => m.august && m.august > 0).length },
    { month: 'সেপ্টেম্বর ২০২৫', collection: sepTotal, target: 60000, paidCount: data.members.filter(m => m.september && m.september > 0).length },
    { month: 'অক্টোবর ২০২৫ (চলমান)', collection: data.members.reduce((sum, m) => sum + (m.october || 0), 0), target: 60000, paidCount: data.members.filter(m => m.october && m.october > 0).length },
  ];

  const maxChartValue = Math.max(augTotal, sepTotal, 65000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              উন্মুক্ত পাবলিক অডিট রিপোর্ট
            </span>
            <span className="text-xs text-stone-500 font-medium">সকলের জন্য দৃশ্যমান • শুধু অ্যাডমিন সম্পাদনা করতে পারে</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 mt-1">
            আর্থিক প্রতিবেদন ও ব্যালেন্স রিপোর্ট
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            ভাই-বন্ধু সমবায় সমিতির মোট আদায়, পূবালী ব্যাংক ব্যালেন্স এবং খরচের স্বচ্ছ হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser.role === 'admin' ? (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" /> ব্যাংক ব্যালেন্স আপডেট করুন
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" /> অ্যাডমিন লগইন
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-300" /> রিপোর্ট প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Bank Balance */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border-2 border-amber-400 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
              বর্তমান ব্যাংক ব্যালেন্স
            </span>
            <div className="p-2 bg-amber-400 text-emerald-950 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {formatCurrency(currentBankBalance)}
          </h2>
          <p className="text-xs text-emerald-200 mt-2">
            পূবালী ব্যাংক (মতলব উত্তর শাখা)
          </p>
        </div>

        {/* Card 2: Total Inflow */}
        <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-md">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
              মোট আদায় (জমা)
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-emerald-950 mt-1">
            {formatCurrency(totalInflow)}
          </h2>
          <p className="text-xs text-stone-500 mt-2">
            আগস্ট ও সেপ্টেম্বর সমন্বিত
          </p>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-md">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
              সমিতির মোট ব্যয়
            </span>
            <div className="p-2 bg-red-100 text-red-700 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-red-600 mt-1">
            {formatCurrency(totalExpense)}
          </h2>
          <p className="text-xs text-stone-500 mt-2">
            রেজিস্ট্রি খাতা, ব্যানার ও স্টেশনারি
          </p>
        </div>

        {/* Card 4: Net Surplus */}
        <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-md">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
              মোট রিজার্ভ স্থিতি
            </span>
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-stone-900 mt-1">
            {formatCurrency(totalInflow - totalExpense)}
          </h2>
          <p className="text-xs text-emerald-700 font-semibold mt-2">
            লাভজনক খাতে বিনিয়োগের জন্য প্রস্তুত
          </p>
        </div>

      </div>

      {/* Visual Graphical Chart: Collection by Month */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-emerald-700" />
              মাসভিত্তিক চাঁদা আদায় ও গ্রাফিক্যাল চার্ট
            </h3>
            <p className="text-xs text-stone-500">
              আগস্ট ও সেপ্টেম্বর মাসের আদায়ের তুলনামূলক চিত্র
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-700 inline-block"></span>
              আদায়কৃত অর্থ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-stone-300 inline-block"></span>
              সম্ভাব্য লক্ষ্যমাত্রা
            </span>
          </div>
        </div>

        {/* SVG Bar Chart Visualization */}
        <div className="space-y-6 pt-2">
          {chartData.map((item, idx) => {
            const percentage = Math.min(100, Math.round((item.collection / maxChartValue) * 100));

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800">
                  <span>{item.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 font-normal">
                      পরিশোধ: <strong>{toBengaliNumber(item.paidCount)}/২৪ জন</strong>
                    </span>
                    <span className="font-mono text-emerald-900 font-extrabold">
                      {formatCurrency(item.collection)}
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-6 w-full bg-stone-100 rounded-xl overflow-hidden p-0.5 border border-stone-200">
                  <div
                    style={{ width: `${Math.max(4, percentage)}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-lg flex items-center justify-end pr-2 transition-all duration-700 shadow-inner"
                  >
                    {percentage > 15 && (
                      <span className="text-[10px] text-white font-bold font-mono">
                        {toBengaliNumber(percentage)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Financial Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-4">
        <h3 className="text-lg font-bold text-stone-900">
          সমিতির পূর্ণাঙ্গ হিসাব ও ব্যালেন্স বিবরণী (২০২৫)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3">খাত / বিবরণ</th>
                <th className="p-3 text-center">সদস্য সংখ্যা</th>
                <th className="p-3 text-right">আদায়কৃত অর্থ</th>
                <th className="p-3 text-right">খরচ / কর্তন</th>
                <th className="p-3 text-right">মোট স্থিতি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              <tr>
                <td className="p-3 font-semibold text-stone-900">আগস্ট ২০২৫ মাসিক চাঁদা সংগ্রহ</td>
                <td className="p-3 text-center">২১ জন আদায়</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-800">{formatCurrency(augTotal)}</td>
                <td className="p-3 text-right font-mono text-stone-400">—</td>
                <td className="p-3 text-right font-mono font-bold">{formatCurrency(augTotal)}</td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-stone-900">সেপ্টেম্বর ২০২৫ মাসিক চাঁদা সংগ্রহ</td>
                <td className="p-3 text-center">২০ জন আদায়</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-800">{formatCurrency(sepTotal)}</td>
                <td className="p-3 text-right font-mono text-stone-400">—</td>
                <td className="p-3 text-right font-mono font-bold">{formatCurrency(sepTotal)}</td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-stone-900">সমিতির সাংগঠনিক খরচ (স্টেশনারি ও ব্যানার)</td>
                <td className="p-3 text-center">২টি ভাউচার</td>
                <td className="p-3 text-right font-mono text-stone-400">—</td>
                <td className="p-3 text-right font-mono font-bold text-red-600">(-) {formatCurrency(totalExpense)}</td>
                <td className="p-3 text-right font-mono text-red-600">(-) {formatCurrency(totalExpense)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-emerald-950 text-white font-extrabold text-sm sm:text-base">
                <td colSpan={4} className="p-3.5 text-right">
                  পূবালী ব্যাংক মোট ব্যালেন্স ও রিজার্ভ ফান্ড:
                </td>
                <td className="p-3.5 text-right font-mono text-amber-300">
                  {formatCurrency(currentBankBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 border-t border-stone-200">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>নিয়মাবলী ধারা ৮ মোতাবেক হিসাবের পূর্ণ স্বচ্ছতা সংরক্ষিত</span>
          </div>
          <div>
            রিপোর্ট তৈরির সময়: <strong>{new Date().toLocaleDateString('bn-BD')}</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
