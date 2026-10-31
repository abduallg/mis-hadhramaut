import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  GraduationCap, 
  Building2, 
  UserCheck 
} from 'lucide-react';
import { BatchSettings } from '../types';
import { exportAllDataJSON, resetAllDataToDefault } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BatchSettings;
  onSaveSettings: (settings: BatchSettings) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [universityName, setUniversityName] = useState(settings.universityName);
  const [facultyName, setFacultyName] = useState(settings.facultyName);
  const [departmentName, setDepartmentName] = useState(settings.departmentName);
  const [batchName, setBatchName] = useState(settings.batchName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [semester, setSemester] = useState(settings.semester);
  const [delegateName, setDelegateName] = useState(settings.delegateName);
  const [delegatePhone, setDelegatePhone] = useState(settings.delegatePhone);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      universityName: universityName.trim(),
      facultyName: facultyName.trim(),
      departmentName: departmentName.trim(),
      batchName: batchName.trim(),
      academicYear: academicYear.trim(),
      semester: semester.trim(),
      delegateName: delegateName.trim(),
      delegatePhone: delegatePhone.trim(),
    });
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('هل تريد استعادة البيانات الافتراضية الأولية؟ سيتم مسح أي تعديلات غير محفوظة.')) {
      resetAllDataToDefault();
      onResetData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>إعدادات الدفعة وبيانات المندوب</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>بيانات الجامعة والكلية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم الجامعة
                </label>
                <input
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم الكلية
                </label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  القسم / التخصص الأكاديمي
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم الدفعة / المستوى
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  العام الأكاديمي
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الفصل الدراسي
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-700/60">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>بيانات مندوب الدفعة (المنسق)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المندوب
                </label>
                <input
                  type="text"
                  value={delegateName}
                  onChange={(e) => setDelegateName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رقم جوال / واتساب المندوب
                </label>
                <input
                  type="text"
                  value={delegatePhone}
                  onChange={(e) => setDelegatePhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Backup & Restore Data section */}
          <div className="pt-3 border-t border-slate-700/60 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">
              النسخ الاحتياطي والبيانات:
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportAllDataJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة البيانات الافتراضية</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
