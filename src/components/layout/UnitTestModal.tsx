import React, { useState, useEffect } from 'react';
import { runAllErpUnitTests, TestResult } from '../../utils/erp.test';
import { CheckCircle2, XCircle, Play, X, ShieldCheck, Terminal } from 'lucide-react';

interface UnitTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnitTestModal: React.FC<UnitTestModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllErpUnitTests();
      setResults(res);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return (
    <div
      id="unit-test-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-slate-950 text-slate-100 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col font-mono text-xs">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="ml-2 font-bold text-slate-300 flex items-center gap-1.5 font-sans text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              AR Tex ERP Automated Unit Test Suite
            </span>
          </div>

          <div className="flex items-center gap-2 font-sans">
            <button
              type="button"
              onClick={executeTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>{isRunning ? 'Running...' : 'Re-run Tests'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Body */}
        <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
          <div className="text-[11px] text-slate-400 font-sans flex items-center justify-between pb-2 border-b border-slate-800">
            <span>
              Executed <strong>{results.length} assertions</strong> across Currency, Outward, and Profit suites.
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {passedCount} Passed • {failedCount} Failed
            </span>
          </div>

          <div className="space-y-2">
            {results.map((res, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5"
              >
                {res.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      [{res.suite}]
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        res.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {res.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans">{res.name}</p>
                  {res.error && (
                    <p className="text-rose-400 text-[11px] font-mono mt-1 bg-rose-950/40 p-1.5 rounded">
                      {res.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/80 px-5 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <span>CLI command: <code className="text-slate-200 font-mono">npm test</code></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
