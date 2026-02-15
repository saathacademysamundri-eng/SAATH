'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useSettings } from '@/hooks/use-settings';

export default function StudentPortalLoginPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { settings, isSettingsLoading } = useSettings();
  const router = useRouter();
  const loginBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const card = document.getElementById("loginCard");
    setTimeout(() => {
      card?.classList.remove("opacity-0", "translate-y-10");
    }, 100);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const queryTerm = rollNumber.trim();
    const phoneTerm = phoneNumber.trim();
    
    if (!queryTerm || !phoneTerm) return;

    setLoading(true);

    // Smart ID Formatting logic
    let formattedId = queryTerm;
    if (/^\d+$/.test(queryTerm)) {
      formattedId = `S${queryTerm.padStart(3, '0')}`;
    } else if (/^s\d+$/i.test(queryTerm)) {
      formattedId = `S${queryTerm.substring(1).padStart(3, '0')}`;
    }

    // Simulate verification animation from design
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setShowToast(true);

      // Final redirect
      setTimeout(() => {
        router.push(`/portal/${formattedId}?p=${encodeURIComponent(phoneTerm)}`);
      }, 1000);
    }, 1500);
  };

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = loginBtnRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const circle = document.createElement("span");
    circle.classList.add("ripple");

    circle.style.left = `${event.clientX - rect.left}px`;
    circle.style.top = `${event.clientY - rect.top}px`;

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  return (
    <div className="bg-slate-900 text-white h-screen w-full flex items-center justify-center relative overflow-hidden">

      {/* Background Blobs */}
      <div className="blob blob-1 rounded-full"></div>
      <div className="blob blob-2 rounded-full"></div>
      <div className="blob blob-3 rounded-full"></div>

      {/* Login Card */}
      <div
        id="loginCard"
        className="glass-card p-8 rounded-2xl w-full max-w-md mx-4 relative overflow-hidden transform transition-all duration-700 opacity-0 translate-y-10 z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="relative w-24 h-24 mb-4 logo-glow">
            <img
              src={settings.logo || "https://i.postimg.cc/Dfq75Lxb/Saath-Academy-logo.png"}
              alt="Academy Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200 uppercase text-center">
            {settings.name || "SAATH ACADEMY"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6" suppressHydrationWarning>

          {/* Roll Number */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-wider">Roll Number</label>
            <input
              type="text"
              required
              placeholder="e.g., S001"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:border-sky-400 text-white transition-colors"
              suppressHydrationWarning
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-wider">Registered Phone Number</label>
            <input
              type="tel"
              required
              placeholder="e.g., 03001234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:border-sky-400 text-white transition-colors"
              suppressHydrationWarning
            />
          </div>

          {/* Forgot */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-xs text-sky-400 hover:underline"
            >
              Need help?
            </button>
          </div>

          {/* Submit */}
          <button
            ref={loginBtnRef}
            type="submit"
            onClick={createRipple}
            disabled={loading || success}
            className={`w-full relative overflow-hidden text-white font-semibold py-3.5 rounded-lg shadow-lg transition
            ${
              success
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            }
            ${(loading || success) && "opacity-80 cursor-not-allowed"}`}
          >
            {loading ? (
              <span>Verifying...</span>
            ) : success ? (
              <span>Authenticated</span>
            ) : (
              <span>Access Portal</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2 text-xs text-slate-400" suppressHydrationWarning>
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} {settings.name}. All Rights Reserved.</p>
          <p className="uppercase tracking-widest text-[10px]">
            Powered by SchoolUP.
          </p>
          <p className="uppercase tracking-widest text-[10px]">
            Developed by <span className="text-sky-400 font-bold">MIAN MUDASSAR</span>
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-4">Portal Help</h3>
            <p className="text-slate-300 text-center text-sm mb-6">
              For security, you must use the phone number registered during your admission. If you've forgotten your details, please contact the academy administration.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-white text-slate-900 px-6 py-4 rounded-lg shadow-2xl border-l-4 border-green-500 z-50 animate-in slide-in-from-right duration-300">
          <h4 className="font-bold text-sm">Success</h4>
          <p className="text-xs text-slate-500">
            Identity verified. Opening dashboard...
          </p>
        </div>
      )}
    </div>
  );
}
