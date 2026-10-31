import React from 'react';
import { 
  Radio, 
  Calendar, 
  ClipboardCheck, 
  Users, 
  GraduationCap, 
  Bell, 
  Settings, 
  ShieldCheck, 
  UserCheck,
  Share2
} from 'lucide-react';
import { AppTab, BatchSettings, LiveLectureSession } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  settings: BatchSettings;
  liveSession: LiveLectureSession | null;
  role: 'delegate' | 'student';
  onRequestDelegateLogin: () => void;
  onLogoutDelegate: () => void;
  onOpenSettings: () => void;
  onOpenShareModal: () => void;
  urgentAnnouncementsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  liveSession,
  role,
  onRequestDelegateLogin,
  onLogoutDelegate,
  onOpenSettings,
  onOpenShareModal,
  urgentAnnouncementsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Banner with University & Batch info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Cohort Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  منصة نظم معلومات إدارية
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {settings.batchName || 'نظم معلومات إدارية (MIS)'}
                </span>
                {liveSession?.isActive && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.universityName} • {settings.departmentName}
              </p>
            </div>
          </div>

          {/* Action controls: Live status indicator, Role switcher & Settings */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Live Lecture Quick Badge */}
            {liveSession?.isActive && (
              <button
                onClick={() => setActiveTab('live')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>محاضرة جارية الآن: <strong>{liveSession.subjectTitle}</strong></span>
              </button>
            )}

            {/* Share Modal Button */}
            <button
              onClick={onOpenShareModal}
              title="مشاركة الجداول والإحصائيات عبر واتساب"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">مشاركة لواتساب</span>
            </button>

            {/* Role Switcher Pill with Passcode Protection */}
            {role === 'delegate' ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>وضع المندوب (مفعل)</span>
                </span>
                <button
                  onClick={onLogoutDelegate}
                  title="قفل وضع المندوب والعودة لوضع الطالب لحماية الخصوصية"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  <span>قفل وخروج</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>وضع الطالب</span>
                </span>
                <button
                  onClick={onRequestDelegateLogin}
                  title="الدخول لوضع المندوب برمز المرور السري"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>دخول المندوب (رمز سري)</span>
                </button>
              </div>
            )}

            {/* Settings Button (Only visible for Delegate) */}
            {role === 'delegate' && (
              <button
                onClick={onOpenSettings}
                title="إعدادات الدفعة والبيانات"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-reverse space-x-1 py-1.5 min-w-max">
          
          {/* Tab 1: Live Lecture Counter */}
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'live'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className={`w-4 h-4 ${liveSession?.isActive ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>العد المباشر للمحاضرة</span>
            {liveSession?.isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* Tab 2: Lectures Schedule */}
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جدول المحاضرات</span>
          </button>

          {/* Tab 3: Attendance Register */}
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>سجل الحضور والغياب</span>
          </button>

          {/* Tab 4: Students Directory */}
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'students'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>طلاب الدفعة</span>
          </button>

          {/* Tab 5: Exams Schedule */}
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-rose-400" />
            <span>توقيت الاختبارات</span>
          </button>

          {/* Tab 6: Announcements */}
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer relative ${
              activeTab === 'announcements'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>الإعلانات والتنبيهات</span>
            {urgentAnnouncementsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

        </nav>
      </div>
    </header>
  );
};
