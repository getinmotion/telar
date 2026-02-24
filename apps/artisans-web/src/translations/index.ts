import { type Language } from '@/types/language';

// Multi-language translations
export const translations = {
  // UI Common
  ui: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close",
    submit: "Submit",
    back: "Back",
    next: "Next",
    continue: "Continue",
    finish: "Finish",
    yes: "Yes",
    no: "No",
    ok: "OK",
    search: "Search",
    filter: "Filter",
    select: "Select",
    selectAll: "Select All",
    clear: "Clear",
    refresh: "Refresh",
    settings: "Settings",
    help: "Help",
    home: "Home",
    generatingRecommendations: "Generating recommendations..."
  },

  // Dashboard
  dashboard: {
    welcome: "Welcome",
    welcomeText: "Ready to take your creative business to the next level?",
    yourNextStep: "Your Next Step",
    taskManagement: "Task Management",
    activeTasks: "Active Tasks",
    completedTasks: "Completed Tasks",
    pendingTasks: "Pending Tasks",
    newTask: "New Task",
    viewAll: "View All",
    simpleView: "Simple View",
    taskLimit: "Task Limit",
    noTasks: "No tasks yet",
    noTasksDesc: "Let's create your first task to get started!",
    createFirstTask: "Create First Task",
    letsStart: "Let's Start!",
    letsKeepWorking: "Let's Keep Working!",
    keepWorking: "Keep Working",
    chatWithMe: "Chat with me",
    chatWithAgent: "Chat with Agent",
    almostThere: "Almost there!",
    keepGoing: "Keep going!",
    youGotThis: "You got this!",
    greatProgress: "Great progress!",
    nextUp: "Next up",
    whyImportant: "Why is this important?",
    whatYoullAchieve: "What you'll achieve",
    estimatedTime: "Estimated time",
    timeSpent: "Time spent",
    minutes: "minutes",
    howIsGoing: "How is it going?",
    going: "going",
    readyToCreate: "Ready to create",
    createFirst: "Create first",
    getStarted: "Get Started",
    yourCreativeJourney: "Your Creative Journey",
    continueTask: "Continue Task",
    welcomeTitle: "Welcome to Your Digital Workshop",
    welcomeSubtitle: "Your personal command center for business growth",
    priorityTasks: "Priority Tasks",
    activeAgents: "Active Agents",
    quickActions: "Quick Actions",
    projectProgress: "Project Progress",
    viewAgent: "View Agent",
    retakeAssessment: "Retake Assessment",
    startWithAgent: "Start with Agent",
    recommendedAssistant: "Recommended Assistant",
    noActiveAgents: "No active agents",
    scheduleSession: "Schedule Session",
    viewProgress: "View Progress"
  },

  // Master Coordinator
  masterCoordinator: {
    title: "Master Coordinator",
    subtitle: "Your AI-powered business growth coordinator",
    welcome: "Welcome back!",
    currentStatus: "Current Status",
    activeSlots: "Active Slots",
    completed: "Completed",
    maturityLevel: "Maturity Level",
    nextRecommendations: "Next Recommendations",
    viewAllTasks: "View All Tasks",
    startWithAgent: "Start with Agent",
    choosePath: "Choose Your Path",
    getPersonalizedGuidance: "Get personalized guidance",
    exploreSubAgents: "Explore specialized agents",
    progressToNext: "Progress to next level",
    personalCoordinator: "Your Personal Coordinator",
    alwaysHereToGuide: "Always here to guide you",
    preparingCoordinator: "Preparing your coordinator...",
    configuringExperience: "Configuring your experience",
    freeSlots: "free slots",
    excellentProgress: "Excellent progress!",
    successRate: "Success Rate",
    efficiency: "Efficiency",
    incredible: "Incredible!",
    completedTasks: "completed tasks"
  },

  // Tasks
  tasks: {
    completed: "Completed",
    pending: "Pending",
    inProgress: "In Progress",
    cancelled: "Cancelled",
    developWithAgent: "Develop with Agent",
    continueTask: "Continue Task",
    activateTask: "Activate Task",
    completeTask: "Complete Task",
    markCompleted: "Mark Completed",
    quickComplete: "Quick Complete",
    stepByStep: "Step by Step",
    continueSteps: "Continue Steps",
    startTask: "Start Task",
    delete: "Delete",
    subtasks: "Subtasks",
    progress: "Progress",
    dueDate: "Due Date",
    taskCreated: "Task created successfully",
    taskUpdated: "Task updated successfully",
    taskDeleted: "Task deleted successfully",
    taskCompleted: "Task completed successfully",
    limitReached: "Task limit reached",
    completeOthers: "Complete other tasks first",
    completeThisFirst: "Complete this task first",
    needToComplete: "You need to complete",
    due: "due",
    tasksLabel: "tasks",
    completedOn: "Completed on",
    noCompletedYet: "No tasks completed yet",
    taskStatus: {
      completed: "Completed",
      pending: "Pending",
      inProgress: "In Progress",
      cancelled: "Cancelled"
    }
  },

  // Messages
  messages: {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
    loading: "Loading...",
    saving: "Saving...",
    deleting: "Deleting...",
    processing: "Processing...",
    connecting: "Connecting...",
    connected: "Connected",
    disconnected: "Disconnected",
    validationError: "Please check your input",
    networkError: "Network error occurred",
    unexpectedError: "An unexpected error occurred"
  },

  // Inventory
  inventory: {
    deleteConfirm: '¿Eliminar este producto?',
    deleteWarning: 'Esta acción no se puede deshacer. El producto será eliminado permanentemente.',
    stockManager: {
      currentStock: 'Stock Actual',
      minStock: 'Stock Mínimo',
      adjustment: 'Ajuste de Stock',
      entry: 'Entrada',
      exit: 'Salida',
      adjust: 'Ajuste',
      reason: 'Razón',
      history: 'Historial de Movimientos',
      lowStockAlert: 'Stock bajo - considera reabastecer',
    },
  },

  // Auth
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    forgotPassword: "Forgot Password",
    resetPassword: "Reset Password",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    signInSuccess: "Successfully signed in",
    signUpSuccess: "Successfully signed up",
    signOutSuccess: "Successfully signed out",
    invalidCredentials: "Invalid credentials",
    accountCreated: "Account created successfully"
  },

  // Agents
  agents: {
    costCalculator: "Cost Calculator",
    contractGenerator: "Contract Generator",
    maturityEvaluator: "Maturity Evaluator",
    exportAdvisor: "Export Advisor",
    portfolioCatalog: "Portfolio Catalog",
    admin: "Administrative Assistant",
    selectAgent: "Select Agent",
    workingWith: "Working with",
    startWorking: "Start Working",
    comingSoon: "Coming Soon"
  },

  // AI Assistant
  aiAssistant: {
    title: "AI Business Assistant",
    welcome: "Welcome to your AI Business Assistant",
    howCanIHelp: "How can I help you today?",
    askAnything: "Ask me anything about your business",
    thinking: "Thinking...",
    type: "Type your message...",
    send: "Send",
    clear: "Clear chat",
    reset: "Reset Chat",
    error: "Something went wrong. Please try again.",
    emptyState: "Start a conversation with your AI assistant",
    placeholder: "Ask me anything about your business...",
    tellMeMore: "Tell me more",
    clickToRespond: "Click to respond",
    suggestions: "Suggestions",
    profileAssistant: "Profile Assistant",
    businessAssistant: "Business Assistant", 
    managementAssistant: "Management Assistant",
    defaultAssistant: "General Assistant",
    aboutQuestion: "What would you like to know about",
    thisContext: "this context?",
    expandedPlaceholder: "Ask me anything about your business, goals, or how I can help you grow..."
  },

  // Footer
  footer: {
    tagline: "Empowering creators to build better businesses",
    company: "Company",
    about: "About Us",
    careers: "Careers", 
    contact: "Contact",
    blog: "Blog",
    product: "Product",
    platform: "Platform",
    calculator: "Maturity Calculator",
    dashboard: "Taller Digital",
    agentsGallery: "Agents Gallery",
    resources: "Resources",
    support: "Support",
    documentation: "Documentation",
    community: "Community",
    login: "Login",
    admin: "Admin",
    waitlist: "Waitlist",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    copyright: "© 2024 CreatorCopilot",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved",
    builtWith: "Built with ❤️ for creators"
  },

  // Product Explanation
  productExplanation: {
    title: "Transform Your Creative Business",
    subtitle: "Get personalized guidance from AI agents specialized in your industry",
    howItWorks: "How it works",
    step1: {
      title: "Take our maturity assessment",
      description: "Answer questions about your business to get your current maturity level"
    },
    step2: {
      title: "Get matched with AI agents", 
      description: "Our system recommends the best agents for your specific needs and goals"
    },
    step3: {
      title: "Start growing your business",
      description: "Work with specialized agents to tackle your biggest challenges and opportunities"
    },
    step4: {
      title: "Track your progress",
      description: "Monitor your growth and achievements as you implement our recommendations"
    }
  },

  // Profile Selector
  profileSelector: {
    title: "Choose Your Profile",
    subtitle: "Select the profile that best describes your creative business",
    selectedMessage: "You selected:",
    individual: "Individual Creator",
    individualDesc: "I'm a solo creator working on my own projects",
    team: "Creative Team", 
    teamDesc: "We're a team of creators working together",
    agency: "Creative Agency",
    agencyDesc: "We're an established agency serving clients",
    ideaTitle: "I have an idea",
    ideaDescription: "I'm just starting with a business concept that needs validation",
    soloTitle: "I work solo",
    soloDescription: "I'm an individual creator with an active business or project",
    teamTitle: "We work as a team",
    teamDescription: "We're a team of creators collaborating on projects",
    continue: "Continue",
    back: "Back",
    confirmButton: "Start Assessment"
  },

  // Value Proposition
  valueProposition: {
    title: "Por Qué Elegir Nuestra Plataforma",
    subtitle: "Todo lo que necesitas para hacer crecer tu negocio artesanal",
    feature1: "Guía Personalizada con IA",
    feature1Desc: "Obtén recomendaciones adaptadas a tu negocio e industria específica",
    feature2: "Conocimiento Experto", 
    feature2Desc: "Accede a conocimiento especializado de expertos y mejores prácticas de la industria",
    feature3: "Tareas Orientadas a la Acción",
    feature3Desc: "Recibe tareas específicas y accionables que impulsan tu negocio hacia adelante",
    reasons: [
      "Guía personalizada con IA adaptada a tu oficio artesanal",
      "Conocimiento experto de artesanos exitosos", 
      "Tareas orientadas a la acción que generan resultados reales",
      "Disponibilidad 24/7 para apoyar tu crecimiento"
    ]
  },

  // Agent Manager
  agentManager: {
    title: "Agent Manager",
    subtitle: "Choose your specialized AI assistants",
    recommended: "Recommended for you",
    allAgents: "All Agents",
    categories: "Categories",
    search: "Search agents...",
    noResults: "No agents found",
    startWorking: "Start Working",
    learnMore: "Learn More",
    comingSoon: "Coming Soon",
    selectCategory: "Select a category",
    allCategories: "All Categories",
    activeAgents: "Active Agents",
    availableAgents: "Available Agents",
    activate: "Activate",
    disabled: "Disabled",
    filterCategories: "Filter by categories",
    clearAllFilters: "Clear all filters",
    totalAgents: "Total agents",
    filters: "Filters",
    noAgentsFound: "No agents found",
    tryAdjusting: "Try adjusting your filters",
    never: "Never",
    loading: "Loading agents..."
  },

  // Recommended Agents
  recommendedAgents: {
    title: "Recommended Agents",
    subtitle: "Based on your business profile and goals", 
    startWorking: "Start Working",
    recommendedAgents: "Recommended for you",
    activeTasks: "active tasks",
    lastUsed: "Last used",
    never: "Never",
    chatWith: "Chat with",
    primaryAgents: "Primary Agents",
    secondaryAgents: "Secondary Agents"
  },

  // AI Assistant Extended
  aiAssistantExtended: {
    profileAssistant: "Profile Assistant",
    businessAssistant: "Business Assistant", 
    managementAssistant: "Management Assistant",
    defaultAssistant: "General Assistant",
    aboutQuestion: "What would you like to know about",
    thisContext: "this context?",
    expandedPlaceholder: "Ask me anything about your business, goals, or how I can help you grow..."
  },

  // Maturity Calculator
  maturityCalculator: {
    title: "Maturity Calculator",
    description: "Assess your business maturity level",
    generatingTasks: "Generating Tasks",
    generatingTasksDescription: "Creating personalized tasks based on your assessment",
    ideaValidation: "Idea Validation",
    userExperience: "User Experience",
    marketFit: "Market Fit",
    monetization: "Monetization"
  },

  // Agent Filters
  agentFilters: {
    search: "Search agents...",
    category: "Category",
    status: "Status",
    priority: "Priority",
    sortBy: "Sort by",
    clearFilters: "Clear filters",
    allCategories: "All Categories",
    filtersLabel: "Filters"
  },

  // Value Proposition Extended
  valuePropositionExtended: {
    reasons: [
      "Guía personalizada con IA adaptada a tu oficio artesanal",
      "Conocimiento experto de artesanos exitosos", 
      "Tareas orientadas a la acción que generan resultados reales",
      "Disponibilidad 24/7 para apoyar tu crecimiento"
    ]
  },


  // Missions Dashboard  
  missionsDashboard: {
    title: "My Missions",
    subtitle: "Track and manage your active business missions",
    searchPlaceholder: "Search missions...",
    allMissions: "All Missions",
    activeMissions: "Active Missions", 
    completedMissions: "Completed Missions",
    filterByStatus: "Filter by Status",
    filterByPriority: "Filter by Priority",
    filterByAgent: "Filter by Agent",
    all: "All",
    pending: "Pending", 
    inProgress: "In Progress",
    completed: "Completed",
    high: "High",
    medium: "Medium",
    low: "Low",
    continueTask: "Continue Task",
    startTask: "Start Task",
    reviewTask: "Review Task",
    completeTask: "Complete Task",
    taskStats: "Task Stats",
    activeCount: "Active",
    completedCount: "Completed",
    remainingSlots: "Remaining Slots",
    progressTitle: "Progress Overview",
    noMissions: "No missions found",
    noMissionsDesc: "Create your first mission to get started",
    createFirst: "Create First Mission",
    estimatedTime: "Estimated Time",
    minutes: "minutes",
    priority: "Priority",
    agent: "Agent",
    status: "Status",
    lastUpdated: "Last Updated",
    daysAgo: "days ago",
    today: "Today",
    yesterday: "Yesterday",
    recommendedTasks: "Recommended Tasks",
    recommendedSubtitle: "Suggested based on your business goals",
    convertToTask: "Convert to Task",
    recommendationsPriority: "Priority",
    estimatedTimeLabel: "Estimated Time",
    hideRecommendations: "Hide Recommendations",
    showRecommendations: "Show Recommendations",
    generatingRecommendations: "Generating personalized recommendations...",
    needMoreInfo: "We need more information about your business to create better recommendations",
    tryAgain: "Try Again",
    noRecommendations: "No recommendations available",
    refreshRecommendations: "Refresh Recommendations",
    converting: "Converting...",
    convertedSuccessfully: "Task created successfully",
    errorConverting: "Error creating task",
    errorGenerating: "Error generating recommendations",
    newRecommendation: "New recommendation generated"
  },

  // Status
  status: {
    active: "Active",
    inactive: "Inactive",
    online: "Online",
    offline: "Offline",
    available: "Available",
    busy: "Busy",
    away: "Away",
    ready: "Ready",
    processing: "Processing",
    complete: "Complete",
    failed: "Failed"
  },

  // Time
  time: {
    now: "Now",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This week",
    lastWeek: "Last week",
    thisMonth: "This month",
    lastMonth: "Last month",
    thisYear: "This year",
    ago: "ago",
    in: "in",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds"
  },

  // Sort Options
  sortOptions: {
    name: "Name",
    date: "Date", 
    priority: "Priority",
    usage: "Usage",
    impact: "Impact"
  },

  // Task Status
  taskStatus: {
    completed: "Completed",
    pending: "Pending",
    inProgress: "In Progress",
    cancelled: "Cancelled",
    completedPercentage: "% completed",
    completedTime: "Completed"
  },

  // Task Management - Bilingual with Spanish as primary
  taskManagement: {
    title: "Gestor de Misiones",
    subtitle: "Organiza y ejecuta tu plan de negocio de forma eficiente",
    backToCoordinator: "Volver al Coordinador",
    backToTasks: "Volver a Tareas",
    stepByStepExecution: "Ejecución guiada paso a paso",
    totalTasks: "Total de Tareas",
    activeTasks: "Tareas Activas",
    completedTasks: "Completadas",
    freeSlots: "Espacios Libres",
    limit: "Límite de Tareas",
    unlimited: "Ilimitado",
    remaining: "restantes",
    manageSlots: "Gestionar Espacios",
    reachedLimit: "Has alcanzado tu límite de tareas",
    completeOthers: "Completa algunas tareas para crear nuevas",
    limitReached: "Límite de tareas alcanzado",
    limitWarning: "Te estás acercando al límite de tareas",
    smartSuggestion: "Sugerencia inteligente: Completa algunas tareas para liberar espacio",
    manage: "Gestionar",
    taskLimit: "Límite de Tareas",
    recommendation: "Recomendación",
    currentTasks: "Tareas Actuales",
    paused: "En Pausa",
    inProgress: "En Progreso",
    completed: "Completada",
    pending: "Pendiente",
    myTasks: "Mis Tareas",
    pendingTasks: "tareas pendientes",
    completedTasksCount: "completadas",
    totalProgress: "Progreso total",
    goToWizard: "Ir al wizard",
    start: "Comenzar",
    allTasksCompleted: "¡Todas las tareas completadas!",
    allTasksCompletedDesc: "Has completado todas las tareas disponibles. Sigue construyendo tu negocio.",
    keepBuilding: "Sigue construyendo",
    noCompletedYet: "Aún no hay tareas completadas",
    completedOn: "Completada el"
  },

  // Impact
  impact: {
    high: "High Impact", 
    medium: "Medium Impact",
    low: "Low Impact"
  },

  // Hero Section
  heroSection: {
    title: "Transform Your Creative Business",
    subtitle: "Get AI-powered guidance tailored to your industry",
    agentsSection: {
      title: "Meet Your AI Agents",
      subtitle: "Specialized AI assistants designed to help you succeed",
      preview: "Agent Categories",
      cta: "Explore All Agents",
      features: {
        instant: {
          title: "Instant Responses",
          description: "Get immediate answers to your business questions"
        },
        specialized: {
          title: "Specialized Knowledge",
          description: "Each agent is trained for specific business areas"
        },
        secure: {
          title: "Secure & Private",
          description: "Your business data is protected and confidential"
        },
        collaborative: {
          title: "Collaborative",
          description: "Work with multiple agents for comprehensive solutions"
        }
      },
      categories: {
        financial: "Financial",
        legal: "Legal",
        operational: "Operational",
        marketing: "Marketing"
      }
    }
  },

  // Extended Recommended Agents
  recommendedAgentsExtended: {
    activeTasks: "active tasks",
    lastUsed: "Last used",
    never: "Never",
    chatWith: "Chat with",
    primaryAgents: "Primary Agents",
    secondaryAgents: "Secondary Agents"
  },

  // Hero Chat Boxes
  heroChatBoxes: {
    typing: "Typing...",
    viewAllAgents: "View All Agents",
    exploreComplete: "Explore Complete Platform",
    examples: [
      "How can I improve my business?",
      "What should I focus on next?",
      "Help me create a business plan"
    ]
  },

  // Mobile Bottom Navigation
  mobileBottomNav: {
    dashboard: "Taller Digital",
    agents: "Agents",
    tasks: "Tasks",
    profile: "Profile",
    analytics: "Analytics",
    settings: "Settings"
  },


  // Recommended Tasks for unified system
  recommendedTasks: {
    title: "Recommended Tasks",
    subtitle: "Based on your business goals",
    generateNew: "Generate New Recommendations",
    noTasks: "No recommendations available",
    explorador: {
      title: "Business Explorer",
      subtitle: "Explore business opportunities",
      agents: "Explore Agents",
      categories: "Categories"
    },
    agents: "Agents",
    categories: "Categories",
    digitalMarketing: {
      title: "Digital Marketing",
      subtitle: "Marketing strategies"
    },
    projectManagement: {
      title: "Project Management", 
      subtitle: "Project coordination"
    }
  },

  // Time Estimates
  timeEstimates: {
    short: "15-30 min",
    medium: "30-60 min",
    long: "1-2 hours"
  }
};

export type Translations = typeof translations;

export function getTranslations(): Translations {
  return translations;
}

export function getTranslation(path: string, fallback = ""): string {
  const keys = path.split('.');
  let current: any = translations;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback || path;
    }
  }
  
  return typeof current === 'string' ? current : fallback || path;
}