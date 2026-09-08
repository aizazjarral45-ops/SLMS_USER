import { useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  List,
  Space,
  Tag,
  Typography,
  message,
  Spin,
} from "antd";
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
  complaint: <MessageOutlined />,
  hostel: <HomeOutlined />,
  reminder: <ClockCircleOutlined />,
  ai: <NotificationOutlined />,
  security: <SettingOutlined />,
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

const notificationCreationTimes = new Map();

const ensureNotificationCreationTime = (notification) => {
  if (!notification.id) return notification;
  const existingDate = getNotificationDate(notification);
  if (existingDate) return { ...notification, createdAt: existingDate.toISOString() };
  if (!notificationCreationTimes.has(notification.id)) {
    notificationCreationTimes.set(notification.id, new Date().toISOString());
  }
  return {
    ...notification,
    createdAt: notificationCreationTimes.get(notification.id),
  };
};

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

const getNotificationId = (notification) =>
  String(notification?._id || notification?.id || "");

function BellIcon({
  notifications = [],
  onMarkNotificationsRead,
  onMarkAllNotificationsRead,
  onMarkNotificationUnread,
  onDeleteNotifications,
  deletingNotificationIds = [],
  loading = false,
}) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const visibleNotifications = useMemo(
    () =>
      notifications
        .map(ensureNotificationCreationTime)
        .sort((first, second) => {
          const firstDate = getNotificationDate(first)?.getTime() ?? 0;
          const secondDate = getNotificationDate(second)?.getTime() ?? 0;
          return secondDate - firstDate;
        }),
    [notifications],
  );

  const notificationGroups = useMemo(() => {
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

    return groups;
  }, [visibleNotifications]);
  const unreadIds = useMemo(
    () =>
      visibleNotifications.filter((item) => !item.read).map((item) => item.id),
    [visibleNotifications],
  );

  const urgentCount = visibleNotifications.filter(
    (item) => item.urgency === "critical" || item.urgency === "soon",
  ).length;
  const isInformationalNotification = (item) =>
    item.module === "auth" ||
    ["security", "login", "signup"].includes(String(item.type).toLowerCase()) ||
    ["login activity", "signup activity", "create account"].includes(
      String(item.title).trim().toLowerCase(),
    );
  const severityClass = (item) => {
    const severity = String(item.severity || item.priority || "").toLowerCase();
    if (severity === "critical" || severity === "error" || severity === "danger") return "critical";
    if (severity === "warning" || severity === "alert") return "soon";
    return item.urgency || "upcoming";
  };

  return (
    <>
      {contextHolder}
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
            reminder alerts appear here.             Open or manage each alert without losing your notification history.
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
          <Space>
            <Text type="secondary">{visibleNotifications.length} total</Text>
            {unreadIds.length ? (
              <Button
                type="link"
                onClick={async () => {
                  try {
                    await onMarkAllNotificationsRead?.();
                  } catch (error) {
                    messageApi.error(error.message || "Unable to mark notifications as read.");
                  }
                }}
              >
                Mark all as read
              </Button>
            ) : null}
          </Space>
        }
      >
        <Spin spinning={loading} tip="Loading notifications...">
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
                  <List.Item
                    className={`bell-notification-item ${severityClass(item)} ${
                      !item.read && !isInformationalNotification(item)
                        ? "unread"
                        : ""
                    }`}
                    style={{ marginBottom: 10 }}
                    onClick={async () => {
                      if (!isInformationalNotification(item) || item.read) {
                        return;
                      }
                      try {
                        await onMarkNotificationsRead?.([
                          getNotificationId(item),
                        ]);
                      } catch (error) {
                        messageApi.error(
                          error.message || "Unable to update notification.",
                        );
                      }
                    }}
                  >
                    <div className="bell-notification-content">
                      <span
                        className={`bell-notification-icon ${severityClass(item)}`}
                      >
                        {typeIcons[item.type] || <BellOutlined />}
                      </span>
                      <div className="bell-notification-copy">
                        <div className="bell-notification-heading">
                          <Text strong>{item.title}</Text>
                          <Tag
                            color={
                              severityClass(item) === "critical"
                                ? "red"
                                : severityClass(item) === "soon"
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
                            className={`bell-notification-time ${severityClass(item)}`}
                          >
                            <ClockCircleOutlined />
                            {formatNotificationTimeOnly(
                              getNotificationDate(item),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isInformationalNotification(item) ? (
                      <Space>
                        <Button
                          type="text"
                          className="bell-open-button"
                          icon={<ArrowRightOutlined />}
                          iconPosition="end"
                          onClick={async () => {
                            try {
                              if (!item.read) {
                                await onMarkNotificationsRead?.([
                                  getNotificationId(item),
                                ]);
                              }
                              navigate(
                                item.type === "fee" || item.module === "fees"
                                  ? "/hostel"
                                  : item.route || "/notifications",
                              );
                            } catch (error) {
                              messageApi.error(
                                error.message || "Unable to open notification.",
                              );
                            }
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          type="text"
                          onClick={async () => {
                            try {
                              if (item.read) {
                                await onMarkNotificationUnread?.(
                                  getNotificationId(item),
                                );
                              } else {
                                await onMarkNotificationsRead?.([
                                  getNotificationId(item),
                                ]);
                              }
                            } catch (error) {
                              messageApi.error(
                                error.message || "Unable to update notification.",
                              );
                            }
                          }}
                        >
                          {item.read ? "Mark as Unread" : "Mark as Read"}
                        </Button>
                        <Button
                          type="text"
                          className="bell-delete-button"
                          icon={<DeleteOutlined />}
                          iconPosition="end"
                          danger
                          loading={deletingNotificationIds.includes(
                            String(item._id || item.id),
                          )}
                          disabled={deletingNotificationIds.includes(
                            String(item._id || item.id),
                          )}
                          onClick={async () => {
                            try {
                              await onDeleteNotifications?.([
                                getNotificationId(item),
                              ]);
                            } catch (error) {
                              messageApi.error(
                                error.message || "Unable to delete notification.",
                              );
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Space>
                    ) : null}
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
        </Spin>
      </Card>
      </main>
    </>
  );
}

export default BellIcon;
