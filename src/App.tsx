/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SocietyData, CurrentUser, Member } from './types';
import { getStoredData, saveStoredData } from './utils/storage';
import { subscribeToSocietyCloudData, saveSocietyCloudData } from './firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OriginalDocsModal } from './components/OriginalDocsModal';
import { MobileBottomNav } from './components/MobileBottomNav';

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

  // Read initial tab from URL hash
  const getInitialTab = (): string => {
    if (typeof window === 'undefined') return 'home';
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['home', 'members', 'year2025', 'year2026', 'committee', 'payment', 'rules', 'report', 'contact', 'login', 'profile', 'admin'];
    return validTabs.includes(hash) ? hash : 'home';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

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
  const docsModalOpenRef = useRef(docsModalOpen);
  docsModalOpenRef.current = docsModalOpen;

  const [docsModalTab, setDocsModalTab] = useState<'rules' | 'ledger' | 'committee' | 'logo'>('rules');

  // Navigate function with HTML5 History API integration (prevents website exit on phone back button)
  const navigateTo = (tab: string, replace = false) => {
    const validTabs = ['home', 'members', 'year2025', 'year2026', 'committee', 'payment', 'rules', 'report', 'contact', 'login', 'profile', 'admin'];
    const targetTab = validTabs.includes(tab) ? tab : 'home';

    const targetHash = targetTab === 'home' ? '' : `#${targetTab}`;
    const currentHash = window.location.hash;

    if (targetTab !== activeTabRef.current || currentHash !== targetHash) {
      if (replace) {
        window.history.replaceState({ tab: targetTab }, '', targetHash || window.location.pathname);
      } else {
        window.history.pushState({ tab: targetTab }, '', targetHash || window.location.pathname);
      }
      setActiveTab(targetTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Physical/system back button handling on mobile phones and browser navigation
  useEffect(() => {
    // Ensure initial entry in history has state
    const currentTab = getInitialTab();
    if (!window.history.state) {
      window.history.replaceState(
        { tab: currentTab }, 
        '', 
        currentTab === 'home' ? window.location.pathname : `#${currentTab}`
      );
    }

    const handlePopState = (e: PopStateEvent) => {
      // 1. If original docs modal is open, close it instead of leaving page
      if (docsModalOpenRef.current) {
        setDocsModalOpen(false);
        return;
      }

      // 2. Dispatch custom event for any sub-components with active modals (e.g. Member details modal)
      const modalEvent = new CustomEvent('app_back_pressed', { cancelable: true });
      window.dispatchEvent(modalEvent);
      if (modalEvent.defaultPrevented) {
        // Child modal was closed, stop here
        return;
      }

      // 3. Navigate back to previous tab
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'members', 'year2025', 'year2026', 'committee', 'payment', 'rules', 'report', 'contact', 'login', 'profile', 'admin'];
      const targetTab = validTabs.includes(hash) ? hash : 'home';
      setActiveTab(targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
          localStorage.setItem('bhai_bondhu_somobay_data_v3', JSON.stringify(cloudData));
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
    navigateTo('home');
  };

  const handleOpenDocsModal = (tab: 'rules' | 'ledger' | 'committee' | 'logo' = 'rules') => {
    setDocsModalTab(tab);
    setDocsModalOpen(true);
    // Push modal state to history so mobile back button closes the modal
    window.history.pushState({ modal: 'docs' }, '', window.location.href);
  };

  const handleCloseDocsModal = () => {
    setDocsModalOpen(false);
    if (window.history.state && window.history.state.modal === 'docs') {
      window.history.back();
    }
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
        setActiveTab={navigateTo}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenDocsModal={handleOpenDocsModal}
      />

      {/* Main Dynamic View with bottom padding for mobile navigation */}
      <main className="flex-1 pb-20 lg:pb-0">
        {activeTab === 'home' && (
          <HomePage
            data={data}
            onNavigate={navigateTo}
            onOpenDocsModal={handleOpenDocsModal}
          />
        )}

        {activeTab === 'committee' && (
          <CommitteePage
            committee={data.committee}
            data={data}
            onNavigate={navigateTo}
            onOpenDocsModal={handleOpenDocsModal}
          />
        )}

        {activeTab === 'members' && (
          <MemberList
            members={data.members}
            data={data}
            currentUser={currentUser}
            onOpenDocsModal={handleOpenDocsModal}
            onNavigate={navigateTo}
            onDataUpdated={handleDataUpdated}
            onEditMember={(member: Member) => {
              if (currentUser.role === 'admin') {
                navigateTo('admin');
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
            onNavigate={navigateTo}
          />
        )}

        {(activeTab === 'year2026' || activeTab === '2026') && (
          <YearChartPage
            year={2026}
            data={data}
            currentUser={currentUser}
            onDataUpdated={handleDataUpdated}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentPage
            data={data}
            onPaymentSubmitted={handleDataUpdated}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'rules' && (
          <RulesPage
            rules={data.rules}
            data={data}
            onNavigate={navigateTo}
            onOpenDocsModal={handleOpenDocsModal}
          />
        )}

        {activeTab === 'report' && (
          <ReportPage
            data={data}
            currentUser={currentUser}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'contact' && (
          <ContactPage
            data={data}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            data={data}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
          />
        )}

        {activeTab === 'profile' && currentUser.memberId && (
          <MemberDashboard
            data={data}
            memberId={currentUser.memberId}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            onDataUpdated={handleDataUpdated}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            data={data}
            onDataUpdated={handleDataUpdated}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Mobile Floating/Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={navigateTo}
      />

      {/* Footer with Circular Logo & Required Address */}
      <Footer
        onNavClick={navigateTo}
        onOpenDocsModal={handleOpenDocsModal}
      />

      {/* Modal for viewing original documents & ledger */}
      <OriginalDocsModal
        isOpen={docsModalOpen}
        onClose={handleCloseDocsModal}
        initialTab={docsModalTab}
      />

    </div>
  );
}
