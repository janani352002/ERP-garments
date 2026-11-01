import React from 'react';
import { useErp } from '../../context/ErpContext';
import { AppRoute } from '../../types/erp';
import {
  X,
  Building2,
  LayoutDashboard,
  ArrowDownToLine,
  PackagePlus,
  ArrowUpFromLine,
  Truck,
  Scissors,
  Wallet,
  ReceiptText,
  Coins,
  BadgePercent,
  Sparkles,
  RotateCcw,
  Users,
  Layers,
  ShieldCheck,
  Lock,
  Eye,
  Smartphone,
} from 'lucide-react';
import { LoginModal } from './LoginModal';

export const SidebarDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setDrawerOpen,
    currentRoute,
    navigate,
    inwardOrders,
    seedDemoData,
    resetToCleanState,
    currentUser,
    isManager,
    setAppMode,
  } = useErp();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  if (!isDrawerOpen) return null;

  const pendingCount = inwardOrders.filter((p) => p.totalQty - p.dispatchedQty > 0).length;

  const menuSections = [
    {
      title: 'Mobile Work Apps',
      items: [
        {
          route: '/staff_portal' as AppRoute,
          label: 'Staff Daily Work App (தொழிலாளர்)',
          icon: Smartphone,
          badge: 'Staff Portal',
        },
      ],
    },
    {
      title: 'Production Orders & Job Cards',
      items: [
        { route: '/' as AppRoute, label: 'ERP Overview Dashboard', icon: LayoutDashboard },
        { route: '/inward' as AppRoute, label: 'Fabric Inward & PO Master', icon: ArrowDownToLine, badge: pendingCount ? `${pendingCount} Pending` : undefined },
        { route: '/inward/new' as AppRoute, label: 'Create Clean Inward PO', icon: PackagePlus },
      ],
    },
    {
      title: 'Dispatches & Logistics',
      items: [
        { route: '/outward' as AppRoute, label: 'Outward Delivery Orders', icon: ArrowUpFromLine },
        { route: '/outward/new' as AppRoute, label: 'Create Outward Dispatch', icon: Truck },
      ],
    },
    {
      title: 'Piece-Rate Wages & Labor',
      items: [
        { route: '/employees' as AppRoute, label: 'Employees & Tailors Directory', icon: Users },
        { route: '/salary' as AppRoute, label: 'Daily Worker Production Log', icon: Scissors },
        { route: '/salary/payment' as AppRoute, label: 'Weekly Payroll & Advances', icon: Wallet },
        { route: '/rate_card' as AppRoute, label: 'Operation Rate Card Master', icon: ReceiptText },
      ],
    },
    {
      title: 'Financial Engine & Overhead',
      items: [
        { route: '/expenses' as AppRoute, label: 'Factory Overheads & Expenses', icon: Coins },
        { route: '/profit' as AppRoute, label: 'Net Profit & 3-Way Equity', icon: BadgePercent },
      ],
    },
  ];

  return (
    <div id="sidebar-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <aside
          id="sidebar-drawer-panel"
          className="w-80 max-w-sm bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-indigo-100 bg-linear-to-r from-indigo-900 to-indigo-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  AR Tex <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">ERP</span>
                </h2>
                <p className="text-xs text-indigo-200">Garment Production & Profit Hub</p>
              </div>
            </div>
            <button
              id="drawer-close-btn"
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Context Card */}
          <div className="px-5 py-3 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-indigo-900">
              <Layers className="w-4 h-4 text-indigo-600" /> Tirupur Cluster Unit 1
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
              Live Engine
            </span>
          </div>

          {/* User Session & Role Access Card */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                {isManager ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-300">
                    <Eye className="w-3 h-3 text-blue-600" /> Staff (View Only)
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">
                {currentUser.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>{isManager ? 'Switch' : 'Login'}</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.route;

                  return (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => navigate(item.route)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-indigo-800 text-amber-300' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Data Controls / Testing Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Data Management
            </p>
            <button
              id="drawer-seed-demo-btn"
              type="button"
              onClick={() => {
                seedDemoData();
                setDrawerOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Sample Industrial POs</span>
            </button>
            <button
              id="drawer-reset-clean-btn"
              type="button"
              onClick={() => {
                if (window.confirm('Reset all entered POs, dispatches, and logs to a completely blank factory state?')) {
                  resetToCleanState();
                  setDrawerOpen(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset to Clean Blank State</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Login & Role Switcher Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
