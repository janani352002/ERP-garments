import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { OutwardDispatch } from '../../types/erp';
import { formatCurrency, formatNumber } from '../../utils/currency';
import { DeliveryChallanModal } from './DeliveryChallanModal';
import {
  Truck,
  PackageCheck,
  Trash2,
  Printer,
  Search,
  ArrowRight,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Coins,
} from 'lucide-react';

export const OutwardDispatchesView: React.FC = () => {
  const { outwardDispatches, deleteOutwardDispatch, navigate, isManager } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispatchForDc, setSelectedDispatchForDc] = useState<OutwardDispatch | null>(null);
  const [dispatchToDelete, setDispatchToDelete] = useState<OutwardDispatch | null>(null);

  // Metrics
  const totalDispatchesCount = outwardDispatches.length;
  const totalDispatchedPieces = outwardDispatches.reduce((sum, d) => sum + d.totalDispatchedQty, 0);
  const totalGrossRevenuePaise = outwardDispatches.reduce((sum, d) => sum + d.totalRevenuePaise, 0);

  const filteredDispatches = outwardDispatches.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.dispatchNo.toLowerCase().includes(q) ||
      d.poNumber.toLowerCase().includes(q) ||
      d.clientName.toLowerCase().includes(q) ||
      d.styleName.toLowerCase().includes(q) ||
      d.deliveryChallanNo.toLowerCase().includes(q)
    );
  });

  const confirmDelete = () => {
    if (dispatchToDelete) {
      deleteOutwardDispatch(dispatchToDelete.id);
      setDispatchToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Outward Delivery & Dispatch Register</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              {totalDispatchesCount} {totalDispatchesCount === 1 ? 'Dispatch' : 'Dispatches'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log completed garment batches, generate delivery gate passes, and track revenue generation.
          </p>
        </div>

        <button
          id="create-new-dispatch-header-btn"
          type="button"
          onClick={() => navigate('/outward/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98"
        >
          <Truck className="w-4 h-4" />
          <span>Create New Dispatch</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Total Dispatches Logged</span>
          <div className="text-xl font-black text-slate-900 font-mono">{totalDispatchesCount} <span className="text-xs font-normal text-slate-500">consignments</span></div>
          <span className="text-[10px] text-teal-700 font-medium">Syncs real-time with Inward PO balances</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Total Dispatched Volume</span>
          <div className="text-xl font-black text-indigo-950 font-mono">{formatNumber(totalDispatchedPieces)} <span className="text-xs font-normal text-slate-500">pieces</span></div>
          <span className="text-[10px] text-slate-500">Shipped out of factory floor</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Total Realized Outward Revenue</span>
          <div className="text-xl font-black text-emerald-800 font-mono">{formatCurrency(totalGrossRevenuePaise)}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">Feeds directly into Live Net Profit Engine</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-4 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-800">
            All Dispatch Challans ({filteredDispatches.length})
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Challan, PO, Client..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Empty State or Table */}
        {filteredDispatches.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto">
              <Truck className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No Outward Dispatches Recorded Yet
              </h3>
              <p className="text-xs text-slate-500">
                When stitched garments are ready, create an Outward Dispatch against an active Inward PO to immediately deduct the quantities from the pending order balance.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate('/outward/new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Truck className="w-4 h-4" />
                <span>[Create New Outward Dispatch]</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-200">
                  <th className="py-3 px-3.5">Challan / DC No</th>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">PO Ref</th>
                  <th className="py-3 px-3.5">Client Company</th>
                  <th className="py-3 px-3.5">Garment Style</th>
                  <th className="py-3 px-3.5 text-right">Dispatched Qty</th>
                  <th className="py-3 px-3.5 text-right">Unit Rate (₹)</th>
                  <th className="py-3 px-3.5 text-right">Gross Total (₹)</th>
                  <th className="py-3 px-3.5">Vehicle / Transporter</th>
                  <th className="py-3 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {filteredDispatches.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-teal-50/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedDispatchForDc(d)}
                  >
                    {/* DC No */}
                    <td className="py-3 px-3.5 font-mono font-bold text-teal-800 group-hover:underline">
                      {d.deliveryChallanNo || d.dispatchNo}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {d.date}
                    </td>

                    {/* PO Ref */}
                    <td className="py-3 px-3.5 font-mono font-semibold text-indigo-900">
                      {d.poNumber}
                    </td>

                    {/* Client */}
                    <td className="py-3 px-3.5 font-semibold text-slate-900">
                      {d.clientName}
                    </td>

                    {/* Style */}
                    <td className="py-3 px-3.5 text-slate-700 max-w-[180px] truncate" title={d.styleName}>
                      {d.styleName}
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900">
                      {formatNumber(d.totalDispatchedQty)}
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-3.5 text-right font-mono text-slate-600">
                      {formatCurrency(d.ratePerPiecePaise)}
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3 px-3.5 text-right font-mono font-black text-emerald-800">
                      {formatCurrency(d.totalRevenuePaise)}
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-3.5 text-slate-600 text-[11px] truncate max-w-[140px]">
                      {d.vehicleNumber || 'Standard Delivery'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDispatchForDc(d)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-colors border border-teal-200"
                          title="View & Print Delivery Challan"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Challan</span>
                        </button>
                        {isManager && (
                          <button
                            type="button"
                            onClick={() => setDispatchToDelete(d)}
                            className="p-1.5 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                            title="Delete dispatch and restore PO inward balance (Manager Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Dispatch Dialog */}
      {dispatchToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Dispatch & Restore PO Balance?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete Dispatch <strong>{dispatchToDelete.deliveryChallanNo}</strong>?
              </p>
              <p className="text-xs text-indigo-900 font-semibold pt-1">
                {dispatchToDelete.totalDispatchedQty.toLocaleString()} pieces will be credited back into PO {dispatchToDelete.poNumber}'s active balance automatically.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDispatchToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Delete & Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Challan Printable Modal */}
      {selectedDispatchForDc && (
        <DeliveryChallanModal
          dispatch={selectedDispatchForDc}
          onClose={() => setSelectedDispatchForDc(null)}
        />
      )}
    </div>
  );
};
