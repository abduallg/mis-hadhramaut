export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export type LectureType = 'lecture' | 'lab' | 'section' | 'seminar';

export interface Lecture {
  id: string;
  title: string;           // اسم المادة
  code?: string;           // كود المادة
  doctor: string;          // اسم الدكتور / المحاضر
  hall: string;            // القاعة / المدرج / المعمل
  day: DayOfWeek;          // يوم المحاضرة
  startTime: string;       // e.g. "08:30"
  endTime: string;         // e.g. "10:00"
  type: LectureType;       // نوع المحاضرة
  color?: string;          // لون مميز للكرت
  notes?: string;          // ملاحظات إضافية
  isCancelled?: boolean;   // ملغية
  isPostponed?: boolean;   // مؤجلة
  statusNotice?: string;   // إشعار خاص مثلاً "اعتذار الدكتور"
}

export interface LiveLectureSession {
  isActive: boolean;
  lectureId?: string | null;
  subjectTitle: string;
  doctorName: string;
  hall: string;
  startedAt: number;        // timestamp
  durationMinutes: number;  // مدة المحاضرة بالدقائق
  targetEndTime: number;    // timestamp
  isPaused?: boolean;
  pausedAt?: number;        // timestamp when paused
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  name: string;             // اسم الطالب ثلاثي أو رباعي
  universityId: string;     // الرقم الجامعي / الأكاديمي
  group: string;            // المجموعة / الشعبة / السكشن
  phone?: string;           // رقم الهاتف / واتساب
  email?: string;           // البريد الأكاديمي
  notes?: string;           // ملاحظات المندوب
}

export interface AttendanceRecord {
  id: string;
  date: string;             // YYYY-MM-DD
  lectureId?: string;
  subjectTitle: string;
  doctorName?: string;
  records: Record<string, AttendanceStatus>; // studentId -> status
  recordedAt: number;
  notes?: string;
}

export type ExamType = 'midterm' | 'final' | 'quiz' | 'practical' | 'oral';

export interface Exam {
  id: string;
  title: string;            // اسم المادة
  code?: string;            // كود المادة
  doctor: string;           // أستاذ المادة
  type: ExamType;           // نوع الاختبار
  date: string;             // YYYY-MM-DD
  startTime: string;        // "09:00"
  durationMinutes: number;  // مدة الاختبار بالدقائق مثلاً 90
  hall: string;             // القاعة / المدرج / أرقام اللجان
  syllabusNotes?: string;   // المقرر والمواضيع المطلوبة
  studyTopics?: { id: string; text: string; completed: boolean }[]; // قائمة مراجعة المذاكرة
  totalMarks?: number;      // درجة الاختبار
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'urgent' | 'important' | 'normal';
  category: 'lecture' | 'exam' | 'assignment' | 'general';
  author: string;
}

export interface BatchSettings {
  universityName: string;
  facultyName: string;      // الكلية
  departmentName: string;   // القسم / التخصص
  batchName: string;        // الدفعة (مثلاً: دفعة 2026 - المستوى الثالث)
  academicYear: string;     // العام الدراسي 2025/2026
  semester: string;         // الفصل الدراسي الثاني
  delegateName: string;     // اسم مندوب الدفعة
  delegatePhone: string;    // رقم واتساب المندوب
  groups: string[];         // المجموعات مثل ["المجموعة الأولى أ", "المجموعة الثانية ب"]
}

export type AppTab = 'live' | 'schedule' | 'attendance' | 'students' | 'exams' | 'announcements';
