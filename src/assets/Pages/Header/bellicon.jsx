import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Empty, List, Space, Tag, Typography } from "antd";
import {
  ArrowRightOutlined,
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  MessageOutlined,
  NotificationOutlined,
  SettingOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getNotificationLabel } from "../../../data/notifications";
import "./bellicon.css";

const { Title, Paragraph, Text } = Typography;

const assignCreatedAt = (notification) => ({
  ...notification,
  createdAt: notification?.createdAt || new Date().toISOString(),
});

const mergeNotificationArrays = (base = [], updates = []) => {
  const map = new Map();
  [...base, ...updates].forEach((item) => {
    if (!item || !item.id) return;
    const existing = map.get(item.id);
    if (existing) {
      map.set(item.id, {
        ...existing,
        ...item,
        createdAt:
          existing.createdAt || item.createdAt || new Date().toISOString(),
      });
    } else {
      map.set(item.id, assignCreatedAt(item));
    }
  });
  return Array.from(map.values());
};

const typeIcons = {
  assignment: <BookOutlined />,
  quiz: <BookOutlined />,
  exam: <CalendarOutlined />,
  attendance: <WarningFilled />,
  expense: <DollarCircleOutlined />,
  complaints: <MessageOutlined />,
  hostel: <HomeOutlined />,
  reminder: <ClockCircleOutlined />,
  ai: <NotificationOutlined />,
};

function BellIcon({ notifications = [], onMarkNotificationsRead }) {
  const navigate = useNavigate();
  const [notificationData, setNotificationData] = useState(() => {
    const stored = localStorage.getItem("slms_notifications");
    try {
      const base = stored ? JSON.parse(stored) : notifications || [];
      return base.map(assignCreatedAt);
    } catch (e) {
      return (notifications || []).map(assignCreatedAt);
    }
  });

  const saveNotifications = (data) => {
    try {
      localStorage.setItem("slms_notifications", JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    // Merge incoming notifications with stored ones without duplicating by id
    const stored = localStorage.getItem("slms_notifications");
    let storedData = [];
    try {
      storedData = stored ? JSON.parse(stored) : [];
    } catch (e) {
      storedData = [];
    }

    const incoming = (notifications || []).map(assignCreatedAt);
    const merged = mergeNotificationArrays(storedData, incoming);
    setNotificationData(merged);
    saveNotifications(merged);
  }, [notifications]);

  const visibleNotifications = useMemo(
    () => notificationData
      .filter((item) => !item.deleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notificationData],
  );

  const unreadNotifications = useMemo(
    () => visibleNotifications.filter((item) => !item.read),
    [visibleNotifications],
  );

  useEffect(() => {
    if (unreadNotifications.length) {
      onMarkNotificationsRead?.(unreadNotifications.map((item) => item.id));
      // mark them as read locally so the UI reflects that the page opened them
      setNotificationData((prev) =>
        prev.map((item) =>
          unreadNotifications.find((u) => u.id === item.id)
            ? { ...item, read: true }
            : item,
        ),
      );
    }
  }, [onMarkNotificationsRead, unreadNotifications]);

  useEffect(() => {
    localStorage.setItem(
      "slms_notifications",
      JSON.stringify(notificationData),
    );
  }, [notificationData]);

  // listen for new notifications added elsewhere in the app or other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "slms_notifications") {
        try {
          const data = e.newValue ? JSON.parse(e.newValue) : [];
          setNotificationData((prev) =>
            mergeNotificationArrays(prev, data),
          );
        } catch (err) {
          // ignore
        }
      }
    };

    const onCustomAdd = (e) => {
      const n = e.detail;
      if (!n || !n.id) return;
      setNotificationData((prev) => {
        const exists = prev.find((p) => p.id === n.id);
        if (exists) return prev;
        return [assignCreatedAt(n), ...prev];
      });
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("slms_notification_add", onCustomAdd);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("slms_notification_add", onCustomAdd);
    };
  }, []);

  const urgentCount = visibleNotifications.filter(
    (item) => item.urgency === "critical" || item.urgency === "soon",
  ).length;

  // latest createdAt timestamp for display above the card
  const latestCreatedAt = useMemo(() => {
    if (!visibleNotifications || !visibleNotifications.length) return null;
    const dates = visibleNotifications
      .map((n) => (n.createdAt ? new Date(n.createdAt) : null))
      .filter(Boolean)
      .sort((a, b) => b - a);
    return dates.length ? dates[0] : null;
  }, [visibleNotifications]);

  const handleDeleteNotification = (id) => {
    setNotificationData((prev) => {
      const next = prev.map((notification) =>
        notification.id === id ? { ...notification, deleted: true } : notification,
      );
      try {
        localStorage.setItem("slms_notifications", JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  return (
    <main className="bell-page">
      <section className="bell-hero" aria-labelledby="bell-page-title">
        <div className="bell-hero-copy">
          <Tag icon={<BellOutlined />} className="bell-eyebrow">
            Notification center
          </Tag>
          <Title id="bell-page-title" level={1}>
            Keep your next step in view
          </Title>
          <Paragraph>
            Deadlines appear here when two days or less remain. Opening this
            page marks the current bell alerts as read.
          </Paragraph>
          <Space wrap className="bell-hero-meta">
            <span>
              <CheckCircleFilled /> {visibleNotifications.length} active
            </span>
            <span>
              <WarningFilled /> {urgentCount} need attention
            </span>
          </Space>
        </div>
        <div className="bell-hero-orb" aria-hidden="true">
          <BellOutlined />
          <span>{visibleNotifications.length}</span>
        </div>
      </section>

      <Alert
        className="bell-read-alert"
        type="success"
        showIcon
        message="Bell alerts are clear"
        description="The notifications currently shown have been marked as read. New or changed records will appear here automatically when their reminder setting is enabled."
      />

      <Card
        className="bell-feed-card"
        title={
          <Space>
            <NotificationOutlined />
            <span>Your notifications</span>
          </Space>
        }
        extra={
          <div style={{ textAlign: "right" }}>
            <div>
              <Text type="secondary">{visibleNotifications.length} active</Text>
            </div>
            {latestCreatedAt && (
              <div style={{ fontSize: 12, color: "#999" }}>
                Last update: {latestCreatedAt.toLocaleString()}
              </div>
            )}
          </div>
        }
      >
        {latestCreatedAt && (
          <div style={{ marginBottom: 8, fontSize: 13, color: "#666" }}>
            Notifications last created at: {latestCreatedAt.toLocaleString()}
          </div>
        )}
        {visibleNotifications.length ? (
          <List
            className="bell-notification-list"
            dataSource={visibleNotifications}
            renderItem={(item) => (
              <List.Item className={`bell-notification-item ${item.urgency}`}>
                <div className="bell-notification-content">
                  <span className={`bell-notification-icon ${item.urgency}`}>
                    {typeIcons[item.type] || <BellOutlined />}
                  </span>
                  <div className="bell-notification-copy">
                    {item.createdAt && (
                      <div style={{ marginBottom: 6, fontSize: 12, color: "#999" }}>
                        Created at: {new Date(item.createdAt).toLocaleString()}
                      </div>
                    )}
                    <div className="bell-notification-heading">
                      <Text strong>{item.title}</Text>
                      <Tag
                        color={
                          item.urgency === "critical"
                            ? "red"
                            : item.urgency === "soon"
                              ? "gold"
                              : "blue"
                        }
                      >
                        {getNotificationLabel(item.type)}
                      </Tag>
                    </div>
                    <Text type="secondary">{item.description}</Text>
                    <div style={{ marginTop: 6 }}>
                      <span className={`bell-notification-time ${item.urgency}`}>
                        <ClockCircleOutlined /> {item.relativeTime}
                      </span>
                    </div>
                  </div>
                </div>
                <Space>
                  <Button
                    type="text"
                    className="bell-open-button"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    onClick={() => navigate(item.route)}
                  >
                    Open
                  </Button>
                  <Button
                    type="text"
                    className="bell-delete-button"
                    icon={<DeleteOutlined />}
                    iconPosition="end"
                    danger
                    onClick={() => handleDeleteNotification(item.id)}
                  >
                    Delete
                  </Button>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={2}>
                <Text strong>You are all caught up</Text>
                <Text type="secondary">
                  Add a deadline or enable a reminder category in Settings to
                  see alerts here.
                </Text>
              </Space>
            }
          >
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => navigate("/setting")}
            >
              Manage reminder settings
            </Button>
          </Empty>
        )}
      </Card>
    </main>
  );
}

export default BellIcon;
