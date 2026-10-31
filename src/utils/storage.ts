import { 
  BatchSettings, 
  Lecture, 
  LiveLectureSession, 
  Student, 
  AttendanceRecord, 
  Exam, 
  Announcement 
} from '../types';
import { 
  initialSettings, 
  initialLectures, 
  initialStudents, 
  initialExams, 
  initialAnnouncements,
  DELEGATE_SECRET_PASSCODE 
} from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'batch_delegate_settings',
  LECTURES: 'batch_delegate_lectures',
  LIVE_SESSION: 'batch_delegate_live_session',
  STUDENTS: 'batch_delegate_students',
  ATTENDANCE: 'batch_delegate_attendance',
  EXAMS: 'batch_delegate_exams',
  ANNOUNCEMENTS: 'batch_delegate_announcements',
  ACTIVE_ROLE: 'batch_delegate_role',
  SCHEDULE_VER: 'batch_schedule_ver_v4',
  DELEGATE_AUTH: 'batch_delegate_auth_token'
};

// Auto sync new real schedule if version has updated
const ensureLatestDataVersion = () => {
  try {
    const currentVer = localStorage.getItem(STORAGE_KEYS.SCHEDULE_VER);
    if (currentVer !== 'v5_cleared_students') {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE_VER, 'v5_cleared_students');
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(initialLectures));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(initialExams));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initialAnnouncements));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    }
  } catch {
    // ignore
  }
};

ensureLatestDataVersion();

export const verifyDelegatePasscode = (code: string): boolean => {
  return code.trim() === DELEGATE_SECRET_PASSCODE;
};

export const isDelegateAuthenticated = (): boolean => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.DELEGATE_AUTH) === 'authenticated' ||
           localStorage.getItem(STORAGE_KEYS.DELEGATE_AUTH) === 'authenticated';
  } catch {
    return false;
  }
};

export const setDelegateAuthenticated = (authenticated: boolean) => {
  try {
    if (authenticated) {
      sessionStorage.setItem(STORAGE_KEYS.DELEGATE_AUTH, 'authenticated');
      localStorage.setItem(STORAGE_KEYS.DELEGATE_AUTH, 'authenticated');
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'delegate');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.DELEGATE_AUTH);
      localStorage.removeItem(STORAGE_KEYS.DELEGATE_AUTH);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'student');
    }
  } catch {
    // ignore
  }
};

export const getStoredSettings = (): BatchSettings => {
  try {
    ensureLatestDataVersion();
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : initialSettings;
  } catch {
    return initialSettings;
  }
};

export const saveStoredSettings = (settings: BatchSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getStoredLectures = (): Lecture[] => {
  try {
    ensureLatestDataVersion();
    const raw = localStorage.getItem(STORAGE_KEYS.LECTURES);
    return raw ? JSON.parse(raw) : initialLectures;
  } catch {
    return initialLectures;
  }
};

export const saveStoredLectures = (lectures: Lecture[]) => {
  localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lectures));
};

export const getStoredLiveSession = (): LiveLectureSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIVE_SESSION);
    if (!raw) return null;
    const session: LiveLectureSession = JSON.parse(raw);
    // If the lecture has already passed targetEndTime by more than 4 hours, auto expire
    if (session.isActive && Date.now() > session.targetEndTime + 4 * 60 * 60 * 1000) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const saveStoredLiveSession = (session: LiveLectureSession | null) => {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.LIVE_SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.LIVE_SESSION);
  }
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : initialStudents;
  } catch {
    return initialStudents;
  }
};

export const saveStoredStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredAttendance = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

export const getStoredExams = (): Exam[] => {
  try {
    ensureLatestDataVersion();
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return raw ? JSON.parse(raw) : initialExams;
  } catch {
    return initialExams;
  }
};

export const saveStoredExams = (exams: Exam[]) => {
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
};

export const getStoredAnnouncements = (): Announcement[] => {
  try {
    ensureLatestDataVersion();
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return raw ? JSON.parse(raw) : initialAnnouncements;
  } catch {
    return initialAnnouncements;
  }
};

export const saveStoredAnnouncements = (announcements: Announcement[]) => {
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
};

export const getStoredRole = (): 'delegate' | 'student' => {
  try {
    // If user has an active authenticated token, they can be in delegate mode
    if (isDelegateAuthenticated()) {
      const r = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
      return r === 'delegate' ? 'delegate' : 'student';
    }
    // Default to student for privacy and student viewing
    return 'student';
  } catch {
    return 'student';
  }
};

export const saveStoredRole = (role: 'delegate' | 'student') => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
};

export const exportAllDataJSON = () => {
  const data = {
    settings: getStoredSettings(),
    lectures: getStoredLectures(),
    students: getStoredStudents(),
    attendance: getStoredAttendance(),
    exams: getStoredExams(),
    announcements: getStoredAnnouncements(),
    exportDate: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `بيانات_مندوب_الدفعة_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const resetAllDataToDefault = () => {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.LECTURES);
  localStorage.removeItem(STORAGE_KEYS.LIVE_SESSION);
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.EXAMS);
  localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_VER);
  localStorage.removeItem(STORAGE_KEYS.DELEGATE_AUTH);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
  ensureLatestDataVersion();
};
