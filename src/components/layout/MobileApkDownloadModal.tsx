import React, { useState } from 'react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import {
  Smartphone,
  Download,
  Share2,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface MobileApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileApkDownloadModal: React.FC<MobileApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'apk_guide' | 'qr'>('install');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-k5wxlduh3g54tyobjt63sz-260768074568.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyInviteMessage = () => {
    const inviteText = `👕 *AR Tex - Staff Daily Work App* 📱\n\nவணக்கம்! எங்கள் தொழிற்சாலை தினசரி வேலை பதிவு செய்ய கீழே உள்ள இணைப்பை உங்கள் போனில் திறக்கவும்:\n\n🔗 ${currentUrl}\n\n1. இணைப்பை Chrome பிரவுசரில் திறக்கவும்.\n2. மேலே உள்ள "Install App" அல்லது "Add to Home screen" அழுத்தவும்.\n3. உங்கள் மொபைல் எண் மற்றும் மேலாளர் வழங்கிய 4-இலக்க OTP PIN கொடுத்து நுழையவும்.`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 3000);
  };

  // Generate SVG QR code representation for the currentUrl
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=ffffff&color=1e1b4b&margin=1`;

  return (
    <div
      id="mobile-apk-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-indigo-100 my-auto text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-amber-300 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Mobile App &amp; APK Download
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Android / iOS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Install as Mobile App or build Android APK for your friend &amp; factory staff
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl my-4 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Install on Phone</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>Scan QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk_guide')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk_guide'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Create APK (.apk)</span>
          </button>
        </div>

        {/* TAB 1: Direct In-App Install */}
        {activeTab === 'install' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-900 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-indigo-950">
                  Direct One-Tap Phone Install (PWA)
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Works on any Android and iPhone without Play Store. Runs full-screen with native app icon, fast startup, and offline caching.
                </p>
              </div>
            </div>

            {/* Android / Desktop Install Button */}
            {isInstallable && (
              <button
                type="button"
                onClick={async () => {
                  await install();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span>Tap to Install App on this Phone (Android/Chrome)</span>
              </button>
            )}

            {isInstalled && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>This application is already installed in Standalone Mobile Mode!</span>
              </div>
            )}

            {/* Step-by-Step Instructions for Android & iPhone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Android Guide */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                    A
                  </span>
                  <span>Android (Chrome / Samsung)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed text-[11px]">
                  <li>Open the live link in <strong>Google Chrome</strong>.</li>
                  <li>Tap the <strong>three dots (⋮)</strong> at top-right.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>The app icon is added to your app drawer like an APK!</li>
                </ol>
              </div>

              {/* iPhone Guide */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-black">
                    i
                  </span>
                  <span>Apple iPhone (Safari)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed text-[11px]">
                  <li>Open the link in <strong>Safari browser</strong>.</li>
                  <li>Tap the <strong>Share</strong> button (bottom square with arrow).</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>Add</strong> at top right.</li>
                </ol>
              </div>
            </div>

            {/* Share link / WhatsApp button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy App Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyInviteMessage}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {copiedInvite ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedInvite ? 'Invite Message Copied!' : 'Share WhatsApp Message'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Scan QR Code */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-600">
              Point your friend's phone camera at this QR code to instantly open the app on mobile!
            </p>

            <div className="flex justify-center my-3">
              <div className="p-3 bg-white border-2 border-indigo-200 rounded-2xl shadow-lg inline-block">
                <img
                  src={qrSvgUrl}
                  alt="App Mobile QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 break-all select-all">
              {currentUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Live App URL'}</span>
            </button>
          </div>
        )}

        {/* TAB 3: APK Build Guide */}
        {activeTab === 'apk_guide' && (
          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">How to generate a standalone Android .APK file:</span>
                <span className="text-[11px] text-amber-800">
                  Because this app is a fully compliant Progressive Web App with manifest and service worker, it can be packaged into an installable Android APK file in 2 minutes for free.
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Method 1: PWABuilder (Recommended - No Coding)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Free &amp; Official</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">pwabuilder.com</a> on your computer.</li>
                  <li>Paste the live URL: <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">{currentUrl}</code></li>
                  <li>Click <strong>"Start"</strong> → PWABuilder will score it 100% PWA compliant.</li>
                  <li>Click <strong>"Package for Android"</strong> → Download signed <code>.apk</code> file!</li>
                  <li>Send the <code>.apk</code> to your friend via WhatsApp to install on Android phone.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">
                  Method 2: Direct Chrome WebAPK (Instant on Phone)
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  When your friend opens the link in Chrome on Android and taps <strong>"Install App"</strong>, Android automatically generates a native WebAPK in the background and installs it as a standalone Android app with the official app icon in the home screen!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                Done / சரி
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
