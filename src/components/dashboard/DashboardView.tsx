import React from 'react';
import { useErp } from '../../context/ErpContext';
import { formatCurrency, formatNumber, formatPaise } from '../../utils/currency';
import {
  PackagePlus,
  Truck,
  Scissors,
  TrendingUp,
  Receipt,
  Wallet,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Users,
  Smartphone,
  Share2,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    inwardOrders,
    outwardDispatches,
    productionLogs,
    expenses,
    workers,
    getFinancialSummary,
    navigate,
    loadDemoData,
    approveProductionLog,
    setAppMode,
    showNotification,
  } = useErp();

  const summary = getFinancialSummary();

  const totalInwardPieces = inwardOrders.reduce((sum, po) => sum + po.totalQty, 0);
  const totalDispatchedPieces = outwardDispatches.reduce((sum, d) => sum + d.totalDispatchedQty, 0);
  const pendingOrdersCount = inwardOrders.filter((po) => po.totalQty - po.dispatchedQty > 0).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Factory Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              AR Tex Manufacturing ERP
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
              Live Factory Floor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tirupur Apparel Export & Job-Work Operational Control Center
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inwardOrders.length === 0 && (
            <button
              id="load-sample-records-btn"
              type="button"
              onClick={loadDemoData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors border border-amber-300"
              title="Load demo Tirupur orders for instant testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Sample POs</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/inward/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <PackagePlus className="w-4 h-4" />
            <span>New Inward PO</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inward POs */}
        <div
          onClick={() => navigate('/inward')}
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500">Inward POs Active</span>
            <PackagePlus className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-950 font-mono">
            {pendingOrdersCount} <span className="text-xs font-normal text-slate-500">pending</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatNumber(totalInwardPieces)} total pieces booked
          </p>
        </div>

        {/* Outward Dispatched */}
        <div
          onClick={() => navigate('/outward')}
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500">Dispatched Volume</span>
            <Truck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-900 font-mono">
            {formatNumber(totalDispatchedPieces)} <span className="text-xs font-normal text-slate-500">pcs</span>
          </div>
          <p className="text-[11px] text-teal-700 mt-1 font-semibold">
            {formatCurrency(summary.grossRevenuePaise)} realized revenue
          </p>
        </div>

        {/* Piece-rate Wages */}
        <div
          onClick={() => navigate('/salary')}
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500">Tailor Wages</span>
            <Scissors className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(summary.totalWagesPaise)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {productionLogs.length} production batches logged
          </p>
        </div>

        {/* Net Profit */}
        <div
          onClick={() => navigate('/profit')}
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500">Live Net Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              summary.netProfitPaise >= 0 ? 'text-emerald-800' : 'text-rose-700'
            }`}
          >
            {formatCurrency(summary.netProfitPaise)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
            Reconciles revenue, labor & overheads
          </p>
        </div>
      </div>

      {/* Staff Mobile App Submissions Card (Live Sync with Staff Daily Work App) */}
      <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Staff Mobile App Submissions (நேரடி தொழிலாளர் வேலை பதிவுகள்)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily pieces entered and saved by tailors via their phone app appear here automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAppMode('staff')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Open Staff Phone App</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Workers &amp; OTP</span>
            </button>
          </div>
        </div>

        {productionLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Smartphone className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No Staff Submissions Recorded Yet</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              When factory tailors and operators log in with their Phone &amp; OTP on the Staff App and tap <strong>"வேலை சேமிக்கவும்"</strong>, their entries will show up here in real time for approval.
            </p>
            <button
              type="button"
              onClick={() => setAppMode('staff')}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700"
            >
              <span>Test Staff Daily Work Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Date &amp; Shift</th>
                  <th className="py-2.5 px-3">Tailor / Worker</th>
                  <th className="py-2.5 px-3">Garment Style</th>
                  <th className="py-2.5 px-3">Operation</th>
                  <th className="py-2.5 px-3 text-center">Pieces</th>
                  <th className="py-2.5 px-3 text-right">Wage (Paise)</th>
                  <th className="py-2.5 px-3 text-center">Verification Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productionLogs.slice(0, 6).map((log) => {
                  const isApproved = log.status === 'approved';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {log.date} <span className="text-[10px] text-slate-400 block">{log.shift || 'General'}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{log.workerName}</span>
                        {log.submittedBy === 'staff' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                            📱 Phone App
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 truncate max-w-[160px]">
                        {log.styleName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {log.operationName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                        {log.piecesCompleted.toLocaleString()} pcs
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatPaise(log.grossWagePaise)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {!isApproved ? (
                          <button
                            type="button"
                            onClick={() => approveProductionLog(log.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold">Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Access Workflow Shortcuts */}
      <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Core Factory Workflow Navigation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => navigate('/inward')}
            className="p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-white text-left transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                <PackagePlus className="w-4 h-4 text-indigo-600" /> Inward Orders & Cutting Sheets
              </span>
              <p className="text-[11px] text-slate-500">
                View pending POs, track cutting statuses, and print A3 Job Cards.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/outward')}
            className="p-4 rounded-xl border border-indigo-100 hover:border-teal-300 bg-slate-50/50 hover:bg-white text-left transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-600" /> Outward Dispatches & Challans
              </span>
              <p className="text-[11px] text-slate-500">
                Dispatch completed pieces, generate delivery gate passes, and sync balances.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0 mt-0.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/rate_card')}
            className="p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-white text-left transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-indigo-600" /> Operation Rate Cards
              </span>
              <p className="text-[11px] text-slate-500">
                Manage operation rates per garment piece with automatic versioning.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/salary')}
            className="p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-white text-left transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" /> Daily Production Logs
              </span>
              <p className="text-[11px] text-slate-500">
                Record daily work completed by tailors and compute piece-rate wages.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/salary/payment')}
            className="p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-white text-left transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-indigo-600" /> Weekly Payroll Settlement
              </span>
              <p className="text-[11px] text-slate-500">
                Deduct advances, reconcile wages, and settle unpaid tailor balances.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-white text-left transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Employees & Tailor Directory
              </span>
              <p className="text-[11px] text-slate-500">
                Register new factory tailors, update designations, and manage active staff.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/profit')}
            className="p-4 rounded-xl border border-indigo-100 hover:border-emerald-300 bg-slate-50/50 hover:bg-white text-left transition-all group flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Net Profit & 3-Way Equity
              </span>
              <p className="text-[11px] text-slate-500">
                Calculate live net surplus and distribute shares between partners.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
