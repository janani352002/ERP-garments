import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { WorkerPayroll } from '../../types/erp';
import { formatCurrency, formatNumber, toPaise } from '../../utils/currency';
import {
  Wallet,
  Coins,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Send,
  Building2,
  Calendar,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export const PayrollPaymentView: React.FC = () => {
  const {
    getWorkerPayrolls,
    addWorkerAdvance,
    addWorkerPayment,
    workerAdvances,
    workerPayments,
    workers,
    navigate,
  } = useErp();

  const [activeTab, setActiveTab] = useState<'payroll' | 'advances' | 'payments'>('payroll');
  const [searchQuery, setSearchQuery] = useState('');

  // Advance Modal State
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advWorkerId, setAdvWorkerId] = useState('');
  const [advAmountInput, setAdvAmountInput] = useState('');
  const [advDate, setAdvDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [advReason, setAdvReason] = useState('');

  // Payment Settlement Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payWorkerId, setPayWorkerId] = useState('');
  const [payAmountInput, setPayAmountInput] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payMode, setPayMode] = useState<'Cash' | 'Bank Transfer' | 'UPI'>('Cash');
  const [payRef, setPayRef] = useState('');

  const payrolls = getWorkerPayrolls();

  // Aggregate Metrics
  const totalGrossWagesPaise = payrolls.reduce((sum, p) => sum + p.grossWagePaise, 0);
  const totalAdvancesPaidPaise = payrolls.reduce((sum, p) => sum + p.advancePaidPaise, 0);
  const totalSettledPaidPaise = payrolls.reduce((sum, p) => sum + p.paidAmountPaise, 0);
  const totalOutstandingBalancePaise = payrolls.reduce((sum, p) => sum + Math.max(0, p.balancePaise), 0);

  const filteredPayrolls = payrolls.filter((p) =>
    p.workerName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleRecordAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === advWorkerId);
    const amountPaise = toPaise(advAmountInput);
    if (!worker || amountPaise <= 0) return;

    addWorkerAdvance({
      workerId: worker.id,
      workerName: worker.name,
      date: advDate,
      amountPaise,
      reason: advReason.trim() || 'Festival / Emergency Weekly Advance',
    });

    setAdvWorkerId('');
    setAdvAmountInput('');
    setAdvReason('');
    setShowAdvanceModal(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = workers.find((w) => w.id === payWorkerId);
    const amountPaise = toPaise(payAmountInput);
    if (!worker || amountPaise <= 0) return;

    addWorkerPayment({
      workerId: worker.id,
      workerName: worker.name,
      date: payDate,
      amountPaise,
      paymentMode: payMode,
      referenceNo: payRef.trim() || `PAY-${Date.now().toString().slice(-4)}`,
    });

    setPayWorkerId('');
    setPayAmountInput('');
    setPayRef('');
    setShowPaymentModal(false);
  };

  const openSettleForWorker = (workerId: string, currentBalancePaise: number) => {
    setPayWorkerId(workerId);
    setPayAmountInput((currentBalancePaise / 100).toFixed(2));
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Weekly Worker Payroll & Wage Settlement</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              /salary/payment
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track weekly gross wages from piece-rates, record advance loans, and settle tailor balances with status audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="record-advance-btn"
            type="button"
            onClick={() => setShowAdvanceModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors border border-amber-300"
          >
            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
            <span>Record Advance</span>
          </button>
          <button
            id="record-payment-btn"
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Settle Wage Payout</span>
          </button>
        </div>
      </div>

      {/* Aggregate Payroll Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Gross Earned Wages</span>
          <div className="text-xl font-black text-indigo-950 font-mono">{formatCurrency(totalGrossWagesPaise)}</div>
          <span className="text-[10px] text-slate-500 font-medium">Pieces × Operation Rate Card</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Advances Issued</span>
          <div className="text-xl font-black text-amber-900 font-mono">{formatCurrency(totalAdvancesPaidPaise)}</div>
          <span className="text-[10px] text-amber-700 font-medium">{workerAdvances.length} advance transactions</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Settled Wage Payouts</span>
          <div className="text-xl font-black text-teal-800 font-mono">{formatCurrency(totalSettledPaidPaise)}</div>
          <span className="text-[10px] text-teal-700 font-medium">{workerPayments.length} payout vouchers</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Outstanding Balance</span>
          <div className="text-xl font-black text-rose-700 font-mono">{formatCurrency(totalOutstandingBalancePaise)}</div>
          <span className="text-[10px] text-rose-600 font-bold">Pending Tailor Settlements</span>
        </div>
      </div>

      {/* Main Table / Sub-Tabs */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveTab('payroll')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'payroll' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-indigo-900'
              }`}
            >
              Worker Balances
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advances')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'advances' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-amber-900'
              }`}
            >
              Advance History ({workerAdvances.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'payments' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-teal-900'
              }`}
            >
              Settlement Vouchers ({workerPayments.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tailor name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Tab 1: Worker Payroll Summary */}
        {activeTab === 'payroll' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-200">
                  <th className="py-3 px-3.5">Tailor Name</th>
                  <th className="py-3 px-3.5 text-right">Pieces Stitched</th>
                  <th className="py-3 px-3.5 text-right">Gross Wage (₹)</th>
                  <th className="py-3 px-3.5 text-right">Advance Taken (₹)</th>
                  <th className="py-3 px-3.5 text-right">Net Payable (₹)</th>
                  <th className="py-3 px-3.5 text-right">Paid to Date (₹)</th>
                  <th className="py-3 px-3.5 text-right">Unpaid Balance (₹)</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {filteredPayrolls.map((p) => {
                  const isPaid = p.status === 'Paid';
                  const isPartial = p.status === 'Partial';

                  return (
                    <tr key={p.workerId} className="hover:bg-indigo-50/30">
                      <td className="py-3 px-3.5 font-bold text-slate-900">{p.workerName}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-700">{formatNumber(p.totalPieces)}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-indigo-950">{formatCurrency(p.grossWagePaise)}</td>
                      <td className="py-3 px-3.5 text-right font-mono text-amber-900">{formatCurrency(p.advancePaidPaise)}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">{formatCurrency(p.netPayablePaise)}</td>
                      <td className="py-3 px-3.5 text-right font-mono text-teal-800">{formatCurrency(p.paidAmountPaise)}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-black text-rose-700">{formatCurrency(p.balancePaise)}</td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPartial
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {p.balancePaise > 0 ? (
                          <button
                            type="button"
                            onClick={() => openSettleForWorker(p.workerId, p.balancePaise)}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors shadow-2xs"
                          >
                            Pay Balance
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Cleared</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Advance Log History */}
        {activeTab === 'advances' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50 text-amber-950 font-bold border-b border-amber-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Worker Name</th>
                  <th className="py-2.5 px-3">Reason / Particulars</th>
                  <th className="py-2.5 px-3 text-right">Advance Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {workerAdvances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-3 text-slate-600">{adv.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{adv.workerName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{adv.reason}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900">
                      {formatCurrency(adv.amountPaise)}
                    </td>
                  </tr>
                ))}
                {workerAdvances.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No worker advances recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Payment Settlement History */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-teal-50 text-teal-950 font-bold border-b border-teal-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher Ref</th>
                  <th className="py-2.5 px-3">Worker Name</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Settled Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100">
                {workerPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-teal-50/40">
                    <td className="py-2.5 px-3 text-slate-600">{pay.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{pay.referenceNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{pay.workerName}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">{pay.paymentMode}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900">
                      {formatCurrency(pay.amountPaise)}
                    </td>
                  </tr>
                ))}
                {workerPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No wage settlement payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Record Advance */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-amber-600" /> Issue Worker Advance
            </h3>

            <form onSubmit={handleRecordAdvance} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tailor / Worker *</label>
                <select
                  value={advWorkerId}
                  onChange={(e) => setAdvWorkerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold"
                >
                  <option value="">-- Choose Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={advAmountInput}
                    onChange={(e) => setAdvAmountInput(e.target.value)}
                    placeholder="1000"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={advDate}
                    onChange={(e) => setAdvDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Purpose</label>
                <input
                  type="text"
                  value={advReason}
                  onChange={(e) => setAdvReason(e.target.value)}
                  placeholder="e.g. Festival advance, Medical emergency"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs"
                >
                  Issue Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Settle Wage Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-emerald-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" /> Settle Wage Payment Payout
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tailor / Worker *</label>
                <select
                  value={payWorkerId}
                  onChange={(e) => setPayWorkerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold"
                >
                  <option value="">-- Choose Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={payAmountInput}
                    onChange={(e) => setPayAmountInput(e.target.value)}
                    placeholder="2500.00"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Cash">Cash In Hand</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="UPI">UPI / GooglePay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voucher / Transaction Ref</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="VCH-PAY-01"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
