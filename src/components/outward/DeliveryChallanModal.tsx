import React from 'react';
import { OutwardDispatch } from '../../types/erp';
import { formatCurrency, formatNumber } from '../../utils/currency';
import { Printer, X, Truck, Building2, CheckCircle2 } from 'lucide-react';

interface DeliveryChallanModalProps {
  dispatch: OutwardDispatch | null;
  onClose: () => void;
}

export const DeliveryChallanModal: React.FC<DeliveryChallanModalProps> = ({ dispatch, onClose }) => {
  if (!dispatch) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="delivery-challan-overlay"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="delivery-challan-card"
        className="bg-white text-slate-900 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col border border-indigo-200 overflow-hidden"
      >
        {/* Top Control Bar */}
        <div className="bg-indigo-950 text-white px-5 py-3 flex items-center justify-between print:hidden border-b border-indigo-900">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-bold">Delivery Challan & Gate Pass (Dispatch #{dispatch.dispatchNo})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="dc-print-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Challan</span>
            </button>
            <button
              id="dc-close-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Challan Sheet Body */}
        <div className="p-6 sm:p-8 space-y-4 font-sans text-xs print:p-0 print:text-black">
          {/* Outer Border */}
          <div className="border-2 border-indigo-950 rounded-lg p-5 space-y-4 print:border-black">
            {/* Header */}
            <div className="border-b-2 border-indigo-950 pb-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <h1 className="text-lg font-black uppercase text-indigo-950 print:text-black">
                  AR TEX GARMENT EXPORTS & JOB WORK
                </h1>
                <p className="text-[11px] text-slate-600">
                  Plot 42-A, SIDCO Industrial Estate, Palladam Road, Tirupur - 641 605, TN
                </p>
                <p className="text-[10px] text-slate-500">GSTIN: 33AAQFA1204N1Z8 • Phone: +91 421 2478900</p>
              </div>

              <div className="border-2 border-indigo-950 bg-indigo-50 px-4 py-2 rounded text-center shrink-0 print:bg-white print:border-black">
                <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-900">
                  DELIVERY CHALLAN & GATE PASS
                </span>
                <span className="text-base font-black text-indigo-950 font-mono">
                  {dispatch.deliveryChallanNo || dispatch.dispatchNo}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 print:bg-white print:border-black">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Client / Consignee</span>
                <span className="font-bold text-slate-900 text-sm">{dispatch.clientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Dispatch Date</span>
                <span className="font-semibold text-slate-800">{dispatch.date}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">PO Reference</span>
                <span className="font-mono font-bold text-indigo-900">{dispatch.poNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Vehicle / Transporter</span>
                <span className="font-semibold text-slate-900">{dispatch.vehicleNumber || 'Private Carrier'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Garment Style</span>
                <span className="font-bold text-slate-800">{dispatch.styleName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Destination Address</span>
                <span className="font-semibold text-slate-800">{dispatch.destination || 'Client Tirupur Hub'}</span>
              </div>
            </div>

            {/* Colour Breakdown Table */}
            <div className="border-2 border-indigo-200 rounded-lg overflow-hidden print:border-black">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-indigo-900 text-white font-bold text-[11px] print:bg-slate-200 print:text-black">
                    <th className="py-2 px-3 border-r border-indigo-700">#</th>
                    <th className="py-2 px-3 border-r border-indigo-700">Colour Shade</th>
                    <th className="py-2 px-3 border-r border-indigo-700">Size Assortment</th>
                    <th className="py-2 px-3 border-r border-indigo-700 text-right">Dispatched Pcs</th>
                    <th className="py-2 px-3 border-r border-indigo-700 text-right">Unit Rate</th>
                    <th className="py-2 px-3 text-right">Batch Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {dispatch.colours.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border-r border-indigo-100 font-mono text-center">{i + 1}</td>
                      <td className="py-2 px-3 border-r border-indigo-100 font-bold text-slate-900">{c.colour}</td>
                      <td className="py-2 px-3 border-r border-indigo-100 text-slate-600 font-mono">{c.size || 'Free Size'}</td>
                      <td className="py-2 px-3 border-r border-indigo-100 text-right font-mono font-bold text-slate-900">{formatNumber(c.dispatchedQty)}</td>
                      <td className="py-2 px-3 border-r border-indigo-100 text-right font-mono text-slate-700">{formatCurrency(dispatch.ratePerPiecePaise)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-indigo-950">
                        {formatCurrency(c.dispatchedQty * dispatch.ratePerPiecePaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50 font-black text-xs text-indigo-950 border-t-2 border-indigo-300 print:bg-slate-100 print:border-black">
                    <td colSpan={3} className="py-2.5 px-3 text-right uppercase border-r border-indigo-200">
                      Total Dispatched Quantity:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm text-indigo-950 border-r border-indigo-200">
                      {formatNumber(dispatch.totalDispatchedQty)} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right text-[11px] uppercase border-r border-indigo-200">
                      Total Revenue:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm text-emerald-900">
                      {formatCurrency(dispatch.totalRevenuePaise)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signature Blocks */}
            <div className="pt-8 grid grid-cols-3 gap-6 text-center border-t-2 border-indigo-950 print:border-black">
              <div className="space-y-6">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Dispatcher / Security</p>
                  <p className="text-[10px] text-slate-500">Gate Pass Checked</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Driver Signature</p>
                  <p className="text-[10px] text-slate-500">Goods Handed Over</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Receiver Seal & Signature</p>
                  <p className="text-[10px] text-slate-500">Consignee Acknowledgment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
          >
            Close Challan
          </button>
        </div>
      </div>
    </div>
  );
};
