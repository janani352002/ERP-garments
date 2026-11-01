import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { InwardPO } from '../../types/erp';
import { formatCurrency, formatNumber } from '../../utils/currency';
import { A3CuttingSheetModal } from './A3CuttingSheetModal';
import {
  PackagePlus,
  Trash2,
  Printer,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  Building2,
  Scissors,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const InwardOrdersView: React.FC = () => {
  const { inwardOrders, deleteInwardPO, navigate, seedDemoData, isManager } = useErp();

  // Two-Tab System:
  // Tab 1: 'all' -> All Inward Orders
  // Tab 2: 'pending' -> Pending PO List (active POs with balance > 0)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected PO for A3 Modal
  const [selectedPoForA3, setSelectedPoForA3] = useState<InwardPO | null>(null);

  // Delete Confirmation Dialog State
  const [poToDelete, setPoToDelete] = useState<InwardPO | null>(null);

  // Filter pending POs: Total Inward Qty - Outwarded Qty > 0
  const pendingOrders = inwardOrders.filter((po) => po.totalQty - po.dispatchedQty > 0);

  // Display list based on active tab
  const baseList = activeTab === 'all' ? inwardOrders : pendingOrders;

  const filteredOrders = baseList.filter((po) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      po.poNumber.toLowerCase().includes(q) ||
      po.clientName.toLowerCase().includes(q) ||
      po.styleName.toLowerCase().includes(q) ||
      po.date.includes(q)
    );
  });

  // Calculate high-level summary metrics
  const totalInwardPieces = inwardOrders.reduce((sum, p) => sum + p.totalQty, 0);
  const totalDispatchedPieces = inwardOrders.reduce((sum, p) => sum + p.dispatchedQty, 0);
  const totalBalancedPieces = Math.max(0, totalInwardPieces - totalDispatchedPieces);
  const totalPoValuePaise = inwardOrders.reduce((sum, p) => sum + p.totalQty * p.ratePerPiecePaise, 0);

  const confirmDelete = () => {
    if (poToDelete) {
      deleteInwardPO(poToDelete.id);
      setPoToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Fabric Inward & Purchase Orders</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              {inwardOrders.length} {inwardOrders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming textile job-work POs, track cutting status, and inspect piece-level balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="create-new-po-header-btn"
            type="button"
            onClick={() => navigate('/inward/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Create New PO</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Total Inward Volume</span>
          <div className="text-xl font-black text-slate-900 font-mono">{formatNumber(totalInwardPieces)} <span className="text-xs font-normal text-slate-500">pcs</span></div>
          <span className="text-[10px] text-indigo-600 font-medium">Across {inwardOrders.length} POs</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Dispatched Pieces</span>
          <div className="text-xl font-black text-teal-700 font-mono">{formatNumber(totalDispatchedPieces)} <span className="text-xs font-normal text-slate-500">pcs</span></div>
          <span className="text-[10px] text-teal-600 font-medium">
            {totalInwardPieces > 0 ? `${Math.round((totalDispatchedPieces / totalInwardPieces) * 100)}% Fulfilled` : '0%'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Pending Balance to Cut</span>
          <div className="text-xl font-black text-amber-700 font-mono">{formatNumber(totalBalancedPieces)} <span className="text-xs font-normal text-slate-500">pcs</span></div>
          <span className="text-[10px] text-amber-800 font-semibold">{pendingOrders.length} Active Orders Pending</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Cumulative PO Valuation</span>
          <div className="text-xl font-black text-indigo-950 font-mono">{formatCurrency(totalPoValuePaise)}</div>
          <span className="text-[10px] text-slate-500">Based on agreed piece rates</span>
        </div>
      </div>

      {/* Two-Tab System & Search Toolbar */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start">
            <button
              id="tab-all-inward-orders"
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-indigo-900'
              }`}
            >
              <span>Tab 1: All Inward Orders</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                {inwardOrders.length}
              </span>
            </button>

            <button
              id="tab-pending-po-list"
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-amber-900'
              }`}
            >
              <span>Tab 2: Pending PO List</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">
                {pendingOrders.length}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO, Client, Style..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Tab 1 / Tab 2 Table or Friendly Empty State */}
        {filteredOrders.length === 0 ? (
          <div id="inward-empty-state-card" className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
              <Scissors className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'pending'
                  ? 'No Pending Inward Orders Found'
                  : 'No Inward Purchase Orders Recorded'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'pending'
                  ? 'All registered purchase orders are currently 100% completed and dispatched, or no active PO has been saved yet.'
                  : 'The order table starts strictly isolated and clean. No dummy records are loaded into memory until you explicitly save a PO.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                id="empty-state-create-po-btn"
                type="button"
                onClick={() => navigate('/inward/new')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <PackagePlus className="w-4 h-4" />
                <span>[Create New PO]</span>
              </button>

              {inwardOrders.length === 0 && (
                <button
                  type="button"
                  onClick={seedDemoData}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Load Sample Job-Work Batch</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-200">
                  <th className="py-3 px-3.5 whitespace-nowrap">PO Ref & Date</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Client / Company</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Garment Style</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Colours</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Inward Qty</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Rate (₹)</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Total PO Value</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Dispatched</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Balanced Qty</th>
                  <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {filteredOrders.map((po) => {
                  const balancedQty = Math.max(0, po.totalQty - po.dispatchedQty);
                  const poValuePaise = po.totalQty * po.ratePerPiecePaise;
                  const isPending = balancedQty > 0;

                  return (
                    <tr
                      key={po.id}
                      className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPoForA3(po)}
                    >
                      {/* PO Ref & Date */}
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-indigo-900 group-hover:underline">
                          {po.poNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">{po.date}</div>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-3.5 font-semibold text-slate-900">
                        {po.clientName}
                      </td>

                      {/* Style */}
                      <td className="py-3 px-3.5 text-slate-700 max-w-[180px] truncate" title={po.styleName}>
                        {po.styleName}
                      </td>

                      {/* Colours */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {po.colours.map((c, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                            >
                              {c.colour}: {formatNumber(c.qty)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Inward Qty */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        {formatNumber(po.totalQty)}
                      </td>

                      {/* Rate per Piece */}
                      <td className="py-3 px-3.5 text-right font-mono text-slate-700">
                        {formatCurrency(po.ratePerPiecePaise)}
                      </td>

                      {/* Total PO Value */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-indigo-950">
                        {formatCurrency(poValuePaise)}
                      </td>

                      {/* Dispatched Qty */}
                      <td className="py-3 px-3.5 text-right font-mono text-teal-700 font-semibold">
                        {formatNumber(po.dispatchedQty)}
                      </td>

                      {/* Balanced Qty */}
                      <td className="py-3 px-3.5 text-right font-mono font-black text-amber-900 bg-amber-50/40">
                        {formatNumber(balancedQty)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center">
                        {balancedQty === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : po.dispatchedQty > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            <Clock className="w-3 h-3" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Action Buttons: A3 Cutting Sheet & Delete PO */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {/* A3 Sheet Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedPoForA3(po)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors border border-indigo-200"
                            title="Open Industrial A3 Production Cutting Sheet"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>A3 Sheet</span>
                          </button>

                          {/* Quick Dispatch Shortcut */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => navigate('/outward/new')}
                              className="p-1.5 rounded-md text-teal-700 hover:text-teal-900 hover:bg-teal-50 transition-colors"
                              title="Create Dispatch for this PO"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete PO Button - Manager Only */}
                          {isManager && (
                            <button
                              type="button"
                              onClick={() => setPoToDelete(po)}
                              className="p-1.5 rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                              title="Delete PO permanently (Manager Only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete PO Confirmation Dialog */}
      {poToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Permanent PO Deletion
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete Purchase Order{' '}
                <strong className="text-indigo-900">{poToDelete.poNumber}</strong> ({poToDelete.clientName})?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold pt-1">
                Any dispatches and production entries tied to this order will also be purged.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPoToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-po-btn"
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Delete PO Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Industrial A3 Cutting Sheet Modal */}
      {selectedPoForA3 && (
        <A3CuttingSheetModal
          po={selectedPoForA3}
          onClose={() => setSelectedPoForA3(null)}
        />
      )}
    </div>
  );
};
