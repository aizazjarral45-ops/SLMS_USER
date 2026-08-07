import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  ScheduleOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import "./Academic.css";
const { Title, Paragraph, Text } = Typography;

const courseCards = [
  {
    code: "CS-302",
    title: "AI Fundamentals",
    instructor: "Dr. Hina Rashid",
    credits: 3,
    status: "In Progress",
  },
  {
    code: "CS-318",
    title: "Advanced Web Engineering",
    instructor: "Prof. Ahmed Raza",
    credits: 4,
    status: "Project Heavy",
  },
  {
    code: "CS-305",
    title: "Database Systems",
    instructor: "Dr. Sana Qureshi",
    credits: 3,
    status: "On Track",
  },
  {
    code: "MGT-201",
    title: "Entrepreneurship",
    instructor: "Ms. Mahnoor Saleem",
    credits: 2,
    status: "Elective",
  },
];

const assignments = [
  {
    key: "1",
    title: "Database Normalization Report",
    course: "Database Systems",
    dueDate: "2026-08-02",
    status: "Upcoming",
    priority: "High",
  },
  {
    key: "2",
    title: "AI Model Reflection Journal",
    course: "AI Fundamentals",
    dueDate: "2026-08-06",
    status: "Upcoming",
    priority: "Medium",
  },
  {
    key: "3",
    title: "SRS Final Submission",
    course: "Software Engineering",
    dueDate: "2026-07-22",
    status: "Completed",
    priority: "High",
  },
  {
    key: "4",
    title: "Responsive Interface Audit",
    course: "Advanced Web Engineering",
    dueDate: "2026-07-26",
    status: "Late",
    priority: "Critical",
  },
];

const quizItems = [
  {
    title: "AI Quiz 3",
    course: "AI Fundamentals",
    date: "2026-08-04",
    status: "Upcoming",
    score: null,
  },
  {
    title: "DBMS Quiz 2",
    course: "Database Systems",
    date: "2026-07-24",
    status: "Completed",
    score: "18/20",
  },
  {
    title: "SE Quiz 1",
    course: "Software Engineering",
    date: "2026-07-18",
    status: "Completed",
    score: "16/20",
  },
];

const exams = [
  {
    title: "Mid Term: AI Fundamentals",
    date: "2026-08-09T09:00:00",
    venue: "Hall B-201",
  },
  {
    title: "Final: Database Systems",
    date: "2026-09-18T13:30:00",
    venue: "Lab Complex",
  },
];

const calendarItems = [
  { title: "Capstone Proposal Review", type: "Event", date: "Aug 1" },
  { title: "DBMS Report Due", type: "Assignment", date: "Aug 2" },
  { title: "AI Quiz 3", type: "Quiz", date: "Aug 4" },
  { title: "AI Mid Term", type: "Exam", date: "Aug 9" },
];

const assignmentPriorityIcon = (priority) => {
  if (priority === "Critical")
    return <ExclamationCircleOutlined style={{ color: "#f5222d" }} />;
  if (priority === "High")
    return <WarningOutlined style={{ color: "#fa8c16" }} />;
  return <ClockCircleOutlined style={{ color: "#1890ff" }} />;
};

const calendarTypeIcon = (type) => {
  if (type === "Assignment")
    return <FileTextOutlined style={{ color: "#1890ff" }} />;
  if (type === "Quiz")
    return <QuestionCircleOutlined style={{ color: "#52c41a" }} />;
  if (type === "Exam") return <ScheduleOutlined style={{ color: "#fa8c16" }} />;
  return <CalendarOutlined style={{ color: "#1890ff" }} />;
};

const analytics = {
  gpaTrend: [
    { label: "Sem 2", value: 3.2 },
    { label: "Sem 3", value: 3.35 },
    { label: "Sem 4", value: 3.48 },
    { label: "Sem 5", value: 3.61 },
    { label: "Sem 6", value: 3.74 },
  ],
  attendanceTrend: [
    { label: "Mon", value: 86 },
    { label: "Tue", value: 91 },
    { label: "Wed", value: 94 },
    { label: "Thu", value: 89 },
    { label: "Fri", value: 96 },
  ],
  assignmentProgress: [
    { label: "Completed", value: 11, color: "#2563eb" },
    { label: "Upcoming", value: 4, color: "#60a5fa" },
    { label: "Late", value: 1, color: "#f97316" },
  ],
  subjectPerformance: [
    { label: "AI", value: 87 },
    { label: "DBMS", value: 92 },
    { label: "Web", value: 89 },
    { label: "SE", value: 84 },
  ],
};

function MiniChart({ title, items, formatValue = (value) => value }) {
  const max = Math.max(...items.map((item) => item.value));

  return (
    <Card className="academic-panel" title={title}>
      <div className="academic-mini-chart">
        {items.map((item) => (
          <div key={item.label} className="academic-bar-row">
            <div className="academic-bar-meta">
              <Text>{item.label}</Text>
              <Text strong>{formatValue(item.value)}</Text>
            </div>
            <div className="academic-bar-track">
              <div
                className="academic-bar-fill"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CountdownCard() {
  const targetDate = new Date(exams[0].date).getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(targetDate - Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const safeTime = Math.max(timeLeft, 0);
  const days = Math.floor(safeTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeTime / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeTime / (1000 * 60)) % 60);

  return (
    <Card className="academic-panel academic-countdown">
      <Space direction="vertical" size={6}>
        <Badge status="processing" text="Next Major Exam" />
        <Title level={4}>{exams[0].title}</Title>
        <Text type="secondary">
          {new Date(exams[0].date).toLocaleString()} • {exams[0].venue}
        </Text>
        <div className="academic-countdown-grid">
          <div>
            <strong>{days}</strong>
            <span>Days</span>
          </div>
          <div>
            <strong>{hours}</strong>
            <span>Hours</span>
          </div>
          <div>
            <strong>{minutes}</strong>
            <span>Minutes</span>
          </div>
        </div>
      </Space>
    </Card>
  );
}

function Academic() {
  const [stats, setStats] = useState([]);
  const [attendanceState, setAttendanceState] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [AttendanceModal, setAttendanceModal] = useState(false);
  const [editingAttendanceItem, setEditingAttendanceItem] = useState(null);
  const [form] = Form.useForm();
  const [attendanceForm] = Form.useForm();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("academicStats");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.attendanceState) setAttendanceState(parsed.attendanceState);
      }
    } catch (e) {}
  }, []);

  const openModal = () => {
    const currentGpa = stats.find((s) => s.title === "Current GPA")?.value || 0;
    const cgpa = stats.find((s) => s.title === "CGPA")?.value || 0;
    const currentsemester =
      stats.find((s) => s.title === "Current Semester")?.value || 0;
    form.setFieldsValue({
      currentGpa,
      gpa: cgpa,
      currentsemester,
    });
    setIsModalOpen(true);
  };

  const openAttendanceModal = () => {
    attendanceForm.resetFields();
    setEditingAttendanceItem(null);
    setIsAttendanceModalOpen(true);
  };

  const openAttendanceEditModal = (record) => {
    attendanceForm.resetFields();
    attendanceForm.setFieldsValue({
      subject: record.subject,
      attended: record.attended,
      total: record.total,
    });
    setEditingAttendanceItem(record);
    setAttendanceModal(true);
  };

  const handleAttendanceSubmit = (values) => {
    const percent =
      values.total > 0 ? Math.round((values.attended / values.total) * 100) : 0;
    const newItem = {
      key: `${Date.now()}-${values.subject}`,
      subject: values.subject,
      attended: values.attended,
      total: values.total,
      percent,
    };
    const newAttendanceState = [...attendanceState, newItem];
    setAttendanceState(newAttendanceState);

    const updatedStats = stats.map((s) =>
      s.title === "Attendance"
        ? {
            ...s,
            value: Math.round(
              newAttendanceState.reduce((sum, item) => sum + item.percent, 0) /
                newAttendanceState.length,
            ),
          }
        : s,
    );
    setStats(updatedStats);

    try {
      localStorage.setItem(
        "academicStats",
        JSON.stringify({
          stats: updatedStats,
          attendanceState: newAttendanceState,
        }),
      );
    } catch (e) {}
    setIsAttendanceModalOpen(false);
  };

  const handleAttendanceEditSubmit = (values) => {
    if (!editingAttendanceItem) return;

    const percent =
      values.total > 0 ? Math.round((values.attended / values.total) * 100) : 0;
    const updatedAttendanceState = attendanceState.map((item) =>
      item.key === editingAttendanceItem.key
        ? {
            ...item,
            subject: values.subject,
            attended: values.attended,
            total: values.total,
            percent,
          }
        : item,
    );

    setAttendanceState(updatedAttendanceState);

    const updatedStats = stats.map((s) =>
      s.title === "Attendance"
        ? {
            ...s,
            value: updatedAttendanceState.length
              ? Math.round(
                  updatedAttendanceState.reduce(
                    (sum, item) => sum + item.percent,
                    0,
                  ) / updatedAttendanceState.length,
                )
              : 0,
          }
        : s,
    );
    setStats(updatedStats);

    try {
      localStorage.setItem(
        "academicStats",
        JSON.stringify({
          stats: updatedStats,
          attendanceState: updatedAttendanceState,
        }),
      );
    } catch (e) {}
    setAttendanceModal(false);
    setEditingAttendanceItem(null);
    attendanceForm.resetFields();
  };

  const handleAttendanceDelete = (record) => {
    const updatedAttendanceState = attendanceState.filter(
      (item) => item.key !== record.key,
    );
    setAttendanceState(updatedAttendanceState);

    const updatedStats = stats.map((s) =>
      s.title === "Attendance"
        ? {
            ...s,
            value: updatedAttendanceState.length
              ? Math.round(
                  updatedAttendanceState.reduce(
                    (sum, item) => sum + item.percent,
                    0,
                  ) / updatedAttendanceState.length,
                )
              : 0,
          }
        : s,
    );
    setStats(updatedStats);

    try {
      localStorage.setItem(
        "academicStats",
        JSON.stringify({
          stats: updatedStats,
          attendanceState: updatedAttendanceState,
        }),
      );
    } catch (e) {}
  };

  const handleModalSubmit = (vals) => {
    const newStats = stats.map((s) => {
      if (s.title === "Current GPA") return { ...s, value: vals.currentGpa };
      if (s.title === "Attendance") return { ...s, value: vals.percentage };
      if (s.title === "CGPA") return { ...s, value: vals.gpa };
      if (s.title === "Current Semester")
        return { ...s, value: vals.currentsemester };
      return s;
    });
    setStats(newStats);

    try {
      localStorage.setItem(
        "academicStats",
        JSON.stringify({ stats: newStats, attendanceState: attendanceState }),
      );
    } catch (e) {}
    setIsModalOpen(false);
  };
  const assignmentSummary = useMemo(
    () => ({
      upcoming: assignments.filter((item) => item.status === "Upcoming").length,
      completed: assignments.filter((item) => item.status === "Completed")
        .length,
      late: assignments.filter((item) => item.status === "Late").length,
    }),
    [],
  );

  const assignmentColumns = [
    {
      title: "Assignment",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Space>
          {assignmentPriorityIcon(record.priority)}
          <Text>{text}</Text>
        </Space>
      ),
    },
    { title: "Course", dataIndex: "course", key: "course" },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate" },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (value) => (
        <Tag
          color={
            value === "Critical" ? "red" : value === "High" ? "volcano" : "blue"
          }
        >
          {value}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Badge
          status={
            value === "Completed"
              ? "success"
              : value === "Late"
                ? "error"
                : "processing"
          }
          text={value}
        />
      ),
    },
  ];

  const attendanceColumns = [
    { title: "Subject", dataIndex: "subject", key: "subject" },
    { title: "Attended", dataIndex: "attended", key: "attended" },
    { title: "Total", dataIndex: "total", key: "total" },
    {
      title: "Progress",
      dataIndex: "percent",
      key: "percent",
      render: (value) => (
        <Progress percent={value} size="small" strokeColor="#2563eb" />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => openAttendanceEditModal(record)}>
            Edit
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleAttendanceDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="academic-page">
      <div className="academic-hero">
        <div>
          <Tag color="blue" className="academic-pill">
            Academic Dashboard
          </Tag>
          <Title level={2}>Your semester performance at a glance</Title>
          <Paragraph>
            Track GPA, attendance, upcoming exams, quizzes, and coursework in
            one focused academic workspace.
          </Paragraph>
        </div>
        <Card className="academic-hero-card">
          <Space align="start">
            <Avatar
              size={56}
              icon={<RiseOutlined />}
              className="academic-avatar"
            />
            <div>
              <Text type="secondary">Current Standing</Text>
              <Title level={3}>Dean’s List Eligible</Title>
              <Text>
                Keep attendance above 90% to protect scholarship priority.
              </Text>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={openModal}
              >
                + Academic Data
              </Button>
            </div>
          </Space>
        </Card>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((card) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={card.title}>
            <Card className="academic-stat-card">
              <Statistic {...card} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="academic-panel"
        title="Attendance Overview"
        extra={
          <>
            <Tag color="blue">
              Overall {stats.find((s) => s.title === "Attendance")?.value}%
            </Tag>
            <Button type="primary" onClick={openAttendanceModal}>
              Add Attendance Data
            </Button>
          </>
        }
      >
        <div className="academic-attendance-summary">
          <div>
            <Text type="secondary">Overall Attendance</Text>
            <Progress
              type="circle"
              percent={stats.find((s) => s.title === "Attendance")?.value || 0}
              size={120}
              strokeColor={{ "0%": "#60a5fa", "100%": "#1d4ed8" }}
            />
          </div>
          <div className="academic-attendance-list">
            {attendanceState.map((item) => (
              <div key={item.subject} className="academic-inline-progress">
                <div className="academic-inline-header">
                  <Text>{item.subject}</Text>
                  <Text strong>{item.percent}%</Text>
                </div>
                <Progress
                  percent={item.percent}
                  showInfo={false}
                  strokeColor="#2563eb"
                />
              </div>
            ))}
          </div>
        </div>
        <Table
          className="academic-table"
          columns={attendanceColumns}
          dataSource={attendanceState}
          pagination={true}
          scroll={{ x: 600 }}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <CountdownCard />
        </Col>
        <Col xs={24} md={12}>
          <Card className="academic-panel" title="Upcoming Exams">
            <List
              dataSource={exams}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<ScheduleOutlined />}
                        className="academic-list-avatar"
                      />
                    }
                    title={item.title}
                    description={`${new Date(item.date).toLocaleString()} • ${item.venue}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <div className="academic-section">
        <Title level={4}>Current Courses</Title>
        <div className="academic-course-grid">
          {courseCards.map((course) => (
            <Card key={course.code} className="academic-course-card">
              <Space direction="vertical" size={10}>
                <Space>
                  <Avatar
                    icon={<BookOutlined />}
                    className="academic-list-avatar"
                  />
                  <div>
                    <Text type="secondary">{course.code}</Text>
                    <Title level={5}>{course.title}</Title>
                  </div>
                </Space>
                <Text>Instructor: {course.instructor}</Text>
                <Tag color="cyan">{course.status}</Tag>
              </Space>
            </Card>
          ))}
        </div>
      </div>

      <Row gutter={[16, 16]} className="academic-section">
        <Col xs={24} xl={14}>
          <Card
            className="academic-panel"
            title="Assignments"
            extra={
              <Space size="small">
                <Tag color="blue">Upcoming {assignmentSummary.upcoming}</Tag>
                <Tag color="green">Completed {assignmentSummary.completed}</Tag>
                <Tag color="red">Late {assignmentSummary.late}</Tag>
              </Space>
            }
          >
            <Table
              className="academic-table"
              columns={assignmentColumns}
              dataSource={assignments}
              pagination={true}
              scroll={{ x: 640 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="academic-panel" title="Quiz Center">
            <List
              dataSource={quizItems}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    item.score ? (
                      <Tag color="green" key="score">
                        {item.score}
                      </Tag>
                    ) : (
                      <Tag color="gold" key="status">
                        Prepare
                      </Tag>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={
                          item.status === "Completed" ? (
                            <CheckCircleOutlined />
                          ) : (
                            <ClockCircleOutlined />
                          )
                        }
                        className="academic-list-avatar"
                      />
                    }
                    title={item.title}
                    description={`${item.course} • ${item.date} • ${item.status}`}
                  />
                </List.Item>
              )}
            />
          </Card>
          <Alert
            className="academic-alert"
            type="info"
            showIcon
            message="Study Planner Insight"
            description="Focus on AI Fundamentals this week. It has the nearest assessment and the largest impact on your current GPA."
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="academic-section">
        <Col xs={24} xl={10}>
          <Card
            className="academic-panel"
            title="Academic Calendar"
            extra={<CalendarOutlined />}
          >
            <div className="academic-calendar-card">
              <Calendar fullscreen={false} />
            </div>
            <List
              className="academic-calendar-list"
              dataSource={calendarItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={calendarTypeIcon(item.type)}
                        className="academic-list-avatar"
                      />
                    }
                    title={item.title}
                    description={`${item.type} • ${item.date}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Title level={4}>Performance Analytics</Title>
          <div className="academic-analytics-grid">
            <MiniChart
              title="GPA Trend"
              items={analytics.gpaTrend}
              formatValue={(value) => value.toFixed(2)}
            />
            <MiniChart
              title="Attendance Trend"
              items={analytics.attendanceTrend}
              formatValue={(value) => `${value}%`}
            />
            <MiniChart
              title="Assignment Progress"
              items={analytics.assignmentProgress}
            />
            <MiniChart
              title="Subject Performance"
              items={analytics.subjectPerformance}
              formatValue={(value) => `${value}%`}
            />
          </div>
        </Col>
      </Row>

      <Card className="academic-panel academic-footer-panel">
        <Space align="start">
          <Avatar icon={<TeamOutlined />} className="academic-list-avatar" />
          <div>
            <Title level={5}>Advisor Recommendation</Title>
            <Paragraph>
              Book a mentoring session before August 5 to review your capstone
              workload, secure final exam preparation slots, and keep your
              scholarship benchmarks safe.
            </Paragraph>
            <Button type="primary" icon={<ClockCircleOutlined />}>
              Schedule Review
            </Button>
          </div>
        </Space>
      </Card>

      <Modal
        title="Add Academic Data"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Submit"
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Form.Item
            name="currentGpa"
            label="Current GPA"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={4}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="gpa" label="GPA" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              max={4}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="percentage"
            label="Percentage"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.01}
              formatter={(value) =>
                value !== undefined && value !== null ? `${value}%` : ""
              }
              parser={(value) => value.replace(/%\s?/, "")}
              style={{ width: "100%" }}
            ></InputNumber>
          </Form.Item>
          <Form.Item
            name="currentsemester"
            label="Current Semester"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={4} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Add Attendance Data"
        open={isAttendanceModalOpen}
        onCancel={() => setIsAttendanceModalOpen(false)}
        okText="Submit"
        onOk={() => attendanceForm.submit()}
      >
        <Form
          form={attendanceForm}
          layout="vertical"
          onFinish={handleAttendanceSubmit}
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Enter subject name" />
          </Form.Item>
          <Form.Item
            name="total"
            label="Total"
            rules={[{ required: true, message: "Please enter total classes" }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Attendance Data"
        open={AttendanceModal}
        onCancel={() => {
          setAttendanceModal(false);
          setEditingAttendanceItem(null);
          attendanceForm.resetFields();
        }}
        okText="Update"
        onOk={() => attendanceForm.submit()}
      >
        <Form
          form={attendanceForm}
          layout="vertical"
          onFinish={handleAttendanceEditSubmit}
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Enter subject name" />
          </Form.Item>
          <Form.Item
            name="attended"
            label="Attendance"
            rules={[
              { required: true, message: "Please enter attended classes" },
            ]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="total"
            label="Total"
            rules={[{ required: true, message: "Please enter total classes" }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Academic;
