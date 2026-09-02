import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CoffeeOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  FileTextOutlined,
  HeartOutlined,
  HomeOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  TeamOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import "./Hostel.css";
import { isApiConfigured, request } from "../../../api/client";

const { Title, Paragraph, Text } = Typography;
const STORAGE_KEY = "slms-hostel-applications";

const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

function formatDisplayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") return fallback;
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value !== "object") return String(value);

  const preferredProperty =
    value.name ??
    value.title ??
    value.message ??
    value.roomNumber ??
    value.block ??
    value.floor ??
    value.value ??
    value.label ??
    value._id ??
    value.id;
  if (preferredProperty !== undefined && preferredProperty !== value) {
    return formatDisplayValue(preferredProperty, fallback);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

function formatDateInput(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getStudentRollNumber(application) {
  const details =
    application?.applicantDetails &&
    typeof application.applicantDetails === "object"
      ? application.applicantDetails
      : null;
  const value =
    details?.studentId ??
    details?.rollNumber ??
    application?.rollNumber ??
    (typeof application?.studentId === "string"
      ? application.studentId
      : "");
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function getApplicationFormValues(application) {
  return {
    fullName: formatDisplayValue(application?.fullName, ""),
    studentId: getStudentRollNumber(application),
    email: formatDisplayValue(application?.email, ""),
    phone: formatDisplayValue(application?.phone, ""),
    gender: formatDisplayValue(application?.gender, ""),
    program: formatDisplayValue(application?.program, ""),
    semester: formatDisplayValue(application?.semester, ""),
    guardianName: formatDisplayValue(application?.guardianName, ""),
    guardianPhone: formatDisplayValue(application?.guardianPhone, ""),
    emergencyName: formatDisplayValue(application?.emergencyName, ""),
    emergencyPhone: formatDisplayValue(application?.emergencyPhone, ""),
    feesPerSemester: formatDisplayValue(application?.feesPerSemester, ""),
    feesPaidThisMonth: formatDisplayValue(application?.feesPaidThisMonth, ""),
    paymentDueDate: formatDateInput(application?.paymentDueDate),
    feesStatus: formatDisplayValue(application?.feesStatus, ""),
    agreement: true,
  };
}

function getSavedApplications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Hostel({ applications: applicationsProp, onApplicationsChange }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fallbackApplications, setFallbackApplications] =
    useState(getSavedApplications);
  const [remoteApplications, setRemoteApplications] = useState([]);
  const applications = isApiConfigured
    ? remoteApplications
    : Array.isArray(applicationsProp)
    ? applicationsProp
    : fallbackApplications;
  const setApplications = useCallback(
    (nextValue) => {
      if (onApplicationsChange) {
        onApplicationsChange(nextValue);
        return;
      }

      setFallbackApplications((current) =>
        typeof nextValue === "function" ? nextValue(current) : nextValue,
      );
    },
    [onApplicationsChange],
  );
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingKey, setEditingKey] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");
  const [hostelNotifications, setHostelNotifications] = useState([]);

  const normalizeRemoteApplication = (application) => {
    if (!application) return null;
    const details =
      application.applicantDetails &&
      typeof application.applicantDetails === "object"
        ? application.applicantDetails
        : application;
    return {
      ...details,
      ...application,
      key: String(
        application._id || application.id || application.key || Date.now(),
      ),
      applicationNo:
        application.applicationNo ||
        `HST-${String(application._id || application.id || "").slice(-8)}`,
      studentId: getStudentRollNumber(application),
      status: application.status || "Pending",
      submittedAt: application.createdAt || application.submittedAt || "",
      roomAllocation: application.roomAllocation || null,
    };
  };

  useEffect(() => {
    if (!isApiConfigured) return undefined;
    let cancelled = false;
    const loadMyApplication = async (showLoading = true) => {
      if (showLoading) setRemoteLoading(true);
      try {
        const result = await request("/hostel/my-application");
        if (cancelled) return;
        const next = normalizeRemoteApplication(result?.application || result);
        setRemoteApplications(next ? [next] : []);
        if (!isApiConfigured) setApplications(next ? [next] : []);
        setRemoteError("");
      } catch (error) {
        if (!cancelled && error?.status !== 404) {
          setRemoteError(
            formatDisplayValue(
              error?.message,
              "Unable to load your hostel application.",
            ),
          );
        }
      } finally {
        if (showLoading && !cancelled) setRemoteLoading(false);
      }
    };
    const loadNotifications = async () => {
      try {
        const result = await request("/notifications");
        const notifications = (result?.notifications || []).filter(
          (notification) =>
            notification.type === "hostel" || notification.module === "hostel",
        );
        if (!cancelled) setHostelNotifications(notifications.slice(0, 3));
      } catch {
        if (!cancelled) setHostelNotifications([]);
      }
    };
    loadMyApplication();
    loadNotifications();
    const poll = window.setInterval(() => {
      loadMyApplication(false);
      loadNotifications();
    }, 30000);
    return () => window.clearInterval(poll);
  }, [form, setApplications]);

  const filteredApplications = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return applications.filter((application) => {
      const searchableText = [
        application.fullName,
        application.studentId,
        application.program,
        application.guardianName,
        application.guardianPhone,
        application.emergencyName,
        application.emergencyPhone,
        application.applicationNo,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        (statusFilter === "All" || application.status === statusFilter)
      );
    });
  }, [applications, searchText, statusFilter]);

  const feesData = useMemo(
    () =>
      applications.map((application) => ({
        key: application.key,
        studentName: application.fullName,
        studentId: application.studentId,
        applicationNo: application.applicationNo,
        feesAmount: application.feesPerSemester || 0,
        feesPaidThisMonth: application.feesPaidThisMonth || 0,
        feesStatus: application.feesStatus || "Pending",
        paymentDueDate: application.paymentDueDate || "",
        recordDate: application.submittedAt || "",
      })),
    [applications],
  );

  const submitApplication = async (values) => {
    // Send the complete form object without trimming, coercing, or dropping fields.
    const applicantDetails = { ...values };

    if (editingKey) {
      const existingApplication =
        applications.find((item) => item.key === editingKey) || {};
      if (isApiConfigured) {
        try {
          const applicationId = existingApplication._id || editingKey;
          const result = await request(`/hostel/update/${applicationId}`, {
            method: "PUT",
            body: { applicantDetails },
          });
          const next = normalizeRemoteApplication(
            result?.application || result,
          ) || normalizeRemoteApplication({
            ...existingApplication,
            ...applicantDetails,
            _id: applicationId,
          });
          setRemoteApplications((current) =>
            current.map((item) =>
              item.key === editingKey ? { ...item, ...next } : item,
            ),
          );
          messageApi.success("Your hostel application has been updated.");
          return;
        } catch (error) {
          messageApi.error(
            formatDisplayValue(
              error?.message,
              "Unable to update hostel application.",
            ),
          );
          return;
        }
      }

      const updatedApplication = {
        ...existingApplication,
        ...applicantDetails,
      };

      setApplications((current) =>
        current.map((item) =>
          item.key === editingKey ? updatedApplication : item,
        ),
      );

      setEditingKey(updatedApplication.key);
      form.setFieldsValue(getApplicationFormValues(updatedApplication));
      messageApi.success("Hostel application updated.");
      return;
    }

    if (isApiConfigured) {
      try {
        const result = await request("/hostel/apply", {
          method: "POST",
          body: { applicantDetails },
        });
        const refreshed = await request("/hostel/my-application");
        const next = normalizeRemoteApplication(
          refreshed?.application || refreshed || result?.application || result,
        );
        if (next)         setRemoteApplications([next]);
        if (next) {
          setEditingKey(next.key);
          form.setFieldsValue(getApplicationFormValues(next));
        }
        messageApi.success("Your hostel application has been saved.");
        return;
      } catch (error) {
        messageApi.error(
          formatDisplayValue(
            error?.message,
            "Unable to save hostel application.",
          ),
        );
        return;
      }
    }

    const timestamp = Date.now();
    const application = {
      key: String(timestamp),
      applicationNo: `HST-${String(timestamp).slice(-6)}`,
      ...applicantDetails,
      fullName: values.fullName.trim(),
      studentId: values.studentId.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      gender: values.gender,
      program: values.program.trim(),
      semester: values.semester,
      guardianName: values.guardianName.trim(),
      guardianPhone: values.guardianPhone.trim(),
      emergencyName: values.emergencyName.trim(),
      emergencyPhone: values.emergencyPhone.trim(),
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };

    setApplications((current) => [application, ...current]);

    setEditingKey(application.key);
    form.setFieldsValue(getApplicationFormValues(application));
    messageApi.success("Your hostel application has been saved.");
  };

  const removeApplication = async (key) => {
    if (isApiConfigured) {
      try {
        await request(`/hostel/${key}`, { method: "DELETE" });
        setRemoteApplications((current) =>
          current.filter((item) => item.key !== key),
        );
        setEditingKey(null);
        messageApi.success("Hostel application removed.");
      } catch (error) {
        messageApi.error(
          formatDisplayValue(
            error?.message,
            "Unable to remove hostel application.",
          ),
        );
      }
      return;
    }

    setApplications((current) => current.filter((item) => item.key !== key));
    messageApi.success("Hostel application removed.");
  };

  const handleEditApplication = (record) => {
    form.setFieldsValue(getApplicationFormValues(record));
    setEditingKey(record.key);
    document
      .getElementById("hostel-application-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    messageApi.info(
      "Edit your information and click 'Update application' to save changes.",
    );
  };

  const statusBadge = (status) => {
    const badgeStatus =
      {
        Approved: "success",
        Rejected: "error",
        Pending: "processing",
        Submitted: "processing",
      }[status] || "default";
    return (
      <Badge
        status={badgeStatus}
        text={formatDisplayValue(status, "Pending")}
      />
    );
  };

  const columns = [
    {
      title: (
        <Space>
          <TeamOutlined /> Student
        </Space>
      ),
      key: "student",
      render: (_, record) => (
        <div className="hostel-student-cell">
          <strong>{formatDisplayValue(record.fullName)}</strong>
          <span>{formatDisplayValue(record.studentId)}</span>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <PhoneOutlined /> Contact
        </Space>
      ),
      key: "contact",
      render: (_, record) => (
        <div className="hostel-student-cell">
          <span>{formatDisplayValue(record.email)}</span>
          <span>{formatDisplayValue(record.phone)}</span>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <SafetyCertificateOutlined /> Status
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      render: statusBadge,
    },
    {
      title: (
        <Space>
          <EditOutlined /> Action
        </Space>
      ),
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit application">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditApplication(record)}
              aria-label="Edit application"
            />
          </Tooltip>
          <Popconfirm
            title="Remove this application?"
            description="This removes the saved record from this device."
            okText="Remove"
            okButtonProps={{ danger: true }}
            cancelText="Keep"
            onConfirm={() => removeApplication(record.key)}
          >
            <Tooltip title="Remove application">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label="Remove application"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const contactColumns = [
    {
      title: (
        <Space>
          <TeamOutlined /> Student
        </Space>
      ),
      key: "student",
      render: (_, record) => (
        <div className="hostel-student-cell">
          <strong>{formatDisplayValue(record.fullName)}</strong>
          <span>{formatDisplayValue(record.studentId)}</span>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <SafetyCertificateOutlined /> Parent / guardian
        </Space>
      ),
      key: "guardian",
      render: (_, record) => (
        <div className="hostel-student-cell">
          <strong>{formatDisplayValue(record.guardianName)}</strong>
          {record.guardianPhone ? (
            <a href={`tel:${formatDisplayValue(record.guardianPhone, "")}`}>
              {formatDisplayValue(record.guardianPhone)}
            </a>
          ) : (
            <span>Not provided</span>
          )}
        </div>
      ),
    },
    {
      title: (
        <Space>
          <PhoneOutlined /> Emergency contact
        </Space>
      ),
      key: "emergency",
      render: (_, record) => (
        <div className="hostel-student-cell">
          <strong>{formatDisplayValue(record.emergencyName)}</strong>
          {record.emergencyPhone ? (
            <a href={`tel:${formatDisplayValue(record.emergencyPhone, "")}`}>
              {formatDisplayValue(record.emergencyPhone)}
            </a>
          ) : (
            <span>Not provided</span>
          )}
        </div>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined /> Saved
        </Space>
      ),
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date) => formatDisplayValue(date),
    },
    {
      title: (
        <Space>
          <EditOutlined /> Action
        </Space>
      ),
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit contact record">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditApplication(record)}
              aria-label="Edit contact record"
            />
          </Tooltip>
          <Popconfirm
            title="Remove this contact record?"
            description="This removes the related saved application from this device."
            okText="Remove"
            okButtonProps={{ danger: true }}
            cancelText="Keep"
            onConfirm={() => removeApplication(record.key)}
          >
            <Tooltip title="Remove contact record">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label="Remove contact record"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const newestApplication = applications[0];
  const roomAllocation = newestApplication?.roomAllocation;

  return (
    <div className="hostel-page">
      {contextHolder}
      {isApiConfigured && remoteLoading ? (
        <Alert
          showIcon
          type="info"
          message="Loading your hostel application..."
        />
      ) : null}
      {remoteError ? (
        <Alert
          showIcon
          type="warning"
          message="Hostel status unavailable"
          description={remoteError}
        />
      ) : null}
      {hostelNotifications.length ? (
        <Card
          className="hostel-panel hostel-status-card"
          title={
            <Space>
              <SafetyCertificateOutlined /> Hostel notifications
            </Space>
          }
        >
          <Space
            direction="vertical"
            size={8}
            className="hostel-notification-list"
          >
            {hostelNotifications.map((notification) => (
              <div key={notification._id || notification.id}>
                <Text strong>
                  {formatDisplayValue(notification.title, "Hostel update")}
                </Text>
                <div>
                  <Text type="secondary">
                    {formatDisplayValue(notification.message)}
                  </Text>
                </div>
              </div>
            ))}
          </Space>
        </Card>
      ) : null}

      <section className="hostel-hero">
        <div className="hostel-hero-copy">
          <Tag icon={<HomeOutlined />} className="hostel-eyebrow">
            Hostel Portal
          </Tag>
          <Title level={1}>Find a room that feels like home.</Title>
          <Paragraph>
            Submit your student details and emergency contact in one place.
            Track review progress and room allocation from this panel.
          </Paragraph>
          <Space wrap className="hostel-hero-meta">
            <span>
              <CheckCircleOutlined /> Secure student details
            </span>
            <span>
              <PhoneOutlined /> Emergency contact ready
            </span>
          </Space>
        </div>

        <Card className="hostel-hero-card" bordered={false}>
          <div className="hostel-hero-card-icon">
            <SafetyCertificateOutlined />
          </div>
          <Text type="secondary">Application progress</Text>
          <Title level={3}>One complete form</Title>
          <Paragraph>
            Share your personal and guardian information to create your request.
          </Paragraph>
          <Tag
            color={
              newestApplication?.status === "Approved"
                ? "green"
                : newestApplication?.status === "Rejected"
                  ? "red"
                  : "blue"
            }
          >
            {newestApplication
              ? `Application status: ${formatDisplayValue(newestApplication.status, "Pending")}`
              : "Application status: Pending"}
          </Tag>
        </Card>
      </section>

      <Row gutter={[16, 16]} className="hostel-stat-grid">
        <Col xs={24} sm={12} xl={6}>
          <Card className="hostel-stat-card">
            <div>
              <Text type="secondary">
                <TeamOutlined /> Student Name
              </Text>
              <Title level={4}>
                {formatDisplayValue(newestApplication?.fullName)}
              </Title>
              <Text type="secondary">
                <PhoneOutlined /> {formatDisplayValue(newestApplication?.phone)}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="hostel-stat-card">
            <div>
              <Text type="secondary">
                <SafetyCertificateOutlined /> Guardian Name
              </Text>
              <Title level={4}>
                {formatDisplayValue(newestApplication?.guardianName)}
              </Title>
              <Text type="secondary">
                <PhoneOutlined />{" "}
                {formatDisplayValue(newestApplication?.guardianPhone)}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="hostel-stat-card">
            <div>
              <Text type="secondary">
                <PhoneOutlined /> Emergency Contact Name
              </Text>
              <Title level={4}>
                {formatDisplayValue(newestApplication?.emergencyName)}
              </Title>
              <Text type="secondary">
                <PhoneOutlined />{" "}
                {formatDisplayValue(newestApplication?.emergencyPhone)}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="hostel-stat-card">
            <div>
              <Text type="secondary">
                <DollarOutlined /> Fees Status
              </Text>
              <Title level={4}>
                {formatDisplayValue(newestApplication?.feesStatus, "Pending")}
              </Title>
              <Tag
                color={
                  newestApplication?.feesStatus === "Paid" ? "green" : "orange"
                }
              >
                {newestApplication?.feesStatus === "Paid"
                  ? "✓ Paid"
                  : "⚠ Reminder"}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} align="top">
        <Col xs={24} xl={24}>
          <Card
            className="hostel-panel hostel-form-card"
            title={
              <Space>
                <FileTextOutlined /> Hostel application
              </Space>
            }
            extra={<Tag color="blue">All fields marked * are required</Tag>}
          >
            <Alert
              className="hostel-form-alert"
              type="info"
              showIcon
              message="Complete your details carefully"
              description="The hostel office uses this information to review your request and contact you when needed."
            />

            <Form
              id="hostel-application-form"
              form={form}
              layout="vertical"
              requiredMark="optional"
              onFinish={submitApplication}
            >
              <div className="hostel-form-heading">
                <TeamOutlined /> Student information
              </div>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    label="Full name"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter your full name.",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. Ayesha Khan" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="studentId"
                    label="Student ID / roll number"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter your student ID.",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. CS-2024-102" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="University email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Enter a valid email address.",
                      },
                    ]}
                  >
                    <Input placeholder="student@university.edu" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Student phone number"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter your phone number.",
                      },
                      {
                        pattern: /^[+]?[0-9\s()-]{7,20}$/,
                        message: "Enter a valid phone number.",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. +92 300 1234567" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="program"
                    label="Program / department"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter your program or department.",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. BS Computer Science" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="semester"
                    label="Semester"
                    rules={[
                      { required: true, message: "Select your semester." },
                    ]}
                  >
                    <Select
                      placeholder="Select"
                      options={semesters.map((item) => ({
                        value: item,
                        label: item,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="gender"
                    label="Gender"
                    rules={[{ required: true, message: "Select your gender." }]}
                  >
                    <Select
                      placeholder="Select"
                      options={[
                        { value: "Female", label: "Female" },
                        { value: "Male", label: "Male" },
                        {
                          value: "Prefer not to say",
                          label: "Prefer not to say",
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <div className="hostel-form-heading">
                <DollarOutlined /> Hostel fees information
              </div>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="feesPerSemester"
                    label="Fees per semester (PKR)"
                    rules={[
                      { required: true, message: "Enter the fees amount." },
                    ]}
                  >
                    <Input type="number" placeholder="e.g. 50000" min="0" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="paymentDueDate"
                    label="Payment due date"
                    rules={[
                      {
                        required: true,
                        message: "Enter the payment due date.",
                      },
                    ]}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="feesPaidThisMonth"
                    label="Fees paid this month (PKR)"
                    rules={[
                      {
                        required: true,
                        message: "Enter the amount paid this month.",
                      },
                    ]}
                  >
                    <Input type="number" placeholder="e.g. 15000" min="0" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="feesStatus"
                    label="Payment status"
                    rules={[
                      { required: true, message: "Select the payment status." },
                    ]}
                  >
                    <Select
                      placeholder="Select"
                      options={[
                        { value: "Pending", label: "Pending" },
                        { value: "Paid", label: "Paid" },
                        { value: "Partially Paid", label: "Partially Paid" },
                        { value: "Overdue", label: "Overdue" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <div className="hostel-form-heading">
                <PhoneOutlined /> Guardian and emergency contact
              </div>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="guardianName"
                    label="Parent / guardian name"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter your guardian's name.",
                      },
                    ]}
                  >
                    <Input placeholder="Guardian full name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="guardianPhone"
                    label="Guardian phone number"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter the guardian's phone number.",
                      },
                      {
                        pattern: /^[+]?[0-9\s()-]{7,20}$/,
                        message: "Enter a valid phone number.",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. +92 300 1234567" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="emergencyName"
                    label="Emergency contact name"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter an emergency contact name.",
                      },
                    ]}
                  >
                    <Input placeholder="Name of person to contact" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="emergencyPhone"
                    label="Emergency contact phone"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter an emergency contact phone number.",
                      },
                      {
                        pattern: /^[+]?[0-9\s()-]{7,20}$/,
                        message: "Enter a valid phone number.",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. +92 300 1234567" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              "Please confirm that your details are correct.",
                            ),
                          ),
                  },
                ]}
              >
                <Checkbox>
                  I confirm that the information provided is correct and I agree
                  to follow hostel rules.
                </Checkbox>
              </Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SendOutlined />}
                >
                  {editingKey ? "Edit Application" : "Submit Application"}
                </Button>
                {editingKey && (
                  <Button
                    size="large"
                    onClick={() => {
                      setEditingKey(null);
                      form.resetFields();
                      messageApi.info("Editing canceled.");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <div className="hostel-side-stack">
            <Card
              className="hostel-panel"
              title={
                <Space>
                  <HomeOutlined /> Residence essentials
                </Space>
              }
            >
              <div className="hostel-feature-list">
                <div>
                  <span className="hostel-feature-icon">
                    <WifiOutlined />
                  </span>
                  <div>
                    <strong>Reliable Wi-Fi</strong>
                    <Text type="secondary">
                      Stay connected for classes and study.
                    </Text>
                  </div>
                </div>
                <div>
                  <span className="hostel-feature-icon">
                    <CoffeeOutlined />
                  </span>
                  <div>
                    <strong>Dining services</strong>
                    <Text type="secondary">
                      Ask the residence team about meal options.
                    </Text>
                  </div>
                </div>
                <div>
                  <span className="hostel-feature-icon">
                    <HeartOutlined />
                  </span>
                  <div>
                    <strong>Student wellbeing</strong>
                    <Text type="secondary">
                      Share needs that help staff support you.
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Col>
        <Col xs={24} xl={12}>
          <div className="hostel-side-stack">
            <Card
              className="hostel-panel"
              title={
                <Space>
                  <FileTextOutlined /> Fees status
                </Space>
              }
            >
              {newestApplication ? (
                <Descriptions
                  column={1}
                  size="large"
                  className="hostel-latest-details"
                >
                  <Descriptions.Item label="Application">
                    {formatDisplayValue(newestApplication.applicationNo)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Student Name">
                    {formatDisplayValue(newestApplication.fullName)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fees Amount">
                    PKR{" "}
                    {formatDisplayValue(newestApplication.feesPerSemester, "0")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fees paid this month">
                    PKR{" "}
                    {formatDisplayValue(
                      newestApplication.feesPaidThisMonth,
                      "0",
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fees Status">
                    <Tag
                      color={
                        newestApplication.feesStatus === "Paid"
                          ? "green"
                          : newestApplication.feesStatus === "Pending"
                            ? "orange"
                            : "red"
                      }
                      style={{ width: "auto" }}
                    >
                      {formatDisplayValue(newestApplication.feesStatus, "N/A")}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Due Date">
                    {formatDisplayValue(
                      newestApplication.paymentDueDate,
                      "N/A",
                    )}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Fees information will appear here after submission."
                />
              )}
            </Card>
          </div>
        </Col>
      </Row>

      <Card
        className="hostel-panel hostel-records-card"
        title={
          <Space>
            <FileTextOutlined /> Saved hostel applications
          </Space>
        }
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search applications"
              style={{ width: 210 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="hostel-status-filter"
              options={[
                { value: "All", label: "All statuses" },
                { value: "Submitted", label: "Submitted" },
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredApplications}
          locale={{
            emptyText:
              "No hostel applications saved yet. Complete the form above to add one.",
          }}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 820 }}
        />
      </Card>

      {newestApplication?.status === "Approved" &&
      roomAllocation &&
      (roomAllocation.roomNumber ||
        roomAllocation.block ||
        roomAllocation.floor) ? (
        <Card
          className="hostel-panel hostel-records-card hostel-room-card"
          title={
            <Space>
              <HomeOutlined /> Room allocation
            </Space>
          }
          extra={<Tag color="green">Allocated</Tag>}
        >
          <Table
            rowKey="applicationNo"
            pagination={false}
            dataSource={[newestApplication]}
            columns={[
              {
                title: "Application",
                key: "applicationNo",
                render: (_, record) =>
                  formatDisplayValue(record.applicationNo, "—"),
              },
              {
                title: "Room",
                key: "roomNumber",
                render: (_, record) =>
                  formatDisplayValue(record.roomAllocation?.roomNumber, "—"),
              },
              {
                title: "Block",
                key: "block",
                render: (_, record) =>
                  formatDisplayValue(record.roomAllocation?.block, "—"),
              },
              {
                title: "Floor",
                key: "floor",
                render: (_, record) =>
                  formatDisplayValue(record.roomAllocation?.floor, "—"),
              },
              {
                title: "Allocated on",
                key: "allocatedAt",
                render: (_, record) =>
                  formatDisplayValue(record.roomAllocation?.allocatedAt, "—"),
              },
            ]}
            scroll={{ x: 700 }}
          />
        </Card>
      ) : null}

      <Card
        className="hostel-panel hostel-records-card hostel-status-card"
        title={
          <Space>
            <SafetyCertificateOutlined /> Application Status
          </Space>
        }
        extra={newestApplication ? statusBadge(newestApplication.status) : null}
      >
        <Table
          rowKey="key"
          pagination={false}
          dataSource={newestApplication ? [newestApplication] : []}
          columns={[
            {
              title: "Application",
              key: "applicationNo",
              render: (_, record) =>
                formatDisplayValue(record.applicationNo, "—"),
            },
            {
              title: "Status",
              key: "status",
              render: (_, record) => statusBadge(record.status),
            },
            {
              title: "Submitted",
              key: "submittedAt",
              render: (_, record) =>
                formatDisplayValue(record.submittedAt, "—"),
            },
            {
              title: "Message",
              key: "statusMessage",
              render: (_, record) =>
                record.status === "Approved"
                  ? "Approved. Room allocation details are shown above."
                  : record.status === "Rejected"
                    ? "Not approved. Please contact the hostel office."
                    : "Your application is awaiting hostel office approval.",
            },
          ]}
          locale={{
            emptyText: "Submit an application to see its approval status.",
          }}
          scroll={{ x: 760 }}
        />
      </Card>

      <Card
        className="hostel-panel hostel-records-card hostel-contact-card"
        title={
          <Space>
            <PhoneOutlined /> Guardian & emergency contacts
          </Space>
        }
        extra={
          <Tag color="green">
            {filteredApplications.length} saved record
            {filteredApplications.length === 1 ? "" : "s"}
          </Tag>
        }
      >
        <Alert
          className="hostel-contact-alert"
          type="info"
          showIcon
          message="Contact records are stored with each hostel application."
        />
        <Table
          columns={contactColumns}
          dataSource={filteredApplications}
          locale={{
            emptyText:
              "Guardian and emergency contacts will appear here after you save an application.",
          }}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Card
        className="hostel-panel hostel-records-card hostel-fees-card"
        title={
          <Space>
            <FileTextOutlined /> Hostel fees structure
          </Space>
        }
        extra={
          <Tag color="blue">
            {feesData.length} fees record{feesData.length === 1 ? "" : "s"}
          </Tag>
        }
      >
        <Alert
          className="hostel-fees-alert"
          type="info"
          showIcon
          message="Hostel fees information is stored with each application."
          description="Track payment status and dues for all submitted applications."
        />
        <Table
          columns={[
            {
              title: "Student",
              key: "student",
              render: (_, record) => (
                <div className="hostel-student-cell">
                  <strong>{formatDisplayValue(record.studentName)}</strong>
                  <span>{formatDisplayValue(record.studentId)}</span>
                </div>
              ),
            },
            {
              title: "Application",
              key: "applicationNo",
              render: (_, record) =>
                formatDisplayValue(record.applicationNo, "—"),
            },
            {
              title: "Fees Amount (PKR)",
              dataIndex: "feesAmount",
              key: "feesAmount",
              render: (amount) => `PKR ${formatDisplayValue(amount, "0")}`,
            },
            {
              title: "Paid this month (PKR)",
              dataIndex: "feesPaidThisMonth",
              key: "feesPaidThisMonth",
              render: (amount) => `PKR ${formatDisplayValue(amount, "0")}`,
            },
            {
              title: "Payment Status",
              dataIndex: "feesStatus",
              key: "feesStatus",
              render: (status) => (
                <Tag
                  color={
                    status === "Paid"
                      ? "green"
                      : status === "Pending"
                        ? "orange"
                        : status === "Partially Paid"
                          ? "cyan"
                          : "red"
                  }
                >
                  {formatDisplayValue(status, "N/A")}
                </Tag>
              ),
            },
            {
              title: "Due Date",
              dataIndex: "paymentDueDate",
              key: "paymentDueDate",
              render: (date) => formatDisplayValue(date, "—"),
            },
            {
              title: "Record Date",
              dataIndex: "recordDate",
              key: "recordDate",
              render: (date) => formatDisplayValue(date, "—"),
            },
          ]}
          dataSource={feesData}
          locale={{
            emptyText:
              "Hostel fees records will appear here after you save an application with fees information.",
          }}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}

export default Hostel;
