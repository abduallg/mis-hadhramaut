import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveLectureWidget } from './components/LiveLectureWidget';
import { ScheduleView } from './components/ScheduleView';
import { AttendanceView } from './components/AttendanceView';
import { StudentsView } from './components/StudentsView';
import { ExamsView } from './components/ExamsView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { DelegateAuthModal } from './components/DelegateAuthModal';
import { 
  AppTab, 
  Lecture, 
  LiveLectureSession, 
  Student, 
  AttendanceRecord, 
  Exam, 
  Announcement, 
  BatchSettings 
} from './types';
import { 
  getStoredSettings, 
  saveStoredSettings,
  getStoredLectures, 
  saveStoredLectures,
  getStoredLiveSession, 
  saveStoredLiveSession,
  getStoredStudents, 
  saveStoredStudents,
  getStoredAttendance, 
  saveStoredAttendance,
  getStoredExams, 
  saveStoredExams,
  getStoredAnnouncements, 
  saveStoredAnnouncements,
  getStoredRole, 
  saveStoredRole,
  setDelegateAuthenticated,
  isDelegateAuthenticated 
} from './utils/storage';
import { AlertTriangle, MessageCircle, Heart, Sparkles, Lock, ShieldCheck } from 'lucide-react';

export default function App() {
  // Application states
  const [activeTab, setActiveTab] = useState<AppTab>('live');
  const [role, setRole] = useState<'delegate' | 'student'>('student');
  const [settings, setSettings] = useState<BatchSettings>(getStoredSettings);
  const [lectures, setLectures] = useState<Lecture[]>(getStoredLectures);
  const [liveSession, setLiveSession] = useState<LiveLectureSession | null>(getStoredLiveSession);
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(getStoredAttendance);
  const [exams, setExams] = useState<Exam[]>(getStoredExams);
  const [announcements, setAnnouncements] = useState<Announcement[]>(getStoredAnnouncements);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preselectedAttendanceSubject, setPreselectedAttendanceSubject] = useState<string>('');

  // Load stored role on mount (defaults to student for security)
  useEffect(() => {
    setRole(getStoredRole());
  }, []);

  // Secure Role Switchers
  const handleRequestDelegateLogin = () => {
    if (isDelegateAuthenticated()) {
      setRole('delegate');
      saveStoredRole('delegate');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setRole('delegate');
    saveStoredRole('delegate');
  };

  const handleLogoutDelegate = () => {
    setDelegateAuthenticated(false);
    setRole('student');
    saveStoredRole('student');
  };

  const handleSaveSettings = (newSettings: BatchSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleSaveLectures = (newLectures: Lecture[]) => {
    setLectures(newLectures);
    saveStoredLectures(newLectures);
  };

  const handleStartSession = (session: LiveLectureSession) => {
    setLiveSession(session);
    saveStoredLiveSession(session);
  };

  const handleEndSession = () => {
    setLiveSession(null);
    saveStoredLiveSession(null);
  };

  const handleTogglePauseSession = () => {
    if (!liveSession) return;
    const now = Date.now();
    if (liveSession.isPaused) {
      // Resume session
      const pauseDuration = now - (liveSession.pausedAt || now);
      const updated: LiveLectureSession = {
        ...liveSession,
        isPaused: false,
        pausedAt: undefined,
        targetEndTime: liveSession.targetEndTime + pauseDuration,
      };
      setLiveSession(updated);
      saveStoredLiveSession(updated);
    } else {
      // Pause session
      const updated: LiveLectureSession = {
        ...liveSession,
        isPaused: true,
        pausedAt: now,
      };
      setLiveSession(updated);
      saveStoredLiveSession(updated);
    }
  };

  const handleExtendSession = (additionalMinutes: number) => {
    if (!liveSession) return;
    const additionalMs = additionalMinutes * 60 * 1000;
    const updated: LiveLectureSession = {
      ...liveSession,
      durationMinutes: liveSession.durationMinutes + additionalMinutes,
      targetEndTime: liveSession.targetEndTime + additionalMs,
    };
    setLiveSession(updated);
    saveStoredLiveSession(updated);
  };

  const handleOpenAttendanceForLecture = (subjectTitle: string, doctorName?: string) => {
    setPreselectedAttendanceSubject(subjectTitle);
    setActiveTab('attendance');
  };

  const handleSaveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
  };

  const handleSaveAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords(newRecords);
    saveStoredAttendance(newRecords);
  };

  const handleSaveExams = (newExams: Exam[]) => {
    setExams(newExams);
    saveStoredExams(newExams);
  };

  const handleSaveAnnouncements = (newAnnouncements: Announcement[]) => {
    setAnnouncements(newAnnouncements);
    saveStoredAnnouncements(newAnnouncements);
  };

  const handleResetData = () => {
    setSettings(getStoredSettings());
    setLectures(getStoredLectures());
    setLiveSession(null);
    setStudents(getStoredStudents());
    setAttendanceRecords([]);
    setExams(getStoredExams());
    setAnnouncements(getStoredAnnouncements());
  };

  const urgentAnnouncements = announcements.filter(a => a.priority === 'urgent');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      
      {/* Urgent Announcement Alert Strip (if any) */}
      {urgentAnnouncements.length > 0 && (
        <aside 
          aria-label="تنبيهات عاجلة"
          className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 px-4 py-2 text-white text-xs font-semibold flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto overflow-hidden">
            <span className="px-2 py-0.5 rounded bg-rose-600 text-[10px] font-black uppercase tracking-wider animate-pulse">
              عاجل
            </span>
            <span className="truncate">
              <strong>{urgentAnnouncements[0].title}:</strong> {urgentAnnouncements[0].content}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('announcements')}
            className="text-[11px] underline hover:text-amber-200 shrink-0 font-bold"
          >
            عرض الكل
          </button>
        </aside>
      )}

      {/* Main App Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        liveSession={liveSession}
        role={role}
        onRequestDelegateLogin={handleRequestDelegateLogin}
        onLogoutDelegate={handleLogoutDelegate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        urgentAnnouncementsCount={urgentAnnouncements.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Role Helper Banner */}
        {role === 'student' && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>أنت تتصفح المنصة في <strong>وضع الطالب (اطلاع فقط)</strong>. يمكنك متابعة جدول المحاضرات، العد التنازلي، وتوقيت الاختبارات.</span>
            </div>
            <button
              onClick={handleRequestDelegateLogin}
              className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/40 font-bold transition cursor-pointer shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>دخول وضع المندوب (رمز سري)</span>
            </button>
          </div>
        )}

        {/* Tab 1: Live Lecture Counter & Start */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <LiveLectureWidget
              liveSession={liveSession}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              onTogglePauseSession={handleTogglePauseSession}
              onExtendSession={handleExtendSession}
              onOpenAttendanceForLecture={handleOpenAttendanceForLecture}
              onRequestDelegateLogin={handleRequestDelegateLogin}
              lectures={lectures}
              settings={settings}
              role={role}
            />

            {/* Quick schedule preview below the widget */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-300">نظرة سريعة على جدول اليوم</h3>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  عرض الجدول الأسبوعي الكامل ←
                </button>
              </div>
              <ScheduleView
                lectures={lectures}
                onSaveLectures={handleSaveLectures}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
                liveSession={liveSession}
                settings={settings}
                role={role}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Weekly Schedule */}
        {activeTab === 'schedule' && (
          <ScheduleView
            lectures={lectures}
            onSaveLectures={handleSaveLectures}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            liveSession={liveSession}
            settings={settings}
            role={role}
          />
        )}

        {/* Tab 3: Attendance Register */}
        {activeTab === 'attendance' && (
          <AttendanceView
            students={students}
            lectures={lectures}
            attendanceRecords={attendanceRecords}
            onSaveAttendanceRecords={handleSaveAttendance}
            liveSession={liveSession}
            settings={settings}
            role={role}
            preselectedSubject={preselectedAttendanceSubject}
          />
        )}

        {/* Tab 4: Students Directory */}
        {activeTab === 'students' && (
          <StudentsView
            students={students}
            onSaveStudents={handleSaveStudents}
            attendanceRecords={attendanceRecords}
            settings={settings}
            role={role}
          />
        )}

        {/* Tab 5: Exams & Assessment Timetable */}
        {activeTab === 'exams' && (
          <ExamsView
            exams={exams}
            onSaveExams={handleSaveExams}
            settings={settings}
            role={role}
          />
        )}

        {/* Tab 6: Announcements */}
        {activeTab === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            onSaveAnnouncements={handleSaveAnnouncements}
            settings={settings}
            role={role}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>منصة نظم معلومات إدارية (MIS)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{settings.batchName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>مندوب الدفعة: <strong>{settings.delegateName}</strong></span>
            {settings.delegatePhone && (
              <a 
                href={`https://wa.me/${settings.delegatePhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetData}
      />

      {/* Share to WhatsApp Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lectures={lectures}
        exams={exams}
        settings={settings}
      />

      {/* Delegate Passcode Authentication Modal */}
      <DelegateAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

    </div>
  );
}
