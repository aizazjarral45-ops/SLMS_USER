import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import {
  BellOutlined,
  LockOutlined,
  PlusOutlined,
  RobotOutlined,
  SettingOutlined,
  KeyOutlined,
  HistoryOutlined,
  LogoutOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./Setting.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { deleteAccount as deleteAccountService } from "../../../services/authService";

const { Title, Paragraph, Text } = Typography;

const notificationDefaults = {
  assignment: true,
  quiz: true,
  exam: true,
  attendance: false,
  expense: true,
  complaints: true,
  hostel: true,
  reminder: true,
  ai: false,
};

const reminderTypeOptions = [
  "Assignments",
  "Projects",
  "Quizzes",
  "Exams",
  "Study Sessions",
  "Fee Due Dates",
  "Hostel Payments",
].map((item) => ({ value: item, label: item }));

const notificationItems = [
  ["assignment", "Assignment Reminder"],
  ["quiz", "Quiz Reminder"],
  ["exam", "Exam Reminder"],
  ["attendance", "Attendance Reminder"],
  ["expense", "Expense Reminder"],
  ["complaints", "Complaint Updates"],
  ["hostel", "Hostel Updates"],
  ["reminder", "Personal Reminders"],
  ["ai", "AI Suggestions"],
];

const aiSettingItems = [
  ["studyPlanner", "Study planner suggestions"],
  ["budgetWarnings", "Budget warnings"],
  ["complaintDrafting", "Complaint drafting assistance"],
];

const securityItems = [
  { key: "change-password", title: "Change Password", icon: <KeyOutlined /> },
  { key: "login-history", title: "Login History", icon: <HistoryOutlined /> },
  { key: "logout", title: "Logout", icon: <LogoutOutlined /> },
  { key: "delete-account", title: "Delete Account", icon: <DeleteOutlined /> },
];

const SwitchRow = ({ label, checked, onChange }) => (
  <div className="setting-toggle-row">
    <Text>{label}</Text>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

function Settings({ settings = {}, onSettingsChange }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [reminderForm] = Form.useForm();
  const notifications = {
    ...notificationDefaults,
    ...(settings.notifications || {}),
  };
  const reminders = Array.isArray(settings.reminders) ? settings.reminders : [];
  const aiSettings = {
    studyPlanner: true,
    budgetWarnings: true,
    complaintDrafting: false,
    ...(settings.aiSettings || {}),
  };
  const [modalOpen, setModalOpen] = useState(false);
  const { logout, user } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [processingDelete, setProcessingDelete] = useState(false);

  const updateSettings = (updates) => {
    onSettingsChange?.({ ...settings, ...updates });
  };
  const pendingReminders = reminders.filter((item) => !item.done).length;

  const toggleNotification = (key, value) => {
    updateSettings({ notifications: { ...notifications, [key]: value } });
  };

  const toggleAiSetting = (key, value) => {
    updateSettings({ aiSettings: { ...aiSettings, [key]: value } });
  };

  const addReminder = (values) => {
    updateSettings({
      reminders: [
        {
          id: `${Date.now()}`,
          title: values.title,
          type: values.type,
          when: values.when,
          done: false,
        },
        ...reminders,
      ],
    });
    reminderForm.resetFields();
    setModalOpen(false);
    messageApi.success("Reminder added.");
  };

  const completeReminder = (id) => {
    updateSettings({
      reminders: reminders.map((item) =>
        item.id === id ? { ...item, done: true } : item,
      ),
    });
  };

  const deleteReminder = (id) => {
    updateSettings({ reminders: reminders.filter((item) => item.id !== id) });
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "Confirm logout",
      content: "Are you sure you want to logout from this session?",
      okText: "Logout",
      async onOk() {
        try {
          await logout();
          messageApi.success("You have been logged out.");
        } catch (error) {
          console.error("Logout request failed:", error);
        } finally {
          navigate("/login", { replace: true });
        }
      },
    });
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) return;
    if (!deletePassword.trim()) {
      messageApi.error("Enter your account password to confirm deletion.");
      return;
    }

    setProcessingDelete(true);
    try {
      await deleteAccountService({
        email: user.email,
        password: deletePassword,
      });
      messageApi.success("Account deleted permanently.");
      await logout();
      navigate("/login", { replace: true });
    } catch (e) {
      messageApi.error(
        e?.message || "Incorrect password. Account was not deleted.",
      );
    } finally {
      setProcessingDelete(false);
      setDeleteModalOpen(false);
      setDeletePassword("");
      setShowDeletePassword(false);
    }
  };

  const handleSecurityItemClick = (key) => {
    if (key === "change-password") {
      navigate("/setting/change-password");
    } else if (key === "login-history") {
      navigate("/setting/login-history");
    } else if (key === "logout") {
      handleLogout();
    } else if (key === "delete-account") {
      setDeleteModalOpen(true);
    }
  };

  const tabItems = [
    {
      key: "profile",
      label: "Profile",
      children: (
        <Card className="setting-inner-card">
          <Space align="center">
            <Avatar
              size={110}
              icon={<SettingOutlined />}
              className="setting-avatar"
            />
            <div>
              <Title level={4}>Profile Preferences</Title>
              <Paragraph>
                Keep your student identity, personalization, and account-facing
                preferences aligned across the SLMS experience.
              </Paragraph>
              <Button type="primary" onClick={() => navigate("/profile")}>
                Open Profile
              </Button>
            </div>
          </Space>
        </Card>
      ),
    },
    {
      key: "notifications",
      label: "Notifications",
      children: (
        <div className="setting-stack">
          <Card
            className="setting-inner-card"
            title="Notification Settings"
            extra={<BellOutlined />}
          >
            {notificationItems.map(([key, label]) => (
              <SwitchRow
                key={key}
                label={label}
                checked={notifications[key]}
                onChange={(value) => toggleNotification(key, value)}
              />
            ))}
          </Card>
          <Alert
            type="info"
            showIcon
            message="Your bell follows these settings"
            description="Only enabled categories appear in Notifications. Assignment, quiz, exam, and payment deadlines are shown when two days or less remain; opening the bell marks its current alerts as read."
          />
        </div>
      ),
    },
    {
      key: "reminders",
      label: "Reminder Center",
      children: (
        <div className="setting-stack">
          <Card
            className="setting-inner-card"
            title="Reminder Center"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                Add Reminder
              </Button>
            }
          >
            <Text type="secondary">
              {pendingReminders} active reminders pending
            </Text>
            <List
              className="setting-reminder-list"
              dataSource={reminders}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="done"
                      type="link"
                      onClick={() => completeReminder(item.id)}
                    >
                      Mark Completed
                    </Button>,
                    <Button
                      key="delete"
                      danger
                      type="link"
                      onClick={() => deleteReminder(item.id)}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{item.title}</span>
                        <Tag color={item.done ? "green" : "blue"}>
                          {item.done ? "Completed" : item.type}
                        </Tag>
                      </Space>
                    }
                    description={item.when}
                  />
                </List.Item>
              )}
            />
          </Card>
          <Timeline
            items={reminders.map((item) => ({
              color: item.done ? "green" : "blue",
              children: `${item.title} • ${item.when}`,
            }))}
          />
        </div>
      ),
    },
    {
      key: "security",
      label: "Security",
      children: (
        <Card
          className="setting-inner-card"
          title="Security"
          extra={<LockOutlined />}
        >
          <List
            dataSource={securityItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  item.key === "change-password" ? (
                    <Button
                      key="open"
                      onClick={() => navigate("/setting/change-password")}
                    >
                      Open
                    </Button>
                  ) : item.key === "login-history" ? (
                    <Button
                      key="open"
                      onClick={() => navigate("/setting/login-history")}
                    >
                      Open
                    </Button>
                  ) : item.key === "logout" ? (
                    <Button key="logout" danger onClick={handleLogout}>
                      Logout
                    </Button>
                  ) : (
                    <Button
                      key="delete"
                      danger
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      Delete
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar icon={item.icon} className="setting-avatar" />
                  }
                  title={
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSecurityItemClick(item.key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          handleSecurityItemClick(item.key);
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {item.title}
                    </span>
                  }
                  description="Manage this security control from your student account center."
                />
              </List.Item>
            )}
          />

          <Modal
            title="Delete account — permanent"
            open={deleteModalOpen}
            onCancel={() => {
              setDeleteModalOpen(false);
              setDeletePassword("");
              setShowDeletePassword(false);
            }}
            onOk={handleDeleteAccount}
            okButtonProps={{ danger: true, loading: processingDelete }}
            okText="Delete account"
          >
            <p style={{ color: "#a00", fontWeight: 600 }}>
              This action is permanent and cannot be undone.
            </p>
            <p>Enter your account password to confirm deletion.</p>
            <Input.Password
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your account password to confirm deletion."
              visibilityToggle={{
                visible: showDeletePassword,
                onVisibleChange: setShowDeletePassword,
              }}
            />
          </Modal>
        </Card>
      ),
    },
    {
      key: "ai",
      label: "AI Settings",
      children: (
        <Card
          className="setting-inner-card"
          title="AI Settings"
          extra={<RobotOutlined />}
        >
          <Space direction="vertical" size={14} className="setting-full-width">
            {aiSettingItems.map(([key, label]) => (
              <SwitchRow
                key={key}
                label={label}
                checked={aiSettings[key]}
                onChange={(value) => toggleAiSetting(key, value)}
              />
            ))}
            <Alert
              type="info"
              showIcon
              message="Copilot personalization"
              description="Your AI preferences are saved in browser storage and restored on your next visit."
            />
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <div className="setting-page">
      {contextHolder}
      <div className="setting-hero">
        <div>
          <Tag icon={<SettingOutlined />} className="hostel-eyebrow">
            Setting Page
          </Tag>
          <Title level={2}>Personalize the SLMS experience</Title>
          <Paragraph>
            Manage profile preferences, notifications, reminder workflows,
            appearance, privacy, security, and AI behavior from one premium
            control center.
          </Paragraph>
        </div>
        <Card className="setting-panel">
          <Space align="start">
            <Avatar
              size={100}
              icon={<SettingOutlined />}
              className="setting-avatar"
            />
            <div>
              <Text type="secondary">Current profile mode</Text>
              <Title level={3}>Student Mode</Title>
              <Text>{pendingReminders} reminders still need attention.</Text>
            </div>
          </Space>
        </Card>
      </div>

      <Card className="setting-panel">
        <Tabs items={tabItems} />
      </Card>

      <Modal
        title="Add Reminder"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={reminderForm} layout="vertical" onFinish={addReminder}>
          <Form.Item
            name="title"
            label="Reminder Title"
            rules={[{ required: true, message: "Enter a reminder title." }]}
          >
            <Input placeholder="Reminder title" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Reminder Type"
            rules={[{ required: true, message: "Select a reminder type." }]}
          >
            <Select options={reminderTypeOptions} />
          </Form.Item>
          <Form.Item
            name="when"
            label="Schedule"
            rules={[
              { required: true, message: "Enter the reminder schedule." },
            ]}
          >
            <Input type="date" placeholder="e.g. Aug 7 2026, 6:00 PM" />
          </Form.Item>
          <div className="setting-modal-actions">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button htmlType="submit" type="primary">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Settings;
