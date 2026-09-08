import "./App.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  ConfigProvider,
  Drawer,
  Layout,
  Result,
  Spin,
  theme as antdTheme,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import Header from "./assets/Pages/Header/header";
import Sidebar from "./assets/Pages/sidebar/sidebar";
import Profile from "./assets/Pages/Profile/profile";
import Settings from "./assets/Pages/Setting/Setting";
import Complaints from "./assets/Pages/Complaints/Complaints";
import Hostel from "./assets/Pages/Hostel/Hostel";
import Expense from "./assets/Pages/Expense/Expense";
import Academic from "./assets/Pages/Academic/Academic";
import Copilot from "./assets/Pages/Ai-chatbot/aicopilot";
import Dashboard from "./assets/Pages/Dashboard/Dashboard";
import BellIcon from "./assets/Pages/Header/bellicon";
import Login from "./assets/Pages/Login/login";
import Forgot from "./assets/Pages/Login/forgot";
import ProtectedRoute from "./assets/Pages/Login/protectedRoute";
import Signup from "./assets/Pages/Sign Up/signup";
import ChangePassword from "./assets/Pages/Setting/ChangePassword";
import LoginHistory from "./assets/Pages/Setting/LoginHistory";
import { useAuth } from "./hooks/useAuth";
import { getNotifications } from "./data/notifications";
import { studentDataService } from "./services/studentDataService";
import { listReminders, createReminder, toggleReminder, deleteReminder } from "./services/reminderService";
import { isApiConfigured, request } from "./api/client";
import { createDefaultSharedData } from "./data/sharedData";
import { connectSocket } from "./services/socketService";
import LoadingState from "./components/LoadingState";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const notificationRouteByModule = {
  complaints: "/complaints",
  complaint: "/complaints",
  expenses: "/expense",
  expense: "/expense",
  hostel: "/hostel",
  assignments: "/academic",
  assignment: "/academic",
  academic: "/academic",
  attendance: "/academic",
};

const normalizeRemoteNotification = (notification) => {
  const id = String(notification?._id || notification?.id || "");
  const module = notification?.module || notification?.type || "general";
  const isRead = Boolean(
    notification?.isRead !== undefined
      ? notification.isRead
      : notification?.read,
  );
  return {
    ...notification,
    id,
    isRead,
    read: isRead,
    description: notification?.message || notification?.description || "",
    severity: notification?.severity || notification?.priority || "normal",
    route:
      notification?.navigationTarget ||
      notification?.route ||
      notificationRouteByModule[module] ||
      "/notifications",
  };
};

const mergeRemoteNotifications = (existing, incoming) => {
  const merged = [];
  const seen = new Set();
  [...incoming, ...existing].forEach((notification) => {
    const normalized = normalizeRemoteNotification(notification);
    const id = String(normalized.id || normalized._id || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    merged.push(normalized);
  });
  return merged;
};

function LoadingScreen() {
  return (
    <div className="app-route-loading" aria-live="polite">
      <Spin size="large" description="Loading SLMS..." />
    </div>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function StudentLayout() {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [isTablet, setIsTablet] = useState(
    () =>
      window.innerWidth >= MOBILE_BREAKPOINT &&
      window.innerWidth < TABLET_BREAKPOINT,
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [deletingNotificationIds, setDeletingNotificationIds] = useState([]);
  const deletingNotificationIdsRef = useRef(new Set());
  const [sharedData, setSharedData] = useState(() => {
    return isApiConfigured ? createDefaultSharedData() : studentDataService.load();
  });
  const [resourceLoading, setResourceLoading] = useState({});
  const [initialDataLoading, setInitialDataLoading] = useState(isApiConfigured);
  const setResourceBusy = useCallback((resource, busy) => {
    setResourceLoading((current) => ({ ...current, [resource]: busy }));
  }, []);

  useEffect(() => {
    if (isApiConfigured || !user) return;
    const { profile, academic, ...otherData } = sharedData;
    studentDataService.save(otherData);
  }, [sharedData, user]);

  useEffect(() => {
    if (!user) setSharedData(createDefaultSharedData());
  }, [user]);

  useEffect(() => {
    if (!isApiConfigured || !user) return;
    let cancelled = false;
    setSharedData(createDefaultSharedData());
    const resources = ["profile", "academic", "complaints", "expenses", "preferences", "settings", "hostel", "notifications", "reminders"];
    setResourceLoading(Object.fromEntries(resources.map((resource) => [resource, true])));
    const trackResource = (resource, promise) =>
      promise.finally(() => {
        if (!cancelled) setResourceBusy(resource, false);
      });
    const loadRemoteData = async () => {
      const [
        profileResult,
        academicResult,
        complaintsResult,
        expensesResult,
        preferencesResult,
        settingsResult,
        hostelResult,
        notificationsResult,
        remindersResult,
      ] =
        await Promise.allSettled([
          trackResource("profile", request("/students/profile")),
          trackResource("academic", request("/academic")),
          trackResource("complaints", request("/complaints")),
          trackResource("expenses", request("/expenses")),
          trackResource("preferences", request("/users/me/preferences")),
          trackResource("settings", request("/settings")),
          trackResource("hostel", request("/hostel")),
          trackResource("notifications", request("/notifications")),
          trackResource("reminders", listReminders()),
        ]);
      if (cancelled) return;
      setSharedData((current) => ({
        ...createDefaultSharedData(),
        ...current,
        profile:
          profileResult.status === "fulfilled"
            ? {
                personalData: profileResult.value.profile || {},
                profileData: profileResult.value.profile || {},
                contactData: profileResult.value.profile || {},
              }
            : current.profile,
        academic:
          academicResult.status === "fulfilled"
            ? {
                ...current.academic,
                profile: academicResult.value.profile || {},
                courses: academicResult.value.courses || [],
                assignments: academicResult.value.assignments || [],
                exams: academicResult.value.exams || [],
                attendance: academicResult.value.attendance || [],
              }
            : current.academic,
        complaints:
          complaintsResult.status === "fulfilled"
            ? complaintsResult.value.complaints || []
            : current.complaints,
        expenses:
          expensesResult.status === "fulfilled"
            ? expensesResult.value.expenses || []
            : current.expenses,
        monthlyBudget:
          preferencesResult.status === "fulfilled"
            ? Number(preferencesResult.value.preferences?.monthlyBudget || 0)
            : current.monthlyBudget,
        budgetHistory:
          preferencesResult.status === "fulfilled" &&
          Array.isArray(preferencesResult.value.preferences?.budgetHistory)
            ? preferencesResult.value.preferences.budgetHistory
            : current.budgetHistory,
        hostelApplications:
          hostelResult.status === "fulfilled"
            ? hostelResult.value.records || []
            : current.hostelApplications,
        settings:
          remindersResult.status === "fulfilled" || notificationsResult.status === "fulfilled" || settingsResult.status === "fulfilled"
            ? {
                ...current.settings,
                ...(settingsResult.status === "fulfilled"
                  ? {
                      notifications: {
                        ...current.settings.notifications,
                        ...(settingsResult.value.settings?.notifications || {}),
                      },
                      aiSettings: {
                        ...current.settings.aiSettings,
                        ...(settingsResult.value.settings?.aiSettings || {}),
                      },
                    }
                  : {}),
                ...(remindersResult.status === "fulfilled"
                  ? { reminders: remindersResult.value }
                  : {}),
                ...(notificationsResult.status === "fulfilled"
                  ? {
                      remoteNotifications: mergeRemoteNotifications(
                        current.settings?.remoteNotifications || [],
                        notificationsResult.value.notifications || [],
                      ),
                    }
                  : {}),
              }
            : current.settings,
      }));
    };
    loadRemoteData()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitialDataLoading(false);
      });
    const refreshNotifications = async () => {
      setResourceBusy("notifications", true);
      try {
        const result = await request("/notifications");
        if (cancelled) return;
        setSharedData((current) => ({
          ...current,
          settings: {
            ...current.settings,
            remoteNotifications: mergeRemoteNotifications(
              current.settings?.remoteNotifications || [],
              result.notifications || [],
            ),
          },
        }));
      } finally {
        if (!cancelled) setResourceBusy("notifications", false);
      }
    };
    const refreshResource = async (resource) => {
      const paths = {
        profile: "/students/profile",
        academic: "/academic",
        complaints: "/complaints",
        expenses: "/expenses",
        hostel: "/hostel",
        fees: "/fees",
        reminders: "/reminders",
        preferences: "/users/me/preferences",
      };
      const path = paths[resource];
      if (!path) return;
      setResourceBusy(resource, true);
      try {
        const result = await request(path);
        if (cancelled) return;
        setSharedData((current) => {
        const next = { ...current };
        if (resource === "profile") {
          next.profile = {
            personalData: result.profile || {},
            profileData: result.profile || {},
            contactData: result.profile || {},
          };
        } else if (resource === "academic") {
          next.academic = {
            ...current.academic,
            profile: result.profile || {},
            courses: result.courses || [],
            assignments: result.assignments || [],
            exams: result.exams || [],
            attendance: result.attendance || [],
          };
        } else if (resource === "complaints") {
          next.complaints = result.complaints || [];
        } else if (resource === "expenses") {
          next.expenses = result.expenses || [];
        } else if (resource === "hostel") {
          next.hostelApplications = result.records || [];
        } else if (resource === "reminders") {
          next.settings = { ...current.settings, reminders: result };
        } else if (resource === "preferences") {
          next.monthlyBudget = Number(result.preferences?.monthlyBudget || 0);
          next.budgetHistory = Array.isArray(result.preferences?.budgetHistory)
            ? result.preferences.budgetHistory
            : current.budgetHistory;
        }
          return next;
        });
      } finally {
        if (!cancelled) setResourceBusy(resource, false);
      }
    };
  }, [user]);

  useEffect(() => {
    if (!isApiConfigured || !user) {
      setInitialDataLoading(false);
    }
    let cancelled = false;
    const socket = connectSocket();
    if (!socket) return undefined;
    const upsertNotification = (incoming) => {
      const normalized = normalizeRemoteNotification(incoming);
      setSharedData((current) => {
        const existing = current.settings?.remoteNotifications || [];
        const id = String(normalized.id || normalized._id);
        const found = existing.some(
          (notification) => String(notification.id || notification._id) === id,
        );
        return {
          ...current,
          settings: {
            ...current.settings,
            remoteNotifications: found
              ? existing.map((notification) =>
                  String(notification.id || notification._id) === id
                    ? { ...notification, ...normalized }
                    : notification,
                )
              : [normalized, ...existing],
          },
        };
      });
    };
    const handleNotificationUpdated = (incoming) => upsertNotification(incoming);
    const handleNotificationDeleted = ({ id }) => {
      setSharedData((current) => ({
        ...current,
        settings: {
          ...current.settings,
          remoteNotifications: (current.settings?.remoteNotifications || []).filter(
            (notification) => String(notification.id || notification._id) !== String(id),
          ),
        },
      }));
    };
    const handleReadAll = () => {
      setSharedData((current) => ({
        ...current,
        settings: {
          ...current.settings,
          remoteNotifications: (current.settings?.remoteNotifications || []).map(
            (notification) => ({ ...notification, read: true, isRead: true }),
          ),
        },
      }));
    };
    const handleDataChanged = ({ resource }) => {
      window.dispatchEvent(
        new CustomEvent("slms:data-changed", { detail: { resource } }),
      );
      if (resource === "notifications") return;
      refreshResource(resource).catch(() => {});
    };
    socket.on("notification:created", upsertNotification);
    socket.on("notification:updated", handleNotificationUpdated);
    socket.on("notification:deleted", handleNotificationDeleted);
    socket.on("notifications:read-all", handleReadAll);
    socket.on("data:changed", handleDataChanged);
    socket.on("connect", () => refreshNotifications().catch(() => {}));
    return () => {
      cancelled = true;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [setResourceBusy, user]);

  useEffect(() => {
    const syncFromAnotherTab = (event) => {
      if (event.key === studentDataService.storageKey && event.newValue) {
        setSharedData(studentDataService.load());
      }
    };
    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (isTablet) setCollapsed(true);
    else if (!isMobile) setCollapsed(false);
    if (!isMobile) setMobileSidebarOpen(false);
  }, [isMobile, isTablet]);

  const updateSection = useCallback((section, nextValue) => {
    setSharedData((current) => ({
      ...current,
      [section]:
        typeof nextValue === "function"
          ? nextValue(current[section])
          : nextValue,
    }));
  }, []);

  const updateMonthlyBudget = useCallback((value) => {
    const budget = Math.max(0, Number(value) || 0);
    setSharedData((current) => ({
      ...current,
      monthlyBudget: budget,
      budgetHistory: [...current.budgetHistory, budget],
    }));
  }, []);

  const resetProfile = useCallback(async () => {
    if (isApiConfigured) {
      await request("/students/profile", {
        method: "PUT",
        body: {
          studentId: "",
          fullName: "",
          fatherName: "",
          gender: "",
          dob: null,
          cnic: "",
          bloodGroup: "",
          nationality: "",
          maritalStatus: "Single",
          universityEmail: "",
          personalEmail: "",
          phone: "",
          emergencyContact: "",
          currentAddress: "",
          permanentAddress: "",
          profileImage: "",
          program: "",
          semester: "",
          batch: "",
          cgpa: 0,
          department: "",
          sessions: "",
          rollNo: "",
        },
      });
    }
    updateSection("profile", {
      personalData: {},
      profileData: {},
      contactData: {},
    });
  }, [updateSection]);

  const notifications = useMemo(
    () =>
      isApiConfigured
        ? sharedData.settings?.remoteNotifications || []
        : getNotifications(sharedData),
    [sharedData],
  );
  const unreadNotificationCount = notifications.filter(
    (item) => !(item.isRead !== undefined ? item.isRead : item.read),
  ).length;
  const markNotificationsRead = useCallback(
    async (notificationIds) => {
      if (!notificationIds?.length) return;
      if (isApiConfigured) {
        const ids = new Set(notificationIds.map(String));
        updateSection("settings", (settings) => ({
          ...settings,
          remoteNotifications: (settings?.remoteNotifications || []).map(
            (notification) =>
              ids.has(String(notification.id || notification._id))
                ? { ...notification, id: String(notification.id || notification._id), read: true, isRead: true }
                : notification,
          ),
        }));
        const results = await Promise.allSettled(
          [...ids].map((id) =>
            request(`/notifications/${id}/read`, { method: "PATCH" }),
          ),
        );
        const failed = results.find((result) => result.status === "rejected");
        if (failed) throw failed.reason;
        return;
      }
      updateSection("settings", (settings) => ({
        ...settings,
        readNotificationIds: Array.from(
          new Set([
            ...(settings?.readNotificationIds || []),
            ...notificationIds,
          ]),
        ).slice(-500),
      }));
    },
    [updateSection],
  );

  const markNotificationUnread = useCallback(
    async (notificationId) => {
      if (!notificationId) return;
      if (isApiConfigured) {
        updateSection("settings", (settings) => ({
          ...settings,
          remoteNotifications: (settings?.remoteNotifications || []).map(
            (notification) =>
              String(notification.id || notification._id) === String(notificationId)
                ? { ...notification, read: false, isRead: false }
                : notification,
          ),
        }));
        await request(`/notifications/${notificationId}/unread`, {
          method: "PATCH",
        });
        return;
      }
      updateSection("settings", (settings) => ({
        ...settings,
        readNotificationIds: (settings?.readNotificationIds || []).filter(
          (id) => String(id) !== String(notificationId),
        ),
      }));
    },
    [updateSection],
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (isApiConfigured) {
      updateSection("settings", (settings) => ({
        ...settings,
        remoteNotifications: (settings?.remoteNotifications || []).map(
          (notification) => ({ ...notification, read: true, isRead: true }),
        ),
      }));
      await request("/notifications/mark-all-read", { method: "PATCH" });
      return;
    }
    updateSection("settings", (settings) => ({
      ...settings,
      readNotificationIds: Array.from(
        new Set([
          ...(settings?.readNotificationIds || []),
          ...notifications.map((notification) => notification.id),
        ]),
      ).slice(-500),
    }));
  }, [notifications, updateSection]);

  const deleteNotifications = useCallback(
    async (notificationIds) => {
      if (!notificationIds?.length) return;
      if (!isApiConfigured) {
        updateSection("settings", (settings) => ({
          ...settings,
          dismissedNotificationIds: [
            ...new Set([
              ...(settings?.dismissedNotificationIds || []),
              ...notificationIds,
            ]),
          ],
        }));
        return;
      }
      const remoteNotifications = sharedData.settings?.remoteNotifications || [];
      const selected = notificationIds.map((id) =>
        remoteNotifications.find(
          (notification) =>
            String(notification._id || notification.id) === String(id),
        ),
      );
      const deletable = selected.filter((notification) => notification?._id);
      if (deletable.length !== notificationIds.length) {
        throw new Error("This notification is not stored in MongoDB.");
      }

      const ids = deletable.map((notification) => String(notification._id));
      if (!ids.length) return;
      const pendingIds = ids.filter(
        (id) => !deletingNotificationIdsRef.current.has(id),
      );
      if (!pendingIds.length) return;
      pendingIds.forEach((id) => deletingNotificationIdsRef.current.add(id));
      setDeletingNotificationIds((current) => [
        ...new Set([...current, ...pendingIds]),
      ]);
      try {
        const results = await Promise.allSettled(
          pendingIds.map((id) =>
            request(`/notifications/${id}`, { method: "DELETE" }),
          ),
        );
        const deletedIds = pendingIds.filter(
          (_id, index) => results[index].status === "fulfilled",
        );
        const failedResults = results.filter(
          (result) => result.status === "rejected",
        );
        updateSection("settings", (settings) => ({
          ...settings,
          remoteNotifications: (settings?.remoteNotifications || []).filter(
            (notification) => !deletedIds.includes(String(notification._id)),
          ),
        }));
        if (failedResults.length) {
          throw failedResults[0].reason;
        }
      } finally {
        pendingIds.forEach((id) =>
          deletingNotificationIdsRef.current.delete(id),
        );
        setDeletingNotificationIds((current) =>
          current.filter((id) => !pendingIds.includes(id)),
        );
      }
    },
    [
      sharedData.settings?.remoteNotifications,
      updateSection,
    ],
  );

  if (initialDataLoading) return <LoadingScreen />;

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <div
        className={`app-shell ${mobileSidebarOpen ? "mobile-navigation-open" : ""}`}
      >
        <Header
          profileData={sharedData.profile.profileData}
          unreadNotificationCount={unreadNotificationCount}
          onNotificationsOpen={() => undefined}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          onLogout={logout}
        />
        <Layout className="app-body">
          {!isMobile ? (
            <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={setCollapsed}
              width={220}
              theme="dark"
              className="app-sidebar app-desktop-sidebar"
            >
              <Sidebar />
            </Sider>
          ) : null}
          <Content className="app-content">
            <Outlet
              context={{
                sharedData,
                notifications,
                updateSection,
                updateMonthlyBudget,
                resetProfile,
                markNotificationsRead,
                markAllNotificationsRead,
                markNotificationUnread,
                deleteNotifications,
                deletingNotificationIds,
                resourceLoading,
              }}
            />
          </Content>
        </Layout>
        <Drawer
          className="mobile-sidebar-drawer"
          rootClassName="mobile-sidebar-drawer-root"
          title="Navigation"
          placement="left"
          width={260}
          closable
          closeIcon={<CloseOutlined />}
          open={isMobile && mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          styles={{
            header: { background: "#1e3a8a", color: "#ffffff" },
            body: { padding: 0, background: "#1e3a8a" },
          }}
        >
          <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </Drawer>
      </div>
    </ConfigProvider>
  );
}

function useStudentData() {
  return useOutletContext();
}

function DashboardPage() {
  const { sharedData, notifications, resourceLoading } = useStudentData();
  return <LoadingState loading={resourceLoading?.profile || resourceLoading?.academic}><Dashboard data={sharedData} notifications={notifications} /></LoadingState>;
}

function NotificationsPage() {
  const {
    notifications,
    resourceLoading,
    markNotificationsRead,
    markAllNotificationsRead,
    markNotificationUnread,
    deleteNotifications,
    deletingNotificationIds,
  } =
    useStudentData();
  return (
    <BellIcon
        notifications={notifications}
        loading={resourceLoading?.notifications}
        onMarkNotificationsRead={markNotificationsRead}
        onMarkAllNotificationsRead={markAllNotificationsRead}
        onMarkNotificationUnread={markNotificationUnread}
        onDeleteNotifications={deleteNotifications}
        deletingNotificationIds={deletingNotificationIds}
      />
  );
}

function CopilotPage() {
  const { sharedData, updateSection } = useStudentData();
  return (
    <Copilot
      data={sharedData}
      messages={sharedData.copilotMessages}
      onMessagesChange={(nextValue) =>
        updateSection("copilotMessages", nextValue)
      }
    />
  );
}

function ProfilePage() {
  const { sharedData, updateSection, resetProfile, resourceLoading } = useStudentData();
  return (
    <Profile
      profile={sharedData.profile}
      onProfileChange={(nextValue) => updateSection("profile", nextValue)}
      onResetProfile={resetProfile}
      loading={resourceLoading?.profile}
    />
  );
}

function ExpensePage() {
  const { sharedData, updateSection, updateMonthlyBudget, resourceLoading } = useStudentData();
  return (
    <Expense
      expenses={sharedData.expenses}
      monthlyBudget={sharedData.monthlyBudget}
      onExpensesChange={(nextValue) => updateSection("expenses", nextValue)}
      onMonthlyBudgetChange={updateMonthlyBudget}
      loading={resourceLoading?.expenses || resourceLoading?.preferences}
    />
  );
}

function ComplaintsPage() {
  const { sharedData, updateSection, resourceLoading } = useStudentData();
  return (
    <Complaints
      complaints={sharedData.complaints}
      onComplaintsChange={(nextValue) => updateSection("complaints", nextValue)}
      loading={resourceLoading?.complaints}
    />
  );
}

function SettingsPage() {
  const { sharedData, updateSection, resourceLoading } = useStudentData();
  const saveNotification = async (key, value) => {
    const result = await request("/settings/notifications", {
      method: "PUT",
      body: { [key]: value },
    });
    updateSection("settings", (settings) => ({
      ...settings,
      notifications: result.settings?.notifications || settings.notifications,
    }));
  };
  const saveAiSetting = async (key, value) => {
    const result = await request("/settings/ai", {
      method: "PUT",
      body: { [key]: value },
    });
    updateSection("settings", (settings) => ({
      ...settings,
      aiSettings: result.settings?.aiSettings || settings.aiSettings,
    }));
  };
  return (
    <Settings
      settings={sharedData.settings}
      onSettingsChange={(nextValue) => updateSection("settings", nextValue)}
      onNotificationChange={saveNotification}
      onAiSettingChange={saveAiSetting}
      loading={resourceLoading?.settings || resourceLoading?.reminders}
      onReminderCreate={async (reminder) => {
        const created = await createReminder(reminder);
        updateSection("settings", (settings) => ({
          ...settings,
          reminders: [created, ...(settings?.reminders || [])],
        }));
        return created;
      }}
      onReminderToggle={async (id) => {
        const updated = await toggleReminder(id);
        updateSection("settings", (settings) => ({
          ...settings,
          reminders: (settings?.reminders || []).map((item) =>
            String(item.id) === String(id) ? updated : item,
          ),
        }));
        return updated;
      }}
      onReminderDelete={async (id) => {
        await deleteReminder(id);
        updateSection("settings", (settings) => ({
          ...settings,
          reminders: (settings?.reminders || []).filter(
            (item) => String(item.id) !== String(id),
          ),
        }));
      }}
    />
  );
}

function ChangePasswordPage() {
  return <ChangePassword />;
}

function LoginHistoryPage() {
  return <LoginHistory />;
}

function HostelPage() {
  const { sharedData, updateSection, resourceLoading } = useStudentData();
  return (
    <Hostel
      applications={sharedData.hostelApplications}
      onApplicationsChange={(nextValue) =>
        updateSection("hostelApplications", nextValue)
      }
      loading={resourceLoading?.hostel}
    />
  );
}

function AcademicPage() {
  const { sharedData, updateSection, resourceLoading } = useStudentData();
  return (
    <Academic
      workspace={sharedData.academic}
      onWorkspaceChange={(nextValue) => updateSection("academic", nextValue)}
      loading={resourceLoading?.academic}
    />
  );
}

function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  return (
    <Result
      status="404"
      title="Page not found"
      subTitle="The page you requested is not available in SLMS."
      extra={
        <Button
          type="primary"
          onClick={() => navigate(isAuthenticated ? "/" : "/login")}
        >
          {isAuthenticated ? "Back to dashboard" : "Go to login"}
        </Button>
      }
    />
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot"
        element={
          <PublicRoute>
            <Forgot />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="aicopilot" element={<CopilotPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="expense" element={<ExpensePage />} />
        <Route path="expenses" element={<ExpensePage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="setting" element={<SettingsPage />} />
        <Route
          path="setting/change-password"
          element={<ChangePasswordPage />}
        />
        <Route path="setting/login-history" element={<LoginHistoryPage />} />
        <Route path="hostel" element={<HostelPage />} />
        <Route path="academic" element={<AcademicPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
