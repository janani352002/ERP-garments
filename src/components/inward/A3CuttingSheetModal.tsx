import React from 'react';
import { InwardPO } from '../../types/erp';
import { formatCurrency, formatNumber } from '../../utils/currency';
import { Printer, X, Scissors, CheckCircle, AlertTriangle, Building2 } from 'lucide-react';

interface A3CuttingSheetModalProps {
  po: InwardPO | null;
  onClose: () => void;
}

export const A3CuttingSheetModal: React.FC<A3CuttingSheetModalProps> = ({ po, onClose }) => {
  if (!po) return null;

  const pendingBalance = Math.max(0, po.totalQty - po.dispatchedQty);
  const completionPercentage = po.totalQty > 0 ? Math.round((po.dispatchedQty / po.totalQty) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="a3-cutting-sheet-overlay"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      {/* Modal Container */}
      <div
        id="a3-cutting-sheet-card"
        className="bg-white text-slate-900 w-full max-w-5xl max-h-[96vh] rounded-xl shadow-2xl flex flex-col border border-indigo-200 overflow-hidden"
      >
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="bg-indigo-950 text-white px-5 py-3.5 flex items-center justify-between print:hidden border-b border-indigo-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-800 text-amber-300">
              <Scissors className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Industrial A3 Production Job Card & Cutting Sheet</h3>
              <p className="text-xs text-indigo-300">PO Ref: {po.poNumber} • {po.clientName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="a3-print-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print A3 Sheet</span>
            </button>
            <button
              id="a3-close-btn"
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* High-Resolution A3 Sheet Content */}
        <div className="p-6 sm:p-8 overflow-y-auto font-sans text-xs print:p-0 print:text-black">
          {/* Sheet Outer Border */}
          <div className="border-2 border-indigo-900 rounded-lg p-5 space-y-4 print:border-black">
            {/* Header Block */}
            <div className="border-b-2 border-indigo-900 pb-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-lg bg-indigo-900 text-amber-300 flex items-center justify-center font-black text-xl shrink-0 print:border print:border-black">
                  AR
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-indigo-950 uppercase print:text-black">
                    AR TEX GARMENT EXPORTS & JOB WORK
                  </h1>
                  <p className="text-[11px] font-medium text-slate-600">
                    Plot No. 42-A, SIDCO Industrial Estate, Palladam Road, Tirupur - 641 605, Tamil Nadu, India
                  </p>
                  <p className="text-[10px] text-slate-500">
                    GSTIN: 33AAQFA1204N1Z8 • Phone: +91 421 2478900 • Email: production@artexgarments.in
                  </p>
                </div>
              </div>

              <div className="border-2 border-indigo-900 bg-indigo-50 px-4 py-2 rounded text-center shrink-0 print:bg-white print:border-black">
                <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-900">
                  A3 CUTTING & PRODUCTION JOB CARD
                </span>
                <span className="text-base font-black text-indigo-950 font-mono">
                  {po.poNumber}
                </span>
              </div>
            </div>

            {/* PO Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-indigo-200 print:bg-white print:border-black">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Client / Buyer</span>
                <span className="font-bold text-slate-900 text-sm">{po.clientName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Garment Style</span>
                <span className="font-bold text-indigo-900 text-sm">{po.styleName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Inward PO Date</span>
                <span className="font-semibold text-slate-900">{po.date}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Agreed Unit Rate</span>
                <span className="font-bold text-emerald-800 text-sm">{formatCurrency(po.ratePerPiecePaise)} / pc</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Delivery Destination</span>
                <span className="font-semibold text-slate-800">{po.deliveryLocation || 'Factory Floor - Tirupur Main Unit'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Industrial Remarks & Fabric Specs</span>
                <span className="font-semibold text-slate-800">{po.remarks || 'Standard job work cutting & assembly specifications apply.'}</span>
              </div>
            </div>

            {/* Key Volume Metrics Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-indigo-50 border-2 border-indigo-200 rounded-lg text-center print:bg-white print:border-black">
                <span className="text-[10px] font-bold uppercase text-indigo-700 block">Total Order Target</span>
                <span className="text-xl font-black text-indigo-950">{formatNumber(po.totalQty)}</span>
                <span className="text-[10px] text-slate-500 block">Pieces in PO</span>
              </div>
              <div className="p-3 bg-teal-50 border-2 border-teal-200 rounded-lg text-center print:bg-white print:border-black">
                <span className="text-[10px] font-bold uppercase text-teal-800 block">Dispatched to Date</span>
                <span className="text-xl font-black text-teal-900">{formatNumber(po.dispatchedQty)}</span>
                <span className="text-[10px] text-teal-700 font-semibold block">{completionPercentage}% Completed</span>
              </div>
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg text-center print:bg-white print:border-black">
                <span className="text-[10px] font-bold uppercase text-amber-900 block">Remaining Balanced Qty</span>
                <span className="text-xl font-black text-amber-950">{formatNumber(pendingBalance)}</span>
                <span className="text-[10px] text-amber-800 font-bold block">Active Pieces Left</span>
              </div>
            </div>

            {/* Detailed Colour Breakdown Table */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-indigo-700" /> Colour & Size Ratio Production Breakdown
                </h3>
                <span className="text-[11px] font-semibold text-slate-600">
                  Total Colour Rows: {po.colours.length}
                </span>
              </div>

              <div className="overflow-x-auto border-2 border-indigo-200 rounded-lg print:border-black">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-indigo-900 text-white font-bold text-[11px] print:bg-slate-200 print:text-black">
                      <th className="py-2 px-3 border-r border-indigo-700">S.No</th>
                      <th className="py-2 px-3 border-r border-indigo-700">Colour Shade</th>
                      <th className="py-2 px-3 border-r border-indigo-700">Size Breakdown</th>
                      <th className="py-2 px-3 border-r border-indigo-700 text-right">Inward Qty (Pcs)</th>
                      <th className="py-2 px-3 border-r border-indigo-700 text-right">Dispatched</th>
                      <th className="py-2 px-3 border-r border-indigo-700 text-right">Balance Qty</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {po.colours.map((item, idx) => {
                      const dispatched = item.dispatchedQty || 0;
                      const bal = Math.max(0, item.qty - dispatched);
                      const isComplete = bal === 0;

                      return (
                        <tr key={item.id || idx} className="hover:bg-indigo-50/50">
                          <td className="py-2 px-3 border-r border-indigo-100 font-mono text-center">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-indigo-100 font-bold text-slate-900">
                            {item.colour}
                          </td>
                          <td className="py-2 px-3 border-r border-indigo-100 text-slate-700 font-mono">
                            {item.size || 'Free Size / Standard Ratio'}
                          </td>
                          <td className="py-2 px-3 border-r border-indigo-100 font-bold text-right font-mono text-indigo-950">
                            {formatNumber(item.qty)}
                          </td>
                          <td className="py-2 px-3 border-r border-indigo-100 text-right font-mono text-teal-800">
                            {formatNumber(dispatched)}
                          </td>
                          <td className="py-2 px-3 border-r border-indigo-100 text-right font-mono font-bold text-amber-900">
                            {formatNumber(bal)}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">
                            {isComplete ? (
                              <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Full
                              </span>
                            ) : (
                              <span className="text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> In Production
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-indigo-50 font-black text-xs text-indigo-950 border-t-2 border-indigo-300 print:bg-slate-100 print:border-black">
                      <td colSpan={3} className="py-2 px-3 text-right uppercase border-r border-indigo-200">
                        Total Production Target
                      </td>
                      <td className="py-2 px-3 text-right font-mono border-r border-indigo-200 text-sm">
                        {formatNumber(po.totalQty)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono border-r border-indigo-200 text-teal-900">
                        {formatNumber(po.dispatchedQty)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-900 text-sm">
                        {formatNumber(pendingBalance)}
                      </td>
                      <td className="py-2 px-3 text-center text-[10px] uppercase font-bold text-indigo-800">
                        {po.status}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Industrial Cutting Instructions */}
            <div className="bg-slate-50 border border-slate-300 p-3 rounded text-[11px] space-y-1 text-slate-700 print:bg-white print:border-black">
              <span className="font-bold uppercase text-slate-900 block">Cutting Master Guidelines & Quality Norms:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Check fabric roll shrinkage before spreading; allow 4 hours relaxation for Lycra/Spandex blends.</li>
                <li>Stitch density must strictly maintain 12 to 14 SPI with 4-thread overlock seam tolerance.</li>
                <li>Ensure matching high-tenacity spun polyester sewing threads for all body and collar attachments.</li>
                <li>Completed bundles must carry bundle ticket tags mentioning Job Card Ref: <strong>{po.poNumber}</strong>.</li>
              </ul>
            </div>

            {/* Industrial 4-Block Signatures */}
            <div className="pt-6 grid grid-cols-4 gap-4 text-center border-t-2 border-indigo-900 print:border-black">
              <div className="space-y-6">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Cutting Master</p>
                  <p className="text-[10px] text-slate-500">Sign & Date</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Line Supervisor</p>
                  <p className="text-[10px] text-slate-500">Stitching Line In-Charge</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Quality Checker</p>
                  <p className="text-[10px] text-slate-500">100% Inspection Passed</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <div>
                  <p className="font-bold text-xs text-indigo-950">Factory Manager</p>
                  <p className="text-[10px] text-slate-500">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between print:hidden shrink-0">
          <span className="text-xs text-slate-500">
            A3 Job Card generated for industrial shop-floor production management.
          </span>
          <button
            id="a3-bottom-close-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
