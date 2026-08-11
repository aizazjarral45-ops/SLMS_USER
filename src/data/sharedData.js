export const SHARED_DATA_STORAGE_KEY = "slms-shared-app-data";

export const defaultExpenses = [
  {
    key: "1",
    title: "Cafeteria Lunch Combo",
    category: "Food",
    amount: 12.5,
    date: "2026-07-30",
    paymentMethod: "Card",
    description: "Lunch between lab sessions",
    location: "Main Cafeteria",
    status: "Approved",
    receipt: "Available",
  },
  {
    key: "2",
    title: "Project Printing",
    category: "Printing",
    amount: 8.25,
    date: "2026-07-29",
    paymentMethod: "Cash",
    description: "Capstone draft print",
    location: "Campus Print Hub",
    status: "Logged",
    receipt: "Uploaded",
  },
  {
    key: "3",
    title: "Hostel Laundry",
    category: "Hostel",
    amount: 15,
    date: "2026-07-28",
    paymentMethod: "Wallet",
    description: "Weekly laundry cycle",
    location: "Hostel Block B",
    status: "Approved",
    receipt: "N/A",
  },
  {
    key: "4",
    title: "Ride to Internship Fair",
    category: "Transport",
    amount: 19.75,
    date: "2026-07-26",
    paymentMethod: "Wallet",
    description: "Shared cab fare",
    location: "City Expo Center",
    status: "Approved",
    receipt: "Uploaded",
  },
];

export const createDefaultAcademicWorkspace = () => ({
  profile: {},
  courses: [],
  assignments: [],
  exams: [],
  attendance: [],
  formValues: {
    profile: {},
    course: {},
    assignment: {},
    exam: {},
    attendance: {},
  },
});

const defaultSettings = {
  theme: "Light",
  notifications: {
    assignment: true,
    quiz: true,
    exam: true,
    attendance: false,
    expense: true,
    complaints: true,
    hostel: true,
    ai: false,
  },
  reminders: [],
  aiSettings: {
    studyPlanner: true,
    budgetWarnings: true,
    complaintDrafting: false,
  },
};

const cloneDefaultExpenses = () => defaultExpenses.map((item) => ({ ...item }));

const readJSON = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const asArray = (value, fallback = []) =>
  Array.isArray(value) ? value : fallback;

const asObject = (value, fallback = {}) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallback;

export const normalizeAcademicWorkspace = (value) => {
  const defaults = createDefaultAcademicWorkspace();
  const workspace = asObject(value);
  const formValues = asObject(workspace.formValues);

  return {
    profile: { ...defaults.profile, ...asObject(workspace.profile) },
    courses: asArray(workspace.courses),
    assignments: asArray(workspace.assignments),
    exams: asArray(workspace.exams),
    attendance: asArray(workspace.attendance),
    formValues: {
      profile: asObject(formValues.profile),
      course: asObject(formValues.course),
      assignment: asObject(formValues.assignment),
      exam: asObject(formValues.exam),
      attendance: asObject(formValues.attendance),
    },
  };
};

export const createDefaultSharedData = () => ({
  profile: {
    personalData: {},
    profileData: {},
    contactData: {},
  },
  academic: createDefaultAcademicWorkspace(),
  expenses: cloneDefaultExpenses(),
  monthlyBudget: 0,
  budgetHistory: [],
  hostelApplications: [],
  complaints: [],
  settings: { ...defaultSettings },
  copilotMessages: [],
});

export const normalizeSharedData = (value) => {
  const defaults = createDefaultSharedData();
  const data = asObject(value);
  const settings = asObject(data.settings);
  const history = asArray(data.budgetHistory);
  const suppliedBudget = Number(data.monthlyBudget);

  return {
    profile: {
      personalData: asObject(data.profile?.personalData),
      profileData: asObject(data.profile?.profileData),
      contactData: asObject(data.profile?.contactData),
    },
    academic: normalizeAcademicWorkspace(data.academic),
    expenses: asArray(data.expenses, defaults.expenses),
    monthlyBudget: Number.isFinite(suppliedBudget)
      ? suppliedBudget
      : Number(history.at(-1)) || 0,
    budgetHistory: history.map((item) => Number(item) || 0),
    hostelApplications: asArray(data.hostelApplications),
    complaints: asArray(data.complaints),
    settings: {
      theme:
        typeof settings.theme === "string" ? settings.theme : defaultSettings.theme,
      notifications: {
        ...defaultSettings.notifications,
        ...asObject(settings.notifications),
      },
      reminders: asArray(settings.reminders),
      aiSettings: {
        ...defaultSettings.aiSettings,
        ...asObject(settings.aiSettings),
      },
    },
    copilotMessages: asArray(data.copilotMessages),
  };
};

export const loadSharedData = () => {
  const savedData = readJSON(SHARED_DATA_STORAGE_KEY, null);
  if (savedData) return normalizeSharedData(savedData);

  const budgetHistory = asArray(readJSON("slms-monthly-budgets", []));
  const legacyTheme =
    typeof window === "undefined" ? null : window.localStorage.getItem("theme");

  return normalizeSharedData({
    profile: {
      personalData: readJSON("personalData", {}),
      profileData: readJSON("profileData", {}),
      contactData: readJSON("contactData", {}),
    },
    academic: readJSON("slms-academic-workspace", createDefaultAcademicWorkspace()),
    expenses: readJSON("slms-expenses", cloneDefaultExpenses()),
    monthlyBudget: Number(budgetHistory.at(-1)) || 0,
    budgetHistory,
    hostelApplications: readJSON("slms-hostel-applications", []),
    complaints: readJSON("slms-complaints", []),
    settings: {
      theme: legacyTheme || defaultSettings.theme,
      notifications: readJSON("notifications", defaultSettings.notifications),
      reminders: readJSON("reminders", []),
      aiSettings: readJSON("aiSettings", defaultSettings.aiSettings),
    },
    copilotMessages: readJSON("slms-copilot-messages", []),
  });
};

export const persistSharedData = (data) => {
  if (typeof window === "undefined") return;

  try {
    const normalized = normalizeSharedData(data);
    window.localStorage.setItem(SHARED_DATA_STORAGE_KEY, JSON.stringify(normalized));

    // Keep the original keys in sync so previously stored browser data remains usable.
    window.localStorage.setItem(
      "personalData",
      JSON.stringify(normalized.profile.personalData),
    );
    window.localStorage.setItem(
      "profileData",
      JSON.stringify(normalized.profile.profileData),
    );
    window.localStorage.setItem(
      "contactData",
      JSON.stringify(normalized.profile.contactData),
    );
    window.localStorage.setItem(
      "slms-academic-workspace",
      JSON.stringify(normalized.academic),
    );
    window.localStorage.setItem("slms-expenses", JSON.stringify(normalized.expenses));
    window.localStorage.setItem(
      "slms-monthly-budgets",
      JSON.stringify(normalized.budgetHistory),
    );
    window.localStorage.setItem(
      "slms-hostel-applications",
      JSON.stringify(normalized.hostelApplications),
    );
    window.localStorage.setItem(
      "slms-complaints",
      JSON.stringify(normalized.complaints),
    );
    window.localStorage.setItem("theme", normalized.settings.theme);
    window.localStorage.setItem(
      "notifications",
      JSON.stringify(normalized.settings.notifications),
    );
    window.localStorage.setItem(
      "reminders",
      JSON.stringify(normalized.settings.reminders),
    );
    window.localStorage.setItem(
      "aiSettings",
      JSON.stringify(normalized.settings.aiSettings),
    );
    window.localStorage.setItem(
      "slms-copilot-messages",
      JSON.stringify(normalized.copilotMessages),
    );
  } catch {
    // A full or unavailable browser storage should never prevent the UI updating.
  }
};
