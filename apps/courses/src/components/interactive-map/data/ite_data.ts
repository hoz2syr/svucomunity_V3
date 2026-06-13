import type { Course, Specialization, SpecializationId, CourseCode, TrackId } from '../types';

export const iteData = {
  meta: {
    title: 'أسبقيات مواد فرع الهندسة المعلوماتية ITE',
    university: 'SVU',
    published: '2025-08-01',
    term: '24F',
    source: 'هكرات مزنوقين',
    rules: {
      min_credits_per_term: 16,
      max_credits_per_term: 36,
      promotion_thresholds: [
        { year: 2, min_credits: 40 },
        { year: 3, min_credits: 100 },
        { year: 4, min_credits: 160 },
        { year: 5, min_credits: 220 }
      ],
      specialization_required_at_credits: 160,
      english_note: 'يجب ترفيع مستوى الإنجليزي قبل تسجيل المستوى التالي (ليس فقط تسجيله)',
      english_registration_credit: 1,
      english_completion_credit: 3,
      prerequisite_rule:
        'يكفي تسجيل الأسبقية (حتى لو رسب الطالب فيها) لفتح المادة التالية، ما عدا الإنجليزي'
    }
  },

  specializations: [
    { id: 'AI', name_ar: 'الذكاء الاصطناعي', tracks: ['ML', 'IS'] as TrackId[] },
    { id: 'SE', name_ar: 'هندسة البرمجيات', tracks: ['DS', 'SD'] as TrackId[] },
    { id: 'SCN', name_ar: 'النظم والشبكات الحاسوبية', tracks: ['CS', 'NS'] as TrackId[] }
  ],

  courses: {
    "BMA101": {
      code: "BMA101",
      name_ar: "مقدمة في الحوسبة",
      credits: 3,
      prereqs: [],
      year: 1,
      type: "core"
    },
    "BMA102": {
      code: "BMA102",
      name_ar: "البرمجة 1",
      credits: 3,
      prereqs: [],
      year: 1,
      type: "core"
    },
    "BMA103": {
      code: "BMA103",
      name_ar: "الرياضيات التطبيقية 1",
      credits: 3,
      prereqs: [],
      year: 1,
      type: "core"
    },
    "BMA104": {
      code: "BMA104",
      name_ar: "الفيزياء",
      credits: 3,
      prereqs: [],
      year: 1,
      type: "core"
    },
    "BMA105": {
      code: "BMA105",
      name_ar: "الإنجليزي 1",
      credits: 2,
      prereqs: [],
      year: 1,
      type: "english",
      english_must_pass: true
    },
    "BMA106": {
      code: "BMA106",
      name_ar: "البرمجة 2 (OOP)",
      credits: 3,
      prereqs: ["BMA102"],
      year: 1,
      type: "core"
    },
    "BMA107": {
      code: "BMA107",
      name_ar: "الرياضيات المتقطعة",
      credits: 3,
      prereqs: [],
      year: 1,
      type: "core"
    },
    "BMA108": {
      code: "BMA108",
      name_ar: "المنطق الرقمي",
      credits: 2,
      prereqs: [],
      year: 1,
      type: "core"
    },
    "BMA109": {
      code: "BMA109",
      name_ar: "الإنجليزي 2",
      credits: 2,
      prereqs: ["BMA105"],
      year: 1,
      type: "english",
      english_must_pass: true
    },
    "BMA110": {
      code: "BMA110",
      name_ar: "البرمجة الوظيفية",
      credits: 2,
      prereqs: ["BMA106"],
      year: 2,
      type: "core"
    },
    "BMA201": {
      code: "BMA201",
      name_ar: "هياكل البيانات",
      credits: 3,
      prereqs: ["BMA106"],
      year: 2,
      type: "core"
    },
    "BMA202": {
      code: "BMA202",
      name_ar: "تنظيم الحواسيب",
      credits: 3,
      prereqs: ["BMA108"],
      year: 2,
      type: "core"
    },
    "BMA203": {
      code: "BMA203",
      name_ar: "قواعد البيانات",
      credits: 3,
      prereqs: [],
      year: 2,
      type: "core"
    },
    "BMA204": {
      code: "BMA204",
      name_ar: "الإحصاء والاحتمالات",
      credits: 3,
      prereqs: ["BMA103"],
      year: 2,
      type: "core"
    },
    "BMA205": {
      code: "BMA205",
      name_ar: "هندسة البرمجيات 1",
      credits: 3,
      prereqs: ["BMA106"],
      year: 2,
      type: "core"
    },
    "BMA206": {
      code: "BMA206",
      name_ar: "أنظمة التشغيل",
      credits: 3,
      prereqs: ["BMA202"],
      year: 2,
      type: "core"
    },
    "BMA207": {
      code: "BMA207",
      name_ar: "شبكات الحاسوب 1",
      credits: 3,
      prereqs: ["BMA202"],
      year: 2,
      type: "core"
    },
    "BMA208": {
      code: "BMA208",
      name_ar: "الإنجليزي 3",
      credits: 2,
      prereqs: ["BMA109"],
      year: 2,
      type: "english",
      english_must_pass: true
    },
    "BMA301": {
      code: "BMA301",
      name_ar: "الذكاء الاصطناعي",
      credits: 3,
      prereqs: ["BMA201", "BMA204"],
      year: 3,
      type: "core"
    },
    "BMA302": {
      code: "BMA302",
      name_ar: "خوارزميات",
      credits: 3,
      prereqs: ["BMA201"],
      year: 3,
      type: "core"
    },
    "BMA303": {
      code: "BMA303",
      name_ar: "هندسة البرمجيات 2",
      credits: 3,
      prereqs: ["BMA205"],
      year: 3,
      type: "core"
    },
    "BMA304": {
      code: "BMA304",
      name_ar: "أمن المعلومات",
      credits: 3,
      prereqs: ["BMA207"],
      year: 3,
      type: "core"
    },
    "BMA305": {
      code: "BMA305",
      name_ar: "برمجة الويب",
      credits: 3,
      prereqs: ["BMA201", "BMA206"],
      year: 3,
      type: "core"
    },
    "BMA306": {
      code: "BMA306",
      name_ar: "التصميم الخوارزمي",
      credits: 2,
      prereqs: ["BMA302"],
      year: 3,
      type: "general"
    },
    "BMA401": {
      code: "BMA401",
      name_ar: "تعلم الآلة",
      credits: 3,
      prereqs: ["BMA301", "BMA204"],
      year: 4,
      type: "core"
    },
    "BMA402": {
      code: "BMA402",
      name_ar: "قواعد البيانات المتقدمة",
      credits: 3,
      prereqs: ["BMA203"],
      year: 4,
      type: "core"
    },
    "BMA403": {
      code: "BMA403",
      name_ar: "أمن السيبراني",
      credits: 3,
      prereqs: ["BMA304"],
      year: 4,
      type: "core"
    },
    "BMA404": {
      code: "BMA404",
      name_ar: "الحوسبة السحابية",
      credits: 3,
      prereqs: ["BMA206", "BMA207"],
      year: 4,
      type: "core"
    },
    "BMA405": {
      code: "BMA405",
      name_ar: "البيانات الضخمة",
      credits: 3,
      prereqs: ["BMA401", "BMA402"],
      year: 4,
      type: "core"
    },
    "BMA406": {
      code: "BMA406",
      name_ar: "الروبوتات",
      credits: 2,
      prereqs: ["BMA110", "BMA306"],
      year: 4,
      type: "project"
    },
    "BMA501": {
      code: "BMA501",
      name_ar: "مشروع تخرج 1",
      credits: 3,
      prereqs: ["BMA205", "BMA303"],
      year: 5,
      type: "project"
    },
    "BMA502": {
      code: "BMA502",
      name_ar: "مشروع تخرج 2",
      credits: 6,
      prereqs: ["BMA501"],
      year: 5,
      type: "project"
    },
    "BMA503": {
      code: "BMA503",
      name_ar: "التعلم العميق",
      credits: 3,
      prereqs: ["BMA401"],
      year: 5,
      type: "core"
    },
    "BMA504": {
      code: "BMA504",
      name_ar: "أمن الشبكات",
      credits: 3,
      prereqs: ["BMA304", "BMA207"],
      year: 5,
      type: "core"
    },
    "BMA505": {
      code: "BMA505",
      name_ar: "المعالجة الطبيعية للغة",
      credits: 3,
      prereqs: ["BMA401", "BMA106"],
      year: 5,
      type: "core"
    }
  } as Record<CourseCode, Course>,

  specialization_courses: {
    AI: {
      id: "AI",
      name_ar: "الذكاء الاصطناعي",
      prereqs_from_core: ["BMA301", "BMA204"],
      tracks: {
        ML: {
          id: "ML",
          name_ar: "تعلم الآلة",
          courses: {
            "SPC-ML-01": {
              code: "SPC-ML-01",
              name_ar: "تعلم عميق",
              credits: 3,
              prereqs: ["BMA401"]
            },
            "SPC-ML-02": {
              code: "SPC-ML-02",
              name_ar: "رؤية حاسوبية",
              credits: 3,
              prereqs: ["BMA401"]
            }
          }
        },
        IS: {
          id: "IS",
          name_ar: "أمن المعلومات",
          courses: {
            "SPC-IS-01": {
              code: "SPC-IS-01",
              name_ar: "أمن سيبراني متقدم",
              credits: 3,
              prereqs: ["BMA403", "BMA304"]
            }
          }
        }
      }
    },
    SE: {
      id: "SE",
      name_ar: "هندسة البرمجيات",
      prereqs_from_core: ["BMA205", "BMA203"],
      tracks: {
        DS: {
          id: "DS",
          name_ar: "علم البيانات",
          courses: {
            "SPC-DS-01": {
              code: "SPC-DS-01",
              name_ar: "تنقيب البيانات",
              credits: 3,
              prereqs: ["BMA401", "BMA203"]
            }
          }
        },
        SD: {
          id: "SD",
          name_ar: "تطوير البرمجيات",
          courses: {
            "SPC-SD-01": {
              code: "SPC-SD-01",
              name_ar: "هندسة برمجيات متقدمة",
              credits: 3,
              prereqs: ["BMA205", "BMA303"]
            }
          }
        }
      }
    },
    SCN: {
      id: "SCN",
      name_ar: "النظم والشبكات الحاسوبية",
      prereqs_from_core: ["BMA208", "BMA206", "BMA202"],
      tracks: {
        CS: {
          id: "CS",
          name_ar: "الأنظمة الحاسوبية",
          courses: {}
        },
        NS: {
          id: "NS",
          name_ar: "شبكات الحاسوب",
          courses: {
            "SPC-NS-01": {
              code: "SPC-NS-01",
              name_ar: "شبكات متقدمة",
              credits: 3,
              prereqs: ["BMA208", "BMA306"]
            }
          }
        }
      }
    }
  } as Record<SpecializationId, Specialization>
} as const;
