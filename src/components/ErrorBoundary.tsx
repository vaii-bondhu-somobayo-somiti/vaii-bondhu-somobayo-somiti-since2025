import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              পেজ লোড করতে একটি সমস্যা হয়েছে
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              সাময়িক ডাটা বা ব্রাউজার লোডিং সমস্যার কারণে এই পেজটি লোড হতে পারেনি। অনুগ্রহ করে নিচের বাটনে ক্লিক করে রিফ্রেশ করুন।
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] font-mono text-stone-600 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('bhai_bondhu_somobay_data_v1');
                  } catch {}
                  window.location.reload();
                }}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" />
                পেজটি পুনরায় লোড করুন
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
