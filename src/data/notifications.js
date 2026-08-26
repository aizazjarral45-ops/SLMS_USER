const DAY_IN_MS = 24 * 60 * 60 * 1000;

const notificationLabels = {
  assignment: "Assignment reminders",
  quiz: "Quiz reminders",
  exam: "Exam reminders",
  attendance: "Attendance alerts",
  expense: "Budget alerts",
  complaints: "Complaint updates",
  hostel: "Hostel updates",
  reminder: "Personal reminders",
  ai: "AI suggestions",
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const notificationCreationCache = new Map();

const getStableCreatedAt = (notification, fallbackDate = new Date()) => {
  if (notification?.createdAt) return notification.createdAt;

  const cacheKey =
    notification?.id || `notification:${fallbackDate.toISOString()}`;
  if (notificationCreationCache.has(cacheKey)) {
    return notificationCreationCache.get(cacheKey);
  }

  const createdAt = fallbackDate.toISOString();
  notificationCreationCache.set(cacheKey, createdAt);
  return createdAt;
};

const isEnabled = (settings, type) => settings?.notifications?.[type] !== false;

const parseNotificationDate = (value) => {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) return null;

    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) return date;

    const dateOnly = new Date(`${normalized}T00:00:00`);
    return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
  }

  return null;
};

const getNotificationSortValue = (notification) => {
  const rawValue =
    notification?.createdAt ||
    notification?.timestamp ||
    notification?.dateTime ||
    notification?.date ||
    notification?.time ||
    null;
  const date = parseNotificationDate(rawValue);
  return date ? date.getTime() : 0;
};

const formatNotificationDate = (value) => {
  const date = parseNotificationDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatNotificationTime = (value) => {
  const date = parseNotificationDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const normalizeNotification = (notification = {}, fallback = {}) => {
  if (!notification || typeof notification !== "object") return null;

  const createdAt = getStableCreatedAt(
    {
      ...notification,
      id: notification.id || fallback.id,
    },
    parseNotificationDate(
      notification.createdAt ||
        notification.timestamp ||
        notification.dateTime ||
        fallback.createdAt ||
        null,
    ) || new Date(),
  );

  const explicitId =
    typeof notification.id === "string" ? notification.id.trim() : "";
  const fallbackId = typeof fallback.id === "string" ? fallback.id.trim() : "";
  const id =
    explicitId ||
    fallbackId ||
    `notification:${createdAt}:${Math.random().toString(16).slice(2)}`;

  return {
    ...notification,
    id,
    createdAt,
    date: notification.date || formatNotificationDate(createdAt),
    time: notification.time || formatNotificationTime(createdAt),
    title: notification.title || fallback.title || "Notification",
    message:
      notification.message ||
      notification.description ||
      fallback.message ||
      "",
    type: notification.type || fallback.type || "reminder",
    module:
      notification.module || notification.route || fallback.module || "general",
    read: Boolean(notification.read),
    description: notification.description || notification.message || "",
  };
};

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const toLocalDate = (value) => {
  if (!value || typeof value !== "string") return null;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
};

const daysFromToday = (value) => {
  const date = toLocalDate(value);
  if (!date) return null;

  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - getStartOfToday().getTime()) / DAY_IN_MS);
};

const relativeDeadline = (days) => {
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === 2) return "Due in 2 days";
  if (days === -1) return "Overdue by 1 day";
  return `Overdue by ${Math.abs(days)} days`;
};

const formatDate = (value) => {
  const date = toLocalDate(value);
  if (!date) return "No date set";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const reminderCategory = (type = "") => {
  const normalized = type.toLowerCase();
  if (normalized.includes("quiz")) return "quiz";
  if (normalized.includes("exam")) return "exam";
  if (normalized.includes("hostel") || normalized.includes("fee"))
    return "hostel";
  if (normalized.includes("assignment") || normalized.includes("project")) {
    return "assignment";
  }
  return "reminder";
};

const isQuiz = (item) => /quiz/i.test(item.title || "");

const buildDeadline = ({ id, type, title, course, date, route, detail }) => {
  const days = daysFromToday(date);
  if (days === null || days > 2) return null;

  return {
    id,
    type,
    title,
    description: [course, detail, formatDate(date)].filter(Boolean).join(" · "),
    relativeTime: relativeDeadline(days),
    date,
    route,
    urgency: days <= 0 ? "critical" : days === 1 ? "soon" : "upcoming",
  };
};

export const getNotifications = (data) => {
  const settings = data?.settings || {};
  const academic = data?.academic || {};
  const notifications = [];
  const add = (notification) => {
    if (!notification) return;

    const normalized = normalizeNotification(notification);
    if (!normalized || !isEnabled(settings, normalized.type)) return;
    if (notifications.some((entry) => entry.id === normalized.id)) return;

    notifications.push(normalized);
  };

  asArray(academic.assignments)
    .filter((item) => item.status !== "Completed")
    .forEach((item) => {
      add(
        buildDeadline({
          id: `assignment:${item.id || item.title}:${item.dueDate}`,
          type: "assignment",
          title: `${item.title || "Assignment"} needs attention`,
          course: item.course,
          date: item.dueDate,
          route: "/academic",
          detail: "Assignment deadline",
        }),
      );
    });

  asArray(academic.exams).forEach((item) => {
    const quiz = isQuiz(item);
    add(
      buildDeadline({
        id: `${quiz ? "quiz" : "exam"}:${item.id || item.title}:${item.examDate}`,
        type: quiz ? "quiz" : "exam",
        title: `${item.title || (quiz ? "Quiz" : "Exam")} is coming up`,
        course: item.course,
        date: item.examDate,
        route: "/academic",
        detail: item.venue
          ? `Venue: ${item.venue}`
          : quiz
            ? "Quiz date"
            : "Exam date",
      }),
    );
  });

  asArray(academic.attendance).forEach((item) => {
    const total = Number(item.total || 0);
    const rate = total
      ? Math.round((Number(item.attended || 0) / total) * 100)
      : 0;
    if (total && rate < 75) {
      add({
        id: `attendance:${item.id || item.course}:${item.attended}:${item.total}`,
        type: "attendance",
        title: `Attendance needs attention in ${item.course || "a course"}`,
        description: `${item.attended || 0} of ${total} classes attended (${rate}%).`,
        relativeTime: "Below 75%",
        date: "",
        route: "/academic",
        urgency: rate < 60 ? "critical" : "soon",
      });
    }
  });

  const expenses = asArray(data?.expenses);
  const budget = Number(data?.monthlyBudget || 0);
  const spent = expenses.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  );
  const budgetPercent = budget ? Math.round((spent / budget) * 100) : 0;
  // Trigger a budget notification when remaining budget is 30% or less
  // i.e., when spent is >= 70% of budget
  if (budget && budgetPercent >= 70) {
    add({
      id: `budget:${budget}:${spent.toFixed(2)}`,
      type: "expense",
      title:
        budgetPercent >= 100
          ? "Monthly budget exceeded"
          : "Your remaining budget is low",
      description: `$${spent.toFixed(2)} of your $${budget.toFixed(2)} monthly budget has been used (${budgetPercent}% used).`,
      relativeTime: `${budgetPercent}% used`,
      date: "",
      route: "/expense",
      urgency: budgetPercent >= 100 ? "critical" : "soon",
    });
  }

  asArray(data?.complaints).forEach((item) => {
    if (!item.status) return;
    add({
      id: `complaint:${item.key || item.id || item.title}:${item.status}`,
      type: "complaints",
      title: `${item.title || "Your complaint"}: ${item.status}`,
      description:
        item.resolution ||
        `${item.category || "Student support"} complaint status updated.`,
      relativeTime: item.status === "Resolved" ? "Resolved" : "Status update",
      date: item.date || "",
      route: "/complaints",
      urgency:
        item.priority === "High" && item.status !== "Resolved"
          ? "soon"
          : "upcoming",
    });
  });

  asArray(data?.hostelApplications).forEach((item) => {
    const paymentPending = item.feesStatus && item.feesStatus !== "Paid";
    if (paymentPending) {
      add(
        buildDeadline({
          id: `hostel-payment:${item.key || item.applicationNo}:${item.paymentDueDate}:${item.feesStatus}`,
          type: "hostel",
          title: "Hostel payment needs attention",
          course: item.applicationNo,
          date: item.paymentDueDate,
          route: "/hostel",
          detail: `${item.feesStatus} · PKR ${Number(item.feesPerSemester || 0).toLocaleString()}`,
        }),
      );
    }

    if (item.status === "Submitted") {
      add({
        id: `hostel-application:${item.key || item.applicationNo}:submitted`,
        type: "hostel",
        title: "Hostel application submitted",
        description: `${item.applicationNo || "Your application"} is saved and awaiting an update.`,
        relativeTime: "Application update",
        date: item.submittedAt || "",
        route: "/hostel",
        urgency: "upcoming",
      });
    }
  });

  asArray(settings.reminders)
    .filter((item) => !item.done)
    .forEach((item) => {
      const type = reminderCategory(item.type);
      const days = daysFromToday(item.when);
      if (days !== null && days > 2) return;

      add({
        id: `reminder:${item.id || item.title}:${item.when}`,
        type,
        title: item.title || "Personal reminder",
        description: [item.type, item.when].filter(Boolean).join(" · "),
        relativeTime:
          days === null ? "Personal reminder" : relativeDeadline(days),
        date: item.when || "",
        route: "/setting",
        urgency: days !== null && days <= 0 ? "critical" : "upcoming",
      });
    });

  asArray(settings.customNotifications).forEach((item) => {
    if (!item) return;

    const normalized = normalizeNotification(item, {
      id: `custom:${item.createdAt || item.timestamp || item.date || Date.now()}`,
      type: item.type || "reminder",
      title: item.title || "Notification",
      message: item.message || item.description || "",
      module: item.module || item.route || "general",
    });

    if (normalized) add(normalized);
  });

  const readIds = new Set(asArray(settings.readNotificationIds));
  const dismissedIds = new Set(asArray(settings.dismissedNotificationIds));
  return notifications
    .filter((item) => !dismissedIds.has(item.id))
    .map((item) => ({ ...item, read: readIds.has(item.id) }))
    .sort(
      (first, second) =>
        getNotificationSortValue(second) - getNotificationSortValue(first),
    );
};

export const getNotificationLabel = (type) =>
  notificationLabels[type] || "Notification";
