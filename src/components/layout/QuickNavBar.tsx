import React from 'react';
import { useErp } from '../../context/ErpContext';
import { AppRoute } from '../../types/erp';
import {
  LayoutDashboard,
  PackagePlus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Truck,
  Scissors,
  Wallet,
  ReceiptText,
  BadgePercent,
  Coins,
  Users,
} from 'lucide-react';

interface NavItem {
  route: AppRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const QuickNavBar: React.FC = () => {
  const { currentRoute, navigate, inwardOrders } = useErp();

  // Pending PO count for badge
  const pendingCount = inwardOrders.filter((p) => p.totalQty - p.dispatchedQty > 0).length;

  const navItems: NavItem[] = [
    { route: '/', label: 'Dashboard', icon: LayoutDashboard },
    { route: '/inward', label: 'Inward POs', icon: ArrowDownToLine, badge: pendingCount > 0 ? pendingCount : undefined },
    { route: '/inward/new', label: 'New PO', icon: PackagePlus },
    { route: '/outward', label: 'Outward Dispatches', icon: ArrowUpFromLine },
    { route: '/outward/new', label: 'New Dispatch', icon: Truck },
    { route: '/salary', label: 'Daily Production', icon: Scissors },
    { route: '/salary/payment', label: 'Weekly Payroll', icon: Wallet },
    { route: '/employees', label: 'Employees', icon: Users },
    { route: '/rate_card', label: 'Rate Card Master', icon: ReceiptText },
    { route: '/expenses', label: 'Factory Expenses', icon: Coins },
    { route: '/profit', label: 'Net Profit & Partners', icon: BadgePercent },
  ];

  return (
    <nav
      id="quick-nav-bar"
      aria-label="Quick Navigation Bar"
      className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.route}
                id={`nav-pill-${item.route.replace('/', '').replace('/', '-') || 'dashboard'}`}
                type="button"
                onClick={() => navigate(item.route)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-700'
                    : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-indigo-800 text-amber-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
