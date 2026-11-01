import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { ShieldCheck, Lock, Eye, CheckCircle2, User, KeyRound, X, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isManager, loginAsManager, loginAsStaff } = useErp();
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [staffName, setStaffName] = useState('');

  if (!isOpen) return null;

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginAsManager(passcode);
    if (res.success) {
      setPasscode('');
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid passcode. Default is 1234.');
    }
  };

  const handleStaffLogin = () => {
    loginAsStaff(staffName.trim() || 'Floor Operator / Staff');
    onClose();
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ERP Role & Access Control
              </h3>
              <p className="text-xs text-slate-500">
                Switch between Manager (Edit/Delete) and Staff (Read-Only)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Status */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">
              Current Session
            </span>
            <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
            <span className="text-slate-500 block text-[11px]">{currentUser.designation}</span>
          </div>
          <div>
            {isManager ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Manager (Full Access)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                <Eye className="w-4 h-4 text-blue-600" />
                Staff (Read-Only)
              </span>
            )}
          </div>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Manager Mode */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isManager
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Manager Role
              </span>
              {isManager && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mb-3">
              Full administrative privileges. Can <strong>add, edit, and delete/remove</strong> employees, orders, dispatches, and wages.
            </p>

            <form onSubmit={handleManagerLogin} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-slate-400" /> Manager Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 1234"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Default passcode: <code className="font-mono text-indigo-600">1234</code>
                </span>
              </div>

              {errorMessage && (
                <div className="text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Login as Manager
              </button>
            </form>
          </div>

          {/* Option 2: Staff / Other Person (View Only) */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              !isManager
                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-blue-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" /> Staff / Other Person
                </span>
                {!isManager && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                <strong>Read-Only Mode</strong>. Employees, inward orders, dispatches, and reports are visible, but <strong>Edit & Delete buttons are hidden</strong>.
              </p>

              <div className="mb-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Staff / Operator Name (Optional)
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Floor Supervisor"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleStaffLogin}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs mt-2"
            >
              Switch to View-Only Mode
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Security rule: Non-managers cannot edit or delete records.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
