import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Share2, 
  Trash2, 
  AlertTriangle, 
  Tag, 
  Calendar, 
  User, 
  X,
  Megaphone
} from 'lucide-react';
import { Announcement, BatchSettings } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onSaveAnnouncements: (announcements: Announcement[]) => void;
  settings: BatchSettings;
  role: 'delegate' | 'student';
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onSaveAnnouncements,
  settings,
  role,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'important' | 'normal'>('important');
  const [category, setCategory] = useState<'lecture' | 'exam' | 'assignment' | 'general'>('general');

  const handleOpenAdd = () => {
    setTitle('');
    setContent('');
    setPriority('important');
    setCategory('general');
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().slice(0, 10),
      priority,
      category,
      author: settings.delegateName || 'مندوب الدفعة',
    };

    onSaveAnnouncements([newAnn, ...announcements]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      onSaveAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleShareWhatsApp = (ann: Announcement) => {
    let text = `📢 *إعلان هام لطلاب الدفعة (${settings.batchName})*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📌 *${ann.title}*\n\n`;
    text += `${ann.content}\n\n`;
    text += `📅 التاريخ: ${ann.date}\n`;
    text += `✍️ مرسل الإعلان: ${ann.author}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filtered = announcements.filter(a => 
    filterCategory === 'all' ? true : a.category === filterCategory
  );

  return (
    <div className="space-y-6">

      {/* Header Deck */}
      <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">لوحة إعلانات وتنبيهات المندوب</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              التبليغات الرسمية وتحديثات القاعات، التكاليف، والاعتذارات لجميع طلاب الدفعة
            </p>
          </div>

          {role === 'delegate' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نشر إعلان جديد للدفعة</span>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-700/60">
          {[
            { id: 'all', label: 'كل الإعلانات' },
            { id: 'lecture', label: 'المحاضرات والقاعات' },
            { id: 'exam', label: 'الاختبارات' },
            { id: 'assignment', label: 'التكاليف والمشاريع' },
            { id: 'general', label: 'إعلانات عامة' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterCategory === c.id
                  ? 'bg-amber-500 text-slate-900 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-12 text-center text-slate-400 space-y-3">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">لا توجد إعلانات منشورة حالياً</h3>
          <p className="text-xs">كن أول من ينشر تنبيهاً لطلاب الدفعة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ann => {
            const isUrgent = ann.priority === 'urgent';
            const isImportant = ann.priority === 'important';

            return (
              <div
                key={ann.id}
                className={`rounded-3xl p-5 shadow-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUrgent
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : isImportant
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-800/90 border-slate-700/80'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isUrgent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        عاجل جداً
                      </span>
                    )}
                    {isImportant && (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        تنبيه مهم
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">
                      📅 {ann.date}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      ✍️ {ann.author}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white">
                    {ann.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                  <button
                    onClick={() => handleShareWhatsApp(ann)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
                    title="مشاركة في قروب واتساب"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مشاركة</span>
                  </button>

                  {role === 'delegate' && (
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                      title="حذف الإعلان"
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

      {/* Add Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <span>نشر إعلان جديد لطلاب الدفعة</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  عنوان الإعلان <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تغيير قاعة المحاضرة، موعد تسليم المشروع..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    درجة الأهمية
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="urgent">🚨 عاجل جداً</option>
                    <option value="important">⚠️ تنبيه مهم</option>
                    <option value="normal">📌 إعلان عادي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    التصنيف
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="general">عام</option>
                    <option value="lecture">محاضرات وقاعات</option>
                    <option value="exam">اختبارات</option>
                    <option value="assignment">تكاليف ومشاريع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  نص وتفاصيل الإعلان <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب رسالتك لجميع زملاء الدفعة..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30"
                >
                  نشر الإعلان الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
