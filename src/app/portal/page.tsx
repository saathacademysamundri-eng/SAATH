'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useSettings } from '@/hooks/use-settings';
import { getStudent } from '@/lib/firebase/firestore';
import { Loader2, AlertCircle, X, MessageCircle, HelpCircle } from 'lucide-react';

export default function StudentPortalLoginPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { settings, isSettingsLoading } = useSettings();
  const router = useRouter();
  const loginBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const card = document.getElementById("loginCard");
    setTimeout(() => {
      card?.classList.remove("opacity-0", "translate-y-10");
    }, 100);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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

    try {
      // 1. Fetch Student from DB
      const student = await getStudent(formattedId);

      if (!student || student.status !== 'active') {
        throw new Error('NotFound');
      }

      // 2. Verify Phone Number (Normalized comparison)
      const normalizedProvided = phoneTerm.replace(/\D/g, '');
      const normalizedRecord = (student.phone || '').replace(/\D/g, '');

      if (!normalizedRecord || normalizedProvided !== normalizedRecord) {
        throw new Error('PhoneMismatch');
      }

      // 3. Success state and redirect
      setSuccess(true);
      setTimeout(() => {
        router.push(`/portal/${formattedId}?p=${encodeURIComponent(phoneTerm)}`);
      }, 800);

    } catch (err: any) {
      setLoading(false);
      setShowErrorModal(true);
    }
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

  // UPDATED: Primary academy support number
  const supportWhatsapp = `https://wa.me/923438775425?text=Dear Admin, I am unable to access the student portal. My Roll No is: ${rollNumber}`;

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
              src={settings.logo || "https://i.postimg.cc/v8L8kPMV/saath.png"}
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
              onChange={(e) => {
                setRollNumber(e.target.value.toUpperCase());
              }}
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
              onChange={(e) => {
                setPhoneNumber(e.target.value);
              }}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:outline-none focus:border-sky-400 text-white transition-colors"
              suppressHydrationWarning
            />
          </div>

          {/* Forgot */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-xs text-sky-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3" />
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
                ? "bg-gradient-to-r from-green-500 to-emerald-600 scale-[0.98]"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            }
            ${(loading || success) && "opacity-80 cursor-not-allowed"}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : success ? (
              <span>Verified Successfully</span>
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-center mb-4">Portal Help</h3>
            <p className="text-slate-300 text-center text-sm mb-6">
              For security, you must use the phone number registered during your admission. If you've forgotten your details, please contact the academy administration.
            </p>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Error Modal - COMPACT & MOBILE FRIENDLY */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-800 border border-red-500/30 rounded-2xl max-w-sm w-full p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowErrorModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4 tracking-tight">Verification Failed</h3>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
                Dear User, the information on your app is incorrect, so people are not able to use it.
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <a 
                  href={supportWhatsapp}
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-lg text-sm sm:text-base"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Get Help via WhatsApp
                </a>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-xl transition-all text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}