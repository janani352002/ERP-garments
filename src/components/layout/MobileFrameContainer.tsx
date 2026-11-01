import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Smartphone, Monitor, Wifi, Battery, Signal, ArrowLeft, RotateCcw } from 'lucide-react';

interface MobileFrameContainerProps {
  children: React.ReactNode;
}

export const MobileFrameContainer: React.FC<MobileFrameContainerProps> = ({ children }) => {
  const { viewMode, setViewMode, appMode, setAppMode, activeStaffWorker } = useErp();

  if (viewMode !== 'mobile_frame') {
    return <>{children}</>;
  }

  // Get current device time for the status bar
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="py-6 px-2 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-slate-900/90 text-slate-100">
      {/* Device Simulator Header Control Bar */}
      <div className="mb-4 flex items-center justify-between max-w-sm w-full px-3 py-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-lg text-xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">Phone Simulator</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('full')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] font-semibold text-slate-200 transition-colors"
            title="Expand to Full Width"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>
        </div>
      </div>

      {/* Realistic Phone Bezel Frame */}
      <div className="relative w-full max-w-[390px] rounded-[48px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-700/80 ring-12 ring-slate-900/50">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2 h-2 rounded-full bg-indigo-950/80" />
        </div>

        {/* Mobile Status Bar */}
        <div className="h-9 px-6 flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1 select-none z-20">
          <span>{timeStr}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Inner Phone Screen */}
        <div className="bg-slate-50 text-slate-900 rounded-[38px] overflow-hidden min-h-[640px] max-h-[780px] flex flex-col shadow-inner overflow-y-auto">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-5 flex items-center justify-center pt-1">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
        <span>Previewing native touch mobile viewport</span>
      </div>
    </div>
  );
};
