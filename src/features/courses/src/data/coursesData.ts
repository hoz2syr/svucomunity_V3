import type { Course } from '../types';

export const defaultInfo = {
  over: 'لم يتوفر شرح مفصل لها حالياً.',
  doc: 'غير متوفر حالياً.',
  prac: 'غير متوفر حالياً.',
  exam: 'غير متوفر حالياً.',
};

export const yearNames: Record<number, string> = {
  1: 'السنة الأولى',
  2: 'السنة الثانية',
  3: 'السنة الثالثة',
  4: 'السنة الرابعة',
  5: 'السنة الخامسة',
};

export const promotionThresholds = [
  { name: 'الثانية', credits: 40 },
  { name: 'الثالثة', credits: 100 },
  { name: 'الرابعة', credits: 160 },
  { name: 'الخامسة', credits: 220 },
  { name: 'التخرج', credits: 260 },
] as const;

export const coursesDB: Record<string, Course> = {
  GCS301: { name: 'مهارات حاسوب', credits: 4, level: 1, prereqs: [], diff: 1, icon: 'Monitor', info: { over: 'مادة سهلة جداً تتحدث عن أساسيات الكمبيوتر.', doc: 'د. محمد الحبال.', prac: 'تطبيق عملي على Excel و Word.', exam: 'سهل جداً، مادة مضمونة لرفع المعدل غالبا 50 سؤال.' } },
  GTW301: { name: 'مهارات التواصل', credits: 5, level: 1, prereqs: ['GCS301'], diff: 1, icon: 'MessageSquare', info: { over: 'معلومات عامة ومنطقية. مادة سهلة.', doc: 'الجميع جيد.', prac: 'سيرة ذاتية وعرض تقديمي.', exam: 'بسيط ودورات.' } },
  GOE301: { name: 'التعليم الالكتروني', credits: 4, level: 1, prereqs: [], diff: 1, icon: 'GraduationCap', info: { over: 'مادة نظرية تعتمد على الفهم وليس البصم.', doc: 'جميع الدكاترة جيدين.', prac: 'ملف وورد (حلقة بحث) + عرض بوربوينت.', exam: 'سهل ويمكن الحصول على علامة عالية.' } },
  BPH401: { name: 'الفيزياء', credits: 5, level: 1, prereqs: [], diff: 2, icon: 'Atom', info: { over: 'مادة تشبه فيزياء البكالوريا مع بعض الإضافات.', doc: 'د. باسم السهو، د. محمد سعيد معروف.', prac: 'سهلة ومضمونة مسائل.', exam: 'أسئلة مألوفة، تحتاج دراسة وفهم للقوانين.' } },
  BMA401: { name: 'التحليل 1', credits: 5, level: 1, prereqs: [], diff: 2, icon: 'Calculator', info: { over: 'مادة سهلة وبسيطة تشبه البكالوريا، لكن قسم المتسلسلات جديد.', doc: 'د. عمار مردم بك، د. شكري.', prac: 'متوسطة الصعوبة.', exam: 'يحتاج متابعة، 20 سؤال.' } },
  BAS401: { name: 'بنى جبرية', credits: 5, level: 1, prereqs: [], diff: 3, icon: 'Binary', info: { over: 'مادة دسمة وصعبة نوعاً ما، تحتاج متابعة دقيقة.', doc: 'د. حيان، د. نضال، د. سلافة.', prac: 'صعبة، مجموعات كبيرة.', exam: 'يحتاج دراسة معمقة.' } },
  BPG401: { name: 'برمجة 1', credits: 5, level: 1, prereqs: [], diff: 2, icon: 'Code2', info: { over: 'أساسيات لغة C.', doc: 'د. حسام فوال.', prac: 'تتشابه كل فصل، كانت فردية وأصبحت مشتركة.', exam: 'يعتمد على الفهم والتطبيق العملي.' } },

  BEC401: { name: 'دارات إلكترونية', credits: 5, level: 2, prereqs: ['BPH401'], diff: 2, icon: 'CircuitBoard', info: { over: 'تتمة للفيزياء. تعتمد كثيراً على الدورات.', doc: 'د. أميمة.', prac: 'سهلة مسائل العلامة 100% مضمونة.', exam: '19 سؤال نظري + 1 مقالي.' } },
  BLA401: { name: 'جبر خطي 1', credits: 5, level: 2, prereqs: ['BMA401'], diff: 1, icon: 'Calculator', info: { over: 'تتمحور حول المصفوفات والعمليات عليها.', doc: 'د. عمران.', prac: 'اختر إجابة صحيحة بملف إكسل.', exam: 'سهلة مو دايما دورات بس مألوفة.' } },
  BMA402: { name: 'التحليل 2', credits: 5, level: 2, prereqs: ['BMA401'], diff: 2, icon: 'Calculator', info: { over: 'سهلة بدها تركيز. (لابلاس، فورييه).', doc: 'د. برلنت مطيط، د. إياد زعرور.', prac: 'سهلة جداً، اختيار إجابة صحيحة.', exam: 'أسئلة دورات مكررة.' } },
  BLC401: { name: 'دارات منطقية', credits: 5, level: 2, prereqs: ['BAS401'], diff: 1, icon: 'Cpu', info: { over: 'جداول حقيقة وبوابات منطقية.', doc: 'د. لؤي.', prac: 'عادة وسهلين.', exam: 'دورات اغلب الاحيان.' } },
  BPG402: { name: 'برمجة 2', credits: 5, level: 2, prereqs: ['BPG401'], diff: 2, icon: 'Code2', info: { over: 'الواجهات التخاطبية (GUI).', doc: 'د. حسام فوال، د. جميل.', prac: 'مشاريع واجهات.', exam: 'سهل ويأتي نسبة جيدة من الدورات.' } },
  BDM501: { name: 'الرياضيات المتقطعة', credits: 5, level: 2, prereqs: ['BLC401'], diff: 2, icon: 'Calculator', info: { over: 'جبر بولياني واشجار.', doc: 'د. محسن.', prac: 'حلقة بحث وعرض بوربوينت.', exam: 'اسئلة دورات.' } },
  BCA501: { name: 'بنيان حواسيب 1', credits: 6, level: 2, prereqs: ['BLC401'], diff: 2, icon: 'Monitor', info: { over: 'عتاد صلب وذواكر.', doc: 'د. هبة.', prac: 'اسئلة بتتكرر.', exam: 'نظري وتعريفات.' } },
  BDA501: { name: 'الخوارزميات', credits: 6, level: 2, prereqs: ['BPG402'], diff: 3, icon: 'Brain', info: { over: 'صعبة جدا بدا شغل وتدريب عالي.', doc: 'د. زهير او د. سهير.', prac: 'بتتكرر من فصول سابقة.', exam: 'صعب.' } },
  BWP401: { name: 'برمجة ويب 1', credits: 5, level: 2, prereqs: ['BPG402'], diff: 1, icon: 'Globe', info: { over: 'تطوير واجهات Front.', doc: 'د. باسل.', prac: 'تطوير واجهة موقع.', exam: 'دوورات بحتة.' } },

  BNA401: { name: 'تحليل عددي', credits: 5, level: 3, prereqs: ['BLA401', 'BMA402'], diff: 2, icon: 'Calculator', info: { over: 'حفظ قانون وتطبيق.', doc: 'د. يوسف.', prac: 'قانون وطبق.', exam: 'دورات.' } },
  BSP501: { name: 'معالجة إشارة', credits: 5, level: 3, prereqs: ['BMA402'], diff: 2, icon: 'Signal', info: { over: 'الاشارات وانواعها.', doc: 'د. اياد.', prac: 'سهلة.', exam: 'دورات متكررة.' } },
  BPS501: { name: 'احتمالات وإحصاء', credits: 6, level: 3, prereqs: ['BMA402', 'BDM501'], diff: 3, icon: 'Calculator', info: defaultInfo },
  BOS501: { name: 'نظم تشغيل', credits: 4, level: 3, prereqs: ['BCA501', 'BDA501'], diff: 3, icon: 'Server', info: { over: 'كلها انكليزي واساسيات النظام.', doc: 'د. غيث.', prac: 'حلقة بحث علمي.', exam: 'مقالي وأسئلة.' } },
  BOSL501: { name: 'مخبر نظم تشغيل', credits: 4, level: 3, prereqs: ['BCA501', 'BDA501'], diff: 2, icon: 'Terminal', info: { over: 'اوامر لينكس.', doc: 'د. ماجدة.', prac: 'اكواد C++.', exam: 'مقالي وأوامر.' } },
  BDB501: { name: 'قواعد بيانات 1', credits: 4, level: 3, prereqs: ['BDA501'], diff: 3, icon: 'Database', info: { over: 'بدها شغل منيح.', doc: 'د. علاء عيسى.', prac: 'تنزيل برامج.', exam: 'اغلب نظري.' } },
  BAU501: { name: 'أوتومات ولغات', credits: 5, level: 3, prereqs: ['BDA501', 'BDM501'], diff: 3, icon: 'Binary', info: defaultInfo },
  BPG601: { name: 'برمجة 3', credits: 5, level: 3, prereqs: ['BPG402'], diff: 1, icon: 'Code2', info: { over: 'لغة بايثون Python.', doc: 'د. أحمد العص.', prac: 'سهلة.', exam: 'دورات بتترفع معدل.' } },
  BDBL501: { name: 'مخبر قواعد بيانات', credits: 4, level: 3, prereqs: ['BDA501'], diff: 2, icon: 'Database', info: { over: 'رسم مخطط ERD والتنفيذ.', doc: 'د. محمد حجوز.', prac: 'مسألة قواعد بيانات.', exam: 'أسئلة دروس ومقالي SQL.' } },
  BAI501: { name: 'الذكاء الصنعي', credits: 5, level: 3, prereqs: ['BDA501'], diff: 3, icon: 'Brain', info: defaultInfo },

  GMN401: { name: 'أساسيات إدارة', credits: 4, level: 4, prereqs: ['BNA401'], diff: 1, icon: 'Briefcase', info: { over: 'نظرية عن الادارة والمدير.', doc: 'د. علي نوفل.', prac: 'سئيلة وبدا شغل.', exam: 'نظري حفظ.' } },
  BTS501: { name: 'نظم اتصالات', credits: 5, level: 4, prereqs: ['BMA402', 'BLC401'], diff: 2, icon: 'Signal', info: { over: 'مختصة بالاتصالات.', doc: 'د. رضوان.', prac: 'مسائل.', exam: 'قوانين واتمتة.' } },
  BNT501: { name: 'الشبكات الحاسوبية', credits: 6, level: 4, prereqs: ['BTS501'], diff: 3, icon: 'Network', info: { over: 'مادة معدل.', doc: 'د. مرح.', prac: 'برنامج Packet Tracer.', exam: 'نظري وعملي.' } },
  BWP501: { name: 'برمجة ويب 2', credits: 5, level: 4, prereqs: ['BWP401'], diff: 2, icon: 'Globe', info: { over: 'الجزء الثاني (PHP).', doc: 'د. باسل.', prac: 'موقع php.', exam: 'دورات.' } },
  GPM601: { name: 'إدارة مشاريع', credits: 6, level: 4, prereqs: ['BSE601'], diff: 1, icon: 'Briefcase', info: defaultInfo },
  BSE601: { name: 'هندسة برمجيات', credits: 6, level: 4, prereqs: ['BPG601'], diff: 3, icon: 'Code2', info: { over: 'دورة حياة البرمجيات.', doc: 'د. محمد.', prac: 'من المحاضرات.', exam: 'اسئلة شابترات.' } },
  BPR601: { name: 'مشروع 1', credits: 6, level: 4, prereqs: ['BIS501'], minTotalCredits: 180, diff: 2, icon: 'FolderOpen', info: { over: 'مشروع تخرج مصغر.', doc: 'حسب المشرف.', prac: 'تطوير وبحث.', exam: 'مناقشة.' } },
  BMP601: { name: 'برمجة تطبيقات النقال', credits: 5, level: 4, prereqs: ['BWP501'], diff: 2, icon: 'Smartphone', info: defaultInfo },
  BID501: { name: 'تحليل وتصميم النظم', credits: 6, level: 4, prereqs: ['BDB501'], diff: 2, icon: 'Workflow', info: defaultInfo },
  BCM601: { name: 'المترجمات', credits: 6, level: 4, prereqs: ['BAU501'], diff: 3, icon: 'Binary', info: defaultInfo },
  BIA601: { name: 'خوارزميات ذكية', credits: 5, level: 4, prereqs: ['BAI501'], diff: 3, icon: 'Brain', info: defaultInfo },
  BIS501: { name: 'أمن المعلومات', credits: 6, level: 4, prereqs: ['GET501', 'BDB501', 'BOS501', 'BNT501'], diff: 3, icon: 'Shield', info: defaultInfo },

  GET501: { name: 'أخلاقيات المهنة', credits: 6, level: 5, prereqs: ['GPM601'], diff: 1, icon: 'Scale', info: defaultInfo },
  GAC501: { name: 'المحاسبة', credits: 5, level: 5, prereqs: ['GMN401'], diff: 2, icon: 'Calculator', info: { over: 'أساسيات المحاسبة للمهندسين.', doc: 'اسأل الدفعة الحالية.', prac: 'وظائف حسابية.', exam: 'مسائل ونظري.' } },
  BPR602: { name: 'مشروع 2', credits: 10, level: 5, prereqs: ['BPR601'], minTotalCredits: 240, diff: 3, icon: 'FolderOpen', info: { over: 'مشروع التخرج النهائي.', doc: 'المشرف المناسب.', prac: 'أطروحة.', exam: 'مناقشة علنية.' } },
  BMM601: { name: 'نظم الوسائط المتعددة', credits: 6, level: 5, prereqs: ['BNT501', 'BDG601'], diff: 2, icon: 'Image', info: defaultInfo },
  BDG601: { name: 'البيانات', credits: 6, level: 5, prereqs: ['BSP501', 'BDA501'], diff: 3, icon: 'Database', info: defaultInfo },
  GEP601: { name: 'نظرية المعرفة', credits: 4, level: 5, prereqs: ['GET501'], diff: 1, icon: 'BookOpen', info: defaultInfo },
  BSM601: { name: 'النمذجة والمحاكاة', credits: 5, level: 5, prereqs: ['BPR601', 'BPS501', 'BPG601'], diff: 3, icon: 'Boxes', info: defaultInfo },

  GEN301: { name: 'اللغة الإنجليزية 1', credits: 1, level: 'ENG', prereqs: [], isEnglish: true, diff: 1, icon: 'Languages', info: { ...defaultInfo, over: '1 نقطة تنزيل تعطي 3 ترفيع.' } },
  GEN401: { name: 'اللغة الإنجليزية 2', credits: 1, level: 'ENG', prereqs: ['GEN301'], isEnglish: true, diff: 1, icon: 'Languages', info: { ...defaultInfo, over: '1 نقطة تنزيل تعطي 3 ترفيع.' } },
  GEN501: { name: 'اللغة الإنجليزية 3', credits: 1, level: 'ENG', prereqs: ['GEN401'], isEnglish: true, diff: 1, icon: 'Languages', info: { ...defaultInfo, over: '1 نقطة تنزيل تعطي 3 ترفيع.' } },
  GEN502: { name: 'اللغة الإنجليزية 4', credits: 1, level: 'ENG', prereqs: ['GEN501'], isEnglish: true, diff: 1, icon: 'Languages', info: { ...defaultInfo, over: '1 نقطة تنزيل تعطي 3 ترفيع.' } },
};
