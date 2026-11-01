import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { formatCurrency, formatNumber } from '../../utils/currency';
import {
  Scissors,
  Plus,
  Trash2,
  Calendar,
  User,
  Building2,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export const ProductionDailyView: React.FC = () => {
  const {
    productionLogs,
    addProductionLog,
    deleteProductionLog,
    approveProductionLog,
    workers,
    addWorker,
    styles,
    rateCards,
    inwardOrders,
    navigate,
  } = useErp();

  // Form State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [workerId, setWorkerId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [styleName, setStyleName] = useState('');
  const [operationId, setOperationId] = useState('');
  const [piecesInput, setPiecesInput] = useState('');
  const [notes, setNotes] = useState('');

  // Search/Filter State
  const [filterWorker, setFilterWorker] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('');

  // Modal: Add New Worker
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerCode, setNewWorkerCode] = useState('');
  const [newWorkerDesig, setNewWorkerDesig] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');

  // Auto-selected operation details
  const selectedOperation = rateCards.find((r) => r.id === operationId);
  const selectedWorker = workers.find((w) => w.id === workerId);

  // Live Wage Calculation
  const piecesCompleted = parseInt(piecesInput) || 0;
  const unitRatePaise = selectedOperation ? selectedOperation.ratePaise : 0;
  const liveGrossWagePaise = piecesCompleted * unitRatePaise;

  const handleLogProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || !selectedOperation || piecesCompleted <= 0) return;

    addProductionLog({
      date,
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      poNumber: poNumber.trim() || undefined,
      styleName: styleName || 'Standard T-Shirt',
      operationId: selectedOperation.id,
      operationName: selectedOperation.operationName,
      ratePaise: selectedOperation.ratePaise,
      piecesCompleted,
      notes: notes.trim() || undefined,
    });

    // Reset piece count and notes for rapid sequential entry
    setPiecesInput('');
    setNotes('');
  };

  const handleRegisterWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    addWorker({
      name: newWorkerName.trim(),
      code: newWorkerCode.trim() || `ART-W${(workers.length + 1).toString().padStart(2, '0')}`,
      designation: newWorkerDesig.trim() || 'Stitching Tailor',
      phone: newWorkerPhone.trim() || '+91 ',
      department: 'Stitching Floor',
      active: true,
    });

    setNewWorkerName('');
    setNewWorkerCode('');
    setNewWorkerDesig('');
    setNewWorkerPhone('');
    setShowAddWorkerModal(false);
  };

  // Filtered Production Logs
  const filteredLogs = productionLogs.filter((log) => {
    const matchesWorker = filterWorker === 'All' || log.workerId === filterWorker;
    const matchesDate = !filterDate || log.date === filterDate;
    return matchesWorker && matchesDate;
  });

  const totalLoggedPieces = filteredLogs.reduce((sum, l) => sum + l.piecesCompleted, 0);
  const totalLoggedWagesPaise = filteredLogs.reduce((sum, l) => sum + l.grossWagePaise, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daily Piece-Rate Production Log</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              /salary
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisors record daily pieces stitched per tailor. Line wages compute automatically based on locked operation rate cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddWorkerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Tailor / Worker</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/salary/payment')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>Weekly Payroll</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Production Entry Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-indigo-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 pb-2 border-b border-indigo-50">
          <Scissors className="w-4 h-4 text-indigo-600" /> Log Tailor Operation Batch
        </h3>

        <form onSubmit={handleLogProduction} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Date */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Production Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            {/* Worker Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tailor / Worker *</label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold"
              >
                <option value="">-- Select Worker --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code}) - {w.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Garment Style */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Garment Style *</label>
              <select
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
              >
                <option value="">-- Select Style --</option>
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* PO Ref (Optional Link) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">PO Ref Link (Optional)</label>
              <select
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
              >
                <option value="">-- General Factory Work --</option>
                {inwardOrders.map((po) => (
                  <option key={po.id} value={po.poNumber}>
                    {po.poNumber} ({po.clientName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Operation & Pieces Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* Operation Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tailoring Operation *</label>
              <select
                value={operationId}
                onChange={(e) => setOperationId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold"
              >
                <option value="">-- Select Operation from Rate Card --</option>
                {rateCards.map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    {rc.operationName} • {formatCurrency(rc.ratePaise)} / pc (v{rc.version})
                  </option>
                ))}
              </select>
            </div>

            {/* Pieces Completed */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pieces Completed *</label>
              <input
                type="number"
                min="1"
                value={piecesInput}
                onChange={(e) => setPiecesInput(e.target.value)}
                placeholder="e.g. 350"
                required
                className="w-full px-3 py-2 rounded-lg border border-indigo-300 focus:outline-hidden focus:border-indigo-600 font-mono font-bold text-sm"
              />
            </div>

            {/* Live Line Wage Calculation Display */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-800 block">Calculated Wage</span>
                <span className="text-lg font-black text-indigo-950 font-mono">
                  {formatCurrency(liveGrossWagePaise)}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono text-right">
                {piecesCompleted} pcs × {formatCurrency(unitRatePaise)}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional bundle note or machine line reference..."
              className="w-full sm:w-1/2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
            />

            <button
              id="log-production-submit-btn"
              type="submit"
              disabled={!selectedWorker || !selectedOperation || piecesCompleted <= 0}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-xs transition-all shadow-xs ${
                !selectedWorker || !selectedOperation || piecesCompleted <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Log Production Record</span>
            </button>
          </div>
        </form>
      </div>

      {/* Production History Table & Filters */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Logged Production Records ({filteredLogs.length})
            </h4>
            <span className="text-xs text-slate-500">
              Filtered Total: <strong>{formatNumber(totalLoggedPieces)} pcs</strong> • Gross Wages: <strong>{formatCurrency(totalLoggedWagesPaise)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by Worker */}
            <select
              value={filterWorker}
              onChange={(e) => setFilterWorker(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-medium"
            >
              <option value="All">All Workers</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Filter by Date */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-300 text-xs"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">No daily production entries recorded yet.</p>
            <p>Use the form above to log pieces stitched by line workers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Worker Name</th>
                  <th className="py-2.5 px-3">Style & PO</th>
                  <th className="py-2.5 px-3">Operation</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Pieces</th>
                  <th className="py-2.5 px-3 text-right">Gross Wage (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {filteredLogs.map((log) => {
                  const isApproved = log.status === 'approved';
                  return (
                    <tr key={log.id} className="hover:bg-indigo-50/30">
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {log.date}
                        {log.shift && <span className="text-[10px] text-slate-400 block">{log.shift}</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{log.workerName}</span>
                        {log.submittedBy === 'staff' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                            📱 Staff App
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div>{log.styleName}</div>
                        {log.poNumber && <div className="text-[10px] font-mono text-indigo-800">{log.poNumber}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{log.operationName}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatCurrency(log.ratePaise)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatNumber(log.piecesCompleted)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-950">{formatCurrency(log.grossWagePaise)}</td>
                      <td className="py-2.5 px-3 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] border border-amber-300">
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => approveProductionLog(log.id)}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteProductionLog(log.id)}
                            className="p-1 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                            title="Delete log entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal: Register New Worker */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-indigo-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" /> Register Tailor / Worker
            </h3>

            <form onSubmit={handleRegisterWorker} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="e.g. Senthil Kumar"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={newWorkerCode}
                    onChange={(e) => setNewWorkerCode(e.target.value)}
                    placeholder="ART-W06"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newWorkerDesig}
                    onChange={(e) => setNewWorkerDesig(e.target.value)}
                    placeholder="Overlock / Flatlock"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  placeholder="+91 98420 12345"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
