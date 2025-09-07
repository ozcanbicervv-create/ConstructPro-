/**
 * English Translations
 */

export const enTranslations = {
  common: {
    // Navigation
    dashboard: 'Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    materials: 'Materials',
    documents: 'Documents',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    nextMonth: 'Next Month',
    
    // Messages
    loading: 'Loading...',
    noData: 'No data available',
    error: 'An error occurred',
    success: 'Operation completed successfully',
    confirm: 'Are you sure?',
    
    // Form
    required: 'This field is required',
    optional: 'Optional',
    placeholder: 'Enter value...',
    
    // Accessibility
    skipToContent: 'Skip to main content',
    skipToNavigation: 'Skip to navigation',
    closeModal: 'Close modal',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  
  accessibility: {
    title: 'Accessibility Settings',
    description: 'Customize the interface for better accessibility',
    
    // Visual settings
    visual: {
      title: 'Visual Settings',
      theme: 'Theme',
      fontSize: 'Font Size',
      lineHeight: 'Line Height',
      letterSpacing: 'Letter Spacing',
      fontFamily: 'Font Family',
      colorBlindness: 'Color Vision Support',
      
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        highContrast: 'High Contrast',
      },
      
      fonts: {
        default: 'Default (Inter)',
        dyslexic: 'Dyslexic Friendly',
        mono: 'Monospace',
      },
      
      colorVision: {
        none: 'Normal color vision',
        protanopia: 'Red-blind (Protanopia)',
        deuteranopia: 'Green-blind (Deuteranopia)',
        tritanopia: 'Blue-blind (Tritanopia)',
      },
    },
    
    // Motor settings
    motor: {
      title: 'Motor & Interaction',
      reducedMotion: 'Reduced Motion',
      reducedMotionDesc: 'Minimize animations and transitions',
      stickyKeys: 'Sticky Keys',
      stickyKeysDesc: 'Press modifier keys one at a time',
      slowKeys: 'Slow Keys',
      slowKeysDesc: 'Ignore brief key presses',
      clickDelay: 'Click Delay',
      clickDelayDesc: 'Delay before registering clicks',
    },
    
    // Cognitive settings
    cognitive: {
      title: 'Cognitive Support',
      focusIndicators: 'Enhanced Focus Indicators',
      focusIndicatorsDesc: 'Stronger visual focus indicators',
      simplifiedUI: 'Simplified UI',
      simplifiedUIDesc: 'Hide non-essential interface elements',
      autoSave: 'Auto-save',
      autoSaveDesc: 'Automatically save changes',
      confirmActions: 'Confirm Actions',
      confirmActionsDesc: 'Ask for confirmation on important actions',
    },
    
    // Navigation settings
    navigation: {
      title: 'Navigation & Audio',
      keyboardNavigation: 'Keyboard Navigation',
      keyboardNavigationDesc: 'Navigate using keyboard only',
      skipLinks: 'Skip Links',
      skipLinksDesc: 'Show skip navigation links',
      soundEffects: 'Sound Effects',
      soundEffectsDesc: 'Play UI sound effects',
      screenReader: 'Screen Reader Support',
      screenReaderDesc: 'Optimize for screen readers',
    },
    
    // Actions
    resetToDefaults: 'Reset to Defaults',
    saveSettings: 'Save Accessibility Settings',
    preview: 'Preview',
    
    // Messages
    settingsSaved: 'Accessibility settings saved successfully',
    settingsReset: 'Settings reset to defaults',
    errorSaving: 'Failed to save accessibility settings',
  },
  
  projects: {
    title: 'Projects',
    createProject: 'Create Project',
    editProject: 'Edit Project',
    deleteProject: 'Delete Project',
    projectDetails: 'Project Details',
    
    // Fields
    name: 'Project Name',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',
    startDate: 'Start Date',
    endDate: 'End Date',
    budget: 'Budget',
    location: 'Location',
    manager: 'Project Manager',
    team: 'Team Members',
    
    // Status values
    statuses: {
      planning: 'Planning',
      active: 'Active',
      onHold: 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    
    // Priority values
    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
    
    // Messages
    projectCreated: 'Project created successfully',
    projectUpdated: 'Project updated successfully',
    projectDeleted: 'Project deleted successfully',
    confirmDelete: 'Are you sure you want to delete this project?',
  },
  
  tasks: {
    title: 'Tasks',
    createTask: 'Create Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    taskDetails: 'Task Details',
    
    // Fields
    name: 'Task Name',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',
    dueDate: 'Due Date',
    assignee: 'Assigned To',
    project: 'Project',
    progress: 'Progress',
    
    // Status values
    statuses: {
      todo: 'To Do',
      inProgress: 'In Progress',
      review: 'Under Review',
      completed: 'Completed',
      blocked: 'Blocked',
    },
    
    // Messages
    taskCreated: 'Task created successfully',
    taskUpdated: 'Task updated successfully',
    taskDeleted: 'Task deleted successfully',
    confirmDelete: 'Are you sure you want to delete this task?',
  },
  
  materials: {
    title: 'Materials',
    addMaterial: 'Add Material',
    editMaterial: 'Edit Material',
    deleteMaterial: 'Delete Material',
    materialDetails: 'Material Details',
    
    // Fields
    name: 'Material Name',
    category: 'Category',
    supplier: 'Supplier',
    unitPrice: 'Unit Price',
    quantity: 'Quantity',
    totalCost: 'Total Cost',
    deliveryDate: 'Delivery Date',
    
    // Categories
    categories: {
      concrete: 'Concrete',
      steel: 'Steel',
      lumber: 'Lumber',
      electrical: 'Electrical',
      plumbing: 'Plumbing',
      insulation: 'Insulation',
      roofing: 'Roofing',
      flooring: 'Flooring',
    },
    
    // Messages
    materialAdded: 'Material added successfully',
    materialUpdated: 'Material updated successfully',
    materialDeleted: 'Material deleted successfully',
    confirmDelete: 'Are you sure you want to delete this material?',
  },
  
  auth: {
    // Login
    login: 'Login',
    loginTitle: 'Sign in to your account',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    
    // Register
    register: 'Register',
    registerTitle: 'Create your account',
    firstName: 'First Name',
    lastName: 'Last Name',
    confirmPassword: 'Confirm Password',
    agreeToTerms: 'I agree to the Terms of Service',
    signUp: 'Sign Up',
    
    // Messages
    loginSuccess: 'Logged in successfully',
    loginError: 'Invalid email or password',
    registerSuccess: 'Account created successfully',
    registerError: 'Failed to create account',
    logoutSuccess: 'Logged out successfully',
    
    // Validation
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsDoNotMatch: 'Passwords do not match',
  },
};