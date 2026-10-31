import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Share2, 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Award, 
  AlertCircle,
  X
} from 'lucide-react';
import { Exam, ExamType, BatchSettings } from '../types';
import { EXAM_TYPES, formatArabicDate, getExamCountdownDays, generateExamsWhatsApp, formatTime12Hour } from '../utils/formatters';

interface ExamsViewProps {
  exams: Exam[];
  onSaveExams: (exams: Exam[]) => void;
  settings: BatchSettings;
  role: 'delegate' | 'student';
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  onSaveExams,
  settings,
  role,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [doctor, setDoctor] = useState('');
  const [type, setType] = useState<ExamType>('midterm');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [hall, setHall] = useState('');
  const [syllabusNotes, setSyllabusNotes] = useState('');
  const [totalMarks, setTotalMarks] = useState<number | undefined>(30);
  const [topicsInput, setTopicsInput] = useState('');

  const handleOpenAdd = () => {
    setEditingExam(null);
    setTitle('');
    setCode('');
    setDoctor('');
    setType('midterm');
    setDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setStartTime('09:00');
    setDurationMinutes(90);
    setHall('المدرج 1');
    setSyllabusNotes('');
    setTotalMarks(30);
    setTopicsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exam) => {
    setEditingExam(ex);
    setTitle(ex.title);
    setCode(ex.code || '');
    setDoctor(ex.doctor);
    setType(ex.type);
    setDate(ex.date);
    setStartTime(ex.startTime);
    setDurationMinutes(ex.durationMinutes);
    setHall(ex.hall);
    setSyllabusNotes(ex.syllabusNotes || '');
    setTotalMarks(ex.totalMarks);
    setTopicsInput(ex.studyTopics?.map(t => t.text).join('\n') || '');
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    // Parse topics
    const studyTopics = topicsInput
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map((text, i) => ({
        id: 'tp-' + Date.now() + '-' + i,
        text,
        completed: false,
      }));

    if (editingExam) {
      const updated = exams.map(ex => {
        if (ex.id === editingExam.id) {
          return {
            ...ex,
            title: title.trim(),
            code: code.trim(),
            doctor: doctor.trim() || 'أستاذ المادة',
            type,
            date,
            startTime,
            durationMinutes: Number(durationMinutes) || 90,
            hall: hall.trim() || 'القاعة المحددة',
            syllabusNotes: syllabusNotes.trim(),
            totalMarks: totalMarks ? Number(totalMarks) : undefined,
            studyTopics: studyTopics.length > 0 ? studyTopics : ex.studyTopics,
          };
        }
        return ex;
      });
      onSaveExams(updated);
    } else {
      const newExam: Exam = {
        id: 'ex-' + Date.now(),
        title: title.trim(),
        code: code.trim(),
        doctor: doctor.trim() || 'أستاذ المادة',
        type,
        date,
        startTime,
        durationMinutes: Number(durationMinutes) || 90,
        hall: hall.trim() || 'القاعة المحددة',
        syllabusNotes: syllabusNotes.trim(),
        totalMarks: totalMarks ? Number(totalMarks) : undefined,
        studyTopics,
      };
      onSaveExams([...exams, newExam]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاختبار من الجدول؟')) {
      onSaveExams(exams.filter(ex => ex.id !== id));
    }
  };

  // Toggle study checklist item
  const toggleTopicCheck = (examId: string, topicId: string) => {
    const updated = exams.map(ex => {
      if (ex.id === examId && ex.studyTopics) {
        return {
          ...ex,
          studyTopics: ex.studyTopics.map(tp => 
            tp.id === topicId ? { ...tp, completed: !tp.completed } : tp
          )
        };
      }
      return ex;
    });
    onSaveExams(updated);
  };

  // Share exams schedule via WhatsApp
  const handleShareWhatsApp = () => {
    const encoded = generateExamsWhatsApp(exams, settings.batchName, settings.delegateName);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Filter exams
  const filteredExams = exams
    .filter(ex => (filterType === 'all' ? true : ex.type === filterType))
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold text-white">جدول ومواعيد الاختبارات</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مواعيد الاختبارات النصفية والنهائية، عد تنازلي، القاعات، والمقرر المطلوب
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="مشاركة جدول الاختبارات في قروب الواتساب"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>مشاركة الجدول للواتساب</span>
            </button>

            {role === 'delegate' && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موعد اختبار جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-700/60">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            كل الاختبارات ({exams.length})
          </button>

          {(['midterm', 'final', 'quiz', 'practical', 'oral'] as ExamType[]).map(t => {
            const count = exams.filter(e => e.type === t).length;
            if (count === 0 && filterType !== t) return null;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  filterType === t
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{EXAM_TYPES[t]?.label || t}</span>
                <span className="mr-1 text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-12 text-center text-slate-400 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">لا توجد اختبارات مسجلة في هذا القسم</h3>
          <p className="text-xs">
            يمكن للمندوب إضافة مواعيد الاختبارات النصفية والنهائية والكويزات لتظهر لجميع طلاب الدفعة
          </p>
          {role === 'delegate' && (
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              + إضافة موعد اختبار الآن
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((ex) => {
            const countdown = getExamCountdownDays(ex.date, ex.startTime);
            const typeConfig = EXAM_TYPES[ex.type] || EXAM_TYPES.midterm;
            const formattedDate = formatArabicDate(ex.date);

            return (
              <div
                key={ex.id}
                className="group relative overflow-hidden rounded-3xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Type Badge & Countdown */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${typeConfig.badge}`}>
                      {typeConfig.label}
                    </span>

                    {/* Countdown Pill */}
                    <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                      countdown.isPast
                        ? 'bg-slate-900 text-slate-500 border-slate-800'
                        : countdown.days <= 2
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{countdown.statusText}</span>
                    </div>
                  </div>

                  {/* Title & Marks */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-rose-300 transition">
                        {ex.title}
                      </h3>
                      {ex.code && (
                        <span className="text-xs font-mono text-slate-400">
                          كود المقرر: {ex.code}
                        </span>
                      )}
                    </div>

                    {ex.totalMarks && (
                      <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400">
                        <Award className="w-3.5 h-3.5" />
                        <span>{ex.totalMarks} درجة</span>
                      </div>
                    )}
                  </div>

                  {/* Details Grid: Date, Time, Hall, Doctor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 py-2.5 bg-slate-900/60 rounded-2xl p-3 border border-slate-700/40 mt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-mono text-slate-200">الساعة {formatTime12Hour(ex.startTime, true)} ({ex.durationMinutes} دقيقة)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{ex.hall}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{ex.doctor}</span>
                    </div>
                  </div>

                  {/* Syllabus & Exam Scope */}
                  {ex.syllabusNotes && (
                    <div className="mt-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-700/60 text-xs">
                      <span className="font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                        <span>المقرر والمواضيع المطلوبة:</span>
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        {ex.syllabusNotes}
                      </p>
                    </div>
                  )}

                  {/* Study Checklist */}
                  {ex.studyTopics && ex.studyTopics.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 block">
                        قائمة مراجعة ومذاكرة محاور الاختبار:
                      </span>
                      <div className="space-y-1">
                        {ex.studyTopics.map(topic => (
                          <button
                            type="button"
                            key={topic.id}
                            onClick={() => toggleTopicCheck(ex.id, topic.id)}
                            className="w-full text-right p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 text-xs flex items-center gap-2 transition cursor-pointer"
                          >
                            {topic.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span className={topic.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                              {topic.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Delegate Controls */}
                {role === 'delegate' && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(ex)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                      title="تعديل تفاصيل الاختبار"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(ex.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                      title="حذف هذا الاختبار"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-rose-400" />
                <span>{editingExam ? 'تعديل موعد الاختبار' : 'إضافة موعد اختبار جديد للدفعة'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المادة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: نظم تشغيل الحاسب"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    كود المقرر
                  </label>
                  <input
                    type="text"
                    placeholder="CS 310"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نوع الاختبار
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ExamType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="midterm">اختبار نصفي (Midterm)</option>
                    <option value="final">اختبار نهائي (Final)</option>
                    <option value="quiz">كويز قصير (Quiz)</option>
                    <option value="practical">اختبار عملي / معمل (Lab)</option>
                    <option value="oral">اختبار شفوي (Oral)</option>
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
                    placeholder="د. خالد الدوسري"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    القاعة / المدرج / أرقام اللجان
                  </label>
                  <input
                    type="text"
                    placeholder="المدرج 2 ولجنة 4"
                    value={hall}
                    onChange={(e) => setHall(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاريخ الاختبار <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                  />
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    المدة (دقيقة)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الدرجة الكلية للاختبار (اختياري)
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    value={totalMarks || ''}
                    onChange={(e) => setTotalMarks(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المقرر المطلوب والصفحات المحددة للاختبار
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: من الفصل الأول حتى الرابع، التركيز على مسائل الخوارزميات..."
                  value={syllabusNotes}
                  onChange={(e) => setSyllabusNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  قائمة محاور المذاكرة (كل محور في سطر مستقل):
                </label>
                <textarea
                  rows={3}
                  placeholder={`مراجعة الفصل الأول
حل التمارين والمسائل النموذجية
حفظ التعريفات والمصطلحات`}
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
                >
                  {editingExam ? 'حفظ التعديلات' : 'إضافة الاختبار للجدول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
