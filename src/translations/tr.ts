/**
 * Turkish Translations
 */

export const trTranslations = {
  common: {
    // Navigation
    dashboard: 'Kontrol Paneli',
    projects: 'Projeler',
    tasks: 'Görevler',
    materials: 'Malzemeler',
    documents: 'Belgeler',
    reports: 'Raporlar',
    settings: 'Ayarlar',
    profile: 'Profil',
    
    // Actions
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    create: 'Oluştur',
    update: 'Güncelle',
    search: 'Ara',
    filter: 'Filtrele',
    sort: 'Sırala',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    
    // Status
    active: 'Aktif',
    inactive: 'Pasif',
    pending: 'Beklemede',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    draft: 'Taslak',
    
    // Time
    today: 'Bugün',
    yesterday: 'Dün',
    tomorrow: 'Yarın',
    thisWeek: 'Bu Hafta',
    lastWeek: 'Geçen Hafta',
    nextWeek: 'Gelecek Hafta',
    thisMonth: 'Bu Ay',
    lastMonth: 'Geçen Ay',
    nextMonth: 'Gelecek Ay',
    
    // Messages
    loading: 'Yükleniyor...',
    noData: 'Veri bulunamadı',
    error: 'Bir hata oluştu',
    success: 'İşlem başarıyla tamamlandı',
    confirm: 'Emin misiniz?',
    
    // Form
    required: 'Bu alan zorunludur',
    optional: 'İsteğe bağlı',
    placeholder: 'Değer girin...',
    
    // Accessibility
    skipToContent: 'Ana içeriğe geç',
    skipToNavigation: 'Navigasyona geç',
    closeModal: 'Modalı kapat',
    openMenu: 'Menüyü aç',
    closeMenu: 'Menüyü kapat',
  },
  
  accessibility: {
    title: 'Erişilebilirlik Ayarları',
    description: 'Daha iyi erişilebilirlik için arayüzü özelleştirin',
    
    // Visual settings
    visual: {
      title: 'Görsel Ayarlar',
      theme: 'Tema',
      fontSize: 'Yazı Boyutu',
      lineHeight: 'Satır Yüksekliği',
      letterSpacing: 'Harf Aralığı',
      fontFamily: 'Yazı Tipi',
      colorBlindness: 'Renk Görme Desteği',
      
      themes: {
        light: 'Açık',
        dark: 'Koyu',
        system: 'Sistem',
        highContrast: 'Yüksek Kontrast',
      },
      
      fonts: {
        default: 'Varsayılan (Inter)',
        dyslexic: 'Disleksi Dostu',
        mono: 'Monospace',
      },
      
      colorVision: {
        none: 'Normal renk görme',
        protanopia: 'Kırmızı körlüğü (Protanopi)',
        deuteranopia: 'Yeşil körlüğü (Deuteranopi)',
        tritanopia: 'Mavi körlüğü (Tritanopi)',
      },
    },
    
    // Motor settings
    motor: {
      title: 'Motor ve Etkileşim',
      reducedMotion: 'Azaltılmış Hareket',
      reducedMotionDesc: 'Animasyonları ve geçişleri minimize et',
      stickyKeys: 'Yapışkan Tuşlar',
      stickyKeysDesc: 'Değiştirici tuşları tek tek bas',
      slowKeys: 'Yavaş Tuşlar',
      slowKeysDesc: 'Kısa tuş basışlarını yoksay',
      clickDelay: 'Tıklama Gecikmesi',
      clickDelayDesc: 'Tıklamaları kaydetmeden önce gecikme',
    },
    
    // Cognitive settings
    cognitive: {
      title: 'Bilişsel Destek',
      focusIndicators: 'Gelişmiş Odak Göstergeleri',
      focusIndicatorsDesc: 'Daha güçlü görsel odak göstergeleri',
      simplifiedUI: 'Basitleştirilmiş Arayüz',
      simplifiedUIDesc: 'Gereksiz arayüz öğelerini gizle',
      autoSave: 'Otomatik Kaydet',
      autoSaveDesc: 'Değişiklikleri otomatik olarak kaydet',
      confirmActions: 'Eylemleri Onayla',
      confirmActionsDesc: 'Önemli eylemler için onay iste',
    },
    
    // Navigation settings
    navigation: {
      title: 'Navigasyon ve Ses',
      keyboardNavigation: 'Klavye Navigasyonu',
      keyboardNavigationDesc: 'Sadece klavye kullanarak gezin',
      skipLinks: 'Atlama Bağlantıları',
      skipLinksDesc: 'Navigasyon atlama bağlantılarını göster',
      soundEffects: 'Ses Efektleri',
      soundEffectsDesc: 'Arayüz ses efektlerini çal',
      screenReader: 'Ekran Okuyucu Desteği',
      screenReaderDesc: 'Ekran okuyucular için optimize et',
    },
    
    // Actions
    resetToDefaults: 'Varsayılanlara Sıfırla',
    saveSettings: 'Erişilebilirlik Ayarlarını Kaydet',
    preview: 'Önizleme',
    
    // Messages
    settingsSaved: 'Erişilebilirlik ayarları başarıyla kaydedildi',
    settingsReset: 'Ayarlar varsayılanlara sıfırlandı',
    errorSaving: 'Erişilebilirlik ayarları kaydedilemedi',
  },
  
  projects: {
    title: 'Projeler',
    createProject: 'Proje Oluştur',
    editProject: 'Projeyi Düzenle',
    deleteProject: 'Projeyi Sil',
    projectDetails: 'Proje Detayları',
    
    // Fields
    name: 'Proje Adı',
    description: 'Açıklama',
    status: 'Durum',
    priority: 'Öncelik',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    budget: 'Bütçe',
    location: 'Konum',
    manager: 'Proje Yöneticisi',
    team: 'Takım Üyeleri',
    
    // Status values
    statuses: {
      planning: 'Planlama',
      active: 'Aktif',
      onHold: 'Beklemede',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    },
    
    // Priority values
    priorities: {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      critical: 'Kritik',
    },
    
    // Messages
    projectCreated: 'Proje başarıyla oluşturuldu',
    projectUpdated: 'Proje başarıyla güncellendi',
    projectDeleted: 'Proje başarıyla silindi',
    confirmDelete: 'Bu projeyi silmek istediğinizden emin misiniz?',
  },
  
  tasks: {
    title: 'Görevler',
    createTask: 'Görev Oluştur',
    editTask: 'Görevi Düzenle',
    deleteTask: 'Görevi Sil',
    taskDetails: 'Görev Detayları',
    
    // Fields
    name: 'Görev Adı',
    description: 'Açıklama',
    status: 'Durum',
    priority: 'Öncelik',
    dueDate: 'Teslim Tarihi',
    assignee: 'Atanan Kişi',
    project: 'Proje',
    progress: 'İlerleme',
    
    // Status values
    statuses: {
      todo: 'Yapılacak',
      inProgress: 'Devam Ediyor',
      review: 'İnceleme',
      completed: 'Tamamlandı',
      blocked: 'Engellendi',
    },
    
    // Messages
    taskCreated: 'Görev başarıyla oluşturuldu',
    taskUpdated: 'Görev başarıyla güncellendi',
    taskDeleted: 'Görev başarıyla silindi',
    confirmDelete: 'Bu görevi silmek istediğinizden emin misiniz?',
  },
  
  materials: {
    title: 'Malzemeler',
    addMaterial: 'Malzeme Ekle',
    editMaterial: 'Malzemeyi Düzenle',
    deleteMaterial: 'Malzemeyi Sil',
    materialDetails: 'Malzeme Detayları',
    
    // Fields
    name: 'Malzeme Adı',
    category: 'Kategori',
    supplier: 'Tedarikçi',
    unitPrice: 'Birim Fiyat',
    quantity: 'Miktar',
    totalCost: 'Toplam Maliyet',
    deliveryDate: 'Teslimat Tarihi',
    
    // Categories
    categories: {
      concrete: 'Beton',
      steel: 'Çelik',
      lumber: 'Kereste',
      electrical: 'Elektrik',
      plumbing: 'Tesisat',
      insulation: 'Yalıtım',
      roofing: 'Çatı',
      flooring: 'Döşeme',
    },
    
    // Messages
    materialAdded: 'Malzeme başarıyla eklendi',
    materialUpdated: 'Malzeme başarıyla güncellendi',
    materialDeleted: 'Malzeme başarıyla silindi',
    confirmDelete: 'Bu malzemeyi silmek istediğinizden emin misiniz?',
  },
  
  auth: {
    // Login
    login: 'Giriş Yap',
    loginTitle: 'Hesabınıza giriş yapın',
    email: 'E-posta',
    password: 'Şifre',
    rememberMe: 'Beni hatırla',
    forgotPassword: 'Şifremi unuttum?',
    signIn: 'Giriş Yap',
    
    // Register
    register: 'Kayıt Ol',
    registerTitle: 'Hesabınızı oluşturun',
    firstName: 'Ad',
    lastName: 'Soyad',
    confirmPassword: 'Şifreyi Onayla',
    agreeToTerms: 'Hizmet Şartlarını kabul ediyorum',
    signUp: 'Kayıt Ol',
    
    // Messages
    loginSuccess: 'Başarıyla giriş yapıldı',
    loginError: 'Geçersiz e-posta veya şifre',
    registerSuccess: 'Hesap başarıyla oluşturuldu',
    registerError: 'Hesap oluşturulamadı',
    logoutSuccess: 'Başarıyla çıkış yapıldı',
    
    // Validation
    emailRequired: 'E-posta gereklidir',
    emailInvalid: 'Geçerli bir e-posta girin',
    passwordRequired: 'Şifre gereklidir',
    passwordTooShort: 'Şifre en az 8 karakter olmalıdır',
    passwordsDoNotMatch: 'Şifreler eşleşmiyor',
  },
};