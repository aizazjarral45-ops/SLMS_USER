import React, { useMemo } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  MessageOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const ACADEMIC_STORAGE_KEY = "slms-academic-workspace";
const EXPENSE_STORAGE_KEY = "slms-expenses";
const BUDGET_STORAGE_KEY = "slms-monthly-budgets";
const COMPLAINTS_STORAGE_KEY = "slms-complaints";

function readStoredJSON(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return fallback;
    }

    return JSON.parse(storedValue);
  } catch {
    return fallback;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShortDate(value) {
  if (!value) {
    return "No date";
  }

  const parsedDate = new Date(value + "T00:00:00");
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(parsedDate);
}

function getDashboardSnapshot(data) {
  const academicWorkspace =
    data?.academic ||
    readStoredJSON(ACADEMIC_STORAGE_KEY, {
      profile: { cgpa: 3.62 },
      assignments: [],
      exams: [],
      attendance: [],
    });
  const expenses = Array.isArray(data?.expenses)
    ? data.expenses
    : Array.isArray(readStoredJSON(EXPENSE_STORAGE_KEY, []))
      ? readStoredJSON(EXPENSE_STORAGE_KEY, [])
      : [];
  const budgetEntries = Array.isArray(readStoredJSON(BUDGET_STORAGE_KEY, []))
    ? readStoredJSON(BUDGET_STORAGE_KEY, [])
    : [];
  const complaints = Array.isArray(data?.complaints)
    ? data.complaints
    : Array.isArray(readStoredJSON(COMPLAINTS_STORAGE_KEY, []))
      ? readStoredJSON(COMPLAINTS_STORAGE_KEY, [])
      : [];

  const monthlyBudget = Number.isFinite(Number(data?.monthlyBudget))
    ? Number(data.monthlyBudget)
    : budgetEntries.length
      ? Number(budgetEntries[budgetEntries.length - 1]) || 0
      : 0;
  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const budgetRemaining = Math.max(monthlyBudget - totalSpent, 0);

  const attendanceEntries = Array.isArray(academicWorkspace.attendance)
    ? academicWorkspace.attendance
    : [];
  const averageAttendance = attendanceEntries.length
    ? attendanceEntries.reduce((sum, entry) => {
        const attended = Number(entry.attended || 0);
        const total = Number(entry.total || 0);
        const ratio = total > 0 ? (attended / total) * 100 : 0;
        return sum + ratio;
      }, 0) / attendanceEntries.length
    : 0;

  const attendanceBreakdown = attendanceEntries.map((entry) => {
    const attended = Number(entry.attended || 0);
    const total = Number(entry.total || 0);
    const ratio = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      course: entry.course || "Course",
      value: ratio,
      color: ratio >= 90 ? "#2563eb" : ratio >= 85 ? "#1d4ed8" : "#60a5fa",
    };
  });

  const assignments = Array.isArray(academicWorkspace.assignments)
    ? academicWorkspace.assignments.filter(
        (item) => item.status !== "Completed",
      )
    : [];
  const exams = Array.isArray(academicWorkspace.exams)
    ? academicWorkspace.exams
    : [];
  const remainingAcademicItems = assignments.length + exams.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDeadlines = [
    ...assignments
      .filter((item) => item.dueDate)
      .map((item) => ({
        title: item.title || "Assignment",
        subtitle:
          (item.course || "Academic") + " - " + formatShortDate(item.dueDate),
        dueDate: item.dueDate,
        kind: "Assignment",
      })),
    ...exams
      .filter((item) => item.examDate)
      .map((item) => ({
        title: item.title || "Exam",
        subtitle:
          (item.course || "Academic") + " - " + formatShortDate(item.examDate),
        dueDate: item.examDate,
        kind: "Exam",
      })),
  ]
    .filter((item) => {
      const itemDate = new Date(item.dueDate + "T00:00:00");
      return itemDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate + "T00:00:00") - new Date(b.dueDate + "T00:00:00"),
    )
    .slice(0, 3);

  const completedComplaints = complaints.filter((item) =>
    ["Resolved", "Completed"].includes(item.status),
  );
  const latestCompletedComplaint = completedComplaints[0];

  return {
    profile: academicWorkspace.profile || {},
    stats: [
      {
        title: "Overall CGPA",
        value: String(Number(academicWorkspace.profile?.cgpa || 0).toFixed(2)),
        icon: <TrophyOutlined />,
        hint: "Synced from academic profile",
        accent: "sky",
      },
      {
        title: "Overall Attendance",
        value: String(Math.round(averageAttendance * 10) / 10) + "%",
        icon: <SafetyCertificateOutlined />,
        hint: "Synced from attendance records",
        accent: "teal",
      },
      {
        title: "Assignments & Quizzes",
        value: String(remainingAcademicItems),
        icon: <BookOutlined />,
        hint: "Remaining from academic data",
        accent: "violet",
      },
      {
        title: "Budget Remaining",
        value: formatCurrency(budgetRemaining),
        icon: <DollarOutlined />,
        hint:
          monthlyBudget > 0
            ? "Synced with monthly budget"
            : "Set a monthly budget",
        accent: "amber",
      },
    ],
    deadlines: upcomingDeadlines,
    attendanceBreakdown,
    complaintSummary: {
      completedCount: completedComplaints.length,
      latestTitle:
        latestCompletedComplaint?.title || "No completed complaints yet",
    },
  };
}

function MetricCard({ stat }) {
  return (
    <Col xs={24} md={12} xl={6} key={stat.title}>
      <Card className={"dashboard-stat-card " + stat.accent}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <div className="dashboard-stat-icon">{stat.icon}</div>
          <Text className="dashboard-stat-title">{stat.title}</Text>
          <Title level={3} className="dashboard-stat-value">
            {stat.value}
          </Title>
          <Text className="dashboard-stat-hint">{stat.hint}</Text>
        </Space>
      </Card>
    </Col>
  );
}

function DeadlineList({ deadlines }) {
  return (
    <List
      dataSource={deadlines}
      renderItem={(item) => (
        <List.Item className="dashboard-list-item">
          <List.Item.Meta
            avatar={
              <Avatar
                icon={<CalendarOutlined />}
                className="dashboard-list-avatar"
              />
            }
            title={item.title}
            description={
              <span className="dashboard-deadline-meta">
                <span>{item.subtitle}</span>
                <Tag className="dashboard-soft-tag">{item.kind}</Tag>
              </span>
            }
          />
        </List.Item>
      )}
    />
  );
}

function Dashboard({ data }) {
  const navigate = useNavigate();
  const dashboardData = useMemo(() => getDashboardSnapshot(data), [data]);

  const focusText = dashboardData.deadlines[0]
    ? "Focus on " +
      dashboardData.deadlines[0].title.toLowerCase() +
      " before " +
      formatShortDate(dashboardData.deadlines[0].dueDate) +
      "."
    : "Keep your learning plan consistent this week.";

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <Card className="dashboard-hero-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" size="small">
                <Tag icon={<AppstoreOutlined />} className="dashboard-eyebrow">
                  SLMS Dashboard
                </Tag>
                <Title level={1} className="dashboard-title">
                  Stay on top of your academic life in one view
                </Title>
                <Paragraph className="dashboard-subtitle">
                  Track your classes, deadlines, spending, hostel needs,
                  complaints, and AI support from a single dashboard designed
                  for clarity.
                </Paragraph>
              </Space>
            </Col>
            <Col xs={24} lg={8}>
              <Card className="dashboard-hero-panel">
                <div className="Dashboard-hero-card-icon">
                  <SafetyCertificateOutlined />
                </div>
                <Space
                  direction="vertical"
                  size="medium"
                  style={{ width: "100%" }}
                >
                  <h1>Today's focus</h1>
                  <Text type="secondary">{focusText}</Text>
                  <Button
                    type="primary"
                    className="dashboard-primary-btn"
                    onClick={() => navigate("/aicopilot")}
                  >
                    Open AI Assistant
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]} className="dashboard-stats-grid">
          {dashboardData.stats.map((stat) => (
            <MetricCard key={stat.title} stat={stat} />
          ))}
        </Row>

        <Row gutter={[16, 16]} className="dashboard-content-grid">
          <Col xs={24} lg={24}>
            <Card className="dashboard-card" title="Weekly priorities">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="dashboard-panel-section">
                    <div className="dashboard-section-heading">
                      <Title level={4}>Upcoming deadlines</Title>
                      <Tag
                        icon={<CalendarOutlined />}
                        className="dashboard-soft-tag"
                      >
                        Live from academic data
                      </Tag>
                    </div>
                    <DeadlineList deadlines={dashboardData.deadlines} />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="dashboard-panel-section">
                    <div className="dashboard-section-heading">
                      <Title level={4}>Attendance health</Title>
                      <Tag
                        icon={<CheckCircleOutlined />}
                        className="dashboard-soft-tag"
                      >
                        Improving
                      </Tag>
                    </div>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {dashboardData.attendanceBreakdown.map((item) => (
                        <div key={item.course}>
                          <div className="dashboard-progress-meta">
                            <Text strong>{item.course}</Text>
                            <Text type="secondary">{item.value}%</Text>
                          </div>
                          <Progress
                            percent={item.value}
                            strokeColor={item.color}
                            trailColor="#e5edff"
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </Space>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              className="dashboard-card"
              title="Module snapshot"
              style={{ marginTop: 24 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="dashboard-mini-card">
                    <Space align="start">
                      <Avatar
                        style={{ background: "#fff" }}
                        icon={
                          <BookOutlined style={{ background: "#52C41A" }} />
                        }
                        className="dashboard-mini-avatar"
                      />
                      <div>
                        <Text strong>Academic</Text>
                        <Paragraph className="dashboard-mini-copy">
                          Active deadlines and exams are pulled directly from
                          your academic workspace.
                        </Paragraph>
                      </div>
                    </Space>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="dashboard-mini-card">
                    <Space align="start">
                      <Avatar
                        style={{ background: "#fff" }}
                        icon={
                          <HomeOutlined style={{ background: "#FAAD14" }} />
                        }
                        className="dashboard-mini-avatar"
                      />
                      <div>
                        <Text strong>Hostel</Text>
                        <Paragraph className="dashboard-mini-copy">
                          Hostel fees and support updates remain visible for
                          quick follow-up.
                        </Paragraph>
                      </div>
                    </Space>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="dashboard-mini-card">
                    <Space align="start">
                      <Avatar
                        style={{ background: "#fff" }}
                        icon={
                          <MessageOutlined style={{ background: "#2452C7" }} />
                        }
                        className="dashboard-mini-avatar"
                      />
                      <div>
                        <Text strong>Complaints</Text>
                        <Paragraph className="dashboard-mini-copy">
                          Resolved requests are tracked so your support progress
                          stays clear.
                        </Paragraph>
                      </div>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={24}>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card
                  className="dashboard-card dashboard-feature-card"
                  title="Goals & focus"
                  style={{ height: "100%", minHeight: 300 }}
                >
                  <Timeline
                    items={[
                      {
                        dot: (
                          <CheckCircleOutlined className="dashboard-timeline-dot" />
                        ),
                        children: (
                          <Text>Keep attendance above 90% this week.</Text>
                        ),
                      },
                      {
                        dot: (
                          <CheckCircleOutlined className="dashboard-timeline-dot" />
                        ),
                        children: (
                          <Text>
                            Clear the next academic deadline before it
                            approaches.
                          </Text>
                        ),
                      },
                      {
                        dot: (
                          <CheckCircleOutlined className="dashboard-timeline-dot" />
                        ),
                        children: (
                          <Text>
                            Review hostel and budget items before the next
                            payment window.
                          </Text>
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  className="dashboard-card dashboard-feature-card"
                  title="Complaint status"
                  style={{ height: "100%", minHeight: 300 }}
                >
                  <div className="dashboard-complaint-panel">
                    <div className="dashboard-complaint-count">
                      {dashboardData.complaintSummary.completedCount}
                    </div>
                    <div className="dashboard-complaint-meta">
                      <Text strong>Completed complaints</Text>
                      <Text type="secondary">
                        {dashboardData.complaintSummary.latestTitle}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card
                  className="dashboard-card dashboard-feature-card"
                  title="Notifications"
                  style={{ height: "100%", minHeight: 300 }}
                >
                  <List
                    dataSource={[
                      {
                        title: "Complaint progress",
                        text:
                          String(
                            dashboardData.complaintSummary.completedCount,
                          ) + " complaints are completed and visible.",
                        tag: "Complaints",
                      },
                      {
                        title: "Upcoming deadline",
                        text: dashboardData.deadlines[0]
                          ? dashboardData.deadlines[0].title +
                            " is coming up soon."
                          : "No upcoming academic deadlines found.",
                        tag: "Academic",
                      },
                      {
                        title: "Budget update",
                        text:
                          "You have " +
                          formatCurrency(
                            Math.max(
                              0,
                              Number(
                                dashboardData.stats
                                  .find(
                                    (item) => item.title === "Budget Remaining",
                                  )
                                  ?.value.replace(/[^0-9.-]+/g, ""),
                              ) || 0,
                            ),
                          ) +
                          " remaining.",
                        tag: "Budget",
                      },
                    ]}
                    renderItem={(item) => (
                      <List.Item className="dashboard-list-item">
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<BellOutlined />}
                              className="dashboard-list-avatar"
                            />
                          }
                          title={
                            <Space size="small">
                              <span>{item.title}</span>
                              <Tag className="dashboard-soft-tag">
                                {item.tag}
                              </Tag>
                            </Space>
                          }
                          description={item.text}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  className="dashboard-card dashboard-feature-card"
                  title="AI features"
                  style={{ height: "100%", minHeight: 300 }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {[
                      {
                        title: "Study plan",
                        text: "Generate a focused revision plan for AI and DBMS.",
                        icon: <RobotOutlined />,
                      },
                      {
                        title: "Budget check",
                        text: "Review your weekly spending and recommend savings.",
                        icon: <DollarOutlined />,
                      },
                      {
                        title: "Hostel support",
                        text: "Summarize active requests and payment items.",
                        icon: <HomeOutlined />,
                      },
                    ].map((item) => (
                      <div key={item.title} className="dashboard-ai-item">
                        <div className="dashboard-ai-icon">{item.icon}</div>
                        <div>
                          <Text strong>{item.title}</Text>
                          <Paragraph className="dashboard-mini-copy">
                            {item.text}
                          </Paragraph>
                        </div>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Dashboard;
