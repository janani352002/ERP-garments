import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { RateCardItem } from '../../types/erp';
import { formatCurrency, toPaise, toRupees } from '../../utils/currency';
import {
  ReceiptText,
  Plus,
  Edit2,
  Clock,
  Tag,
  Search,
  CheckCircle2,
  Layers,
  History,
  AlertCircle,
} from 'lucide-react';

export const RateCardView: React.FC = () => {
  const { rateCards, addRateCardItem, updateRateCardItem, isManager } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal: Add Operation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpCode, setNewOpCode] = useState('');
  const [newOpRate, setNewOpRate] = useState('');
  const [newOpCategory, setNewOpCategory] = useState<'Stitching' | 'Finishing' | 'Cutting' | 'Checking' | 'Packing'>('Stitching');

  // Modal: Edit Rate (with Versioning)
  const [editingItem, setEditingItem] = useState<RateCardItem | null>(null);
  const [updatedRateInput, setUpdatedRateInput] = useState('');

  const categories = ['All', 'Stitching', 'Finishing', 'Cutting', 'Checking', 'Packing'];

  const filteredItems = rateCards.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.operationName.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleCreateOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName.trim()) return;
    const ratePaise = toPaise(newOpRate);
    if (ratePaise <= 0) return;

    addRateCardItem({
      operationName: newOpName.trim(),
      code: newOpCode.trim() || `OP-${Date.now().toString().slice(-4)}`,
      ratePaise,
      category: newOpCategory,
    });

    setNewOpName('');
    setNewOpCode('');
    setNewOpRate('');
    setShowAddModal(false);
  };

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const newRatePaise = toPaise(updatedRateInput);
    if (newRatePaise <= 0) return;

    updateRateCardItem(editingItem.id, newRatePaise);
    setEditingItem(null);
    setUpdatedRateInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Operation Rate Card Master</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              {rateCards.length} Operations
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define piece rates per garment tailoring operation. Versioning ensures past payroll logs keep original rates.
          </p>
        </div>

        {isManager && (
          <button
            id="add-operation-btn"
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Operation</span>
          </button>
        )}
      </div>

      {/* Categories & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-800'
              }`}
            >
              {cat}
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
            placeholder="Search operation name or code..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Rate Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-indigo-100 shadow-xs p-5 flex flex-col justify-between hover:border-indigo-300 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  <History className="w-3 h-3 text-indigo-500" /> v{item.version}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                  {item.operationName}
                </h3>
                <span className="text-xs font-mono text-slate-500 block">{item.code}</span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Piece Rate</span>
                <span className="text-2xl font-black text-indigo-950 font-mono">
                  {formatCurrency(item.ratePaise)}
                </span>
                <span className="text-[11px] text-slate-500 block">per stitched piece</span>
              </div>

              {isManager && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(item);
                    setUpdatedRateInput(toRupees(item.ratePaise).toString());
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 text-xs font-semibold transition-colors border border-slate-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Rate</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add New Operation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-indigo-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-indigo-600" /> Add Operation to Rate Card
            </h3>

            <form onSubmit={handleCreateOperation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operation Name *</label>
                <input
                  type="text"
                  value={newOpName}
                  onChange={(e) => setNewOpName(e.target.value)}
                  placeholder="e.g. Kangaroo Pocket Stitching"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operation Code</label>
                  <input
                    type="text"
                    value={newOpCode}
                    onChange={(e) => setNewOpCode(e.target.value)}
                    placeholder="e.g. OP-PKT-11"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newOpCategory}
                    onChange={(e) => setNewOpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="Stitching">Stitching</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Cutting">Cutting</option>
                    <option value="Checking">Checking</option>
                    <option value="Packing">Packing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rate per Piece (₹) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.10"
                    value={newOpRate}
                    onChange={(e) => setNewOpRate(e.target.value)}
                    placeholder="2.50"
                    required
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono font-bold"
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
                  Save Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Operation Rate (Versioning) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-indigo-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" /> Update Rate with Versioning
            </h3>

            <div className="bg-indigo-50 p-3 rounded-lg text-xs space-y-1 text-slate-700">
              <span className="font-bold text-indigo-900 block">{editingItem.operationName}</span>
              <p>Current Version: <strong>v{editingItem.version}</strong> • Current Rate: <strong>{formatCurrency(editingItem.ratePaise)}</strong></p>
              <p className="text-[11px] text-slate-500">
                Updating creates <strong>v{editingItem.version + 1}</strong>. Historical daily production records will continue to calculate based on their original logged rates.
              </p>
            </div>

            <form onSubmit={handleUpdateRate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Rate per Piece (₹) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.10"
                    value={updatedRateInput}
                    onChange={(e) => setUpdatedRateInput(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Save New Version (v{editingItem.version + 1})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
