/**
 * Arabic Translations (RTL)
 */

export const arTranslations = {
  common: {
    // Navigation
    dashboard: 'لوحة التحكم',
    projects: 'المشاريع',
    tasks: 'المهام',
    materials: 'المواد',
    documents: 'الوثائق',
    reports: 'التقارير',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    
    // Actions
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    update: 'تحديث',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    export: 'تصدير',
    import: 'استيراد',
    
    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'في الانتظار',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    draft: 'مسودة',
    
    // Time
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    lastWeek: 'الأسبوع الماضي',
    nextWeek: 'الأسبوع القادم',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    nextMonth: 'الشهر القادم',
    
    // Messages
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات متاحة',
    error: 'حدث خطأ',
    success: 'تمت العملية بنجاح',
    confirm: 'هل أنت متأكد؟',
    
    // Form
    required: 'هذا الحقل مطلوب',
    optional: 'اختياري',
    placeholder: 'أدخل القيمة...',
    
    // Accessibility
    skipToContent: 'انتقل إلى المحتوى الرئيسي',
    skipToNavigation: 'انتقل إلى التنقل',
    closeModal: 'إغلاق النافذة المنبثقة',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
  },
  
  accessibility: {
    title: 'إعدادات إمكانية الوصول',
    description: 'تخصيص الواجهة لتحسين إمكانية الوصول',
    
    // Visual settings
    visual: {
      title: 'الإعدادات البصرية',
      theme: 'المظهر',
      fontSize: 'حجم الخط',
      lineHeight: 'ارتفاع السطر',
      letterSpacing: 'تباعد الأحرف',
      fontFamily: 'نوع الخط',
      colorBlindness: 'دعم الرؤية اللونية',
      
      themes: {
        light: 'فاتح',
        dark: 'داكن',
        system: 'النظام',
        highContrast: 'تباين عالي',
      },
      
      fonts: {
        default: 'افتراضي (Inter)',
        dyslexic: 'صديق لعسر القراءة',
        mono: 'أحادي المسافة',
      },
      
      colorVision: {
        none: 'رؤية ألوان طبيعية',
        protanopia: 'عمى الأحمر (البروتانوبيا)',
        deuteranopia: 'عمى الأخضر (الديوترانوبيا)',
        tritanopia: 'عمى الأزرق (التريتانوبيا)',
      },
    },
    
    // Motor settings
    motor: {
      title: 'الحركة والتفاعل',
      reducedMotion: 'حركة مقللة',
      reducedMotionDesc: 'تقليل الرسوم المتحركة والانتقالات',
      stickyKeys: 'المفاتيح اللاصقة',
      stickyKeysDesc: 'اضغط على مفاتيح التعديل واحداً تلو الآخر',
      slowKeys: 'المفاتيح البطيئة',
      slowKeysDesc: 'تجاهل الضغطات القصيرة على المفاتيح',
      clickDelay: 'تأخير النقر',
      clickDelayDesc: 'تأخير قبل تسجيل النقرات',
    },
    
    // Cognitive settings
    cognitive: {
      title: 'الدعم المعرفي',
      focusIndicators: 'مؤشرات التركيز المحسنة',
      focusIndicatorsDesc: 'مؤشرات تركيز بصرية أقوى',
      simplifiedUI: 'واجهة مبسطة',
      simplifiedUIDesc: 'إخفاء عناصر الواجهة غير الأساسية',
      autoSave: 'حفظ تلقائي',
      autoSaveDesc: 'حفظ التغييرات تلقائياً',
      confirmActions: 'تأكيد الإجراءات',
      confirmActionsDesc: 'طلب التأكيد على الإجراءات المهمة',
    },
    
    // Navigation settings
    navigation: {
      title: 'التنقل والصوت',
      keyboardNavigation: 'التنقل بلوحة المفاتيح',
      keyboardNavigationDesc: 'التنقل باستخدام لوحة المفاتيح فقط',
      skipLinks: 'روابط التخطي',
      skipLinksDesc: 'إظهار روابط تخطي التنقل',
      soundEffects: 'المؤثرات الصوتية',
      soundEffectsDesc: 'تشغيل مؤثرات صوتية للواجهة',
      screenReader: 'دعم قارئ الشاشة',
      screenReaderDesc: 'تحسين لقارئات الشاشة',
    },
    
    // Actions
    resetToDefaults: 'إعادة تعيين للافتراضي',
    saveSettings: 'حفظ إعدادات إمكانية الوصول',
    preview: 'معاينة',
    
    // Messages
    settingsSaved: 'تم حفظ إعدادات إمكانية الوصول بنجاح',
    settingsReset: 'تم إعادة تعيين الإعدادات للافتراضي',
    errorSaving: 'فشل في حفظ إعدادات إمكانية الوصول',
  },
  
  projects: {
    title: 'المشاريع',
    createProject: 'إنشاء مشروع',
    editProject: 'تعديل المشروع',
    deleteProject: 'حذف المشروع',
    projectDetails: 'تفاصيل المشروع',
    
    // Fields
    name: 'اسم المشروع',
    description: 'الوصف',
    status: 'الحالة',
    priority: 'الأولوية',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    budget: 'الميزانية',
    location: 'الموقع',
    manager: 'مدير المشروع',
    team: 'أعضاء الفريق',
    
    // Status values
    statuses: {
      planning: 'التخطيط',
      active: 'نشط',
      onHold: 'معلق',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    },
    
    // Priority values
    priorities: {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      critical: 'حرج',
    },
    
    // Messages
    projectCreated: 'تم إنشاء المشروع بنجاح',
    projectUpdated: 'تم تحديث المشروع بنجاح',
    projectDeleted: 'تم حذف المشروع بنجاح',
    confirmDelete: 'هل أنت متأكد من رغبتك في حذف هذا المشروع؟',
  },
  
  tasks: {
    title: 'المهام',
    createTask: 'إنشاء مهمة',
    editTask: 'تعديل المهمة',
    deleteTask: 'حذف المهمة',
    taskDetails: 'تفاصيل المهمة',
    
    // Fields
    name: 'اسم المهمة',
    description: 'الوصف',
    status: 'الحالة',
    priority: 'الأولوية',
    dueDate: 'تاريخ الاستحقاق',
    assignee: 'المكلف',
    project: 'المشروع',
    progress: 'التقدم',
    
    // Status values
    statuses: {
      todo: 'للقيام',
      inProgress: 'قيد التنفيذ',
      review: 'قيد المراجعة',
      completed: 'مكتمل',
      blocked: 'محجوب',
    },
    
    // Messages
    taskCreated: 'تم إنشاء المهمة بنجاح',
    taskUpdated: 'تم تحديث المهمة بنجاح',
    taskDeleted: 'تم حذف المهمة بنجاح',
    confirmDelete: 'هل أنت متأكد من رغبتك في حذف هذه المهمة؟',
  },
  
  materials: {
    title: 'المواد',
    addMaterial: 'إضافة مادة',
    editMaterial: 'تعديل المادة',
    deleteMaterial: 'حذف المادة',
    materialDetails: 'تفاصيل المادة',
    
    // Fields
    name: 'اسم المادة',
    category: 'الفئة',
    supplier: 'المورد',
    unitPrice: 'سعر الوحدة',
    quantity: 'الكمية',
    totalCost: 'التكلفة الإجمالية',
    deliveryDate: 'تاريخ التسليم',
    
    // Categories
    categories: {
      concrete: 'خرسانة',
      steel: 'فولاذ',
      lumber: 'أخشاب',
      electrical: 'كهربائي',
      plumbing: 'سباكة',
      insulation: 'عزل',
      roofing: 'تسقيف',
      flooring: 'أرضيات',
    },
    
    // Messages
    materialAdded: 'تم إضافة المادة بنجاح',
    materialUpdated: 'تم تحديث المادة بنجاح',
    materialDeleted: 'تم حذف المادة بنجاح',
    confirmDelete: 'هل أنت متأكد من رغبتك في حذف هذه المادة؟',
  },
  
  auth: {
    // Login
    login: 'تسجيل الدخول',
    loginTitle: 'سجل دخولك إلى حسابك',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    
    // Register
    register: 'التسجيل',
    registerTitle: 'أنشئ حسابك',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    confirmPassword: 'تأكيد كلمة المرور',
    agreeToTerms: 'أوافق على شروط الخدمة',
    signUp: 'التسجيل',
    
    // Messages
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    loginError: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
    registerSuccess: 'تم إنشاء الحساب بنجاح',
    registerError: 'فشل في إنشاء الحساب',
    logoutSuccess: 'تم تسجيل الخروج بنجاح',
    
    // Validation
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordTooShort: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
  },
};