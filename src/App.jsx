import "./App.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Drawer, Layout, Button } from "antd";
import { CloseOutlined, LogoutOutlined } from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import Header from "./assets/Pages/Header/header";
import Sidebar from "./assets/Pages/sidebar/sidebar";
import Profile from "./assets/Pages/Profile/profile";
import Settings from "./assets/Pages/Setting/Setting";
import Complaints from "./assets/Pages/Complaints/Complaints";
import Hostel from "./assets/Pages/Hostel/Hostel";
import Expense from "./assets/Pages/Expense/Expense";
import Academic from "./assets/Pages/Academic/Academic";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import Copilot from "./assets/Pages/Ai-chatbot/aicopilot";
import Dashboard from "./assets/Pages/Dashboard/Dashboard";
import BellIcon from "./assets/Pages/Header/bellicon";
import {
  SHARED_DATA_STORAGE_KEY,
  loadSharedData,
  persistSharedData,
} from "./data/sharedData";
import { getNotifications } from "./data/notifications";
import { useNavigate } from "react-router-dom";
import Login from "./assets/Pages/Login/login";
import Forgot from "./assets/Pages/Login/forgot";
import ProtectedRoute from "./assets/Pages/Login/protectedRoute";
import Signup from "./assets/Pages/Sign Up/signup";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function App({ profileData = {}, onToggleSidebar }) {
  const navigate = useNavigate();
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
  const [sharedData, setSharedData] = useState(loadSharedData);

  useEffect(() => {
    persistSharedData(sharedData);
  }, [sharedData]);

  useEffect(() => {
    const syncFromAnotherTab = (event) => {
      if (event.key === SHARED_DATA_STORAGE_KEY && event.newValue) {
        setSharedData(loadSharedData());
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
    if (isTablet) {
      setCollapsed(true);
    } else if (!isMobile) {
      setCollapsed(false);
    }

    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
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
    () => getNotifications(sharedData),
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
  return (
    <>
      <div
        className={`app-shell ${mobileSidebarOpen ? "mobile-navigation-open" : ""}`}
      >
        {/* <AuthProvider> */}
        
            {/* <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/register" element={<Signup />} /> */}
            {/* <Route
              path="/"
              element={
                <ProtectedRoute> */}
                  <Header
                    profileData={sharedData.profile.profileData}
                    unreadNotificationCount={unreadNotificationCount}
                    onToggleSidebar={() => setMobileSidebarOpen(true)}
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
                        <Routes>
                      <Route
                        path="/"
                        element={<Dashboard data={sharedData} />}
                      />

                      <Route
                        path="/notifications"
                        element={
                          <BellIcon
                            notifications={notifications}
                            onMarkNotificationsRead={markNotificationsRead}
                          />
                        }
                      />
                      <Route
                        path="/aicopilot"
                        element={
                          <Copilot
                            messages={sharedData.copilotMessages}
                            onMessagesChange={(nextValue) =>
                              updateSection("copilotMessages", nextValue)
                            }
                          />
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <Profile
                            profile={sharedData.profile}
                            onProfileChange={(nextValue) =>
                              updateSection("profile", nextValue)
                            }
                            onResetProfile={resetProfile}
                          />
                        }
                      />
                      <Route
                        path="/expense"
                        element={
                          <Expense
                            expenses={sharedData.expenses}
                            monthlyBudget={sharedData.monthlyBudget}
                            onExpensesChange={(nextValue) =>
                              updateSection("expenses", nextValue)
                            }
                            onMonthlyBudgetChange={updateMonthlyBudget}
                          />
                        }
                      />
                      <Route
                        path="/complaints"
                        element={
                          <Complaints
                            complaints={sharedData.complaints}
                            onComplaintsChange={(nextValue) =>
                              updateSection("complaints", nextValue)
                            }
                          />
                        }
                      />
                      <Route
                        path="/setting"
                        element={
                          <Settings
                            settings={sharedData.settings}
                            onSettingsChange={(nextValue) =>
                              updateSection("settings", nextValue)
                            }
                          />
                        }
                      />
                      <Route
                        path="/hostel"
                        element={
                          <Hostel
                            applications={sharedData.hostelApplications}
                            onApplicationsChange={(nextValue) =>
                              updateSection("hostelApplications", nextValue)
                            }
                          />
                        }
                      />
                      <Route
                        path="/academic"
                        element={
                          <Academic
                            workspace={sharedData.academic}
                            onWorkspaceChange={(nextValue) =>
                              updateSection("academic", nextValue)
                            }
                          />
                        }
                      />
                      </Routes>
                    </Content>

                  </Layout>
                {/* </ProtectedRoute> */}
              {/* }
            /> */}
          
        {/* </AuthProvider> */}
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
    </>
  );
}

export default App;
