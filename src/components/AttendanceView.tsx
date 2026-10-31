import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Share2, 
  Search, 
  Printer, 
  RotateCcw, 
  Users, 
  Save, 
  Calendar,
  AlertCircle,
  History,
  Trash2
} from 'lucide-react';
import { 
  Student, 
  Lecture, 
  AttendanceRecord, 
  AttendanceStatus, 
  BatchSettings, 
  LiveLectureSession 
} from '../types';
import { generateAttendanceWhatsApp } from '../utils/formatters';

interface AttendanceViewProps {
  students: Student[];
  lectures: Lecture[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendanceRecords: (records: AttendanceRecord[]) => void;
  liveSession: LiveLectureSession | null;
  settings: BatchSettings;
  role: 'delegate' | 'student';
  preselectedSubject?: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  lectures,
  attendanceRecords,
  onSaveAttendanceRecords,
  liveSession,
  settings,
  role,
  preselectedSubject,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Active session parameters
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    preselectedSubject || (liveSession?.isActive ? liveSession.subjectTitle : (lectures[0]?.title || 'محاضرة عامة'))
  );
  const [doctorName, setDoctorName] = useState<string>(
    liveSession?.isActive ? liveSession.doctorName : (lectures[0]?.doctor || '')
  );
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Attendance status mapping: studentId -> status
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // When preselectedSubject changes (e.g. from LiveLectureWidget button)
  useEffect(() => {
    if (preselectedSubject) {
      setSelectedSubject(preselectedSubject);
      const matched = lectures.find(l => l.title === preselectedSubject);
      if (matched) setDoctorName(matched.doctor);
    }
  }, [preselectedSubject, lectures]);

  // Load existing record for selected date & subject if available
  useEffect(() => {
    const existing = attendanceRecords.find(
      r => r.date === selectedDate && r.subjectTitle === selectedSubject
    );
    if (existing) {
      setStatuses(existing.records);
      if (existing.doctorName) setDoctorName(existing.doctorName);
      if (existing.notes) setSessionNotes(existing.notes);
    } else {
      // Default initial state: keep all absent or preserve existing statuses
      const initial: Record<string, AttendanceStatus> = {};
      students.forEach(s => {
        initial[s.id] = 'absent';
      });
      setStatuses(initial);
    }
  }, [selectedDate, selectedSubject, attendanceRecords, students]);

  // When subject dropdown changes
  const handleSubjectChange = (subj: string) => {
    setSelectedSubject(subj);
    const matched = lectures.find(l => l.title === subj);
    if (matched) {
      setDoctorName(matched.doctor);
    }
  };

  // Toggle single student status
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    if (role !== 'delegate') return;
    setStatuses(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    if (role !== 'delegate') return;
    const next: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      next[s.id] = 'present';
    });
    setStatuses(next);
  };

  // Reset all to absent
  const handleResetAllAbsent = () => {
    if (role !== 'delegate') return;
    const next: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      next[s.id] = 'absent';
    });
    setStatuses(next);
  };

  // Save attendance sheet
  const handleSaveAttendance = () => {
    if (role !== 'delegate') return;
    const recordId = `att-${selectedDate}-${selectedSubject}`.replace(/\s+/g, '_');

    const newRecord: AttendanceRecord = {
      id: recordId,
      date: selectedDate,
      subjectTitle: selectedSubject,
      doctorName,
      records: statuses,
      recordedAt: Date.now(),
      notes: sessionNotes,
    };

    const existingIndex = attendanceRecords.findIndex(
      r => r.date === selectedDate && r.subjectTitle === selectedSubject
    );

    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = [...attendanceRecords];
      updated[existingIndex] = newRecord;
    } else {
      updated = [newRecord, ...attendanceRecords];
    }

    onSaveAttendanceRecords(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleDeleteRecord = (id: string) => {
    if (role !== 'delegate') return;
    if (window.confirm('هل تريد حذف هذا السجل المؤرشف؟')) {
      onSaveAttendanceRecords(attendanceRecords.filter(r => r.id !== id));
    }
  };

  // Calculate live statistics
  const totalStudents = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  students.forEach(s => {
    const st = statuses[s.id] || 'absent';
    if (st === 'present') presentCount++;
    else if (st === 'absent') absentCount++;
    else if (st === 'late') lateCount++;
    else if (st === 'excused') excusedCount++;
  });

  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Filter students for display
  const filteredStudents = students.filter(s => {
    if (groupFilter !== 'all' && s.group !== groupFilter) return false;
    const st = statuses[s.id] || 'absent';
    if (statusFilter !== 'all' && st !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = s.universityId.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  // Extract distinct groups
  const groupsList = Array.from(new Set(students.map(s => s.group))).filter(Boolean);

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const currentRecord: AttendanceRecord = {
      id: 'temp',
      date: selectedDate,
      subjectTitle: selectedSubject,
      doctorName,
      records: statuses,
      recordedAt: Date.now(),
      notes: sessionNotes,
    };
    const encoded = generateAttendanceWhatsApp(currentRecord, students, settings.batchName, settings.delegateName);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & Control Deck */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 sm:p-6 shadow-xl space-y-5">
        
        {/* Title & History Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">كشف تحضير وغياب الدفعة</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              تسجيل ومتابعة حضور جميع طلاب الدفعة وحساب أعداد الحاضرين والغائبين تلقائياً
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>{showHistory ? 'إغلاق الأرشيف' : `سجلات سابقة (${attendanceRecords.length})`}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer"
              title="مشاركة تقرير الحضور عبر واتساب"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة كشف الحضور للواتساب</span>
            </button>

            {role === 'delegate' && (
              <button
                onClick={handleSaveAttendance}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الكشف</span>
              </button>
            )}
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ سجل الحضور والغياب بنجاح في ذاكرة النظام!</span>
          </div>
        )}

        {/* Lecture & Date Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              المادة الدراسية:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {lectures.map((l) => (
                  <option key={l.id} value={l.title}>
                    {l.title} ({l.doctor})
                  </option>
                ))}
                {!lectures.some(l => l.title === selectedSubject) && (
                  <option value={selectedSubject}>{selectedSubject}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              اسم دكتور / أستاذ المادة:
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="مثال: د. عبد الرحمن"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              تاريخ المحاضرة:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Live Counters Stats Deck */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-700/60">
          
          {/* Total Students */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-700/70 text-center">
            <span className="text-[11px] text-slate-400 font-semibold block">إجمالي طلاب الدفعة</span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalStudents}</span>
          </div>

          {/* Present */}
          <div className="bg-emerald-500/10 rounded-2xl p-3.5 border border-emerald-500/30 text-center">
            <span className="text-[11px] text-emerald-400 font-semibold block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>حاضرون</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{presentCount}</span>
            <span className="text-[10px] text-emerald-500/80 block">{attendanceRate}%</span>
          </div>

          {/* Absent */}
          <div className="bg-rose-500/10 rounded-2xl p-3.5 border border-rose-500/30 text-center">
            <span className="text-[11px] text-rose-400 font-semibold block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>غائبون</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-400">{absentCount}</span>
            <span className="text-[10px] text-rose-500/80 block">
              {totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0}%
            </span>
          </div>

          {/* Late */}
          <div className="bg-amber-500/10 rounded-2xl p-3.5 border border-amber-500/30 text-center">
            <span className="text-[11px] text-amber-400 font-semibold block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>متأخرون</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{lateCount}</span>
          </div>

          {/* Excused */}
          <div className="bg-blue-500/10 rounded-2xl p-3.5 border border-blue-500/30 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] text-blue-400 font-semibold block flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>بعذر مسبق</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-400">{excusedCount}</span>
          </div>

        </div>

        {/* Progress Bar of Attendance */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>نسبة اكتمال حضور القاعة</span>
            <span className="font-bold text-emerald-400">{attendanceRate}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Delegate Bulk Action Buttons */}
        {role === 'delegate' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
              >
                ✅ تحضير جميع الطلاب (حاضر)
              </button>

              <button
                onClick={handleResetAllAbsent}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                🔄 إعادة تعيين (الكل غائب)
              </button>
            </div>

            <div className="text-xs text-slate-400">
              💡 اضغط على الأزرار لتغيير حالة الطالب فوراً
            </div>
          </div>
        )}

      </div>

      {/* History Modal / Drawer if opened */}
      {showHistory && (
        <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>أرشيف كشوفات الحضور المسجلة سابقاً ({attendanceRecords.length})</span>
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              إغلاق
            </button>
          </div>

          {attendanceRecords.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">لا توجد سجلات محفوظة حتى الآن</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {attendanceRecords.map((rec) => {
                const countPresent = Object.values(rec.records).filter(st => st === 'present').length;
                return (
                  <div
                    key={rec.id}
                    className="p-3 bg-slate-900 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{rec.subjectTitle}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>📅 {rec.date}</span>
                        <span>•</span>
                        <span>حضور: {countPresent}/{students.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedDate(rec.date);
                          setSelectedSubject(rec.subjectTitle);
                          setStatuses(rec.records);
                          setShowHistory(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold"
                      >
                        عرض وتحرير
                      </button>
                      {role === 'delegate' && (
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-3.5 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث باسم الطالب أو رقمه الجامعي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">كل الحالات (حاضر، غائب، متأخر)</option>
          <option value="present">الحاضرون فقط ({presentCount})</option>
          <option value="absent">الغائبون فقط ({absentCount})</option>
          <option value="late">المتأخرون فقط ({lateCount})</option>
          <option value="excused">أصحاب الأعذار ({excusedCount})</option>
        </select>

        {/* Group Filter */}
        {groupsList.length > 0 && (
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">كل المجموعات والسكاشن</option>
            {groupsList.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}
      </div>

      {/* Students Attendance List Table / Cards */}
      <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-700/80 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>الطلاب المعروضون ({filteredStudents.length} من أصل {totalStudents})</span>
          <span>حالة الحضور والغياب</span>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">سجل طلاب الدفعة فارغ حالياً</h4>
            <p className="max-w-md mx-auto text-slate-400 leading-relaxed">
              لم يتم إضافة طلاب للدفعة بعد. يرجى التوجه إلى تبويب <strong>«طلاب الدفعة»</strong> لإضافة أسماء الزملاء إما بنسخ ولصق قائمة كاملة أو إضافة فردية لتتمكن من تفريغ كشف الحضور والغياب.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            لا يوجد طلاب مطابقين لمعايير البحث
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredStudents.map((st, idx) => {
              const currentStatus = statuses[st.id] || 'absent';

              return (
                <div
                  key={st.id}
                  className="px-5 py-3 hover:bg-slate-800/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Student details */}
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs text-slate-500 font-mono text-center">
                      {idx + 1}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{st.name}</span>
                        {st.group && (
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/60">
                            {st.group}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono text-slate-400">الرقم: {st.universityId}</span>
                        {st.phone && <span>• {st.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {/* Present */}
                    <button
                      type="button"
                      disabled={role !== 'delegate'}
                      onClick={() => setStudentStatus(st.id, 'present')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'present'
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-700/80'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حاضر</span>
                    </button>

                    {/* Absent */}
                    <button
                      type="button"
                      disabled={role !== 'delegate'}
                      onClick={() => setStudentStatus(st.id, 'absent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'absent'
                          ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-700/80'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>غائب</span>
                    </button>

                    {/* Late */}
                    <button
                      type="button"
                      disabled={role !== 'delegate'}
                      onClick={() => setStudentStatus(st.id, 'late')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'late'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-700/80'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>متأخر</span>
                    </button>

                    {/* Excused */}
                    <button
                      type="button"
                      disabled={role !== 'delegate'}
                      onClick={() => setStudentStatus(st.id, 'excused')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        currentStatus === 'excused'
                          ? 'bg-blue-500 text-white font-black shadow-md shadow-blue-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-blue-400 border border-slate-700/80'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>بعذر</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
