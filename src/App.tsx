/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SocietyData, CurrentUser, Member } from './types';
import { getStoredData, saveStoredData } from './utils/storage';
import { subscribeToSocietyCloudData } from './firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OriginalDocsModal } from './components/OriginalDocsModal';

import { HomePage } from './pages/HomePage';
import { CommitteePage } from './pages/CommitteePage';
import { MemberList } from './pages/MemberList';
import { PaymentPage } from './pages/PaymentPage';
import { RulesPage } from './pages/RulesPage';
import { ReportPage } from './pages/ReportPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { MemberDashboard } from './pages/MemberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { YearChartPage } from './pages/YearChartPage';

export default function App() {
  const [data, setData] = useState<SocietyData>(getStoredData);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const saved = localStorage.getItem('bhai_bondhu_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { role: 'guest', name: '' };
      }
    }
    return { role: 'guest', name: '' };
  });

  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsModalTab, setDocsModalTab] = useState<'rules' | 'ledger' | 'committee' | 'logo'>('rules');

  // Sync state with local updates and real-time Firebase Cloud Firestore
  useEffect(() => {
    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setData(e.detail);
      } else {
        setData(getStoredData());
      }
    };

    window.addEventListener('society_data_updated', handleStorageUpdate);

    // Real-time Cloud Firestore listener
    const unsubscribeCloud = subscribeToSocietyCloudData(
      (cloudData) => {
        setData(cloudData);
        try {
          localStorage.setItem('bhai_bondhu_somobay_data_v1', JSON.stringify(cloudData));
        } catch {
          // ignore cache errors
        }
      },
      (error) => {
        console.warn('Cloud sync error (using local cache):', error);
      },
      getStoredData()
    );

    return () => {
      window.removeEventListener('society_data_updated', handleStorageUpdate);
      unsubscribeCloud();
    };
  }, []);

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem('bhai_bondhu_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    const guestUser: CurrentUser = { role: 'guest', name: '' };
    setCurrentUser(guestUser);
    localStorage.removeItem('bhai_bondhu_current_user');
    setActiveTab('home');
  };

  const handleOpenDocsModal = (tab: 'rules' | 'ledger' | 'committee' | 'logo' = 'rules') => {
    setDocsModalTab(tab);
    setDocsModalOpen(true);
  };

  const handleDataUpdated = (newData: SocietyData) => {
    setData(newData);
    saveStoredData(newData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-800 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenDocsModal={handleOpenDocsModal}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            data={data}
            onNavigate={setActiveTab}
            onOpenDocsModal={handleOpenDocsModal}
          />
        )}

        {activeTab === 'committee' && (
          <CommitteePage
            committee={data.committee}
            data={data}
            onOpenDocsModal={handleOpenDocsModal}
          />
        )}

        {activeTab === 'members' && (
          <MemberList
            members={data.members}
            currentUser={currentUser}
            onOpenDocsModal={handleOpenDocsModal}
            onNavigate={setActiveTab}
            onDataUpdated={handleDataUpdated}
            onEditMember={(member: Member) => {
              if (currentUser.role === 'admin') {
                setActiveTab('admin');
              }
            }}
          />
        )}

        {(activeTab === 'year2025' || activeTab === '2025') && (
          <YearChartPage
            year={2025}
            data={data}
            currentUser={currentUser}
            onDataUpdated={handleDataUpdated}
            onNavigate={setActiveTab}
          />
        )}

        {(activeTab === 'year2026' || activeTab === '2026') && (
          <YearChartPage
            year={2026}
            data={data}
            currentUser={currentUser}
            onDataUpdated={handleDataUpdated}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentPage
            data={data}
            onPaymentSubmitted={handleDataUpdated}
          />
        )}

        {activeTab === 'rules' && (
          <RulesPage
            rules={data.rules}
            data={data}
            onOpenDocsModal={handleOpenDocsModal}
          />
        )}

        {activeTab === 'report' && (
          <ReportPage
            data={data}
            currentUser={currentUser}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'contact' && (
          <ContactPage
            data={data}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            data={data}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'profile' && currentUser.memberId && (
          <MemberDashboard
            data={data}
            memberId={currentUser.memberId}
            onLogout={handleLogout}
            onNavigate={setActiveTab}
            onDataUpdated={handleDataUpdated}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            data={data}
            onDataUpdated={handleDataUpdated}
            onLogout={handleLogout}
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* Footer with Circular Logo & Required Address */}
      <Footer
        onNavClick={setActiveTab}
        onOpenDocsModal={handleOpenDocsModal}
      />

      {/* Modal for viewing original documents & ledger */}
      <OriginalDocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        initialTab={docsModalTab}
      />

    </div>
  );
}
