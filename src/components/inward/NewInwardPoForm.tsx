import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { ColourBreakdown } from '../../types/erp';
import { toPaise, formatCurrency } from '../../utils/currency';
import {
  RotateCcw,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  MapPin,
  FileText,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const NewInwardPoForm: React.FC = () => {
  const { clients, styles, addClient, addStyle, addInwardPO, navigate, showNotification } = useErp();

  // 1. Initial State starts COMPLETELY CLEAN as mandated:
  // Text inputs start blank with placeholder hints
  const [poNumber, setPoNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState(''); // starts unselected
  const [styleName, setStyleName] = useState(''); // starts unselected
  const [rateInput, setRateInput] = useState(''); // starts blank "0.00"
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [remarks, setRemarks] = useState('');

  // Modals for adding new client / style on the fly if needed
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientInput, setNewClientInput] = useState('');
  const [showAddStyleModal, setShowAddStyleModal] = useState(false);
  const [newStyleInput, setNewStyleInput] = useState('');

  // Table starts with 1 blank colour breakdown row ready for user entry
  const [colours, setColours] = useState<ColourBreakdown[]>([
    { id: 'row-1', colour: '', size: 'S - XXL', qty: 0 },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset / Clear Form Action (AppBar action [Clear Form])
  const handleClearForm = () => {
    setPoNumber('');
    setDate(new Date().toISOString().split('T')[0]);
    setClientName('');
    setStyleName('');
    setRateInput('');
    setDeliveryLocation('');
    setRemarks('');
    setColours([{ id: `row-${Date.now()}`, colour: '', size: 'S - XXL', qty: 0 }]);
    setErrors({});
    showNotification('Form cleared to blank entry state.', 'info');
  };

  // Add colour row
  const handleAddColourRow = () => {
    setColours((prev) => [
      ...prev,
      { id: `row-${Date.now()}-${prev.length}`, colour: '', size: 'S - XXL', qty: 0 },
    ]);
  };

  // Delete colour row with validation that at least 1 row remains
  const handleDeleteColourRow = (id: string) => {
    if (colours.length <= 1) {
      showNotification('At least one colour breakdown row is required in the PO.', 'error');
      return;
    }
    setColours((prev) => prev.filter((r) => r.id !== id));
  };

  const handleColourChange = (id: string, field: keyof ColourBreakdown, value: string | number) => {
    setColours((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Live total pieces and PO value
  const totalPieces = colours.reduce((sum, c) => sum + (Number(c.qty) || 0), 0);
  const ratePerPiecePaise = toPaise(rateInput);
  const totalPoValuePaise = totalPieces * ratePerPiecePaise;

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!poNumber.trim()) {
      newErrors.poNumber = 'Purchase Order Reference number is required.';
    }
    if (!clientName || clientName === 'Select Client / Company') {
      newErrors.clientName = 'Please select a Client / Company.';
    }
    if (!styleName || styleName === 'Select Garment Style') {
      newErrors.styleName = 'Please select a Garment Style.';
    }
    if (!rateInput || parseFloat(rateInput) <= 0) {
      newErrors.rateInput = 'Please enter a valid rate per piece (greater than 0).';
    }

    const hasValidColour = colours.some((c) => c.colour.trim() && Number(c.qty) > 0);
    if (!hasValidColour) {
      newErrors.colours = 'Please enter at least one colour name and quantity greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('Please fill in all mandatory fields before saving.', 'error');
      return;
    }

    // Filter valid colours
    const validColours = colours
      .filter((c) => c.colour.trim() && Number(c.qty) > 0)
      .map((c) => ({
        ...c,
        qty: Number(c.qty),
        dispatchedQty: 0,
      }));

    addInwardPO({
      poNumber: poNumber.trim().toUpperCase(),
      date,
      clientName,
      styleName,
      ratePerPiecePaise,
      deliveryLocation: deliveryLocation.trim() || 'Tirupur Main Unit',
      remarks: remarks.trim(),
      colours: validColours,
      totalQty: totalPieces,
    });

    // Navigate to /inward after creation
    navigate('/inward');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner with Clear Form AppBar Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/inward')}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-900 hover:bg-indigo-50 transition-colors"
            title="Return to Inward Orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Clean Inward PO Entry Form</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                /inward/new
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Create a fresh job-work production order. Inputs start unselected and blank.
            </p>
          </div>
        </div>

        {/* Clear Form Action Button */}
        <div className="flex items-center gap-2">
          <button
            id="clear-form-btn"
            type="button"
            onClick={handleClearForm}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            title="Reset all inputs with a single click"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>Clear Form</span>
          </button>
        </div>
      </div>

      {/* Main Clean Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Order Identity & Client */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-100 shadow-xs space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 pb-2 border-b border-indigo-50">
            <Building2 className="w-4 h-4 text-indigo-600" /> 1. Purchase Order & Client Particulars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PO Ref Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                PO Reference Number <span className="text-rose-600">*</span>
              </label>
              <input
                id="po-number-input"
                type="text"
                value={poNumber}
                onChange={(e) => {
                  setPoNumber(e.target.value);
                  if (errors.poNumber) setErrors((prev) => ({ ...prev, poNumber: '' }));
                }}
                placeholder="e.g. PO-2026-001"
                className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all ${
                  errors.poNumber ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              {errors.poNumber && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.poNumber}
                </p>
              )}
            </div>

            {/* Inward Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                PO Inward Date <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="po-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Client / Company Dropdown (starts unselected) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Client / Company <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  + Add Client
                </button>
              </div>
              <select
                id="client-dropdown"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: '' }));
                }}
                className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all ${
                  errors.clientName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                }`}
              >
                <option value="">Select Client / Company</option>
                {clients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.clientName && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.clientName}
                </p>
              )}
            </div>

            {/* Garment Style Dropdown (starts unselected) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Garment Style <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddStyleModal(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  + Add Style
                </button>
              </div>
              <select
                id="style-dropdown"
                value={styleName}
                onChange={(e) => {
                  setStyleName(e.target.value);
                  if (errors.styleName) setErrors((prev) => ({ ...prev, styleName: '' }));
                }}
                className={`w-full px-3.5 py-2 rounded-lg text-sm border bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all ${
                  errors.styleName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                }`}
              >
                <option value="">Select Garment Style</option>
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.styleName && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.styleName}
                </p>
              )}
            </div>

            {/* Rate per Piece (starts blank with hint 0.00) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rate per Piece (₹) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  id="rate-per-piece-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rateInput}
                  onChange={(e) => {
                    setRateInput(e.target.value);
                    if (errors.rateInput) setErrors((prev) => ({ ...prev, rateInput: '' }));
                  }}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3.5 py-2 rounded-lg text-sm border bg-slate-50/50 focus:bg-white focus:outline-hidden font-mono transition-all ${
                    errors.rateInput ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.rateInput && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.rateInput}
                </p>
              )}
            </div>

            {/* Delivery Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Delivery Location
              </label>
              <input
                id="delivery-location-input"
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="Tirupur Unit 1"
                className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Production Remarks / Fabric Specifications
            </label>
            <input
              id="remarks-input"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. 100% Cotton Bio-Wash 180 GSM, Single Jersey, Lycra Rib with bar-tack reinforcement"
              className="w-full px-3.5 py-2 rounded-lg text-sm border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Section 2: Colour Breakdown Table */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-50">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> 2. Colour & Size Breakdown Table
              </h3>
              <p className="text-xs text-slate-500">
                Table starts with 1 blank row ready for user entry. Each row has a delete icon (minimum 1 row preserved).
              </p>
            </div>
            <button
              id="add-colour-row-btn"
              type="button"
              onClick={handleAddColourRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200 self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Colour</span>
            </button>
          </div>

          {errors.colours && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.colours}</span>
            </div>
          )}

          {/* Breakdown Table */}
          <div className="overflow-x-auto border border-indigo-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-50 text-indigo-950 font-bold border-b border-indigo-200">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Colour Name / Shade <span className="text-rose-600">*</span></th>
                  <th className="py-2.5 px-3 min-w-[150px]">Size Assortment</th>
                  <th className="py-2.5 px-3 min-w-[140px] text-right">Quantity (Pieces) <span className="text-rose-600">*</span></th>
                  <th className="py-2.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {colours.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono text-slate-500 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.colour}
                        onChange={(e) => handleColourChange(item.id, 'colour', e.target.value)}
                        placeholder="e.g. Navy Blue, Olive Green"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.size}
                        onChange={(e) => handleColourChange(item.id, 'size', e.target.value)}
                        placeholder="e.g. S, M, L, XL"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.qty || ''}
                        onChange={(e) => handleColourChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-hidden focus:border-indigo-600 text-xs text-right font-mono font-bold"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteColourRow(item.id)}
                        disabled={colours.length <= 1}
                        className={`p-1.5 rounded transition-colors ${
                          colours.length <= 1
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                        }`}
                        title={colours.length <= 1 ? 'At least 1 row required' : 'Delete colour row'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50/70 border-t-2 border-indigo-200 font-bold text-xs text-indigo-950">
                  <td colSpan={3} className="py-2.5 px-3 text-right uppercase">
                    Total Order Quantity:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-indigo-950 font-black">
                    {totalPieces.toLocaleString()} pcs
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 3: Live Valuation & Final Submission */}
        <div className="bg-indigo-900 text-white p-5 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs text-indigo-200">Live PO Estimated Valuation</div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {formatCurrency(totalPoValuePaise)}
              </span>
              <span className="text-xs text-indigo-200">
                ({totalPieces.toLocaleString()} pcs × {formatCurrency(ratePerPiecePaise)}/pc)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/inward')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-indigo-800 hover:bg-indigo-750 text-indigo-200 hover:text-white text-xs font-semibold transition-colors text-center"
            >
              Cancel
            </button>
            <button
              id="save-inward-po-btn"
              type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Save & Register PO</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal: Quick Add Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-indigo-100">
            <h4 className="font-bold text-sm text-slate-900">Add New Client Company</h4>
            <input
              type="text"
              value={newClientInput}
              onChange={(e) => setNewClientInput(e.target.value)}
              placeholder="e.g. Tirupur Global Knits"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-indigo-600"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newClientInput.trim()) {
                    addClient(newClientInput.trim());
                    setClientName(newClientInput.trim());
                    setNewClientInput('');
                    setShowAddClientModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Style */}
      {showAddStyleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-indigo-100">
            <h4 className="font-bold text-sm text-slate-900">Add New Garment Style</h4>
            <input
              type="text"
              value={newStyleInput}
              onChange={(e) => setNewStyleInput(e.target.value)}
              placeholder="e.g. Drop Shoulder Boxy Tee"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:border-indigo-600"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddStyleModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newStyleInput.trim()) {
                    addStyle(newStyleInput.trim());
                    setStyleName(newStyleInput.trim());
                    setNewStyleInput('');
                    setShowAddStyleModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Add Style
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
