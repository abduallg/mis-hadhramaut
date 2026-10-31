import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { verifyDelegatePasscode, setDelegateAuthenticated } from '../utils/storage';

interface DelegateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DelegateAuthModal: React.FC<DelegateAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyDelegatePasscode(passcode)) {
      setIsSuccess(true);
      setErrorMessage('');
      setDelegateAuthenticated(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onSuccess();
        onClose();
      }, 500);
    } else {
      setErrorMessage('رمز المرور غير صحيح! هذا الوضع خاص بمندوب الدفعة فقط.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تسجيل الدخول لوضع المندوب</h3>
              <p className="text-[11px] text-slate-400">خاص بمندوب الدفعة المسؤول فقط</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          وضع المندوب يتيح صلاحيات تعديل الجداول، بدء المحاضرات، تفريغ كشوفات الحضور، وإدارة بيانات الطلاب. يرجى إدخال رمز المرور السري للمتابعة:
        </p>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>تم التحقق بنجاح! جاري فتح وضع المندوب...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز المرور السري:
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                autoFocus
                placeholder="••••••••••••"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full bg-slate-950 border rounded-2xl pr-4 pl-11 py-3 text-sm text-white placeholder-slate-600 font-mono tracking-widest focus:outline-none transition ${
                  errorMessage ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={showPasscode ? 'إخفاء الرمز' : 'إظهار الرمز'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500 shrink-0" />
              <span>هذا الرمز سرّي ومحمي وخاص بمندوب الدفعة فقط لمنع التعديل غير المصرح به.</span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              إلغاء (وضع الطالب)
            </button>
            <button
              type="submit"
              disabled={!passcode.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>تأكيد ودخول لوضع المندوب</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
