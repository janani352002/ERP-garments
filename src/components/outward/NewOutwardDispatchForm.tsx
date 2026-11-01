import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { InwardPO, OutwardColourItem, OutwardDispatch } from '../../types/erp';
import { formatCurrency, formatNumber } from '../../utils/currency';
import {
  Truck,
  Building2,
  Calendar,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  RotateCcw,
  ArrowLeft,
  DollarSign,
  PackageCheck,
} from 'lucide-react';

export const NewOutwardDispatchForm: React.FC = () => {
  const { inwardOrders, addOutwardDispatch, navigate, showNotification } = useErp();

  // Selected PO state
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [selectedPo, setSelectedPo] = useState<InwardPO | null>(null);

  // Form Fields
  const [dispatchNo, setDispatchNo] = useState(() => `DC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [dispatchDate, setDispatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryChallanNo, setDeliveryChallanNo] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [destination, setDestination] = useState('');
  const [remarks, setRemarks] = useState('');

  // Colour Rows extracted from PO
  const [dispatchColours, setDispatchColours] = useState<OutwardColourItem[]>([]);

  // Success Dialog State
  const [createdDispatch, setCreatedDispatch] = useState<{
    dispatch: OutwardDispatch;
    ratePerPiecePaise: number;
    dispatchedQty: number;
    totalRevenuePaise: number;
    remainingBalance: number;
    poNumber: string;
  } | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter only POs that have a remaining balance > 0
  const activePOs = inwardOrders.filter((po) => po.totalQty - po.dispatchedQty > 0);

  // Auto-extract PO details when PO is selected
  const handleSelectPO = (poId: string) => {
    setSelectedPoId(poId);
    setValidationError(null);

    const po = inwardOrders.find((p) => p.id === poId);
    if (po) {
      setSelectedPo(po);
      setDestination(po.deliveryLocation || 'Client Warehouse');
      setDeliveryChallanNo(`CH-${po.poNumber}-${Date.now().toString().slice(-4)}`);

      // Extract exact colours defined in that PO
      // Available per colour = po.colour.qty - (po.colour.dispatchedQty || 0)
      const extractedRows: OutwardColourItem[] = po.colours.map((c) => {
        const alreadyDispatched = c.dispatchedQty || 0;
        const remainingThisColour = Math.max(0, c.qty - alreadyDispatched);
        return {
          colourId: c.id,
          colour: c.colour,
          size: c.size,
          availableQty: remainingThisColour,
          dispatchedQty: remainingThisColour, // default to remaining or 0
        };
      });

      setDispatchColours(extractedRows);
    } else {
      setSelectedPo(null);
      setDispatchColours([]);
    }
  };

  // Restrict editing: user can ONLY edit completed / dispatched quantity and delete colour row
  const handleDispatchedQtyChange = (index: number, qty: number) => {
    setValidationError(null);
    setDispatchColours((prev) =>
      prev.map((row, i) => {
        if (i === index) {
          const clamped = Math.max(0, qty);
          return { ...row, dispatchedQty: clamped };
        }
        return row;
      })
    );
  };

  // Delete colour row (remove colours not being dispatched in current batch)
  const handleDeleteColourRow = (index: number) => {
    setDispatchColours((prev) => prev.filter((_, i) => i !== index));
  };

  // Live Mathematical Calculations:
  const ratePerPiecePaise = selectedPo ? selectedPo.ratePerPiecePaise : 0;
  const availablePoBalance = selectedPo ? Math.max(0, selectedPo.totalQty - selectedPo.dispatchedQty) : 0;
  const totalDispatchedQty = dispatchColours.reduce((sum, c) => sum + (Number(c.dispatchedQty) || 0), 0);
  const totalOutwardRevenuePaise = totalDispatchedQty * ratePerPiecePaise;
  const remainingPoBalance = Math.max(0, availablePoBalance - totalDispatchedQty);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPo) {
      setValidationError('Please select an active Purchase Order to dispatch.');
      return;
    }

    if (totalDispatchedQty <= 0) {
      setValidationError('Dispatched quantity must be greater than 0 pieces.');
      return;
    }

    if (totalDispatchedQty > availablePoBalance) {
      setValidationError(
        `Total dispatched quantity (${totalDispatchedQty} pcs) exceeds available PO balance (${availablePoBalance} pcs).`
      );
      return;
    }

    // Save dispatch and trigger immediate Inward balance sync
    const result = addOutwardDispatch({
      dispatchNo,
      poId: selectedPo.id,
      poNumber: selectedPo.poNumber,
      clientName: selectedPo.clientName,
      styleName: selectedPo.styleName,
      date: dispatchDate,
      ratePerPiecePaise,
      colours: dispatchColours.filter((c) => c.dispatchedQty > 0),
      totalDispatchedQty,
      totalRevenuePaise: totalOutwardRevenuePaise,
      vehicleNumber: vehicleNumber.trim() || 'Factory Van / Local Transport',
      deliveryChallanNo: deliveryChallanNo.trim() || `DC-${Date.now()}`,
      destination: destination.trim() || selectedPo.deliveryLocation,
      remarks: remarks.trim(),
    });

    if (result.success && result.dispatch) {
      // Trigger Success Dialog with one-click route actions
      setCreatedDispatch({
        dispatch: result.dispatch,
        ratePerPiecePaise,
        dispatchedQty: totalDispatchedQty,
        totalRevenuePaise: totalOutwardRevenuePaise,
        remainingBalance: remainingPoBalance,
        poNumber: selectedPo.poNumber,
      });
    } else {
      setValidationError(result.error || 'Failed to record outward dispatch.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/outward')}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-900 hover:bg-indigo-50 transition-colors"
            title="Return to Outward Dispatches"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Create Outward Delivery & Dispatch</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                /outward/new
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Select an active PO to automatically extract and lock production parameters.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedPoId('');
            setSelectedPo(null);
            setDispatchColours([]);
            setValidationError(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Selection</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Automatic PO Extraction */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-100 shadow-xs space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 pb-2 border-b border-indigo-50">
            <PackageCheck className="w-4 h-4 text-indigo-600" /> 1. Select Active Inward PO for Dispatch
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Inward PO Reference <span className="text-rose-600">*</span>
              </label>
              <select
                id="outward-po-select"
                value={selectedPoId}
                onChange={(e) => handleSelectPO(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-indigo-300 bg-indigo-50/30 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-semibold text-indigo-950"
              >
                <option value="">-- Choose Active PO from Inward Register --</option>
                {activePOs.map((po) => {
                  const bal = po.totalQty - po.dispatchedQty;
                  return (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} • {po.clientName} • {po.styleName} ({bal.toLocaleString()} pcs remaining)
                    </option>
                  );
                })}
              </select>
              {activePOs.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  No active pending POs with remaining pieces available. Please create a new PO first in Inward.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dispatch Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Locked PO Details Display */}
          {selectedPo ? (
            <div className="bg-slate-50 border-2 border-indigo-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" /> Extracted & Locked PO Particulars
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Rate and client specifications are protected from alteration
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Client Company</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPo.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Garment Style</span>
                  <span className="font-bold text-indigo-900 text-sm">{selectedPo.styleName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Agreed PO Rate</span>
                  <span className="font-black text-emerald-800 text-sm font-mono">{formatCurrency(selectedPo.ratePerPiecePaise)} / pc</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Available Balance</span>
                  <span className="font-black text-amber-900 text-sm font-mono">{formatNumber(availablePoBalance)} pcs</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              Please select a Purchase Order above to automatically extract and lock client details, rate, and colour breakdowns.
            </div>
          )}
        </div>

        {/* Step 2: Restricted Editing Colour Table */}
        {selectedPo && (
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-50">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" /> 2. Dispatched Batch Breakdown & Quantities
                </h3>
                <p className="text-xs text-slate-500">
                  You can <strong>only edit the completed/dispatched quantity</strong>. Delete rows not included in this vehicle batch.
                </p>
              </div>
            </div>

            {/* Colour Table */}
            <div className="overflow-x-auto border border-indigo-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-950 font-bold border-b border-indigo-200">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Colour Shade</th>
                    <th className="py-2.5 px-3">Assortment / Size</th>
                    <th className="py-2.5 px-3 text-right">Available in PO</th>
                    <th className="py-2.5 px-3 text-right min-w-[140px]">
                      Dispatched Qty (Pcs) <span className="text-rose-600">*</span>
                    </th>
                    <th className="py-2.5 px-3 text-right">Locked Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                    <th className="py-2.5 px-3 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {dispatchColours.map((item, index) => {
                    const lineTotalPaise = (Number(item.dispatchedQty) || 0) * ratePerPiecePaise;
                    const isOverAvailable = (Number(item.dispatchedQty) || 0) > item.availableQty;

                    return (
                      <tr key={item.colourId || index} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-mono text-slate-500 font-semibold">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {item.colour}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono">
                          {item.size || 'Standard'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {formatNumber(item.availableQty)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max={item.availableQty}
                            value={item.dispatchedQty === 0 ? '0' : item.dispatchedQty || ''}
                            onChange={(e) => handleDispatchedQtyChange(index, parseInt(e.target.value) || 0)}
                            className={`w-full px-2.5 py-1.5 rounded border text-xs text-right font-mono font-bold ${
                              isOverAvailable
                                ? 'border-rose-500 text-rose-700 bg-rose-50 ring-2 ring-rose-100'
                                : 'border-indigo-300 focus:outline-hidden focus:border-indigo-600'
                            }`}
                          />
                          {isOverAvailable && (
                            <span className="text-[10px] text-rose-600 block">Exceeds PO shade balance</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(ratePerPiecePaise)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-indigo-950">
                          {formatCurrency(lineTotalPaise)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteColourRow(index)}
                            className="p-1.5 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                            title="Remove colour from this dispatch batch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {dispatchColours.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-xs text-slate-500">
                        All colour rows have been deleted. Please reset or choose an active PO.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Logistics & Delivery Details */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-indigo-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Challan / Invoice No.
                </label>
                <input
                  type="text"
                  value={deliveryChallanNo}
                  onChange={(e) => setDeliveryChallanNo(e.target.value)}
                  placeholder="DC-2026-001"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle / Truck Number
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. TN-38-BZ-4419 (Tata 407)"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Warehouse
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Tirupur Hub"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Live Mathematical Calculations & Synchronized Balance */}
        {selectedPo && (
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 pb-2 border-b border-indigo-50">
              <DollarSign className="w-4 h-4 text-indigo-600" /> 3. Live Mathematical Calculations & Inward Balance Projection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-[11px] font-bold uppercase text-indigo-800 block">Total Dispatched Pieces</span>
                <span className="text-2xl font-black text-indigo-950 font-mono block">
                  {formatNumber(totalDispatchedQty)} <span className="text-xs font-normal">pcs</span>
                </span>
                <span className="text-[11px] text-slate-500">In this dispatch batch</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold uppercase text-emerald-800 block">Total Outward Revenue</span>
                <span className="text-2xl font-black text-emerald-950 font-mono block">
                  {formatCurrency(totalOutwardRevenuePaise)}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {totalDispatchedQty.toLocaleString()} pcs × {formatCurrency(ratePerPiecePaise)}
                </span>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300">
                <span className="text-[11px] font-bold uppercase text-amber-900 block">Remaining PO Balance</span>
                <span className="text-2xl font-black text-amber-950 font-mono block">
                  {formatNumber(remainingPoBalance)} <span className="text-xs font-normal">pcs</span>
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">
                  Will immediately sync to Inward Pending list
                </span>
              </div>
            </div>

            {validationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submission Action Bar */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Saving will deduct {totalDispatchedQty.toLocaleString()} pieces from PO {selectedPo.poNumber} in real time.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/outward')}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-dispatch-save-btn"
                  type="submit"
                  disabled={totalDispatchedQty <= 0 || totalDispatchedQty > availablePoBalance}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                    totalDispatchedQty <= 0 || totalDispatchedQty > availablePoBalance
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-98'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Save Outward Dispatch & Sync Balance</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Success Dialog with One-Click Buttons as Specified:
          - [View Pending POs in Inward] (context.go('/inward'))
          - [View Outward Dispatches] (context.go('/outward')) */}
      {createdDispatch && (
        <div
          id="dispatch-success-dialog"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-teal-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Outward Dispatch Synchronized Successfully!
              </h3>
              <p className="text-xs text-slate-600">
                Challan <strong>{createdDispatch.dispatch.deliveryChallanNo}</strong> has been logged.
                The inward balance for PO <strong>{createdDispatch.poNumber}</strong> was deducted immediately.
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Dispatched Quantity</span>
                <span className="text-base font-black text-teal-800 font-mono">{formatNumber(createdDispatch.dispatchedQty)} pcs</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Agreed PO Unit Rate</span>
                <span className="text-base font-bold text-slate-800 font-mono">{formatCurrency(createdDispatch.ratePerPiecePaise)} / pc</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Outward Revenue</span>
                <span className="text-base font-black text-indigo-950 font-mono">{formatCurrency(createdDispatch.totalRevenuePaise)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-800 block">Remaining PO Balance</span>
                <span className="text-base font-black text-amber-900 font-mono">{formatNumber(createdDispatch.remainingBalance)} pcs</span>
              </div>
            </div>

            {/* Required Direct Navigation Actions */}
            <div className="space-y-2 pt-2">
              <button
                id="view-pending-pos-btn"
                type="button"
                onClick={() => {
                  setCreatedDispatch(null);
                  navigate('/inward');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>[View Pending POs in Inward]</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="view-outward-dispatches-btn"
                type="button"
                onClick={() => {
                  setCreatedDispatch(null);
                  navigate('/outward');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <span>[View Outward Dispatches]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
