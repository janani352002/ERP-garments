import React from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { AppHeader } from './components/layout/AppHeader';
import { QuickNavBar } from './components/layout/QuickNavBar';
import { SidebarDrawer } from './components/layout/SidebarDrawer';
import { DashboardView } from './components/dashboard/DashboardView';
import { InwardOrdersView } from './components/inward/InwardOrdersView';
import { NewInwardPoForm } from './components/inward/NewInwardPoForm';
import { OutwardDispatchesView } from './components/outward/OutwardDispatchesView';
import { NewOutwardDispatchForm } from './components/outward/NewOutwardDispatchForm';
import { RateCardView } from './components/ratecard/RateCardView';
import { ProductionDailyView } from './components/salary/ProductionDailyView';
import { PayrollPaymentView } from './components/salary/PayrollPaymentView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ProfitEngineView } from './components/profit/ProfitEngineView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StaffDailyWorkApp } from './components/staff/StaffDailyWorkApp';
import { MobileFrameContainer } from './components/layout/MobileFrameContainer';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRoute, notification, clearNotification, appMode } = useErp();

  // If in Staff App Mode, staff only sees the focused Daily Work Save & History List!
  if (appMode === 'staff' || currentRoute === '/staff_portal') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
        <AppHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex items-center justify-center">
          <MobileFrameContainer>
            <StaffDailyWorkApp />
          </MobileFrameContainer>
        </main>
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border ${
                notification.type === 'success'
                  ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                  : notification.type === 'error'
                  ? 'bg-rose-900 text-rose-100 border-rose-700'
                  : 'bg-indigo-900 text-indigo-100 border-indigo-700'
              }`}
            >
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
              {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 text-indigo-300 shrink-0" />}
              <span>{notification.message}</span>
              <button
                type="button"
                onClick={clearNotification}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Manager ERP Portal views matching the active route
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/':
        return <DashboardView />;
      case '/inward':
        return <InwardOrdersView />;
      case '/inward/new':
        return <NewInwardPoForm />;
      case '/outward':
        return <OutwardDispatchesView />;
      case '/outward/new':
        return <NewOutwardDispatchForm />;
      case '/rate_card':
        return <RateCardView />;
      case '/employees':
        return <EmployeesView />;
      case '/salary':
        return <ProductionDailyView />;
      case '/salary/payment':
        return <PayrollPaymentView />;
      case '/expenses':
        return <ExpensesView />;
      case '/profit':
        return <ProfitEngineView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Persistent Navigation Drawer (Sliding from Left) */}
      <SidebarDrawer />

      {/* Dual-Leading App Header */}
      <AppHeader />

      {/* Persistent Quick Navigation Bar */}
      <QuickNavBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <MobileFrameContainer>
          {renderCurrentView()}
        </MobileFrameContainer>
      </main>

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : notification.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-indigo-900 text-indigo-100 border-indigo-700'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-indigo-300 shrink-0" />}
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={clearNotification}
              className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Industrial Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-[11px] text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AR Tex Industrial ERP • Garment Production, Piece-Rate Payroll & Profit Engine</span>
          <span className="font-mono text-slate-400">Tirupur Cluster Edition • Financial Precision Engine (Paise)</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ErpProvider>
        <AppContent />
      </ErpProvider>
    </ErrorBoundary>
  );
}
