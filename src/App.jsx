import "./App.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  ConfigProvider,
  Drawer,
  Layout,
  Result,
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
import { isApiConfigured, request } from "./api/client";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function LoadingScreen() {
  return <div className="app-route-loading">Loading SLMS...</div>;
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
  const [sharedData, setSharedData] = useState(studentDataService.load);

  useEffect(() => {
    studentDataService.save(sharedData);
  }, [sharedData]);

  useEffect(() => {
    if (!isApiConfigured || !user) return;
    let cancelled = false;
    const loadRemoteData = async () => {
      const [complaintsResult, expensesResult, hostelResult, notificationsResult] =
        await Promise.allSettled([
          request("/complaints"),
          request("/expenses"),
          request("/hostel"),
          request("/notifications"),
        ]);
      if (cancelled) return;
      setSharedData((current) => ({
        ...current,
        complaints:
          complaintsResult.status === "fulfilled"
            ? complaintsResult.value.complaints || []
            : current.complaints,
        expenses:
          expensesResult.status === "fulfilled"
            ? expensesResult.value.expenses || []
            : current.expenses,
        hostelApplications:
          hostelResult.status === "fulfilled"
            ? hostelResult.value.records || []
            : current.hostelApplications,
        settings:
          notificationsResult.status === "fulfilled"
            ? {
                ...current.settings,
                remoteNotifications:
                  notificationsResult.value.notifications || [],
              }
            : current.settings,
      }));
    };
    loadRemoteData().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  const resetProfile = useCallback(() => {
    updateSection("profile", {
      personalData: {},
      profileData: {},
      contactData: {},
    });
  }, [updateSection]);

  const notifications = useMemo(
    () => [
      ...(sharedData.settings?.remoteNotifications || []),
      ...getNotifications(sharedData),
    ],
    [sharedData],
  );
  const unreadNotificationCount = notifications.filter(
    (item) => !item.read,
  ).length;

  const markNotificationsRead = useCallback(
    (notificationIds) => {
      if (!notificationIds?.length) return;
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

  const dismissNotifications = useCallback(
    (notificationIds) => {
      if (!notificationIds?.length) return;
      updateSection("settings", (settings) => ({
        ...settings,
        dismissedNotificationIds: Array.from(
          new Set([
            ...(settings?.dismissedNotificationIds || []),
            ...notificationIds,
          ]),
        ).slice(-500),
      }));
    },
    [updateSection],
  );

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <div
        className={`app-shell ${mobileSidebarOpen ? "mobile-navigation-open" : ""}`}
      >
        <Header
          profileData={sharedData.profile.profileData}
          unreadNotificationCount={unreadNotificationCount}
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
                dismissNotifications,
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
  const { sharedData, notifications } = useStudentData();
  return <Dashboard data={sharedData} notifications={notifications} />;
}

function NotificationsPage() {
  const { notifications, markNotificationsRead, dismissNotifications } =
    useStudentData();
  return (
    <BellIcon
      notifications={notifications}
      onMarkNotificationsRead={markNotificationsRead}
      onDismissNotifications={dismissNotifications}
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
  const { sharedData, updateSection, resetProfile } = useStudentData();
  return (
    <Profile
      profile={sharedData.profile}
      onProfileChange={(nextValue) => updateSection("profile", nextValue)}
      onResetProfile={resetProfile}
      onAddNotification={(note) =>
        updateSection("settings", (settings) => ({
          ...settings,
          customNotifications: [
            ...(settings?.customNotifications || []),
            note,
          ],
        }))
      }
    />
  );
}

function ExpensePage() {
  const { sharedData, updateSection, updateMonthlyBudget } = useStudentData();
  return (
    <Expense
      expenses={sharedData.expenses}
      monthlyBudget={sharedData.monthlyBudget}
      onExpensesChange={(nextValue) => updateSection("expenses", nextValue)}
      onMonthlyBudgetChange={updateMonthlyBudget}
    />
  );
}

function ComplaintsPage() {
  const { sharedData, updateSection } = useStudentData();
  return (
    <Complaints
      complaints={sharedData.complaints}
      onComplaintsChange={(nextValue) => updateSection("complaints", nextValue)}
    />
  );
}

function SettingsPage() {
  const { sharedData, updateSection } = useStudentData();
  return (
    <Settings
      settings={sharedData.settings}
      onSettingsChange={(nextValue) => updateSection("settings", nextValue)}
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
  const { sharedData, updateSection } = useStudentData();
  return (
    <Hostel
      applications={sharedData.hostelApplications}
      onApplicationsChange={(nextValue) =>
        updateSection("hostelApplications", nextValue)
      }
    />
  );
}

function AcademicPage() {
  const { sharedData, updateSection } = useStudentData();
  return (
    <Academic
      workspace={sharedData.academic}
      onWorkspaceChange={(nextValue) => updateSection("academic", nextValue)}
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
