import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReadOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Academic.css";
import { isApiConfigured, request } from "../../../api/client";

const { Title, Paragraph, Text } = Typography;
const createDefaultWorkspace = () => ({
  profile: {},
  courses: [],
  assignments: [],
  exams: [],
  attendance: [],
  formValues: {
    profile: {},
    course: {},
    assignment: {},
    exam: {},
    attendance: {},
  },
});
function formatDate(value) {
  if (!value) return "No date set";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getAssignmentStatus(assignment) {
  if (assignment.status === "Completed") return "Completed";
  if (
    assignment.dueDate &&
    assignment.dueDate < new Date().toISOString().slice(0, 10)
  ) {
    return "Overdue";
  }
  return assignment.status || "To do";
}

const recordId = (record) => String(record?.id || record?._id || "");

function statusColor(status) {
  if (status === "Completed") return "green";
  if (status === "Overdue") return "red";
  if (status === "In progress") return "blue";
  return "gold";
}

function Academic({ workspace: workspaceProp, onWorkspaceChange }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [courseEditor, setCourseEditor] = useState(null);
  const [assignmentEditor, setAssignmentEditor] = useState(null);
  const [examEditor, setExamEditor] = useState(null);
  const [attendanceEditor, setAttendanceEditor] = useState(null);
  const [profileForm] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [assignmentForm] = Form.useForm();
  const [examForm] = Form.useForm();
  const [attendanceForm] = Form.useForm();

  const [fallbackWorkspace, setFallbackWorkspace] = useState(
    createDefaultWorkspace,
  );
  const workspace = workspaceProp || fallbackWorkspace;
  useEffect(() => {
    if (!isApiConfigured) return;
    request("/academic")
      .then((data) =>
        setWorkspace((current) => ({
          ...current,
          profile: data.profile || {},
          courses: (data.courses || []).map((item) => ({ ...item, id: recordId(item) })),
          assignments: (data.assignments || []).map((item) => ({ ...item, id: recordId(item) })),
          exams: (data.exams || []).map((item) => ({ ...item, id: recordId(item) })),
          attendance: (data.attendance || []).map((item) => ({ ...item, id: recordId(item) })),
        })),
      )
      .catch(() => {});
  }, []);
  const setWorkspace = (nextValue) => {
    if (onWorkspaceChange) {
      onWorkspaceChange((current) => {
        const base = current || createDefaultWorkspace();
        return typeof nextValue === "function" ? nextValue(base) : nextValue;
      });
      return;
    }

    setFallbackWorkspace((current) =>
      typeof nextValue === "function" ? nextValue(current) : nextValue,
    );
  };
  const attendanceRate = useMemo(() => {
    const attended = workspace.attendance.reduce(
      (total, record) => total + Number(record.attended || 0),
      0,
    );
    const classes = workspace.attendance.reduce(
      (total, record) => total + Number(record.total || 0),
      0,
    );

    return classes ? Math.round((attended / classes) * 100) : 0;
  }, [workspace.attendance]);

  const outstandingAssignments = useMemo(
    () =>
      workspace.assignments.filter(
        (assignment) => getAssignmentStatus(assignment) !== "Completed",
      ),
    [workspace.assignments],
  );

  const nextExam = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...workspace.exams]
      .filter((exam) => exam.examDate >= today)
      .sort((first, second) =>
        first.examDate.localeCompare(second.examDate),
      )[0];
  }, [workspace.exams]);

  const updateCollection = (collection, nextValue) => {
    setWorkspace((current) => ({ ...current, [collection]: nextValue }));
  };

  const updateFormValues = (section, nextValues) => {
    setWorkspace((current) => ({
      ...current,
      formValues: { ...current.formValues, [section]: nextValues },
    }));
  };

  const clearFormValues = (section) => updateFormValues(section, {});

  const getFormValues = (section) => workspace.formValues?.[section] || {};
  const hasFormValues = (section) =>
    Object.keys(getFormValues(section)).length > 0;

  const openProfileModal = () => {
    profileForm.resetFields();
    profileForm.setFieldsValue(
      hasFormValues("profile") ? getFormValues("profile") : workspace.profile,
    );
    setProfileModalOpen(true);
  };

  const openCourseEditor = (course) => {
    courseForm.resetFields();
    courseForm.setFieldsValue(
      course
        ? course
        : hasFormValues("course")
          ? getFormValues("course")
          : { credits: 3 },
    );
    setCourseEditor(course ? { ...course, id: recordId(course) } : {});
  };

  const openAssignmentEditor = (assignment) => {
    assignmentForm.resetFields();
    assignmentForm.setFieldsValue(
      assignment
        ? assignment
        : hasFormValues("assignment")
          ? getFormValues("assignment")
          : { priority: "Medium", status: "To do" },
    );
    setAssignmentEditor(assignment || {});
  };

  const openExamEditor = (exam) => {
    examForm.resetFields();
    examForm.setFieldsValue(
      exam ? exam : hasFormValues("exam") ? getFormValues("exam") : {},
    );
    setExamEditor(exam ? { ...exam, id: recordId(exam) } : {});
  };

  const openAttendanceEditor = (record) => {
    attendanceForm.resetFields();
    attendanceForm.setFieldsValue(
      record
        ? record
        : hasFormValues("attendance")
          ? getFormValues("attendance")
          : {},
    );
    setAttendanceEditor(record ? { ...record, id: recordId(record) } : {});
  };

  const saveProfile = async (values) => {
    const savedProfile = isApiConfigured
      ? await request("/academic/profile", { method: "PUT", body: values })
      : null;
    setWorkspace((current) => ({
      ...current,
      profile: savedProfile?.profile || {
        program: (values.program || "").trim(),
        semester: values.semester,
        cgpa: values.cgpa,
      },
    }));
    clearFormValues("profile");
    setProfileModalOpen(false);
    messageApi.success("Academic profile updated.");
  };

  const saveCourse = async (values) => {
    const courseId = courseEditor?.id;
    const course = {
      ...(courseEditor || {}),
      code: (values.code || "").trim(),
      title: (values.title || "").trim(),
      instructor: (values.instructor || "").trim(),
      credits: values.credits,
    };

    const saved = isApiConfigured
      ? await request(courseId ? `/academic/courses/${courseId}` : "/academic/courses", {
          method: courseId ? "PUT" : "POST",
          body: course,
        })
      : course;
    const completeCourse = { ...(saved?.course || saved || course), id: recordId(saved?.course || saved || course) || courseId };
    updateCollection(
      "courses",
      courseId
        ? workspace.courses.map((item) =>
            recordId(item) === courseId ? completeCourse : item,
          )
        : [...workspace.courses, completeCourse],
    );
    clearFormValues("course");
    setCourseEditor(null);
    courseForm.resetFields();
    messageApi.success(courseId ? "Course updated." : "Course added.");
  };

  const saveAssignment = async (values) => {
    const assignmentId = assignmentEditor?.id;
    const assignment = {
      id: assignmentId || `assignment-${Date.now()}`,
      title: (values.title || "").trim(),
      course: (values.course || "").trim(),
      dueDate: values.dueDate,
      priority: values.priority,
      status: values.status,
    };

    const saved = isApiConfigured
      ? await request(assignmentId ? `/assignments/${assignmentId}` : "/assignments", {
          method: assignmentId ? "PUT" : "POST",
          body: assignment,
        })
      : assignment;
    const completeAssignment = { ...(saved?.assignment || saved || assignment), id: recordId(saved?.assignment || saved || assignment) || assignmentId };
    updateCollection(
      "assignments",
      assignmentId
        ? workspace.assignments.map((item) =>
            recordId(item) === assignmentId ? completeAssignment : item,
          )
        : [completeAssignment, ...workspace.assignments],
    );
    clearFormValues("assignment");
    setAssignmentEditor(null);
    assignmentForm.resetFields();
    messageApi.success(
      assignmentId ? "Assignment updated." : "Assignment added.",
    );
  };

  const saveExam = async (values) => {
    const examId = examEditor?.id;
    const exam = {
      ...(examEditor || {}),
      title: (values.title || "").trim(),
      course: (values.course || "").trim(),
      examDate: values.examDate,
      venue: (values.venue || "").trim(),
    };

    const saved = isApiConfigured
      ? await request(examId ? `/academic/exams/${examId}` : "/academic/exams", {
          method: examId ? "PUT" : "POST",
          body: exam,
        })
      : exam;
    const completeExam = { ...(saved?.exam || saved || exam), id: recordId(saved?.exam || saved || exam) || examId };
    updateCollection(
      "exams",
      examId
        ? workspace.exams        .map((item) => (recordId(item) === examId ? completeExam : item))
        : [...workspace.exams, completeExam],
    );
    clearFormValues("exam");
    setExamEditor(null);
    examForm.resetFields();
    messageApi.success(examId ? "Exam updated." : "Exam added.");
  };

  const saveAttendance = async (values) => {
    const attendanceId = attendanceEditor?.id;
    const attendance = {
      ...(attendanceEditor || {}),
      course: (values.course || "").trim(),
      attended: values.attended,
      total: values.total,
    };

    const saved = isApiConfigured
      ? await request(
          attendanceId ? `/academic/attendance/${attendanceId}` : "/academic/attendance",
          { method: attendanceId ? "PUT" : "POST", body: attendance },
        )
      : attendance;
    const completeAttendance = { ...(saved?.attendance || saved || attendance), id: recordId(saved?.attendance || saved || attendance) || attendanceId };
    updateCollection(
      "attendance",
      attendanceId
        ? workspace.attendance.map((item) =>
            recordId(item) === attendanceId ? completeAttendance : item,
          )
        : [...workspace.attendance, completeAttendance],
    );
    clearFormValues("attendance");
    setAttendanceEditor(null);
    attendanceForm.resetFields();
    messageApi.success(
      attendanceId ? "Attendance updated." : "Attendance added.",
    );
  };

  const removeItem = async (collection, id, label) => {
    if (isApiConfigured) {
      const endpoint = {
        courses: "courses",
        assignments: "assignments",
        exams: "exams",
        attendance: "attendance",
      }[collection];
      await request(`/${collection === "assignments" ? "assignments" : "academic/" + endpoint}/${id}`, {
        method: "DELETE",
      });
    }
    updateCollection(
      collection,
      workspace[collection].filter((item) => recordId(item) !== id),
    );
    messageApi.success(`${label} removed.`);
  };

  const markAssignmentComplete = async (assignment) => {
    if (isApiConfigured) {
      const result = await request(`/assignments/${recordId(assignment)}`, {
        method: "PUT",
        body: { status: "Completed" },
      });
      assignment = result.assignment || assignment;
    }
    updateCollection(
      "assignments",
      workspace.assignments.map((item) =>
        recordId(item) === recordId(assignment) ? { ...item, ...assignment, status: "Completed" } : item,
      ),
    );
    messageApi.success("Assignment marked as completed.");
  };

  const assignmentColumns = [
    {
      title: "Assignment",
      dataIndex: "title",
      render: (title, record) => (
        <div className="academic-task-title">
          <Text strong>{title}</Text>
          <Text type="secondary">
            <BookOutlined /> {record.course}
          </Text>
        </div>
      ),
    },
    {
      title: "Due",
      dataIndex: "dueDate",
      render: (date) => (
        <Space size={6}>
          <CalendarOutlined />
          <span>{formatDate(date)}</span>
        </Space>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority) => (
        <Tag color={priority === "High" ? "volcano" : "blue"}>{priority}</Tag>
      ),
    },
    {
      title: "Status",
      render: (_, record) => {
        const status = getAssignmentStatus(record);
        return <Tag color={statusColor(status)}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          {getAssignmentStatus(record) !== "Completed" && (
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => markAssignmentComplete(record)}
              aria-label={`Mark ${record.title} as completed`}
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openAssignmentEditor(record)}
            aria-label={`Edit ${record.title}`}
          />
          <Popconfirm
            title="Delete this assignment?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => removeItem("assignments", record.id, "Assignment")}
          >
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              aria-label={`Delete ${record.title}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const attendanceColumns = [
    {
      title: "Course",
      dataIndex: "course",
      render: (course) => (
        <Space size={6}>
          <BookOutlined />
          <Text>{course}</Text>
        </Space>
      ),
    },
    {
      title: "Classes",
      render: (_, record) => (
        <Space size={6}>
          <ReadOutlined />
          <span>{`${record.attended} / ${record.total}`}</span>
        </Space>
      ),
    },
    {
      title: "Attendance",
      render: (_, record) => {
        const percentage = record.total
          ? Math.round((record.attended / record.total) * 100)
          : 0;
        return <Progress percent={percentage} size="small" />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openAttendanceEditor(record)}
            aria-label={`Edit ${record.course} attendance`}
          />
          <Popconfirm
            title="Delete this attendance record?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              removeItem("attendance", record.id, "Attendance record")
            }
          >
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              aria-label={`Delete ${record.course} attendance`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="academic-page">
      {contextHolder}
      <section className="academic-hero" aria-labelledby="academic-title">
        <div className="academic-hero-copy">
          <Tag icon={<BookOutlined />} className="hostel-eyebrow">
            Academic Portal
          </Tag>
          <Title id="academic-title" level={2}>
            Manage your semester in one place
          </Title>
          <Paragraph>
            Keep your courses, deadlines, exams, and attendance up to date.
            Everything on this page is saved on this device.
          </Paragraph>
          <Space direction="vertical" size={2}></Space>
        </div>
        <Card className="academic-hero-card">
          <Space align="start" size={14}>
            <Avatar
              size={52}
              icon={<UserOutlined />}
              className="academic-avatar"
            />
            <div>
              <Text type="secondary">{workspace.profile.program}</Text>
              <Title level={4}>Semester {workspace.profile.semester}</Title>
              <Text>CGPA {Number(workspace.profile.cgpa || 0).toFixed(2)}</Text>
              <Button type="primary" size="small" onClick={openProfileModal}>
                Edit profile
              </Button>
            </div>
          </Space>
        </Card>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="academic-stat-card">
            <Statistic
              title="Current courses"
              value={workspace.courses.length}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="academic-stat-card">
            <Statistic
              title="Open assignments"
              value={outstandingAssignments.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="academic-stat-card">
            <Statistic
              title="Overall attendance"
              value={attendanceRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="academic-stat-card">
            <Statistic
              title="Scheduled exams"
              value={workspace.exams.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={24}>
          <Card
            className="academic-panel"
            title="Assignments"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openAssignmentEditor()}
              >
                Add assignment
              </Button>
            }
          >
            <Table
              className="academic-table"
              rowKey="id"
              columns={assignmentColumns}
              dataSource={[...workspace.assignments].sort((a, b) =>
                b.dueDate.localeCompare(a.dueDate),
              )}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No assignments yet"
                  />
                ),
              }}
              scroll={{ x: 680 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={24}>
          <Card
            className="academic-panel"
            title="Exams"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openExamEditor()}
              >
                Add exam
              </Button>
            }
          >
            {nextExam && (
              <div className="academic-next-exam">
                <ScheduleOutlined />
                <div>
                  <Text type="secondary">Next exam</Text>
                  <Text strong>{nextExam.title}</Text>
                  <Space size={10} wrap>
                    <Text type="secondary">
                      <CalendarOutlined /> {formatDate(nextExam.examDate)}
                    </Text>
                    <Text type="secondary">
                      <EnvironmentOutlined /> {nextExam.venue}
                    </Text>
                  </Space>
                </div>
              </div>
            )}
            <List
              className="academic-exam-list"
              dataSource={[...workspace.exams].sort((a, b) =>
                b.examDate.localeCompare(a.examDate),
              )}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No exams scheduled"
                  />
                ),
              }}
              renderItem={(exam) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openExamEditor(exam)}
                      aria-label={`Edit ${exam.title}`}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete this exam?"
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => removeItem("exams", exam.id, "Exam")}
                    >
                      <Button
                        danger
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        aria-label={`Delete ${exam.title}`}
                      />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<CalendarOutlined />}
                        className="academic-list-avatar"
                      />
                    }
                    title={exam.title}
                    description={
                      <Space size={10} wrap>
                        <Text type="secondary">
                          <BookOutlined /> {exam.course}
                        </Text>
                        <Text type="secondary">
                          <CalendarOutlined /> {formatDate(exam.examDate)}
                        </Text>
                        <Text type="secondary">
                          <EnvironmentOutlined /> {exam.venue}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={24}>
          <Card
            className="academic-panel"
            title="Attendance"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openAttendanceEditor()}
              >
                Add record
              </Button>
            }
          >
            <div className="academic-attendance-summary">
              <div>
                <Progress
                  type="circle"
                  percent={attendanceRate}
                  size={106}
                  strokeColor={{ "0%": "#60a5fa", "100%": "#1d4ed8" }}
                />
              </div>
              <div>
                <Title level={4}>{attendanceRate}% overall attendance</Title>
                <Paragraph>
                  Keep this above your programme requirement. Update each course
                  after classes are held.
                </Paragraph>
              </div>
            </div>
            <Table
              className="academic-table"
              rowKey="id"
              columns={attendanceColumns}
              dataSource={[...workspace.attendance].sort((a, b) => {
                const aTotal = a.total || 0;
                const bTotal = b.total || 0;
                return bTotal - aTotal;
              })}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No attendance records yet"
                  />
                ),
              }}
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={24}>
          <section
            className="academic-courses-section"
            aria-labelledby="courses-title"
          >
            <div className="academic-section-heading">
              <div>
                <Title id="courses-title" level={4}>
                  Courses
                </Title>
                <Text type="secondary">Your active semester subjects</Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCourseEditor()}
              >
                Add course
              </Button>
            </div>
            {workspace.courses.length ? (
              <div className="academic-course-grid">
                {workspace.courses.map((course) => (
                  <Card key={course.id} className="academic-course-card">
                    <div className="academic-course-card-header">
                      <Avatar
                        icon={<ReadOutlined />}
                        className="academic-list-avatar"
                      />
                      <Space size={4}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openCourseEditor(course)}
                          aria-label={`Edit ${course.title}`}
                        />
                        <Popconfirm
                          title="Delete this course?"
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                          onConfirm={() =>
                            removeItem("courses", course.id, "Course")
                          }
                        >
                          <Button
                            danger
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            aria-label={`Delete ${course.title}`}
                          />
                        </Popconfirm>
                      </Space>
                    </div>
                    <Space size={6}>
                      <BookOutlined />
                      <Text type="secondary">{course.code}</Text>
                    </Space>
                    <Title level={5}>{course.title}</Title>
                    <Space size={6}>
                      <UserOutlined />
                      <Text>{course.instructor}</Text>
                    </Space>
                    <Tag color="blue">
                      <ReadOutlined /> {course.credits} credits
                    </Tag>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="academic-panel academic-empty-card">
                <Empty description="Add the courses for this semester" />
              </Card>
            )}
          </section>
        </Col>
      </Row>
      <datalist id="course-options">
        {workspace.courses.map((course) => (
          <option key={course.id} value={course.title} />
        ))}
      </datalist>

      <Modal
        title="Academic profile"
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        onOk={() => profileForm.submit()}
        okText="Save profile"
        destroyOnClose
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={saveProfile}
          onValuesChange={(_, values) => updateFormValues("profile", values)}
        >
          <Form.Item
            name="program"
            label="Programme"
            rules={[{ required: true, message: "Enter your programme" }]}
          >
            <Input placeholder="e.g. BS Computer Science" />
          </Form.Item>
          <Form.Item
            name="semester"
            label="Current semester"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={12} className="academic-full-width" />
          </Form.Item>
          <Form.Item name="cgpa" label="CGPA" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              max={4}
              step={0.01}
              className="academic-full-width"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={courseEditor?.id ? "Edit course" : "Add course"}
        open={courseEditor !== null}
        onCancel={() => {
          setCourseEditor(null);
          courseForm.resetFields();
        }}
        onOk={() => courseForm.submit()}
        okText={courseEditor?.id ? "Save changes" : "Add course"}
        destroyOnClose
      >
        <Form
          form={courseForm}
          layout="vertical"
          onFinish={saveCourse}
          onValuesChange={(_, values) => updateFormValues("course", values)}
        >
          <Form.Item
            name="code"
            label="Course code"
            rules={[{ required: true, message: "Enter a course code" }]}
          >
            <Input placeholder="e.g. CS-302" />
          </Form.Item>
          <Form.Item
            name="title"
            label="Course title"
            rules={[{ required: true, message: "Enter a course title" }]}
          >
            <Input placeholder="e.g. AI Fundamentals" />
          </Form.Item>
          <Form.Item
            name="instructor"
            label="Instructor"
            rules={[{ required: true, message: "Enter the instructor name" }]}
          >
            <Input placeholder="e.g. Dr. Ayesha Khan" />
          </Form.Item>
          <Form.Item
            name="credits"
            label="Credit hours"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={8} className="academic-full-width" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={assignmentEditor?.id ? "Edit assignment" : "Add assignment"}
        open={assignmentEditor !== null}
        onCancel={() => {
          setAssignmentEditor(null);
          assignmentForm.resetFields();
        }}
        onOk={() => assignmentForm.submit()}
        okText={assignmentEditor?.id ? "Save changes" : "Add assignment"}
        destroyOnClose
      >
        <Form
          form={assignmentForm}
          layout="vertical"
          onFinish={saveAssignment}
          onValuesChange={(_, values) => updateFormValues("assignment", values)}
        >
          <Form.Item
            name="title"
            label="Assignment"
            rules={[{ required: true, message: "Enter an assignment title" }]}
          >
            <Input placeholder="e.g. Research report" />
          </Form.Item>
          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: "Enter the course" }]}
          >
            <Input
              list="course-options"
              placeholder="Select or type a course"
            />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due date"
            rules={[{ required: true, message: "Choose a due date" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true }]}
              >
                <select className="academic-native-select">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Progress"
                rules={[{ required: true }]}
              >
                <select className="academic-native-select">
                  <option value="To do">To do</option>
                  <option value="In progress">In progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={examEditor?.id ? "Edit exam" : "Add exam"}
        open={examEditor !== null}
        onCancel={() => {
          setExamEditor(null);
          examForm.resetFields();
        }}
        onOk={() => examForm.submit()}
        okText={examEditor?.id ? "Save changes" : "Add exam"}
        destroyOnClose
      >
        <Form
          form={examForm}
          layout="vertical"
          onFinish={saveExam}
          onValuesChange={(_, values) => updateFormValues("exam", values)}
        >
          <Form.Item
            name="title"
            label="Exam title"
            rules={[{ required: true, message: "Enter an exam title" }]}
          >
            <Input placeholder="e.g. Midterm examination" />
          </Form.Item>
          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: "Enter the course" }]}
          >
            <Input
              list="course-options"
              placeholder="Select or type a course"
            />
          </Form.Item>
          <Form.Item
            name="examDate"
            label="Exam date"
            rules={[{ required: true, message: "Choose an exam date" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="venue"
            label="Venue"
            rules={[{ required: true, message: "Enter the venue" }]}
          >
            <Input placeholder="e.g. Hall B-201" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={attendanceEditor?.id ? "Edit attendance" : "Add attendance"}
        open={attendanceEditor !== null}
        onCancel={() => {
          setAttendanceEditor(null);
          attendanceForm.resetFields();
        }}
        onOk={() => attendanceForm.submit()}
        okText={attendanceEditor?.id ? "Save changes" : "Add record"}
        destroyOnClose
      >
        <Form
          form={attendanceForm}
          layout="vertical"
          onFinish={saveAttendance}
          onValuesChange={(_, values) => updateFormValues("attendance", values)}
        >
          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: "Enter the course" }]}
          >
            <Input
              list="course-options"
              placeholder="Select or type a course"
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="attended"
                label="Classes attended"
                dependencies={["total"]}
                rules={[
                  { required: true, message: "Enter classes attended" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const total = getFieldValue("total");
                      return !total || value <= total
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Cannot exceed total classes"),
                          );
                    },
                  }),
                ]}
              >
                <InputNumber min={0} className="academic-full-width" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="total"
                label="Total classes"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} className="academic-full-width" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default Academic;
