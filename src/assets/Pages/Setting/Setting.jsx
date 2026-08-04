import { useMemo, useState } from "react";
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
  MoonOutlined,
  PlusOutlined,
  RobotOutlined,
  SettingOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import "./Setting.css";

const { Title, Paragraph, Text } = Typography;

const notificationDefaults = {
  assignment: true,
  quiz: true,
  exam: true,
  attendance: false,
  expense: true,
  complaints: true,
  hostel: true,
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
  ["ai", "AI Suggestions"],
];

const aiSettingItems = [
  ["studyPlanner", "Study planner suggestions"],
  ["budgetWarnings", "Budget warnings"],
  ["complaintDrafting", "Complaint drafting assistance"],
];

const securityItems = [
  "Change Password",
  "Two Factor Authentication",
  "Login History",
  "Active Devices",
];

const privacyItems = ["Download My Data", "Delete Account", "Data Permissions"];

const SwitchRow = ({ label, checked, onChange }) => (
  <div className="setting-toggle-row">
    <Text>{label}</Text>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

function Settings() {
  const [messageApi, contextHolder] = message.useMessage();
  const [reminderForm] = Form.useForm();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "Light";
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : notificationDefaults;
  });
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem("reminders");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState(() => {
    const saved = localStorage.getItem("aiSettings");
    return saved
      ? JSON.parse(saved)
      : { studyPlanner: true, budgetWarnings: true, complaintDrafting: false };
  });

  const pendingReminders = useMemo(
    () => reminders.filter((item) => !item.done).length,
    [reminders],
  );

  const saveLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  };

  const toggleNotification = (key, value) => {
    setNotifications((current) => {
      const updated = { ...current, [key]: value };
      saveLocalStorage("notifications", updated);
      return updated;
    });
  };

  const toggleAiSetting = (key, value) => {
    setAiSettings((current) => {
      const updated = { ...current, [key]: value };
      saveLocalStorage("aiSettings", updated);
      return updated;
    });
  };

  const addReminder = (values) => {
    setReminders((current) => {
      const next = [
        {
          id: `${Date.now()}`,
          title: values.title,
          type: values.type,
          when: values.when,
          done: false,
        },
        ...current,
      ];
      saveLocalStorage("reminders", next);
      return next;
    });
    reminderForm.resetFields();
    setModalOpen(false);
    messageApi.success("Reminder added.");
  };

  const completeReminder = (id) => {
    setReminders((current) => {
      const next = current.map((item) =>
        item.id === id ? { ...item, done: true } : item,
      );
      saveLocalStorage("reminders", next);
      return next;
    });
  };

  const deleteReminder = (id) => {
    setReminders((current) => {
      const next = current.filter((item) => item.id !== id);
      saveLocalStorage("reminders", next);
      return next;
    });
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
              <Button type="primary">Open Profile</Button>
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
            message="Quiet timing suggestion"
            description="Keep AI suggestions off during class hours if you want a less distracting experience."
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
      key: "appearance",
      label: "Appearance",
      children: (
        <Card
          className="setting-inner-card"
          title="Appearance"
          extra={<SkinOutlined />}
        >
          <Space wrap>
            {["Light", "Dark", "System"].map((mode) => (
              <Button
                key={mode}
                type={theme === mode ? "primary" : "default"}
                onClick={() => {
                  setTheme(mode);
                  saveLocalStorage("theme", mode);
                }}
              >
                {mode} Mode
              </Button>
            ))}
          </Space>
          <Paragraph className="setting-block-text">
            Current theme preference: <strong>{theme}</strong>
          </Paragraph>
        </Card>
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
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<LockOutlined />}
                      className="setting-avatar"
                    />
                  }
                  title={item}
                  description="Manage this security control from your student account center."
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: "privacy",
      label: "Privacy",
      children: (
        <Card className="setting-inner-card" title="Privacy & Data">
          <List
            dataSource={privacyItems}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item}
                  description="Available as a protected account action."
                />
              </List.Item>
            )}
          />
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
          <Tag color="blue" className="setting-pill">
            Settings
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
              icon={<MoonOutlined />}
              className="setting-avatar"
            />
            <div>
              <Text type="secondary">Current profile mode</Text>
              <Title level={3}>{theme} Theme</Title>
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
            <Input placeholder="e.g. Aug 7, 6:00 PM" />
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
