import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Share2, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Play, 
  Square,
  CheckCircle2, 
  X,
  Search
} from 'lucide-react';
import { Lecture, DayOfWeek, LectureType, BatchSettings, LiveLectureSession } from '../types';
import { 
  DAYS_ARABIC, 
  ORDERED_DAYS, 
  LECTURE_TYPES, 
  getTodayDayOfWeek,
  generateDailyScheduleWhatsApp,
  formatTime12Hour,
  formatInterval12Hour
} from '../utils/formatters';

interface ScheduleViewProps {
  lectures: Lecture[];
  onSaveLectures: (lectures: Lecture[]) => void;
  onStartSession: (session: LiveLectureSession) => void;
  onEndSession?: () => void;
  liveSession: LiveLectureSession | null;
  settings: BatchSettings;
  role: 'delegate' | 'student';
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  lectures,
  onSaveLectures,
  onStartSession,
  onEndSession,
  liveSession,
  settings,
  role,
}) => {
  const today = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [is12Hour, setIs12Hour] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [doctor, setDoctor] = useState('');
  const [hall, setHall] = useState('');
  const [day, setDay] = useState<DayOfWeek>(today);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<LectureType>('lecture');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingLecture(null);
    setTitle('');
    setCode('');
    setDoctor('');
    setHall('');
    setDay(selectedDay === 'all' ? today : selectedDay);
    setStartTime('08:30');
    setEndTime('10:00');
    setType('lecture');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (lec: Lecture) => {
    setEditingLecture(lec);
    setTitle(lec.title);
    setCode(lec.code || '');
    setDoctor(lec.doctor);
    setHall(lec.hall);
    setDay(lec.day);
    setStartTime(lec.startTime);
    setEndTime(lec.endTime);
    setType(lec.type);
    setNotes(lec.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingLecture) {
      const updated = lectures.map(l => {
        if (l.id === editingLecture.id) {
          return {
            ...l,
            title: title.trim(),
            code: code.trim(),
            doctor: doctor.trim() || 'دكتور المادة',
            hall: hall.trim() || 'القاعة المحددة',
            day,
            startTime,
            endTime,
            type,
            notes: notes.trim(),
          };
        }
        return l;
      });
      onSaveLectures(updated);
    } else {
      const newLec: Lecture = {
        id: 'lec-' + Date.now(),
        title: title.trim(),
        code: code.trim(),
        doctor: doctor.trim() || 'دكتور المادة',
        hall: hall.trim() || 'القاعة المحددة',
        day,
        startTime,
        endTime,
        type,
        notes: notes.trim(),
      };
      onSaveLectures([...lectures, newLec]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteLecture = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المحاضرة من الجدول؟')) {
      onSaveLectures(lectures.filter(l => l.id !== id));
    }
  };

  const toggleCancelStatus = (lec: Lecture) => {
    const updated = lectures.map(l => {
      if (l.id === lec.id) {
        return {
          ...l,
          isCancelled: !l.isCancelled,
          isPostponed: false,
        };
      }
      return l;
    });
    onSaveLectures(updated);
  };

  const togglePostponeStatus = (lec: Lecture) => {
    const updated = lectures.map(l => {
      if (l.id === lec.id) {
        return {
          ...l,
          isPostponed: !l.isPostponed,
          isCancelled: false,
        };
      }
      return l;
    });
    onSaveLectures(updated);
  };

  const handleStartFromCard = (lec: Lecture) => {
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
    const session: LiveLectureSession = {
      isActive: true,
      lectureId: lec.id,
      subjectTitle: lec.title,
      doctorName: lec.doctor,
      hall: lec.hall,
      startedAt,
      durationMinutes: diffMinutes,
      targetEndTime: startedAt + diffMinutes * 60 * 1000,
    };
    onStartSession(session);
  };

  // Filter lectures
  const filteredLectures = lectures.filter(lec => {
    if (selectedDay !== 'all' && lec.day !== selectedDay) return false;
    if (typeFilter !== 'all' && lec.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = lec.title.toLowerCase().includes(q);
      const matchDoctor = lec.doctor.toLowerCase().includes(q);
      const matchHall = lec.hall.toLowerCase().includes(q);
      const matchCode = lec.code?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDoctor && !matchHall && !matchCode) return false;
    }
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // WhatsApp share for selected day
  const handleShareDayWhatsApp = () => {
    const dayToShare = selectedDay === 'all' ? today : selectedDay;
    const encoded = generateDailyScheduleWhatsApp(dayToShare, lectures, settings.batchName, settings.delegateName);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Active Live Session Alert Banner with Stop Option */}
      {liveSession?.isActive && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-2">
                <span>المحاضرة جارية الآن:</span>
                <span className="text-emerald-400">{liveSession.subjectTitle}</span>
                <span className="text-xs text-slate-400">({liveSession.hall} - {liveSession.doctorName})</span>
              </p>
            </div>
          </div>
          {role === 'delegate' && onEndSession && (
            <button
              onClick={onEndSession}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-rose-600/30 border border-rose-500 shrink-0"
              title="إيقاف المحاضرة وإنهاء حساب الوقت فوراً"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>إيقاف المحاضرة الآن ⏹️</span>
            </button>
          )}
        </div>
      )}

      {/* Top Controls: Day Tabs & Action Header */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">جدول المحاضرات الأسبوعي</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مواعيد المحاضرات والقاعات والمدرجات لجميع أيام الأسبوع مع التنبيهات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIs12Hour(!is12Hour)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="التبديل بين نظام 12 ساعة و 24 ساعة"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{is12Hour ? 'نظام 12 ساعة (م/ص)' : 'نظام 24 ساعة'}</span>
            </button>

            <button
              onClick={handleShareDayWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="مشاركة جدول اليوم في قروب الواتساب"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>مشاركة جدول {selectedDay === 'all' ? 'اليوم' : DAYS_ARABIC[selectedDay].label}</span>
            </button>

            {role === 'delegate' && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة محاضرة جديدة</span>
              </button>
            )}
          </div>
        </div>

        {/* Days Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedDay === 'all'
                ? 'bg-emerald-500 text-slate-900 shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>أيام الأسبوع (7 أيام)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedDay === 'all' ? 'bg-slate-900 text-emerald-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {lectures.length} محاضرات
            </span>
          </button>

          {ORDERED_DAYS.map((d) => {
            const count = lectures.filter(l => l.day === d).length;
            const isToday = d === today;
            const isOffDay = count === 0;

            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  selectedDay === d
                    ? 'bg-emerald-500 text-slate-900 shadow-sm'
                    : isOffDay
                      ? 'bg-slate-900/60 text-slate-400 hover:bg-slate-700 border border-slate-800'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{DAYS_ARABIC[d].label}</span>
                {count > 0 ? (
                  <span className={`mr-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    selectedDay === d ? 'bg-slate-900 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count} {count === 1 ? 'محاضرة' : count === 2 ? 'محاضرتان' : 'محاضرات'}
                  </span>
                ) : (
                  <span className={`mr-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedDay === d ? 'bg-slate-900 text-slate-300' : 'bg-slate-950 text-slate-500'
                  }`}>
                    إجازة
                  </span>
                )}
                {isToday && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" title="اليوم"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Type filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-700/60">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث باسم المادة، الدكتور، أو القاعة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">كل الأنواع (نظري، معمل، سكشن)</option>
            <option value="lecture">محاضرة نظرية فقط</option>
            <option value="lab">معمل / مختبر فقط</option>
            <option value="section">سكشن فقط</option>
            <option value="seminar">ندوة / حلقة بحث</option>
          </select>
        </div>
      </div>

      {/* Lectures Cards Grid */}
      {filteredLectures.length === 0 ? (
        <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-12 text-center text-slate-400 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">
            {selectedDay === 'thursday' || selectedDay === 'friday' || selectedDay === 'saturday'
              ? `🎉 يوم ${DAYS_ARABIC[selectedDay].label}: إجازة أسبوعية`
              : 'لا توجد محاضرات مطابقة'}
          </h3>
          <p className="text-xs">
            {selectedDay === 'thursday' || selectedDay === 'friday' || selectedDay === 'saturday'
              ? 'لا توجد محاضرات مقررة في هذا اليوم حسب الجدول الرسمي المعتمد للدفعة. إجازة سعيدة وموفقة للجميع!'
              : selectedDay !== 'all'
                ? `لا توجد محاضرات مضافة ليوم ${DAYS_ARABIC[selectedDay].label}`
                : 'لم يتم العثور على أي نتائج في الجدول'}
          </p>
          {role === 'delegate' && selectedDay !== 'friday' && (
            <button
              onClick={openAddModal}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              + إضافة محاضرة الآن
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLectures.map((lec) => {
            const isLiveNow = liveSession?.isActive && (
              liveSession.lectureId === lec.id || liveSession.subjectTitle === lec.title
            );
            const typeConfig = LECTURE_TYPES[lec.type] || LECTURE_TYPES.lecture;

            return (
              <div
                key={lec.id}
                className={`group relative overflow-hidden rounded-3xl bg-slate-800/90 border transition-all duration-200 p-5 shadow-lg flex flex-col justify-between ${
                  isLiveNow 
                    ? 'border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/40 bg-gradient-to-br from-slate-800 to-emerald-950/30' 
                    : lec.isCancelled 
                      ? 'border-rose-500/40 opacity-70 bg-slate-900/60'
                      : lec.isPostponed
                        ? 'border-amber-500/40 bg-slate-900/60'
                        : 'border-slate-700/80 hover:border-slate-600 hover:shadow-xl'
                }`}
              >
                <div>
                  {/* Top Header inside card: Day, Type Badge, and Live Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {DAYS_ARABIC[lec.day].label}
                    </span>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${typeConfig.bg}`}>
                      {typeConfig.label}
                    </span>
                  </div>

                  {/* Special Badges for Cancelled / Postponed / Live */}
                  {isLiveNow && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>جارية الآن في الكلية</span>
                    </div>
                  )}

                  {lec.isCancelled && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>المحاضرة ملغية (اعتذار المحاضر)</span>
                    </div>
                  )}

                  {lec.isPostponed && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>تم تأجيل موعد هذه المحاضرة</span>
                    </div>
                  )}

                  {/* Lecture Title & Code */}
                  <div className="space-y-1 mb-3">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {lec.title}
                    </h3>
                    {lec.code && (
                      <span className="inline-block text-[11px] font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                        {lec.code}
                      </span>
                    )}
                  </div>

                  {/* Details: Doctor, Time, Hall */}
                  <div className="space-y-2 text-xs text-slate-300 py-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{lec.doctor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-mono font-semibold text-slate-200">
                        {is12Hour 
                          ? `من ${formatTime12Hour(lec.startTime, true)} إلى ${formatTime12Hour(lec.endTime, true)}`
                          : `من ${lec.startTime} إلى ${lec.endTime}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{lec.hall}</span>
                    </div>
                    {lec.notes && (
                      <p className="mt-2 text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
                        📝 {lec.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions for Delegate */}
                {role === 'delegate' && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      {/* Start / Stop Live button */}
                      {isLiveNow ? (
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 animate-pulse">
                            جارية الآن
                          </span>
                          {onEndSession && (
                            <button
                              onClick={onEndSession}
                              title="إيقاف المحاضرة الآن"
                              className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/60 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Square className="w-3 h-3 fill-rose-300" />
                              <span>إيقاف</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        !lec.isCancelled && (
                          <button
                            onClick={() => handleStartFromCard(lec)}
                            title="بدء عد هذه المحاضرة الآن"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          </button>
                        )
                      )}
                      
                      {/* Toggle Cancel button */}
                      <button
                        onClick={() => toggleCancelStatus(lec)}
                        title={lec.isCancelled ? 'إلغاء حالة الاعتذار' : 'تسجيل اعتذار الدكتور (إلغاء)'}
                        className={`p-1.5 rounded-lg border transition cursor-pointer text-xs ${
                          lec.isCancelled
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-slate-900 text-slate-400 hover:text-rose-400 border-slate-700'
                        }`}
                      >
                        {lec.isCancelled ? 'مفعل' : 'اعتذار'}
                      </button>

                      {/* Toggle Postpone button */}
                      <button
                        onClick={() => togglePostponeStatus(lec)}
                        title={lec.isPostponed ? 'إلغاء التأجيل' : 'تأجيل المحاضرة'}
                        className={`p-1.5 rounded-lg border transition cursor-pointer text-xs ${
                          lec.isPostponed
                            ? 'bg-amber-500 text-slate-900 font-bold border-amber-500'
                            : 'bg-slate-900 text-slate-400 hover:text-amber-400 border-slate-700'
                        }`}
                      >
                        {lec.isPostponed ? 'مؤجل' : 'تأجيل'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(lec)}
                        title="تعديل تفاصيل المحاضرة"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLecture(lec.id)}
                        title="حذف المحاضرة"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Lecture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>{editingLecture ? 'تعديل بيانات المحاضرة' : 'إضافة محاضرة جديدة إلى الجدول'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المادة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ذكاء اصطناعي، قواعد بيانات..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    كود المادة (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: CS 301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نوع المحاضرة
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LectureType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="lecture">محاضرة نظرية</option>
                    <option value="lab">معمل / مختبر</option>
                    <option value="section">سكشن / تمارين</option>
                    <option value="seminar">ندوة / حلقة بحث</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    أستاذ / دكتور المادة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: د. عبد الرحمن"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    القاعة / المدرج
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مدرج 2، قاعة 101"
                    value={hall}
                    onChange={(e) => setHall(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اليوم
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value as DayOfWeek)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {ORDERED_DAYS.map(d => (
                      <option key={d} value={d}>{DAYS_ARABIC[d].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    وقت البدء
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    وقت الانتهاء
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ملاحظات أو تنبيهات إضافية للطلاب
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: إحضار الحاسب المحمول، تسليم الواجب..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  {editingLecture ? 'حفظ التعديلات' : 'إضافة المحاضرة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
