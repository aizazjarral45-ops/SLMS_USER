import { useEffect, useMemo } from "react";
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

const getNotificationDate = (notification) => {
  const value =
    notification.createdAt ||
    notification.timestamp ||
    notification.dateTime ||
    notification.date;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const formatNotificationDateTime = (date) =>
  date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "Date and time unavailable";

// Format only the time (e.g., 11:10 AM) for use inside grouped lists
const formatNotificationTimeOnly = (date) =>
  date
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(date)
    : "Time unavailable";

const getDateGroupLabel = (date) => {
  if (!date) return "Date unavailable";
  const today = new Date();
  const startOfDay = (value) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const daysAgo = Math.round(
    (startOfDay(today) - startOfDay(date)) / (24 * 60 * 60 * 1000),
  );
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(date);
};

function BellIcon({
  notifications = [],
  onMarkNotificationsRead,
  onDismissNotifications,
}) {
  const navigate = useNavigate();
  const visibleNotifications = useMemo(
    () =>
      [...notifications].sort((first, second) => {
        // Use the stored timestamp (createdAt/timestamp/date) for ordering
        const firstDate = getNotificationDate(first)?.getTime() ?? 0;
        const secondDate = getNotificationDate(second)?.getTime() ?? 0;
        return secondDate - firstDate; // newest first
      }),
    [notifications],
  );

  const notificationGroups = useMemo(() => {
    // Group by date string and ensure groups and items are ordered newest -> oldest
    const groups = [];
    visibleNotifications.forEach((item) => {
      const date = getNotificationDate(item);
      const key = date ? date.toDateString() : "unknown";
      let group = groups.find((entry) => entry.key === key);
      if (!group) {
        group = { key, label: getDateGroupLabel(date), items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });

    // Ensure each group's items are sorted by time descending (newest to oldest)
    groups.forEach((group) => {
      group.items.sort((a, b) => {
        const aTime = getNotificationDate(a)?.getTime() ?? 0;
        const bTime = getNotificationDate(b)?.getTime() ?? 0;
        return bTime - aTime;
      });
    });

    // Ensure groups are sorted by their newest item's time (newest date group first)
    groups.sort((a, b) => {
      const aNewest = getNotificationDate(a.items[0])?.getTime() ?? 0;
      const bNewest = getNotificationDate(b.items[0])?.getTime() ?? 0;
      return bNewest - aNewest;
    });

    return groups;
  }, [visibleNotifications]);
  const unreadIds = useMemo(
    () =>
      visibleNotifications.filter((item) => !item.read).map((item) => item.id),
    [visibleNotifications],
  );

  useEffect(() => {
    if (unreadIds.length) onMarkNotificationsRead?.(unreadIds);
  }, [onMarkNotificationsRead, unreadIds]);

  const urgentCount = visibleNotifications.filter(
    (item) => item.urgency === "critical" || item.urgency === "soon",
  ).length;

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
            Relevant academic, hostel, spending, complaint, and personal
            reminder alerts appear here. Opening this page marks the current
            alerts as read.
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
        message={
          unreadIds.length
            ? "Your alerts are being marked as read"
            : "Bell alerts are clear"
        }
        description="New deadlines and changes will appear automatically when their notification category is enabled."
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
          <Text type="secondary">{visibleNotifications.length} active</Text>
        }
      >
        {visibleNotifications.length ? (
          notificationGroups.map((group) => (
            <section className="bell-notification-group" key={group.key}>
              <Title level={4} className="bell-notification-group-title">
                {group.label}
              </Title>
              <List
                className="bell-notification-list"
                dataSource={group.items}
                rowKey="id"
                renderItem={(item) => (
                  <List.Item className={`bell-notification-item ${item.urgency}`}>
                <div className="bell-notification-content">
                  <span className={`bell-notification-icon ${item.urgency}`}>
                    {typeIcons[item.type] || <BellOutlined />}
                  </span>
                  <div className="bell-notification-copy">
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
                      <span
                        className={`bell-notification-time ${item.urgency}`}
                      >
                      <ClockCircleOutlined /> {formatNotificationTimeOnly(getNotificationDate(item))}
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
                    onClick={() => onDismissNotifications?.([item.id])}
                  >
                    Delete
                  </Button>
                </Space>
                  </List.Item>
                )}
              />
            </section>
          ))
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
