import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause,
  Square, 
  Clock, 
  Plus, 
  ClipboardCheck, 
  Share2, 
  MapPin, 
  User, 
  Sparkles, 
  AlertCircle,
  AlertOctagon,
  Timer,
  Lock,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lecture, LiveLectureSession, BatchSettings } from '../types';
import { getTodayDayOfWeek, DAYS_ARABIC, formatTime12Hour, formatInterval12Hour } from '../utils/formatters';

interface LiveLectureWidgetProps {
  liveSession: LiveLectureSession | null;
  onStartSession: (session: LiveLectureSession) => void;
  onEndSession: () => void;
  onTogglePauseSession?: () => void;
  onExtendSession: (additionalMinutes: number) => void;
  onOpenAttendanceForLecture: (subjectTitle: string, doctorName?: string) => void;
  onRequestDelegateLogin?: () => void;
  lectures: Lecture[];
  settings: BatchSettings;
  role: 'delegate' | 'student';
}

export const LiveLectureWidget: React.FC<LiveLectureWidgetProps> = ({
  liveSession,
  onStartSession,
  onEndSession,
  onTogglePauseSession,
  onExtendSession,
  onOpenAttendanceForLecture,
  onRequestDelegateLogin,
  lectures,
  settings,
  role,
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [hasCelebratedEnd, setHasCelebratedEnd] = useState<boolean>(false);
  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [stopSuccessMessage, setStopSuccessMessage] = useState<string>('');

  const handleConfirmStopSession = () => {
    setShowStopModal(false);
    onEndSession();
    setStopSuccessMessage('تم إيقاف المحاضرة وإنهاء حساب الوقت بنجاح.');
    setTimeout(() => {
      setStopSuccessMessage('');
    }, 5000);
  };

  // Custom lecture form state for starting a session
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customDoctor, setCustomDoctor] = useState<string>('');
  const [customHall, setCustomHall] = useState<string>('');
  const [customDuration, setCustomDuration] = useState<number>(90);
  const [selectedPresetLectureId, setSelectedPresetLectureId] = useState<string>('');

  const today = getTodayDayOfWeek();
  const todayLectures = lectures.filter(l => l.day === today && !l.isCancelled);

  // Timer update tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if session just finished to trigger confetti
  useEffect(() => {
    if (liveSession?.isActive) {
      if (now >= liveSession.targetEndTime && !hasCelebratedEnd) {
        setHasCelebratedEnd(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      setHasCelebratedEnd(false);
    }
  }, [now, liveSession, hasCelebratedEnd]);

  // When a preset lecture is selected from dropdown
  const handleSelectPreset = (lectureId: string) => {
    setSelectedPresetLectureId(lectureId);
    const lec = lectures.find(l => l.id === lectureId);
    if (lec) {
      setCustomSubject(lec.title);
      setCustomDoctor(lec.doctor);
      setCustomHall(lec.hall);
      
      // Calculate duration from start and end time
      try {
        const [startH, startM] = lec.startTime.split(':').map(Number);
        const [endH, endM] = lec.endTime.split(':').map(Number);
        const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (diffMinutes > 0) {
          setCustomDuration(diffMinutes);
        }
      } catch {
        setCustomDuration(90);
      }
    }
  };

  const handleStartCustomSession = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customSubject.trim()) return;

    const startedAt = Date.now();
    const durationMinutes = Math.max(1, customDuration || 90);
    const targetEndTime = startedAt + durationMinutes * 60 * 1000;

    const newSession: LiveLectureSession = {
      isActive: true,
      lectureId: selectedPresetLectureId || null,
      subjectTitle: customSubject.trim(),
      doctorName: customDoctor.trim() || 'دكتور المادة',
      hall: customHall.trim() || 'القاعة المحددة',
      startedAt,
      durationMinutes,
      targetEndTime,
    };

    onStartSession(newSession);
    setHasCelebratedEnd(false);
  };

  const handleStartFromSchedule = (lec: Lecture) => {
    let diffMinutes = 90;
    try {
      const [startH, startM] = lec.startTime.split(':').map(Number);
      const [endH, endM] = lec.endTime.split(':').map(Number);
      diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMinutes <= 0) diffMinutes = 90;
    } catch {
      diffMinutes = 90;
    }

    const startedAt = Date.now();
    const targetEndTime = startedAt + diffMinutes * 60 * 1000;

    const session: LiveLectureSession = {
      isActive: true,
      lectureId: lec.id,
      subjectTitle: lec.title,
      doctorName: lec.doctor,
      hall: lec.hall,
      startedAt,
      durationMinutes: diffMinutes,
      targetEndTime,
    };

    onStartSession(session);
    setHasCelebratedEnd(false);
  };

  // Calculations for active session
  let timeRemainingStr = '00:00';
  let timeElapsedStr = '00:00';
  let percentageElapsed = 0;
  let isOvertime = false;

  if (liveSession?.isActive) {
    const effectiveNow = liveSession.isPaused && liveSession.pausedAt ? liveSession.pausedAt : now;
    const totalMs = liveSession.targetEndTime - liveSession.startedAt;
    const elapsedMs = Math.max(0, effectiveNow - liveSession.startedAt);
    const remainingMs = liveSession.targetEndTime - effectiveNow;

    percentageElapsed = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

    if (remainingMs <= 0) {
      isOvertime = true;
      const overSec = Math.floor(Math.abs(remainingMs) / 1000);
      const overMin = Math.floor(overSec / 60);
      const overRemSec = overSec % 60;
      timeRemainingStr = `+${overMin.toString().padStart(2, '0')}:${overRemSec.toString().padStart(2, '0')}`;
    } else {
      const remSec = Math.floor(remainingMs / 1000);
      const remHours = Math.floor(remSec / 3600);
      const remMinutes = Math.floor((remSec % 3600) / 60);
      const remSeconds = remSec % 60;
      timeRemainingStr = remHours > 0
        ? `${remHours.toString().padStart(2, '0')}:${remMinutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}`
        : `${remMinutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}`;
    }

    const elSec = Math.floor(elapsedMs / 1000);
    const elMin = Math.floor(elSec / 60);
    const elRemSec = elSec % 60;
    timeElapsedStr = `${elMin.toString().padStart(2, '0')}:${elRemSec.toString().padStart(2, '0')}`;
  }

  // Quick share live alert
  const shareLiveAlertWhatsApp = () => {
    if (!liveSession) return;
    const text = `🚨 *تنبيه من مندوب الدفعة: بدأت المحاضرة الآن!* 🚨\n\n` +
      `📚 المادة: *${liveSession.subjectTitle}*\n` +
      `👨‍🏫 الدكتور: ${liveSession.doctorName}\n` +
      `📍 القاعة: ${liveSession.hall}\n` +
      `⏳ المدة المقررة: ${liveSession.durationMinutes} دقيقة\n\n` +
      `الرجاء من جميع الزملاء التواجد في القاعة سريعاً.\n` +
      `✍️ مندوب الدفعة: ${settings.delegateName}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast message if stopped */}
      {stopSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>{stopSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setStopSuccessMessage('')} 
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stop Confirmation Modal */}
      {showStopModal && liveSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">إيقاف المحاضرة الآن</h3>
                  <span className="text-xs text-slate-400">إنهاء حساب الوقت فوراً</span>
                </div>
              </div>
              <button
                onClick={() => setShowStopModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>المادة:</span>
                <span className="text-emerald-400">{liveSession.subjectTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>الدكتور:</span>
                <span>{liveSession.doctorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>الوقت المنقضي:</span>
                <span className="font-mono text-cyan-300 font-semibold">{timeElapsedStr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>الوقت المتبقي:</span>
                <span className="font-mono text-amber-300 font-semibold">{timeRemainingStr}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في إيقاف المحاضرة الآن؟ سيتم إنهاء العداد المباشر فوراً لجميع الطلاب والعودة للوضع الطبيعي.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmStopSession}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>نعم، أوقف المحاضرة الآن ⏹️</span>
              </button>
              <button
                onClick={() => setShowStopModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition cursor-pointer border border-slate-700"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. ACTIVE LIVE LECTURE DISPLAY */}
      {liveSession?.isActive ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 border-2 border-emerald-500/50 shadow-2xl p-6 sm:p-8">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left side: Information about current lecture */}
            <div className="space-y-3 text-center md:text-right w-full md:w-auto">
              {liveSession.isPaused ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold animate-pulse">
                  <Pause className="w-3.5 h-3.5 fill-amber-300" />
                  <span>المحاضرة متوقفة مؤقتاً (استراحة)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>المحاضرة جارية الآن في الكلية</span>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {liveSession.subjectTitle}
              </h2>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{liveSession.doctorName}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{liveSession.hall}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>المدة الكلية: {liveSession.durationMinutes} دقيقة</span>
                </div>
              </div>
            </div>

            {/* Right side: Digital Countdown Clock with Immediate Stop/Pause Action */}
            <div className="flex flex-col items-center bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-inner w-full md:w-auto min-w-[280px]">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-emerald-400" />
                {liveSession.isPaused 
                  ? 'العداد متوقف مؤقتاً'
                  : isOvertime 
                    ? 'انتهى الوقت المحدد (وقت إضافي)' 
                    : 'الوقت المتبقي حتى النهاية'}
              </span>

              <div className={`text-4xl sm:text-5xl font-mono font-black tracking-widest ${
                liveSession.isPaused
                  ? 'text-amber-400'
                  : isOvertime 
                    ? 'text-rose-400 animate-pulse' 
                    : 'text-emerald-400'
              }`}>
                {timeRemainingStr}
              </div>

              <div className="flex items-center justify-between w-full text-xs text-slate-400 mt-2 px-1">
                <span>مضى: {timeElapsedStr}</span>
                <span>{percentageElapsed}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-2 border border-slate-700">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    liveSession.isPaused
                      ? 'bg-amber-400'
                      : isOvertime 
                        ? 'bg-rose-500' 
                        : percentageElapsed > 85 
                          ? 'bg-amber-500' 
                          : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, percentageElapsed)}%` }}
                ></div>
              </div>

              {/* Directly prominent Stop/Pause buttons right inside the Clock Box */}
              {role === 'delegate' ? (
                <div className="w-full mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setShowStopModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 border border-rose-500 transition cursor-pointer"
                    title="إيقاف المحاضرة الآن"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>إيقاف المحاضرة الآن ⏹️</span>
                  </button>

                  {onTogglePauseSession && (
                    <button
                      onClick={onTogglePauseSession}
                      className={`px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer border flex items-center justify-center gap-1 ${
                        liveSession.isPaused
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                      }`}
                      title={liveSession.isPaused ? 'استئناف المحاضرة والوقت' : 'إيقاف مؤقت للاستراحة أو الصلاة'}
                    >
                      {liveSession.isPaused ? (
                        <>
                          <Play className="w-3 h-3 fill-white" />
                          <span>استئناف ▶️</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 fill-amber-300" />
                          <span>إيقاف مؤقت ⏸️</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full mt-3 text-center">
                  {onRequestDelegateLogin && (
                    <button
                      onClick={onRequestDelegateLogin}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
                    >
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>هل أنت المندوب وتريد إيقاف المحاضرة الآن؟ اضغط هنا</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Action buttons toolbar for Delegate */}
          {role === 'delegate' && (
            <div className="relative z-10 mt-6 pt-5 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onExtendSession(10)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تمديد 10 د</span>
                </button>
                <button
                  onClick={() => onExtendSession(15)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تمديد 15 د</span>
                </button>
                <button
                  onClick={shareLiveAlertWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>إرسال تنبيه واتساب للدفعة</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onOpenAttendanceForLecture(liveSession.subjectTitle, liveSession.doctorName)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>فتح كشف الحضور الآن</span>
                </button>
                <button
                  onClick={() => setShowStopModal(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border border-rose-500 text-xs font-bold shadow-md shadow-rose-600/30 transition cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>إيقاف المحاضرة الآن ⏹️</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 2. IF NO LECTURE IS ACTIVE: START LECTURE CONTROLLER (DELEGATE VIEW) */}
      {!liveSession?.isActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Launch Card (Delegate) or Welcome/Status Card (Student) */}
          <div className="lg:col-span-7 bg-slate-800/60 rounded-3xl border border-slate-700/80 p-6 sm:p-7 shadow-xl">
            {role === 'student' ? (
              <div className="space-y-4 py-4 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>حالة المحاضرات المباشرة</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  لا توجد محاضرة جارية في القاعة حالياً
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  عندما تبدأ المحاضرة في الكلية، سيقوم مندوب الدفعة بتفعيل العد المباشر لتظهر لك هنا بالدقائق والثواني مع اسم الدكتور والقاعة والوقت المتبقي حتى الانتهاء.
                </p>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-3 text-xs text-slate-300">
                  <span className="text-xl">📍</span>
                  <div>
                    <strong className="text-white block">مقر المحاضرات المعتمد:</strong>
                    <span>معظم المحاضرات في <strong>قاعة البيئة</strong>، ومادة مهارات الحاسوب في <strong>مختبر رقم 2</strong>.</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Play className="w-5 h-5 fill-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      بدء محاضرة وحساب الوقت فوراً
                    </h3>
                    <p className="text-xs text-slate-400">
                      اضغط "بدأت المحاضرة الآن" وسيقوم النظام بحساب الوقت المتبقي وتنبيهك عند انتهائها
                    </p>
                  </div>
                </div>

            {/* Quick dropdown from scheduled lectures */}
            {lectures.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اختيار سريع من جدول المواد المبرمجة:
                </label>
                <select
                  value={selectedPresetLectureId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- أو اكتب مادة مخصصة أدناه --</option>
                  {lectures.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.title} ({DAYS_ARABIC[lec.day].label} - {formatInterval12Hour(lec.startTime, lec.endTime, true)}) - {lec.doctor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Inputs */}
            <form onSubmit={handleStartCustomSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم المادة / المحاضرة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: هندسة البرمجيات، شبكات الحاسب، فيزياء عامة..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اسم الدكتور / المحاضر
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: د. عبد الرحمن الشهري"
                    value={customDoctor}
                    onChange={(e) => setCustomDoctor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    القاعة / المدرج
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: المدرج 3، معمل 102"
                    value={customHall}
                    onChange={(e) => setCustomHall(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Duration picker with chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  مدة المحاضرة المقررة:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[45, 60, 90, 105, 120, 150].map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => setCustomDuration(dur)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        customDuration === dur
                          ? 'bg-emerald-500 text-slate-900 font-bold'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {dur} دقيقة
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700">
                    <input
                      type="number"
                      min="5"
                      max="360"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(Number(e.target.value))}
                      className="w-14 bg-transparent text-xs text-white text-center focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">د</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!customSubject.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>بدأت المحاضرة الآن 🚀 (ابدأ العد وحساب الوقت)</span>
              </button>
            </form>
          </>
        )}
      </div>

          {/* Right Column: Today's Scheduled Lectures Quick Start */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-800/60 rounded-3xl border border-slate-700/80 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">
                    محاضرات اليوم ({DAYS_ARABIC[today].label})
                  </h4>
                </div>
                <span className="text-xs text-slate-400">
                  {todayLectures.length} محاضرات
                </span>
              </div>

              {todayLectures.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">لا توجد محاضرات مجدولة لهذا اليوم</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayLectures.map((lec) => (
                    <div 
                      key={lec.id}
                      className="group p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-emerald-500/40 transition flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{lec.title}</span>
                          {lec.code && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {lec.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-300">
                          <span className="font-mono text-emerald-400 font-semibold">{formatInterval12Hour(lec.startTime, lec.endTime, true)}</span>
                          <span>•</span>
                          <span>{lec.hall}</span>
                        </div>
                      </div>

                      {role === 'delegate' && (
                        <button
                          onClick={() => handleStartFromSchedule(lec)}
                          title="بدء هذه المحاضرة الآن"
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-emerald-400" />
                          <span>بدء الآن</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delegate quick guide note */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                بمجرد الضغط على <strong>بدأت المحاضرة</strong>، سيتم تحديث حالة المحاضرة للطلاب ويمكنك مباشرة تفريغ كشف الحضور بنقرة زر واحدة أو مشاركة إشعار واتساب للدفعة.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
