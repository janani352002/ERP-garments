import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { PartnerShare } from '../../types/erp';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/currency';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Users,
  DollarSign,
  Truck,
  Scissors,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Sliders,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

export const ProfitEngineView: React.FC = () => {
  const {
    getFinancialSummary,
    partners,
    updatePartnerShares,
    outwardDispatches,
    productionLogs,
    expenses,
    navigate,
  } = useErp();

  const summary = getFinancialSummary();

  // Local partner share % state for editing
  const [partnerEdits, setPartnerEdits] = useState<PartnerShare[]>(partners);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isEditingShares, setIsEditingShares] = useState(false);

  // Calculate sum of shares
  const totalSharePercentage = partnerEdits.reduce((sum, p) => sum + p.percentage, 0);

  const handleShareChange = (partnerId: string, valueStr: string) => {
    const val = parseFloat(valueStr) || 0;
    setPartnerEdits((prev) =>
      prev.map((p) => (p.id === partnerId ? { ...p, percentage: val } : p))
    );
    setShareError(null);
  };

  const handleSaveShares = () => {
    if (Math.abs(totalSharePercentage - 100) > 0.01) {
      setShareError(`Total partnership equity must equal exactly 100.0%. Currently: ${totalSharePercentage.toFixed(1)}%`);
      return;
    }

    updatePartnerShares(partnerEdits);
    setIsEditingShares(false);
    setShareError(null);
  };

  const isProfitable = summary.netProfitPaise >= 0;
  const profitMargin = summary.grossRevenuePaise > 0
    ? (summary.netProfitPaise / summary.grossRevenuePaise) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Live Net Profit Engine & 3-Way Partnership Distribution</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              /profit
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial reconciliation combining dispatched outward revenue, piece-rate wages, and overheads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingShares(!isEditingShares)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors border border-indigo-200"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isEditingShares ? 'Close Equity Editor' : 'Configure Equity %'}</span>
          </button>
        </div>
      </div>

      {/* Net Profit Master Showcase Banner */}
      <div
        className={`p-6 sm:p-7 rounded-2xl border shadow-sm transition-all ${
          isProfitable
            ? 'bg-linear-to-br from-emerald-900 via-teal-900 to-indigo-950 text-white border-emerald-700'
            : 'bg-linear-to-br from-rose-950 via-slate-900 to-indigo-950 text-white border-rose-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-xs text-emerald-200 uppercase tracking-wider">
              {isProfitable ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Net Factory Surplus (Profit)
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" /> Net Operating Deficit (Loss)
                </>
              )}
            </span>
            <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight">
              {formatCurrency(summary.netProfitPaise)}
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Calculated dynamically as: <strong>Total Realized Outward Revenue ({formatCurrency(summary.grossRevenuePaise)})</strong> minus <strong>Piece-Rate Wages ({formatCurrency(summary.totalWagesPaise)})</strong> and <strong>Factory Overheads ({formatCurrency(summary.totalExpensesPaise)})</strong>.
            </p>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-xs min-w-[240px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Profit Margin</span>
              <span className="text-xl font-mono font-black text-white">{formatPercent(profitMargin)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Revenue</span>
              <span className="text-xl font-mono font-bold text-emerald-300">{formatCurrency(summary.grossRevenuePaise)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Dispatches</span>
              <span className="text-base font-mono font-bold text-white">{outwardDispatches.length} consignments</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Production Logs</span>
              <span className="text-base font-mono font-bold text-white">{productionLogs.length} batches</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars Breakdown (Revenue vs Wages vs Overheads) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Revenue */}
        <div
          onClick={() => navigate('/outward')}
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-teal-600" /> 1. Realized Revenue
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold group-hover:bg-teal-100">
              View Dispatches →
            </span>
          </div>
          <div className="py-4 space-y-1">
            <div className="text-2xl font-black text-teal-900 font-mono">
              {formatCurrency(summary.grossRevenuePaise)}
            </div>
            <p className="text-xs text-slate-500">
              Generated from <strong>{summary.totalDispatchedPieces.toLocaleString()} pieces</strong> shipped across {outwardDispatches.length} dispatches.
            </p>
          </div>
          <div className="text-[11px] text-teal-800 font-medium pt-2 border-t border-slate-100">
            Based on locked agreed PO piece rates
          </div>
        </div>

        {/* Pillar 2: Piece-Rate Wages */}
        <div
          onClick={() => navigate('/salary')}
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-indigo-600" /> 2. Tailor Wages (COGS)
            </span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold group-hover:bg-indigo-100">
              Daily Wages →
            </span>
          </div>
          <div className="py-4 space-y-1">
            <div className="text-2xl font-black text-indigo-950 font-mono">
              {formatCurrency(summary.totalWagesPaise)}
            </div>
            <p className="text-xs text-slate-500">
              Accumulated from <strong>{productionLogs.length} daily production logs</strong> computed via Rate Card operations.
            </p>
          </div>
          <div className="text-[11px] text-indigo-800 font-medium pt-2 border-t border-slate-100">
            Direct production labor cost
          </div>
        </div>

        {/* Pillar 3: Factory Overheads */}
        <div
          onClick={() => navigate('/expenses')}
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-600" /> 3. Factory Overheads
            </span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold group-hover:bg-amber-100">
              Expenses →
            </span>
          </div>
          <div className="py-4 space-y-1">
            <div className="text-2xl font-black text-amber-950 font-mono">
              {formatCurrency(summary.totalExpensesPaise)}
            </div>
            <p className="text-xs text-slate-500">
              Total operational expenditure across {expenses.length} material, maintenance, and utility bills.
            </p>
          </div>
          <div className="text-[11px] text-amber-800 font-medium pt-2 border-t border-slate-100">
            Indirect plant & overhead cost
          </div>
        </div>
      </div>

      {/* Configurable Equity Shares Drawer / Card */}
      {isEditingShares && (
        <div className="bg-white p-5 sm:p-6 rounded-xl border-2 border-indigo-300 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" /> Configure Partner Equity Percentage Shares
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                Math.abs(totalSharePercentage - 100) < 0.01
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Total: {totalSharePercentage.toFixed(1)}% / 100%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {partnerEdits.map((partner) => (
              <div key={partner.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{partner.name}</span>
                  <span className="text-[10px] text-slate-500">{partner.role}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={partner.percentage}
                    onChange={(e) => handleShareChange(partner.id, e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 rounded border border-slate-300 text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-600"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
            ))}
          </div>

          {shareError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{shareError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPartnerEdits(partners);
                setIsEditingShares(false);
                setShareError(null);
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveShares}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
            >
              Apply Equity Shares
            </button>
          </div>
        </div>
      )}

      {/* 3-Way Partnership Distribution Cards */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-50">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> 3-Way Partnership Net Profit Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Live equity allocation based on factory surplus. Integer paise math eliminates rounding drift.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Net Pool: <strong className="font-mono text-slate-900">{formatCurrency(summary.netProfitPaise)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map((partner, index) => {
            const partnerProfitSharePaise = Math.round((summary.netProfitPaise * partner.percentage) / 100);
            const isPartnerPositive = partnerProfitSharePaise >= 0;

            return (
              <div
                key={partner.id}
                className="bg-slate-50 rounded-xl p-5 border border-indigo-100 flex flex-col justify-between hover:border-indigo-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-900 font-black text-xs flex items-center justify-center font-mono">
                      0{index + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                      {partner.percentage}% Share
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{partner.name}</h4>
                    <span className="text-xs text-slate-500">{partner.role}</span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Distributable Profit
                  </span>
                  <div
                    className={`text-2xl font-black font-mono tracking-tight ${
                      isPartnerPositive ? 'text-emerald-800' : 'text-rose-700'
                    }`}
                  >
                    {formatCurrency(partnerProfitSharePaise)}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {partner.percentage}% of {formatCurrency(summary.netProfitPaise)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
