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

const isEnabled = (settings, type) => settings?.notifications?.[type] !== false;

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
    if (notification && isEnabled(settings, notification.type)) {
      notifications.push(notification);
    }
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
  if (budget && budgetPercent >= 80) {
    add({
      id: `budget:${budget}:${spent.toFixed(2)}`,
      type: "expense",
      title:
        budgetPercent >= 100
          ? "Monthly budget exceeded"
          : "You are close to your monthly budget",
      description: `$${spent.toFixed(2)} of your $${budget.toFixed(2)} monthly budget has been used.`,
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

  // Include any ad-hoc/custom notifications saved in settings so that they
  // appear immediately and persist across refreshes. Each custom notification
  // may include createdAt, timestamp, or date fields; prefer createdAt when present.
  asArray(settings.customNotifications).forEach((item) => {
    if (!item) return;
    const id = item.id || `custom:${item.createdAt || item.timestamp || Date.now()}:${Math.random()}`;
    const dateValue = item.createdAt || item.timestamp || item.date || "";
    add({
      id,
      type: item.type || "reminder",
      title: item.title || "Notification",
      description: item.description || "",
      relativeTime: item.relativeTime || "",
      date: dateValue,
      route: item.route || "",
      urgency: item.urgency || "upcoming",
    });
  });

  const readIds = new Set(asArray(settings.readNotificationIds));
  const dismissedIds = new Set(asArray(settings.dismissedNotificationIds));
  return notifications
    .filter((item) => !dismissedIds.has(item.id))
    .map((item) => ({ ...item, read: readIds.has(item.id) }))
    .sort((first, second) => {
      const urgencyOrder = { critical: 0, soon: 1, upcoming: 2 };
      const urgencyDifference =
        urgencyOrder[first.urgency] - urgencyOrder[second.urgency];
      if (urgencyDifference) return urgencyDifference;

      const firstDate =
        toLocalDate(first.date)?.getTime() || Number.MAX_SAFE_INTEGER;
      const secondDate =
        toLocalDate(second.date)?.getTime() || Number.MAX_SAFE_INTEGER;
      return firstDate - secondDate;
    });
};

export const getNotificationLabel = (type) =>
  notificationLabels[type] || "Notification";
