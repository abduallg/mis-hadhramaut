import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Calendar, 
  GraduationCap, 
  ClipboardCheck, 
  MessageCircle, 
  ExternalLink 
} from 'lucide-react';
import { Lecture, Exam, BatchSettings } from '../types';
import { 
  getTodayDayOfWeek, 
  DAYS_ARABIC, 
  generateDailyScheduleWhatsApp, 
  generateExamsWhatsApp 
} from '../utils/formatters';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectures: Lecture[];
  exams: Exam[];
  settings: BatchSettings;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  lectures,
  exams,
  settings,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const today = getTodayDayOfWeek();
  const scheduleText = decodeURIComponent(generateDailyScheduleWhatsApp(today, lectures, settings.batchName, settings.delegateName));
  const examsText = decodeURIComponent(generateExamsWhatsApp(exams, settings.batchName, settings.delegateName));

  const generalInviteText = `🎓 *رابط منصة جدول ومتابعة ${settings.batchName}*\n` +
    `مرحباً بالزملاء، تم تحديث مواعيد المحاضرات والاختبارات عبر المنصة الذكية:\n` +
    `📌 جدول المحاضرات الأسبوعي والقاعات\n` +
    `⏰ عداد الوقت المباشر للمحاضرات الجارية\n` +
    `📝 جدول ومقررات الاختبارات النصفية والنهائية\n` +
    `✍️ مندوب الدفعة: ${settings.delegateName}`;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenWhatsApp = (text: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">مركز مشاركة الواتساب لقروب الدفعة</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          اختر الرسالة الجاهزة التي تريد إرسالها لقروب الواتساب الخاص بالدفعة، يمكنك نسخ النص أو فتحه مباشرة في تطبيق واتساب:
        </p>

        <div className="space-y-4">
          
          {/* Item 1: Today's Schedule */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>رسالة جدول محاضرات اليوم ({DAYS_ARABIC[today].label})</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy('schedule', scheduleText)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                >
                  {copiedId === 'schedule' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'schedule' ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
                <button
                  onClick={() => handleOpenWhatsApp(scheduleText)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>فتح في واتساب</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 max-h-24 overflow-y-auto whitespace-pre-line font-mono">
              {scheduleText}
            </div>
          </div>

          {/* Item 2: Exams Schedule */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-rose-400" />
                <span>رسالة جدول ومواعيد الاختبارات ({exams.length} مواد)</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy('exams', examsText)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                >
                  {copiedId === 'exams' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'exams' ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
                <button
                  onClick={() => handleOpenWhatsApp(examsText)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>فتح في واتساب</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 max-h-24 overflow-y-auto whitespace-pre-line font-mono">
              {examsText}
            </div>
          </div>

          {/* Item 3: General Cohort Platform Link */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>رسالة دعوة الزملاء لتصفح المنصة والجدول</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy('general', generalInviteText)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                >
                  {copiedId === 'general' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'general' ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
                <button
                  onClick={() => handleOpenWhatsApp(generalInviteText)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>فتح في واتساب</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 max-h-24 overflow-y-auto whitespace-pre-line font-mono">
              {generalInviteText}
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-600"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
