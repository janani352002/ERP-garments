import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Expense } from '../../types/erp';
import { formatCurrency, toPaise } from '../../utils/currency';
import {
  Coins,
  Plus,
  Trash2,
  Tag,
  Calendar,
  Layers,
  Wrench,
  Zap,
  Package,
  Search,
  Receipt,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, isManager } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<'Material Overheads' | 'Machine Maintenance' | 'Utilities & Rent'>('Material Overheads');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [voucherNo, setVoucherNo] = useState('');

  // Category Aggregates
  let materialOverheadsPaise = 0;
  let maintenancePaise = 0;
  let utilitiesRentPaise = 0;

  expenses.forEach((e) => {
    if (e.category === 'Material Overheads') materialOverheadsPaise += e.amountPaise;
    else if (e.category === 'Machine Maintenance') maintenancePaise += e.amountPaise;
    else if (e.category === 'Utilities & Rent') utilitiesRentPaise += e.amountPaise;
  });

  const totalExpensesPaise = materialOverheadsPaise + maintenancePaise + utilitiesRentPaise;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = toPaise(amountInput);
    if (!title.trim() || amountPaise <= 0) return;

    addExpense({
      date,
      category,
      subcategory: subcategory.trim() || category,
      title: title.trim(),
      amountPaise,
      paymentMode,
      voucherNo: voucherNo.trim() || `VCH-${Date.now().toString().slice(-4)}`,
    });

    setTitle('');
    setAmountInput('');
    setSubcategory('');
    setVoucherNo('');
    setShowAddModal(false);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategoryFilter === 'All' || e.category === selectedCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.subcategory.toLowerCase().includes(q) ||
      e.voucherNo.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Factory Expenses & Overheads</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              /expenses
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record material consumables, machine maintenance, and plant utilities to feed into the Live Net Profit Engine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense Voucher</span>
        </button>
      </div>

      {/* 3 Industrial Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Expenses */}
        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Total Factory Overheads</span>
          <div className="text-2xl font-black text-indigo-950 font-mono">{formatCurrency(totalExpensesPaise)}</div>
          <span className="text-[10px] text-slate-500 font-medium">{expenses.length} Total Vouchers</span>
        </div>

        {/* Material Overheads */}
        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs bg-linear-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-amber-900 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-600" /> Material Overheads
            </span>
          </div>
          <div className="text-xl font-black text-amber-950 font-mono">{formatCurrency(materialOverheadsPaise)}</div>
          <span className="text-[10px] text-amber-800 font-medium">Threads, Needles, Buttons, Elastic</span>
        </div>

        {/* Machine Maintenance */}
        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs bg-linear-to-br from-white to-blue-50/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-blue-900 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" /> Machine Maintenance
            </span>
          </div>
          <div className="text-xl font-black text-blue-950 font-mono">{formatCurrency(maintenancePaise)}</div>
          <span className="text-[10px] text-blue-800 font-medium">Servicing, Spare Parts, Motor repairs</span>
        </div>

        {/* Utilities & Rent */}
        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs bg-linear-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-emerald-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" /> Utilities & Rent
            </span>
          </div>
          <div className="text-xl font-black text-emerald-950 font-mono">{formatCurrency(utilitiesRentPaise)}</div>
          <span className="text-[10px] text-emerald-800 font-medium">EB Bill, Diesel, Unit Rent, Freight</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['All', 'Material Overheads', 'Machine Maintenance', 'Utilities & Rent'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategoryFilter === c
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voucher or description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">No factory expenses logged.</p>
            <p>Click "Record Expense Voucher" to log operational overheads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher No</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description / Particulars</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-indigo-50/30">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{exp.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">{exp.voucherNo}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          exp.category === 'Material Overheads'
                            ? 'bg-amber-100 text-amber-900'
                            : exp.category === 'Machine Maintenance'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{exp.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{exp.paymentMode}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      {formatCurrency(exp.amountPaise)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isManager ? (
                        <button
                          type="button"
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          title="Delete expense voucher (Manager Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Expense Voucher */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-indigo-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" /> Record Factory Expense Voucher
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:outline-hidden focus:border-indigo-600"
                >
                  <option value="Material Overheads">Material Overheads (Threads, Needles, Elastic, Buttons)</option>
                  <option value="Machine Maintenance">Machine Maintenance & Servicing (Oil, Spare parts, Motor)</option>
                  <option value="Utilities & Rent">Utilities & Rent (EB Electricity, Generator Diesel, Rent, Transport)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Expense Particulars *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 50 Cones Spun Poly Sewing Thread (White & Navy)"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="3500.00"
                      required
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Cash">Cash Voucher</option>
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voucher / Bill Number</label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    placeholder="VCH-041"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
