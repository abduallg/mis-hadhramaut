import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Upload, 
  Search, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Student, AttendanceRecord, BatchSettings } from '../types';

interface StudentsViewProps {
  students: Student[];
  onSaveStudents: (students: Student[]) => void;
  attendanceRecords: AttendanceRecord[];
  settings: BatchSettings;
  role: 'delegate' | 'student';
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onSaveStudents,
  attendanceRecords,
  settings,
  role,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  // Add / Edit Single Student Modal
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [name, setName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [group, setGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Bulk Import Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkGroup, setBulkGroup] = useState('المجموعة (أ) - القاعة الرئيسية');
  const [bulkIdPrefix, setBulkIdPrefix] = useState('4410123');

  // Open single modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setUniversityId(`441${Math.floor(100000 + Math.random() * 900000)}`);
    setGroup(settings.groups[0] || 'المجموعة (أ)');
    setPhone('');
    setEmail('');
    setNotes('');
    setIsSingleModalOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setName(st.name);
    setUniversityId(st.universityId);
    setGroup(st.group);
    setPhone(st.phone || '');
    setEmail(st.email || '');
    setNotes(st.notes || '');
    setIsSingleModalOpen(true);
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStudent) {
      const updated = students.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name: name.trim(),
            universityId: universityId.trim() || s.universityId,
            group: group.trim() || 'عامة',
            phone: phone.trim(),
            email: email.trim(),
            notes: notes.trim(),
          };
        }
        return s;
      });
      onSaveStudents(updated);
    } else {
      const newSt: Student = {
        id: 'st-' + Date.now(),
        name: name.trim(),
        universityId: universityId.trim() || `441${Math.floor(100000 + Math.random() * 900000)}`,
        group: group.trim() || 'المجموعة (أ)',
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
      };
      onSaveStudents([...students, newSt]);
    }

    setIsSingleModalOpen(false);
  };

  const handleDelete = (id: string, stName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الطالب "${stName}" من سجل الدفعة؟`)) {
      onSaveStudents(students.filter(s => s.id !== id));
    }
  };

  // Bulk Import parser
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const newStudents: Student[] = [];

    lines.forEach((line, index) => {
      // Check if line contains comma or tab for Name, ID, Phone
      const parts = line.split(/[,\t|]/).map(p => p.trim());
      const parsedName = parts[0];
      const parsedId = parts[1] || `${bulkIdPrefix}${String(students.length + index + 1).padStart(3, '0')}`;
      const parsedPhone = parts[2] || '';

      if (parsedName) {
        newStudents.push({
          id: 'st-' + (Date.now() + index),
          name: parsedName,
          universityId: parsedId,
          group: bulkGroup,
          phone: parsedPhone,
        });
      }
    });

    onSaveStudents([...students, ...newStudents]);
    setBulkText('');
    setIsBulkModalOpen(false);
  };

  // Calculate cumulative stats for each student across all saved records
  const getStudentStats = (studentId: string) => {
    let attended = 0;
    let absent = 0;
    let total = 0;

    attendanceRecords.forEach(rec => {
      const st = rec.records[studentId];
      if (st) {
        total++;
        if (st === 'present' || st === 'late') attended++;
        if (st === 'absent') absent++;
      }
    });

    const rate = total > 0 ? Math.round((attended / total) * 100) : 100;
    const isAtRisk = absent >= 3; // Deprivation warning

    return { attended, absent, total, rate, isAtRisk };
  };

  // Export roster to CSV
  const exportCSV = () => {
    let csv = '\uFEFFالاسم,الرقم الجامعي,المجموعة,رقم الهاتف,البريد الأكاديمي\n';
    students.forEach(s => {
      csv += `"${s.name}","${s.universityId}","${s.group}","${s.phone || ''}","${s.email || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `طلاب_${settings.batchName}.csv`;
    link.click();
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    if (groupFilter !== 'all' && s.group !== groupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = s.universityId.toLowerCase().includes(q);
      const matchPhone = s.phone?.includes(q) || false;
      if (!matchName && !matchId && !matchPhone) return false;
    }
    return true;
  });

  const groupsList = Array.from(new Set(students.map(s => s.group))).filter(Boolean);

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">سجل طلاب الدفعة بالكامل</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              إجمالي المسجلين: <strong className="text-emerald-400">{students.length}</strong> طالب • إدارة بيانات الطلاب والتواصل وتنبيهات الحرمان
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="تصدير كشف الطلاب إلى ملف Excel / CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تصدير Excel/CSV</span>
            </button>

            {role === 'delegate' && (
              <>
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  title="إضافة قائمة أسماء دفعة واحدة بنسخ ولصق"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>إضافة جماعية (نسخ ولصق)</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة طالب جديد</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-700/60">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الرقم الجامعي، أو رقم الجوال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {groupsList.length > 0 && (
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">كل المجموعات ({students.length})</option>
              {groupsList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Students List Cards or Empty States */}
      {students.length === 0 ? (
        <div className="bg-slate-800/60 rounded-3xl border border-slate-700/80 p-8 sm:p-12 text-center text-slate-300 space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">سجل طلاب الدفعة فارغ وجاهز لإضافة الطلاب</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              تم حذف الأسماء السابقة بالكامل بنجاح. بصفتك مندوب الدفعة، يمكنك الآن البدء بإضافة طلاب دفعتك الحقيقيين، إما بنسخ ولصق قائمة الأسماء دفعة واحدة من قروب الواتساب أو إدخالهم طالباً طالباً.
            </p>
          </div>
          {role === 'delegate' ? (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition"
              >
                <Upload className="w-4 h-4" />
                <span>إضافة جماعية (نسخ ولصق قائمة الأسماء)</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة طالب فردي</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 pt-2">
              (سوف يقوم مندوب الدفعة بإدراج قائمة الطلاب قريباً)
            </p>
          )}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-10 text-center text-slate-400 text-xs">
          لا يوجد طلاب مطابقين لمعايير البحث الحالية
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st, idx) => {
            const stats = getStudentStats(st.id);

          return (
            <div
              key={st.id}
              className={`rounded-3xl bg-slate-800/90 border p-5 shadow-lg flex flex-col justify-between transition hover:border-slate-600 ${
                stats.isAtRisk ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-700/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 text-xs font-mono flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
                      {st.name}
                    </h3>
                  </div>

                  {st.group && (
                    <span className="text-[10px] bg-slate-900 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      {st.group}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5 font-mono text-slate-300">
                    <span className="text-slate-500 text-[11px]">الرقم الأكاديمي:</span>
                    <span className="font-bold text-emerald-400">{st.universityId}</span>
                  </div>

                  {st.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <a 
                        href={`https://wa.me/${st.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-cyan-400"
                        title="محادثة واتساب"
                      >
                        {st.phone}
                      </a>
                    </div>
                  )}

                  {st.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{st.email}</span>
                    </div>
                  )}
                </div>

                {/* Cumulative Attendance Summary if records exist */}
                {attendanceRecords.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">إجمالي الغياب:</span>
                      <span className={`font-bold ${stats.absent > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {stats.absent} مرات
                      </span>
                    </div>

                    {stats.isAtRisk && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>إنذار حرمان</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Delegate Actions */}
              {role === 'delegate' && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                    title="تعديل بيانات الطالب"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(st.id, st.name)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                    title="حذف الطالب من الدفعة"
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

      {/* Add / Edit Single Student Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد للدفعة'}</span>
              </h3>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم الرباعي أو الثلاثي <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد العزيز بن فيصل السبيعي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الرقم الجامعي / الأكاديمي
                  </label>
                  <input
                    type="text"
                    placeholder="441000000"
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    المجموعة / الشعبة
                  </label>
                  <input
                    type="text"
                    placeholder="المجموعة (أ)"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الجوال / واتساب
                  </label>
                  <input
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    البريد الأكاديمي
                  </label>
                  <input
                    type="email"
                    placeholder="name@uni.edu.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ملاحظات المندوب (حالة خاصة / عذر صحي...)
                </label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل إضافية..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span>إضافة جماعية لطلاب الدفعة (لصق قائمة)</span>
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              انسخ أسماء الطلاب من الواتساب أو الإكسل وضعها هنا (كل طالب في سطر مستقل). يمكنك أيضاً كتابة:
              <br />
              <code className="text-emerald-400 bg-slate-900 px-2 py-0.5 rounded text-[11px]">
                الاسم، الرقم الجامعي، رقم الجوال
              </code>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المجموعة / الشعبة التلقائية لهؤلاء الطلاب:
                </label>
                <input
                  type="text"
                  value={bulkGroup}
                  onChange={(e) => setBulkGroup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  قائمة الأسماء:
                </label>
                <textarea
                  rows={8}
                  placeholder={`محمد بن فهد العتيبي
عبد الله بن ناصر القحطاني
سعود بن خالد الشمري
ريان بن صالح العنزي`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <span className="text-xs text-slate-400">
                عدد الأسطر: {bulkText.split('\n').filter(l => l.trim()).length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={!bulkText.trim()}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
                >
                  استيراد وإضافة الكل الآن 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
