import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { AppRoute } from '../../types/erp';
import {
  Menu,
  ArrowLeft,
  Building2,
  PlusCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Lock,
  Eye,
  KeyRound,
  Smartphone,
  Download,
  Monitor,
  Share2,
} from 'lucide-react';
import { UnitTestModal } from './UnitTestModal';
import { LoginModal } from './LoginModal';
import { MobileApkDownloadModal } from './MobileApkDownloadModal';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  parentRoute?: AppRoute;
  actionButton?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  parentRoute = '/',
  actionButton,
}) => {
  const {
    currentRoute,
    goBack,
    setDrawerOpen,
    seedDemoData,
    resetToCleanState,
    inwardOrders,
    currentUser,
    isManager,
    appMode,
    setAppMode,
    viewMode,
    setViewMode,
  } = useErp();
  const [showUnitTests, setShowUnitTests] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);

  const isHome = currentRoute === '/';

  // Get default title if not provided
  const getHeaderTitle = () => {
    if (title) return title;
    switch (currentRoute) {
      case '/':
        return 'Garment Manufacturing Dashboard';
      case '/inward':
        return 'Fabric Inward & Purchase Orders';
      case '/inward/new':
        return 'New Inward Purchase Order';
      case '/outward':
        return 'Outward Dispatches & Delivery';
      case '/outward/new':
        return 'New Outward Dispatch';
      case '/salary':
        return 'Daily Production & Wage Entry';
      case '/salary/payment':
        return 'Weekly Worker Payroll & Advances';
      case '/rate_card':
        return 'Operation Rate Card Master';
      case '/employees':
        return 'Factory Employees & Tailor Directory';
      case '/expenses':
        return 'Factory Expenses & Overheads';
      case '/profit':
        return 'Live Net Profit Engine & Partnership';
      default:
        return 'AR Tex ERP';
    }
  };

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-indigo-900 text-white shadow-md border-b border-indigo-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Dual-Leading Controls: Drawer toggle + Back Button */}
          <div className="flex items-center gap-2">
            {/* 1. Drawer Button */}
            <button
              id="header-drawer-toggle-btn"
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* 2. Dual-leading Back Button with Fallback */}
            {!isHome && (
              <button
                id="header-back-btn"
                type="button"
                onClick={() => goBack(parentRoute)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-indigo-100 hover:text-white hover:bg-indigo-800 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                title="Back to Previous Screen"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {/* Brand Logo / Divider */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-indigo-700/60">
              <div className="w-8 h-8 rounded-lg bg-indigo-800 border border-indigo-700 flex items-center justify-center text-amber-400 shadow-inner">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-black text-sm tracking-tight text-white flex items-center gap-1">
                  <span>AR Tex</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-amber-400 text-indigo-950">
                    ERP
                  </span>
                </div>
                <div className="text-[10px] text-indigo-300 leading-none">
                  Tirupur Garment Cluster
                </div>
              </div>
            </div>
          </div>

          {/* Center Title & Portal Mode Switcher */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-2 md:px-4">
            <div className="truncate text-center md:text-left">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {getHeaderTitle()}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-indigo-200 hidden sm:block truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Portal Switcher Tabs: Manager ERP vs Staff Phone App */}
            <div className="flex items-center p-1 bg-indigo-950/90 rounded-xl border border-indigo-700/80 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setAppMode('manager')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  appMode === 'manager'
                    ? 'bg-amber-400 text-indigo-950 shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Manager ERP</span>
              </button>

              <button
                type="button"
                onClick={() => setAppMode('staff')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  appMode === 'staff'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Staff App (தொழிலாளர்)</span>
              </button>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Custom page-specific action if provided */}
            {actionButton}

            {/* Mobile APK & Phone Download Modal Trigger */}
            <button
              id="header-mobile-apk-btn"
              type="button"
              onClick={() => setShowApkModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs border border-emerald-500"
              title="Install App on Phone / Download APK / Scan QR Code"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phone &amp; APK</span>
            </button>

            {/* Phone View Simulator Toggle */}
            <button
              id="header-toggle-mobile-frame-btn"
              type="button"
              onClick={() => setViewMode(viewMode === 'mobile_frame' ? 'full' : 'mobile_frame')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                viewMode === 'mobile_frame'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-indigo-950/70 hover:bg-indigo-950 text-indigo-200 hover:text-white border-indigo-700/60'
              }`}
              title={
                viewMode === 'mobile_frame'
                  ? 'Currently in Phone Frame Mode. Click for Full Screen.'
                  : 'Preview exact mobile screen with smartphone device frame'
              }
            >
              {viewMode === 'mobile_frame' ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Exit Phone View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Phone View</span>
                </>
              )}
            </button>

            {/* Role & Access Login Button */}
            <button
              id="header-role-login-btn"
              type="button"
              onClick={() => setShowLoginModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                isManager
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300'
                  : 'bg-indigo-950/90 hover:bg-indigo-950 text-amber-300 border border-indigo-700'
              }`}
              title={
                isManager
                  ? 'Active as Manager: Full Edit & Delete Access. Click to switch roles or log out.'
                  : 'Active as Staff: View-Only Mode. Click to Login as Manager.'
              }
            >
              {isManager ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-950" />
                  <span>Manager</span>
                  <span className="hidden xl:inline text-[10px] font-normal text-indigo-900/90">(Edit/Delete)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Staff (View Only)</span>
                  <span className="hidden sm:inline text-[10px] underline ml-0.5 text-amber-300">Login</span>
                </>
              )}
            </button>

            {/* Run Unit Tests Button */}
            <button
              id="header-run-tests-btn"
              type="button"
              onClick={() => setShowUnitTests(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-950 text-indigo-200 hover:text-emerald-300 text-xs font-semibold transition-colors border border-indigo-700/60"
              title="Run Automated ERP Unit Tests (Currency, Outward, Profit)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unit Tests</span>
            </button>

            {/* Quick Demo Controls dropdown or button */}
            {inwardOrders.length === 0 ? (
              <button
                id="header-seed-demo-quick-btn"
                type="button"
                onClick={seedDemoData}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-xs"
                title="Populate realistic sample POs and dispatches for instant testing"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample POs</span>
              </button>
            ) : (
              <button
                id="header-reset-clean-quick-btn"
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all entered data to a clean blank state?')) {
                    resetToCleanState();
                  }
                }}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-800/80 hover:bg-indigo-800 text-indigo-200 hover:text-white text-xs font-medium transition-colors border border-indigo-700"
                title="Reset all tables to completely blank factory state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Unit Test Suite Modal */}
      <UnitTestModal
        isOpen={showUnitTests}
        onClose={() => setShowUnitTests(false)}
      />

      {/* Role & Access Control Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Phone App & APK Download Modal */}
      <MobileApkDownloadModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </header>
  );
};
