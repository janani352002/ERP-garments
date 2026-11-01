import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { formatCurrency, formatPaise } from '../../utils/currency';
import {
  Smartphone,
  Save,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Shirt,
  DollarSign,
  UserCheck,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Phone,
  KeyRound,
  History,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const StaffDailyWorkApp: React.FC = () => {
  const {
    currentUser,
    activeStaffWorker,
    workers,
    styles,
    rateCards,
    productionLogs,
    addProductionLog,
    loginStaffWithPhoneAndOtp,
    logoutStaff,
    setAppMode,
    loginAsManager,
    showNotification,
  } = useErp();

  // Login form state
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showManagerPinModal, setShowManagerPinModal] = useState(false);
  const [managerPasscode, setManagerPasscode] = useState('');
  const [managerPinError, setManagerPinError] = useState('');

  // Daily Work Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [workDate, setWorkDate] = useState(todayStr);
  const [selectedStyle, setSelectedStyle] = useState(styles[0] || 'Men Crew Neck Bio-Wash T-Shirt');
  const [selectedOperationId, setSelectedOperationId] = useState(rateCards[0]?.id || '');
  const [piecesCompleted, setPiecesCompleted] = useState<number | ''>('');
  const [shift, setShift] = useState<'Morning' | 'Evening' | 'Night' | 'Overtime'>('Morning');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [historyFilter, setHistoryFilter] = useState<'today' | 'week' | 'all'>('today');

  // Find currently selected operation
  const currentOp = rateCards.find((r) => r.id === selectedOperationId) || rateCards[0];
  const unitRatePaise = currentOp ? currentOp.ratePaise : 0;
  const piecesNum = Number(piecesCompleted) || 0;
  const computedWagePaise = piecesNum * unitRatePaise;

  // Handle staff phone + OTP login
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = loginStaffWithPhoneAndOtp(phoneInput, otpInput);
    if (!res.success) {
      setLoginError(res.error || 'Invalid phone or OTP');
    } else {
      setPhoneInput('');
      setOtpInput('');
    }
  };

  // Quick select demo worker for rapid testing
  const handleQuickDemoWorker = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (worker) {
      setPhoneInput(worker.phone);
      setOtpInput(worker.otpPin || '1234');
      const res = loginStaffWithPhoneAndOtp(worker.phone, worker.otpPin || '1234');
      if (!res.success) {
        setLoginError(res.error || 'Failed to login');
      }
    }
  };

  // Handle work submission
  const handleSaveDailyWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaffWorker) {
      showNotification('Please sign in with your phone and OTP first.', 'error');
      return;
    }
    if (!piecesNum || piecesNum <= 0) {
      showNotification('Please enter valid completed pieces.', 'error');
      return;
    }
    if (!currentOp) {
      showNotification('Please select a valid stitching / finishing operation.', 'error');
      return;
    }

    addProductionLog({
      date: workDate,
      workerId: activeStaffWorker.id,
      workerName: activeStaffWorker.name,
      styleName: selectedStyle,
      operationId: currentOp.id,
      operationName: currentOp.operationName,
      ratePaise: currentOp.ratePaise,
      piecesCompleted: piecesNum,
      shift,
      notes: notes.trim() || undefined,
      status: 'submitted',
      submittedBy: 'staff',
    });

    // Reset pieces and notes, switch to history tab so staff immediately sees saved work!
    setPiecesCompleted('');
    setNotes('');
    setActiveTab('history');
  };

  // Handle manager portal unlock
  const handleUnlockManagerPortal = (e: React.FormEvent) => {
    e.preventDefault();
    setManagerPinError('');
    const res = loginAsManager(managerPasscode);
    if (res.success) {
      setShowManagerPinModal(false);
      setManagerPasscode('');
      setAppMode('manager');
    } else {
      setManagerPinError('Incorrect passcode. Default is 1234.');
    }
  };

  // Filter logs for this specific staff worker ONLY (STRICT PRIVACY)
  const workerLogs = activeStaffWorker
    ? productionLogs.filter((l) => l.workerId === activeStaffWorker.id)
    : [];

  const filteredLogs = workerLogs.filter((log) => {
    if (historyFilter === 'today') return log.date === todayStr;
    if (historyFilter === 'week') {
      const logTime = new Date(log.date).getTime();
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return logTime >= weekAgo;
    }
    return true;
  });

  const todayWorkerLogs = workerLogs.filter((l) => l.date === todayStr);
  const todayPieces = todayWorkerLogs.reduce((sum, l) => sum + l.piecesCompleted, 0);
  const todayWagesPaise = todayWorkerLogs.reduce((sum, l) => sum + l.grossWagePaise, 0);

  // If NOT logged in as a specific registered worker, show Staff Login Screen
  if (!activeStaffWorker) {
    return (
      <div className="max-w-md mx-auto w-full min-h-[580px] bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-indigo-950 flex flex-col justify-between animate-in fade-in duration-200">
        <div>
          {/* Top Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-amber-300 font-black shadow-md shadow-indigo-600/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>AR Tex Staff App</span>
                  <span className="text-[10px] bg-amber-400 text-indigo-950 font-bold px-1.5 py-0.2 rounded">
                    தொழிலாளர்
                  </span>
                </h2>
                <p className="text-[11px] text-indigo-300">Daily Work &amp; Piece-Rate Logger</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowManagerPinModal(true)}
              className="text-[11px] text-indigo-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 font-semibold transition-colors"
            >
              Manager Hub
            </button>
          </div>

          {/* Login Card */}
          <div className="my-6">
            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-lg space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>தொழிலாளர் உள்நுழைவு</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your Mobile Number and 4-digit OTP/PIN provided by the Manager.
                </p>
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>பதிவுசெய்த மொபைல் எண் (Mobile No.)</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. 9842123410"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 font-mono tracking-wider placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>4-இலக்க கடவுச்சொல் (4-Digit OTP / PIN)</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit PIN (e.g. 1001)"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-amber-400 font-mono tracking-widest text-center placeholder:text-slate-500"
                  />
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
                >
                  <span>உள்நுழைக / Verify &amp; Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick 1-Tap Demo Staff Switcher */}
          <div className="bg-slate-800/50 rounded-2xl p-3.5 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ விரைவு சோதனை (Quick Test Enrolled Workers)
            </span>
            <div className="space-y-1.5">
              {workers.slice(0, 3).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleQuickDemoWorker(w.id)}
                  className="w-full p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-white block">{w.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {w.designation} • PIN: <code className="text-amber-400 font-mono">{w.otpPin || '1234'}</code>
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-bold px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-800">
                    Login
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          <span>Factory Manager sets employee phone number &amp; OTP in Manager Portal.</span>
        </div>

        {/* Manager Passcode Unlock Modal */}
        {showManagerPinModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Switch to Manager Portal</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowManagerPinModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Enter Manager security passcode to open the full ERP with Profit, Dispatches &amp; Payroll.
              </p>
              <form onSubmit={handleUnlockManagerPortal} className="space-y-3">
                <input
                  type="password"
                  value={managerPasscode}
                  onChange={(e) => setManagerPasscode(e.target.value)}
                  placeholder="Manager Passcode (1234)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-center font-mono tracking-widest text-white"
                />
                {managerPinError && (
                  <p className="text-[11px] text-rose-400 text-center">{managerPinError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManagerPinModal(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                  >
                    Unlock Manager
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LOGGED IN STAFF VIEW: Strict Privacy + Only Work Save & History
  return (
    <div className="max-w-md mx-auto w-full bg-white text-slate-900 rounded-3xl shadow-xl border border-indigo-100 overflow-hidden flex flex-col min-h-[640px] animate-in fade-in duration-150">
      {/* Mobile App Bar */}
      <div className="bg-indigo-900 text-white p-4 pb-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-indigo-950 font-black flex items-center justify-center shadow-md">
              {activeStaffWorker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm text-white tracking-tight">
                  {activeStaffWorker.name}
                </h3>
                <span className="text-[10px] font-bold bg-amber-400 text-indigo-950 px-1.5 py-0.2 rounded font-mono">
                  {activeStaffWorker.code}
                </span>
              </div>
              <p className="text-[11px] text-indigo-200">{activeStaffWorker.designation}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={logoutStaff}
              className="p-1.5 rounded-xl text-indigo-200 hover:text-white hover:bg-indigo-800 transition-colors"
              title="Logout / கணக்கிலிருந்து வெளியேறு"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowManagerPinModal(true)}
              className="text-[10px] font-bold bg-indigo-950/80 hover:bg-indigo-950 text-amber-300 border border-indigo-700 px-2 py-1.5 rounded-xl transition-colors"
              title="Switch to Manager Hub"
            >
              Manager Hub
            </button>
          </div>
        </div>

        {/* Today's Live Earnings Ticker */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-indigo-800/80">
          <div className="bg-indigo-950/60 rounded-xl p-2 border border-indigo-800/50">
            <span className="text-[10px] text-indigo-300 block uppercase font-bold tracking-wider">
              இன்றைய வேலை (Today Pcs)
            </span>
            <span className="text-base font-black text-white font-mono">
              {todayPieces.toLocaleString()} <span className="text-xs font-normal text-indigo-300">pcs</span>
            </span>
          </div>
          <div className="bg-indigo-950/60 rounded-xl p-2 border border-indigo-800/50">
            <span className="text-[10px] text-amber-300 block uppercase font-bold tracking-wider">
              இன்றைய கூலி (Earnings)
            </span>
            <span className="text-base font-black text-amber-400 font-mono">
              {formatPaise(todayWagesPaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Tab Navigation: Save Work vs My List */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('entry')}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'entry'
              ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Save className="w-4 h-4 text-indigo-600" />
          <span>வேலை பதிவு (Save Work)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-indigo-600" />
          <span>சேமித்த பட்டியல் (My Work)</span>
          {todayWorkerLogs.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">
              {todayWorkerLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
        {/* TAB 1: WORK ENTRY FORM */}
        {activeTab === 'entry' && (
          <form onSubmit={handleSaveDailyWork} className="space-y-4">
            {/* Date and Shift */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>தேதி (Date)</span>
                </label>
                <input
                  type="date"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ஷிப்ட் (Shift)</span>
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold bg-white"
                >
                  <option value="Morning">காலை (Morning)</option>
                  <option value="Evening">மாலை (Evening)</option>
                  <option value="Night">இரவு (Night)</option>
                  <option value="Overtime">ஓவர்டைம் (OT)</option>
                </select>
              </div>
            </div>

            {/* Garment Style Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5 text-indigo-600" />
                <span>ஆடை ஸ்டைல் (Garment Style)</span>
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold bg-white"
              >
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Operation Selector with Rate */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>வேலை வகை (Stitching / Operation)</span>
              </label>
              <select
                value={selectedOperationId}
                onChange={(e) => setSelectedOperationId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-semibold bg-white"
              >
                {rateCards.map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    {rc.operationName} — {formatPaise(rc.ratePaise)}/pc
                  </option>
                ))}
              </select>
            </div>

            {/* Pieces Completed (Big Touch Target) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  செய்த துண்டுகள் (Pieces Completed)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Rate: {formatPaise(unitRatePaise)}/pc
                </span>
              </div>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={piecesCompleted}
                onChange={(e) =>
                  setPiecesCompleted(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                placeholder="எ.கா. 200 துண்டுகள்"
                className="w-full px-4 py-3 text-lg font-black font-mono text-center rounded-xl border-2 border-indigo-200 focus:outline-hidden focus:border-indigo-600 shadow-inner"
              />

              {/* Quick Increment Chips for easy mobile tapping */}
              <div className="flex gap-2 mt-2">
                {[50, 100, 200, 500].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() =>
                      setPiecesCompleted((prev) => (Number(prev) || 0) + num)
                    }
                    className="flex-1 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-bold transition-colors active:scale-95"
                  >
                    +{num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPiecesCompleted('')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Live Calculation Display Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  கணக்கிடப்பட்ட கூலி (Calculated Wage)
                </span>
                <span className="text-xs text-emerald-700 font-mono">
                  {piecesNum.toLocaleString()} pcs × {formatPaise(unitRatePaise)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-950 font-mono">
                  {formatPaise(computedWagePaise)}
                </span>
              </div>
            </div>

            {/* Notes / Bundle No */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                பண்டல் எண் / குறிப்புகள் (Bundle No. / Remarks - Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bundle #42, Line 1 Overlock"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={piecesNum <= 0}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                piecesNum > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              <span>வேலை சேமிக்கவும் (Save Daily Work)</span>
            </button>
          </form>
        )}

        {/* TAB 2: SAVED WORK HISTORY (ONLY THIS WORKER'S ENTRIES) */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setHistoryFilter('today')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  historyFilter === 'today' ? 'bg-white text-indigo-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                இன்று (Today)
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('week')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  historyFilter === 'week' ? 'bg-white text-indigo-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                இந்த வாரம் (7 Days)
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  historyFilter === 'all' ? 'bg-white text-indigo-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                அனைத்தும் (All)
              </button>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">பதிவுகள் எதுவும் இல்லை</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  No daily work saved for this filter. Tap "வேலை பதிவு" to enter today's completed pieces.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('entry')}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
                >
                  Enter Work Now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredLogs.map((log) => {
                  const isApproved = log.status === 'approved';
                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">
                            {log.operationName}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[220px]">
                            {log.styleName}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-sm text-emerald-800 font-mono block">
                            {formatPaise(log.grossWagePaise)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.piecesCompleted} pcs @ {formatPaise(log.ratePaise)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 font-medium">
                          {log.date} • {log.shift || 'General'}
                        </span>

                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>சரிபார்க்கப்பட்டது (Approved)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>மேலாளர் பார்வைக்கு அனுப்பப்பட்டது</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Privacy Guarantee */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
        <span>🔒 Staff Mode: Only your daily production &amp; piece-rate earnings are displayed.</span>
      </div>

      {/* Manager Passcode Modal for switching back */}
      {showManagerPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Switch to Manager Portal</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowManagerPinModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Enter Manager security passcode to open the full ERP with Profit, Dispatches &amp; Payroll.
            </p>
            <form onSubmit={handleUnlockManagerPortal} className="space-y-3">
              <input
                type="password"
                value={managerPasscode}
                onChange={(e) => setManagerPasscode(e.target.value)}
                placeholder="Manager Passcode (1234)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-center font-mono tracking-widest text-white"
              />
              {managerPinError && (
                <p className="text-[11px] text-rose-400 text-center">{managerPinError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManagerPinModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Unlock Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
