import { BatchSettings, Lecture, Student, Exam, Announcement } from '../types';

export const DELEGATE_SECRET_PASSCODE = '12345678900';

export const initialSettings: BatchSettings = {
  universityName: 'كلية العلوم الإدارية والإنسانية / جامعة العلوم والتكنولوجيا',
  facultyName: 'كلية العلوم الإدارية',
  departmentName: 'قسم نظم المعلومات الإدارية (MIS)',
  batchName: 'دفعة نظم معلومات إدارية',
  academicYear: '1447 / 2026 هـ',
  semester: 'الفصل الدراسي الأول',
  delegateName: 'مندوب دفعة نظم المعلومات الإدارية',
  delegatePhone: '',
  groups: ['شعبة نظم المعلومات الإدارية', 'المجموعة (أ) - قاعة البيئة', 'مختبر الحاسوب 2']
};

export const initialLectures: Lecture[] = [
  // --- يوم الأحد ---
  {
    id: 'lec-sun-1',
    title: 'رياضيات',
    code: 'MATH 101',
    doctor: 'د. منير',
    hall: 'قاعة البيئة',
    day: 'sunday',
    startTime: '13:00',
    endTime: '16:00',
    type: 'lecture',
    color: 'from-blue-600 to-indigo-600',
    notes: 'المحاضرة الأولى ليوم الأحد من 1:00 ظهراً إلى 4:00 عصراً'
  },
  {
    id: 'lec-sun-2',
    title: 'اللغة العربية',
    code: 'ARAB 101',
    doctor: 'أ. محمد عرم',
    hall: 'القاعة الكبرى',
    day: 'sunday',
    startTime: '16:00',
    endTime: '18:00',
    type: 'lecture',
    color: 'from-emerald-600 to-teal-600',
    notes: 'المحاضرة الثانية ليوم الأحد في القاعة الكبرى من 4:00 عصراً إلى 6:00 مساءً'
  },

  // --- يوم الإثنين ---
  {
    id: 'lec-mon-1',
    title: 'مبادئ المحاسبة (تمارين)',
    code: 'ACCT 101-S',
    doctor: 'المعيدة د. فاطمة',
    hall: 'قاعة البيئة',
    day: 'monday',
    startTime: '12:30',
    endTime: '13:30',
    type: 'section',
    color: 'from-cyan-600 to-blue-700',
    notes: 'سكشن تمارين مبادئ المحاسبة من 12:30 ظهراً إلى 1:30 ظهراً'
  },
  {
    id: 'lec-mon-2',
    title: 'مبادئ المحاسبة (نظري)',
    code: 'ACCT 101',
    doctor: 'د. خالد هاشم',
    hall: 'قاعة البيئة',
    day: 'monday',
    startTime: '13:30',
    endTime: '16:00',
    type: 'lecture',
    color: 'from-teal-600 to-emerald-700',
    notes: 'المحاضرة النظرية لمبادئ المحاسبة من 1:30 ظهراً إلى 4:00 عصراً'
  },
  {
    id: 'lec-mon-3',
    title: 'مبادئ الإدارة',
    code: 'MGMT 101',
    doctor: 'أ. زينة',
    hall: 'قاعة البيئة',
    day: 'monday',
    startTime: '16:00',
    endTime: '18:00',
    type: 'lecture',
    color: 'from-purple-600 to-violet-700',
    notes: 'محاضرة مبادئ الإدارة من 4:00 عصراً إلى 6:00 مساءً'
  },

  // --- يوم الثلاثاء ---
  {
    id: 'lec-tue-1',
    title: 'الاقتصاد الجزئي',
    code: 'ECON 101',
    doctor: 'د. صفاء باحمران',
    hall: 'قاعة البيئة',
    day: 'tuesday',
    startTime: '13:00',
    endTime: '15:00',
    type: 'lecture',
    color: 'from-amber-600 to-orange-600',
    notes: 'محاضرة الاقتصاد الجزئي من 1:00 ظهراً إلى 3:00 عصراً'
  },
  {
    id: 'lec-tue-2',
    title: 'الثقافة الإسلامية',
    code: 'ISLM 101',
    doctor: 'د. أحمد النشمي',
    hall: 'قاعة البيئة',
    day: 'tuesday',
    startTime: '15:30',
    endTime: '16:30',
    type: 'lecture',
    color: 'from-emerald-700 to-teal-800',
    notes: 'محاضرة الثقافة الإسلامية من 3:30 عصراً إلى 4:30 عصراً'
  },
  {
    id: 'lec-tue-3',
    title: 'تمارين رياضيات (معيد)',
    code: 'MATH 101-S',
    doctor: 'معيد الرياضيات',
    hall: 'قاعة الوسائل',
    day: 'tuesday',
    startTime: '16:30',
    endTime: '17:00',
    type: 'section',
    color: 'from-blue-600 to-cyan-600',
    notes: 'سكشن تمارين ومسائل الرياضيات في قاعة الوسائل من 4:30 عصراً إلى 5:00 مساءً'
  },

  // --- يوم الأربعاء ---
  {
    id: 'lec-wed-1',
    title: 'مهارات الحاسوب',
    code: 'COMP 101',
    doctor: 'أ. أحمد',
    hall: 'مختبر رقم 2',
    day: 'wednesday',
    startTime: '13:00',
    endTime: '16:00',
    type: 'lab',
    color: 'from-indigo-600 to-violet-700',
    notes: 'محاضرة وتطبيق عملي لمادة مهارات الحاسوب في مختبر رقم 2 من 1:00 ظهراً إلى 4:00 عصراً'
  },
  {
    id: 'lec-wed-2',
    title: 'اللغة الإنجليزية',
    code: 'ENG 101',
    doctor: 'م. إيمان',
    hall: 'قاعة البيئة',
    day: 'wednesday',
    startTime: '16:00',
    endTime: '17:00',
    type: 'lecture',
    color: 'from-rose-600 to-pink-600',
    notes: 'محاضرة اللغة الإنجليزية من 4:00 عصراً إلى 5:00 عصراً في قاعة البيئة'
  }
];

export const initialStudents: Student[] = [];

export const initialExams: Exam[] = [
  {
    id: 'ex-1',
    title: 'رياضيات',
    code: 'MATH 101',
    doctor: 'د. منير',
    type: 'midterm',
    date: '2026-11-15',
    startTime: '13:00',
    durationMinutes: 90,
    hall: 'قاعة البيئة',
    syllabusNotes: 'المقرر: المصفوفات والمحددات، الدوال والنهايات، والتفاضل والتكامل الأساسي.',
    studyTopics: [
      { id: 't1', text: 'المصفوفات وطرائق جمعها وضربها وإيجاد المقلوب', completed: false },
      { id: 't2', text: 'حل المعادلات الخطية بطريقة كرامر', completed: false },
      { id: 't3', text: 'قواعد الاشتقاق والتفاضل وتطبيقاتها في الإدارة', completed: false }
    ],
    totalMarks: 30
  },
  {
    id: 'ex-2',
    title: 'مبادئ المحاسبة',
    code: 'ACCT 101',
    doctor: 'د. خالد هاشم',
    type: 'midterm',
    date: '2026-11-18',
    startTime: '13:30',
    durationMinutes: 90,
    hall: 'قاعة البيئة',
    syllabusNotes: 'المقرر: معادلة الميزانية، قيود اليومية، دفتر الأستاذ، وميزان المراجعة.',
    studyTopics: [
      { id: 't4', text: 'معادلة المحاسبة الأساسية: الأصول = الخصوم + حقوق الملكية', completed: false },
      { id: 't5', text: 'تسجيل العمليات المالية في دفتر اليومية وقاعدة القيد المزدوج', completed: false },
      { id: 't6', text: 'الترحيل إلى دفتر الأستاذ وترصيد الحسابات', completed: false }
    ],
    totalMarks: 30
  },
  {
    id: 'ex-3',
    title: 'الاقتصاد الجزئي',
    code: 'ECON 101',
    doctor: 'د. صفاء باحمران',
    type: 'midterm',
    date: '2026-11-22',
    startTime: '13:00',
    durationMinutes: 75,
    hall: 'قاعة البيئة',
    syllabusNotes: 'المقرر: نظرية العرض والطلب، توازن السوق، ومرونات الطلب والعرض.',
    studyTopics: [
      { id: 't7', text: 'قانون الطلب وقانون العرض ومحددات كل منهما', completed: false },
      { id: 't8', text: 'حساب مرونة الطلب السعرية وتفسير نتائجها', completed: false },
      { id: 't9', text: 'توازن السوق وحالات فائض الطلب وفائض العرض', completed: false }
    ],
    totalMarks: 25
  },
  {
    id: 'ex-4',
    title: 'مبادئ الإدارة',
    code: 'MGMT 101',
    doctor: 'أ. زينة',
    type: 'midterm',
    date: '2026-11-25',
    startTime: '16:00',
    durationMinutes: 60,
    hall: 'قاعة البيئة',
    syllabusNotes: 'المقرر: وظائف الإدارة الأربعة (التخطيط، التنظيم، التوجيه، والرقابة).',
    studyTopics: [
      { id: 't10', text: 'مفهوم الإدارة والمهارات الإدارية في المستويات المختلفة', completed: false },
      { id: 't11', text: 'عملية التخطيط ووضع الأهداف الاستراتيجية', completed: false }
    ],
    totalMarks: 20
  },
  {
    id: 'ex-5',
    title: 'مهارات الحاسوب (عملي)',
    code: 'COMP 101',
    doctor: 'أ. أحمد',
    type: 'practical',
    date: '2026-11-29',
    startTime: '13:00',
    durationMinutes: 60,
    hall: 'مختبر رقم 2',
    syllabusNotes: 'تطبيق عملي على جداول البيانات Excel، وتنسيق المستندات Word.',
    studyTopics: [
      { id: 't12', text: 'الدوال الحسابية في Excel (SUM, AVERAGE, IF, VLOOKUP)', completed: false },
      { id: 't13', text: 'الرسوم البيانية وتنسيق الجداول الإلكترونية', completed: false }
    ],
    totalMarks: 15
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'جدول المحاضرات الرسمي المعتمد لدفعة نظم المعلومات الإدارية',
    content: 'أهلاً بكم زملائي وزميلاتي في منصة الدفعة، تم إدراج الجدول الأسبوعي الرسمي:\n- الأحد: رياضيات (د. منير) + لغة عربية (أ. محمد عرم)\n- الإثنين: تمارين محاسبة (د. فاطمة) + محاسبة نظري (د. خالد هاشم) + مبادئ إدارة (أ. زينة)\n- الثلاثاء: اقتصاد جزئي (د. صفاء باحمران) + ثقافة إسلامية (د. أحمد النشمي) + تمارين رياضيات في قاعة الوسائل\n- الأربعاء: مهارات حاسوب (أ. أحمد) في مختبر 2 + لغة إنجليزية (م. إيمان)\n- الخميس والجمعة والسبت: إجازة أسبوعية.',
    date: '2026-10-30',
    priority: 'urgent',
    category: 'lecture',
    author: 'مندوب الدفعة'
  },
  {
    id: 'ann-2',
    title: 'تنبيه: قاعات المحاضرات',
    content: 'يرجى الانتباه إلى أن معظم المحاضرات في قاعة البيئة، عدا مادة اللغة العربية في القاعة الكبرى، وتمارين الرياضيات الثلاثاء في قاعة الوسائل، ومعمل مهارات الحاسوب في مختبر رقم 2.',
    date: '2026-10-30',
    priority: 'important',
    category: 'lecture',
    author: 'مندوب الدفعة'
  }
];
