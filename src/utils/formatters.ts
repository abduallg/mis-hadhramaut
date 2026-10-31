import { DayOfWeek, LectureType, ExamType, AttendanceRecord, Student, Lecture, Exam } from '../types';

export const DAYS_ARABIC: Record<DayOfWeek, { label: string; short: string; order: number }> = {
  sunday: { label: 'الأحد', short: 'أحد', order: 0 },
  monday: { label: 'الإثنين', short: 'إثنين', order: 1 },
  tuesday: { label: 'الثلاثاء', short: 'ثلاثاء', order: 2 },
  wednesday: { label: 'الأربعاء', short: 'أربعاء', order: 3 },
  thursday: { label: 'الخميس', short: 'خميس', order: 4 },
  friday: { label: 'الجمعة', short: 'جمعة', order: 5 },
  saturday: { label: 'السبت', short: 'سبت', order: 6 },
};

export const ORDERED_DAYS: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const LECTURE_TYPES: Record<LectureType, { label: string; bg: string; text: string }> = {
  lecture: { label: 'محاضرة نظرية', bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/30', text: 'text-blue-400' },
  lab: { label: 'معمل / مختبر', bg: 'bg-teal-500/10 text-teal-400 border border-teal-500/30', text: 'text-teal-400' },
  section: { label: 'سكشن / تمارين', bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30', text: 'text-amber-400' },
  seminar: { label: 'ندوة / حلقة بحث', bg: 'bg-purple-500/10 text-purple-400 border border-purple-500/30', text: 'text-purple-400' },
};

export const EXAM_TYPES: Record<ExamType, { label: string; badge: string; color: string }> = {
  midterm: { label: 'اختبار نصفي (Midterm)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', color: 'rose' },
  final: { label: 'اختبار نهائي (Final)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', color: 'purple' },
  quiz: { label: 'كويز قصير (Quiz)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', color: 'amber' },
  practical: { label: 'اختبار عملي (Lab)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', color: 'cyan' },
  oral: { label: 'اختبار شفوي (Oral)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', color: 'emerald' },
};

export const getTodayDayOfWeek = (): DayOfWeek => {
  const dayIndex = new Date().getDay(); // 0 is Sunday
  const map: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return map[dayIndex];
};

export const formatArabicDate = (dateString: string): string => {
  try {
    const d = new Date(dateString + 'T00:00:00');
    return d.toLocaleDateString('ar-SA-u-ca-gregory', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * تحويل الوقت من نظام 24 ساعة (مثلاً 13:00) إلى نظام 12 ساعة (مثلاً 1:00 م)
 * مع إمكانية إضافة الوصف (ظهراً، عصراً، مساءً، صباحاً)
 */
export const formatTime12Hour = (timeStr: string, includeDescription: boolean = false): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const isPM = hours >= 12;
  const periodSymbol = isPM ? 'م' : 'ص';

  let periodDesc = '';
  if (includeDescription) {
    if (hours === 12 || (hours > 12 && hours < 15)) {
      periodDesc = 'ظهراً';
    } else if (hours >= 15 && hours < 18) {
      periodDesc = 'عصراً';
    } else if (hours >= 18 || hours < 4) {
      periodDesc = 'مساءً';
    } else {
      periodDesc = 'صباحاً';
    }
  }

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const formattedTime = `${hours}:${minutes} ${periodSymbol}`;
  return includeDescription && periodDesc ? `${formattedTime} (${periodDesc})` : formattedTime;
};

export const formatInterval12Hour = (startTime: string, endTime: string, includeDesc: boolean = false): string => {
  return `${formatTime12Hour(startTime, includeDesc)} إلى ${formatTime12Hour(endTime, includeDesc)}`;
};

export const formatDurationCountdown = (targetTimestamp: number): {
  isOver: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
} => {
  const diff = targetTimestamp - Date.now();
  if (diff <= 0) {
    return { isOver: true, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, formatted: '00:00' };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = hours > 0 
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;

  return {
    isOver: false,
    hours,
    minutes,
    seconds,
    totalSeconds,
    formatted,
  };
};

export const getExamCountdownDays = (examDateStr: string, startTime: string = '09:00'): {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
  statusText: string;
} => {
  try {
    const target = new Date(`${examDateStr}T${startTime}:00`).getTime();
    const diff = target - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isPast: true, statusText: 'انتهى موعد الاختبار' };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let statusText = '';
    if (days === 0 && hours === 0) {
      statusText = `خلال ${minutes} دقيقة!`;
    } else if (days === 0) {
      statusText = `اليوم (متبقي ${hours} ساعة)`;
    } else if (days === 1) {
      statusText = `غداً (متبقي ${days} يوم و ${hours} س)`;
    } else {
      statusText = `متبقي ${days} يوم`;
    }

    return { days, hours, minutes, isPast: false, statusText };
  } catch {
    return { days: 0, hours: 0, minutes: 0, isPast: false, statusText: '' };
  }
};

// WhatsApp Sharing Generators
export const generateDailyScheduleWhatsApp = (
  day: DayOfWeek, 
  lectures: Lecture[], 
  batchName: string, 
  delegateName: string
): string => {
  const dayName = DAYS_ARABIC[day].label;
  const todayLectures = lectures.filter(l => l.day === day);

  let text = `📅 *جدول محاضرات يوم (${dayName})*\n`;
  text += `🎓 *${batchName}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (todayLectures.length === 0) {
    text += `🎉 لا توجد محاضرات مقررة لهذا اليوم، إجازة سعيدة!\n`;
  } else {
    todayLectures.forEach((lec, idx) => {
      text += `📌 *${idx + 1}. ${lec.title}* ${lec.code ? `(${lec.code})` : ''}\n`;
      text += `👨‍🏫 الدكتور: ${lec.doctor}\n`;
      text += `⏰ التوقيت: من ${formatTime12Hour(lec.startTime, true)} إلى ${formatTime12Hour(lec.endTime, true)}\n`;
      text += `📍 القاعة: ${lec.hall}\n`;
      if (lec.isCancelled) {
        text += `⚠️ *تنبيه: المحاضرة ملغية (اعتذار الدكتور)*\n`;
      } else if (lec.isPostponed) {
        text += `⏳ *تنبيه: تم تأجيل موعد المحاضرة*\n`;
      }
      if (lec.notes) {
        text += `📝 ملاحظة: ${lec.notes}\n`;
      }
      text += `\n`;
    });
  }

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `✍️ مع تحيات مندوب الدفعة: ${delegateName}\n`;
  text += `✨ تم الإرسال عبر منصة تنظيم الدفعة الذكية`;
  return encodeURIComponent(text);
};

export const generateAttendanceWhatsApp = (
  record: AttendanceRecord,
  students: Student[],
  batchName: string,
  delegateName: string
): string => {
  const presentStudents: string[] = [];
  const absentStudents: string[] = [];
  const lateStudents: string[] = [];
  const excusedStudents: string[] = [];

  students.forEach(s => {
    const st = record.records[s.id] || 'absent';
    if (st === 'present') presentStudents.push(s.name);
    else if (st === 'absent') absentStudents.push(s.name);
    else if (st === 'late') lateStudents.push(s.name);
    else if (st === 'excused') excusedStudents.push(s.name);
  });

  const total = students.length;
  const presentCount = presentStudents.length;
  const absentCount = absentStudents.length;
  const lateCount = lateStudents.length;
  const excusedCount = excusedStudents.length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  let text = `📋 *كشف تفريغ الحضور والغياب*\n`;
  text += `📚 المادة: *${record.subjectTitle}*\n`;
  if (record.doctorName) text += `👨‍🏫 أستاذ المادة: ${record.doctorName}\n`;
  text += `📅 التاريخ: ${record.date}\n`;
  text += `🎓 الدفعة: ${batchName}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 *إحصائية الحضور:*\n`;
  text += `• إجمالي طلاب الدفعة: ${total}\n`;
  text += `• الحاضرون: ${presentCount} (نسبة الحضور: ${rate}%)\n`;
  text += `• الغائبون: ${absentCount}\n`;
  if (lateCount > 0) text += `• المتأخرون: ${lateCount}\n`;
  if (excusedCount > 0) text += `• بعذر مسبق: ${excusedCount}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (absentStudents.length > 0) {
    text += `❌ *قائمة الطلاب الغائبين (${absentCount}):*\n`;
    absentStudents.forEach((name, i) => {
      text += `${i + 1}. ${name}\n`;
    });
    text += `\n`;
  }

  if (lateStudents.length > 0) {
    text += `⏳ *قائمة المتأخرين (${lateCount}):*\n`;
    lateStudents.forEach((name, i) => {
      text += `${i + 1}. ${name}\n`;
    });
    text += `\n`;
  }

  if (excusedStudents.length > 0) {
    text += `📄 *قائمة أصحاب الأعذار (${excusedCount}):*\n`;
    excusedStudents.forEach((name, i) => {
      text += `${i + 1}. ${name}\n`;
    });
    text += `\n`;
  }

  text += `✍️ أعده مندوب الدفعة: ${delegateName}`;
  return encodeURIComponent(text);
};

export const generateExamsWhatsApp = (
  exams: Exam[],
  batchName: string,
  delegateName: string
): string => {
  let text = `🚨 *جدول ومواعيد اختبارات ${batchName}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  exams.forEach((ex, idx) => {
    const typeLabel = EXAM_TYPES[ex.type]?.label || ex.type;
    text += `📌 *${idx + 1}. ${ex.title}* [${typeLabel}]\n`;
    text += `📅 التاريخ: ${ex.date}\n`;
    text += `⏰ التوقيت: الساعة ${formatTime12Hour(ex.startTime, true)} (المدة: ${ex.durationMinutes} دقيقة)\n`;
    text += `📍 القاعة / اللجنة: ${ex.hall}\n`;
    text += `👨‍🏫 الدكتور: ${ex.doctor}\n`;
    if (ex.syllabusNotes) {
      text += `📖 المطلوب: ${ex.syllabusNotes}\n`;
    }
    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💡 *توجيهات مهمة:*\n`;
  text += `• الحضور قبل موعد الاختبار بربع ساعة على الأقل.\n`;
  text += `• إحضار البطاقة الجامعية والأدوات اللازمة.\n`;
  text += `• يمنع منعاً باتاً إدخال أجهزة الجوال والساعات الذكية داخل القاعة.\n\n`;
  text += `دعواتنا للجميع بالتوفيق والسداد 🤲\n`;
  text += `مندوب الدفعة: ${delegateName}`;
  return encodeURIComponent(text);
};
