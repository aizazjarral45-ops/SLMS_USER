import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
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

function getTrimmedValue(value) {
  return typeof value === "string" ? value.trim() : "";
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
    (typeof application?.studentId === "string" ? application.studentId : "");
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

function Hostel({
  applications: applicationsProp,
  onApplicationsChange,
  loading = false,
}) {
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
  const [editingKey, setEditingKey] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");
  const [feeForm] = Form.useForm();
  const [fees, setFees] = useState([]);
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [feesLoading, setFeesLoading] = useState(false);
  const [selfManagement, setSelfManagement] = useState(null);
  const [selfManagementLoading, setSelfManagementLoading] = useState(false);
  const [feeSubmitting, setFeeSubmitting] = useState(false);
  const [deletingFeeId, setDeletingFeeId] = useState(null);
  const [applicationSubmitting, setApplicationSubmitting] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [feesModalOpen, setFeesModalOpen] = useState(false);
  const [roomForm] = Form.useForm();
  const [roommateForm] = Form.useForm();
  const [roomDetails, setRoomDetails] = useState(null);
  const [roomDetailsLoading, setRoomDetailsLoading] = useState(false);
  const [roomDetailsSaving, setRoomDetailsSaving] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roommateModalOpen, setRoommateModalOpen] = useState(false);
  const [roommateSaving, setRoommateSaving] = useState(false);
  const [editingRoommateId, setEditingRoommateId] = useState(null);
  const [savedRoommates, setSavedRoommates] = useState([]);
  const [roommatesLoaded, setRoommatesLoaded] = useState(false);
  const loadApplicationRef = useRef(null);
  const loadFeesRef = useRef(null);

  const loadStudentRoomData = useCallback(async (showLoading = false) => {
    if (!isApiConfigured) return;
    if (showLoading) setRoomDetailsLoading(true);
    try {
      const [roomResult, roommateResult] = await Promise.all([
        request("/hostel/room-details"),
        request("/hostel/roommates"),
      ]);
      const room = roomResult?.roomDetails || roomResult?.room || roomResult;
      setRoomDetails(
        room &&
          Object.values(room).some(
            (value) => value !== null && value !== undefined && value !== "",
          )
          ? room
          : null,
      );
      setSavedRoommates(
        Array.isArray(roommateResult?.roommates)
          ? roommateResult.roommates
          : Array.isArray(roommateResult)
            ? roommateResult
            : [],
      );
      setRoommatesLoaded(true);
    } catch (error) {
      if (error?.status !== 404) {
        setRemoteError(
          formatDisplayValue(error?.message, "Unable to load room details."),
        );
      }
    } finally {
      if (showLoading) setRoomDetailsLoading(false);
    }
  }, []);

  const normalizeRemoteApplication = (application) => {
    if (!application) return null;
    const studentInformation =
      application.studentInformation &&
      typeof application.studentInformation === "object"
        ? application.studentInformation
        : {};
    const guardianInformation =
      application.guardianInformation &&
      typeof application.guardianInformation === "object"
        ? application.guardianInformation
        : {};
    const details =
      application.applicantDetails &&
      typeof application.applicantDetails === "object"
        ? {
            ...application.applicantDetails,
            ...studentInformation,
            ...guardianInformation,
          }
        : { ...studentInformation, ...guardianInformation };
    return {
      ...details,
      ...application,
      key: String(
        application._id ||
          application.id ||
          application.key ||
          application.applicationNo ||
          application.studentId ||
          "application",
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
        setEditingKey(next?.key || null);
        form.setFieldsValue(next ? getApplicationFormValues(next) : {});
        setRemoteError("");
        return next;
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
    const loadFees = async () => {
      setFeesLoading(true);
      try {
        const result = await request("/fees");
        if (!cancelled) setFees(Array.isArray(result?.fees) ? result.fees : []);
      } catch (error) {
        if (!cancelled) {
          setRemoteError(
            formatDisplayValue(error?.message, "Unable to load fee records."),
          );
        }
      } finally {
        if (!cancelled) setFeesLoading(false);
      }
    };
    const loadSelfManagement = async () => {
      setSelfManagementLoading(true);
      try {
        const result = await request("/hostel/self-management");
        if (!cancelled) setSelfManagement(result || null);
      } catch (error) {
        if (!cancelled && error?.status !== 404) {
          setRemoteError(
            formatDisplayValue(
              error?.message,
              "Unable to load hostel self-management details.",
            ),
          );
        }
      } finally {
        if (!cancelled) setSelfManagementLoading(false);
      }
    };
    loadApplicationRef.current = loadMyApplication;
    loadFeesRef.current = loadFees;
    const handleRealtimeChange = (event) => {
      const resource = event.detail?.resource;
      if (resource === "hostel") loadMyApplication(false);
      if (resource === "hostel") loadSelfManagement();
      if (resource === "fees") loadFees();
    };
    window.addEventListener("slms:data-changed", handleRealtimeChange);
    loadMyApplication();
    loadFees();
    loadSelfManagement();
    loadStudentRoomData(true);
    return () => {
      cancelled = true;
      window.removeEventListener("slms:data-changed", handleRealtimeChange);
    };
  }, [form, loadStudentRoomData, setApplications]);

  const saveRoomDetails = async (values) => {
    setRoomDetailsSaving(true);
    const savedValues = {
      ...values,
      checkInDate: formatDateInput(values.checkInDate),
      expectedCheckoutDate: formatDateInput(values.expectedCheckoutDate),
    };
    try {
      if (isApiConfigured) {
        await request("/hostel/room-details", {
          method: roomDetails ? "PUT" : "POST",
          body: savedValues,
        });
        await loadStudentRoomData();
      } else {
        setRoomDetails(savedValues);
      }
      setRoomModalOpen(false);
      messageApi.success(
        roomDetails ? "Room details updated." : "Room details saved.",
      );
    } catch (error) {
      messageApi.error(
        formatDisplayValue(error?.message, "Unable to save room details."),
      );
    } finally {
      setRoomDetailsSaving(false);
    }
  };

  const saveRoommate = async (values) => {
    setRoommateSaving(true);
    try {
      if (isApiConfigured) {
        const endpoint = editingRoommateId
          ? `/hostel/roommates/${editingRoommateId}`
          : "/hostel/roommates";
        await request(endpoint, {
          method: editingRoommateId ? "PUT" : "POST",
          body: values,
        });
        await loadStudentRoomData();
      } else {
        const roommateId =
          editingRoommateId || values.id || `roommate-${Date.now()}`;
        setSavedRoommates((current) => {
          if (!editingRoommateId)
            return [...current, { ...values, id: roommateId }];
          return current.map((roommate) =>
            String(roommate.id || roommate._id || roommate.key) ===
            String(editingRoommateId)
              ? { ...roommate, ...values, id: roommate.id || roommateId }
              : roommate,
          );
        });
        setRoommatesLoaded(true);
      }
      setEditingRoommateId(null);
      roommateForm.resetFields();
      setRoommateModalOpen(false);
      messageApi.success(
        editingRoommateId
          ? "Roommate details updated."
          : "Roommate details saved.",
      );
    } catch (error) {
      messageApi.error(
        formatDisplayValue(error?.message, "Unable to save roommate details."),
      );
    } finally {
      setRoommateSaving(false);
    }
  };

  const deleteRoommate = async (roommate) => {
    const roommateId = roommate.id || roommate._id || roommate.key;
    try {
      if (isApiConfigured) {
        await request(`/hostel/roommates/${roommateId}`, { method: "DELETE" });
        await loadStudentRoomData();
      } else {
        setSavedRoommates((current) =>
          (current.length ? current : roommates).filter(
            (item) =>
              String(item.id || item._id || item.key) !== String(roommateId),
          ),
        );
        setRoommatesLoaded(true);
      }
      messageApi.success("Roommate removed.");
    } catch (error) {
      messageApi.error(
        formatDisplayValue(error?.message, "Unable to remove roommate."),
      );
    }
  };

  const feesData = useMemo(
    () =>
      fees.map((fee) => {
        const application = applications.find(
          (item) =>
            String(item._id || item.key) === String(fee.hostelApplicationId),
        );
        return {
          ...fee,
          key: fee._id,
          studentName: application?.fullName || "",
          studentId: application?.studentId || "",
          applicationNo: application?.applicationNo || "",
          feesAmount: fee.amount,
          feesPaidThisMonth: fee.paidAmount,
          feesStatus: fee.status,
          paymentDueDate: fee.dueDate,
          recordDate: fee.createdAt,
        };
      }),
    [applications, fees],
  );

  const newestApplication = applications[0];

  const submitFee = async (values) => {
    const applicationId = newestApplication?._id || newestApplication?.key;
    if (!applicationId) {
      messageApi.error("Save your hostel application before adding fees.");
      return;
    }
    setFeeSubmitting(true);
    try {
      const result = await request(
        editingFeeId ? `/fees/${editingFeeId}` : "/fees",
        {
          method: editingFeeId ? "PUT" : "POST",
          body: { ...values, hostelApplicationId: applicationId },
        },
      );
      const fee = result?.fee || result;
      if (!fee?._id) throw new Error("The fee API returned an invalid record.");
      await loadFeesRef.current?.();
      feeForm.resetFields();
      setEditingFeeId(null);
      setFeesModalOpen(false);
      messageApi.success(
        editingFeeId ? "Fee updated successfully." : "Fee added successfully.",
      );
    } catch (error) {
      messageApi.error(
        formatDisplayValue(error?.message, "Fee operation failed."),
      );
    } finally {
      setFeeSubmitting(false);
    }
  };

  const removeFee = async (feeId) => {
    setDeletingFeeId(feeId);
    try {
      await request(`/fees/${feeId}`, { method: "DELETE" });
      await loadFeesRef.current?.();
      if (String(editingFeeId) === String(feeId)) {
        feeForm.resetFields();
        setEditingFeeId(null);
      }
      messageApi.success("Fee deleted successfully.");
    } catch (error) {
      messageApi.error(
        formatDisplayValue(error?.message, "Unable to delete fee."),
      );
    } finally {
      setDeletingFeeId(null);
    }
  };

  const submitApplication = async (values) => {
    // Send the complete form object without trimming, coercing, or dropping fields.
    const applicantDetails = { ...values };
    setApplicationSubmitting(true);

    try {
      if (editingKey) {
        const existingApplication =
          applications.find(
            (item) => String(item.key) === String(editingKey),
          ) || {};
        if (isApiConfigured) {
          try {
            const applicationId = existingApplication._id || editingKey;
            await request(`/hostel/update/${applicationId}`, {
              method: "PUT",
              body: { applicantDetails },
            });
            await loadApplicationRef.current?.();
            setApplicationModalOpen(false);
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
        setApplicationModalOpen(false);
        messageApi.success("Hostel application updated.");
        return;
      }

      if (isApiConfigured) {
        try {
          await request("/hostel/apply", {
            method: "POST",
            body: { applicantDetails },
          });
          const next = await loadApplicationRef.current?.();
          if (next) {
            setEditingKey(next.key);
            form.setFieldsValue(getApplicationFormValues(next));
          }
          setApplicationModalOpen(false);
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
        fullName: getTrimmedValue(values.fullName),
        studentId: getTrimmedValue(values.studentId),
        email: getTrimmedValue(values.email),
        phone: getTrimmedValue(values.phone),
        gender: values.gender,
        program: getTrimmedValue(values.program),
        semester: values.semester,
        guardianName: getTrimmedValue(values.guardianName),
        guardianPhone: getTrimmedValue(values.guardianPhone),
        emergencyName: getTrimmedValue(values.emergencyName),
        emergencyPhone: getTrimmedValue(values.emergencyPhone),
        status: "Pending",
        submittedAt: new Date().toISOString(),
      };

      setApplications((current) => [application, ...current]);

      setEditingKey(application.key);
      form.setFieldsValue(getApplicationFormValues(application));
      setApplicationModalOpen(false);
      messageApi.success("Your hostel application has been saved.");
    } finally {
      setApplicationSubmitting(false);
    }
  };

  const handleEditApplication = (record) => {
    form.setFieldsValue(getApplicationFormValues(record));
    setEditingKey(record.key);
    setApplicationModalOpen(true);
    document
      .getElementById("hostel-application-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    messageApi.info(
      "Edit your information and click 'Update application' to save changes.",
    );
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (value) => formatDisplayValue(value),
    },
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
      render: (value) => formatDisplayValue(value),
    },
    {
      title: "Department",
      dataIndex: "program",
      key: "program",
      render: (value) => formatDisplayValue(value),
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      render: (value) => formatDisplayValue(value),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (value) => formatDisplayValue(value),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      render: (value) => formatDisplayValue(value),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value) => formatDisplayValue(value),
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
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditApplication(record)}
              aria-label="Edit application"
            />
          </Tooltip>
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
        </Space>
      ),
    },
  ];

  const latestFee = fees[0];
  const roomAllocation = newestApplication?.roomAllocation;
  const selfRoom =
    roomDetails ||
    selfManagement?.application?.roomAllocation ||
    roomAllocation ||
    {};
  const hostelInformation =
    selfManagement?.hostelInformation ||
    selfManagement?.hostel ||
    selfManagement?.information ||
    {};
  const displayedRoom = {
    ...selfRoom,
    block: selfRoom.block || hostelInformation.block,
  };
  const roommates = roommatesLoaded
    ? savedRoommates
    : selfManagement?.roommates || [];
  const hostelRules = selfManagement?.rules?.length
    ? selfManagement.rules
    : [
        {
          title: "Keep shared areas clean",
          description: "Leave kitchens, corridors, and bathrooms tidy.",
        },
        {
          title: "Respect quiet hours",
          description: "Keep noise low during study and sleeping hours.",
        },
        {
          title: "Follow safety rules",
          description: "Do not use prohibited appliances or block exits.",
        },
        {
          title: "Respect your roommates",
          description:
            "Share facilities responsibly and report concerns to the warden.",
        },
      ];
  return (
    <div
      className="hostel-page"
      style={{
        width: "100%",
        maxWidth: 1440,
        margin: "0 auto",
        padding: "clamp(12px, 2vw, 28px)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {contextHolder}
      {remoteError ? (
        <Alert
          showIcon
          type="warning"
          message="Hostel status unavailable"
          description={remoteError}
        />
      ) : null}
      <section className="hostel-hero" style={{ marginBottom: 20 }}>
        <div className="hostel-hero-copy">
          <Tag icon={<HomeOutlined />} className="hostel-eyebrow">
            Hostel Portal
          </Tag>
          <Title level={1}>Manage your hostel stay in one place.</Title>
          <Paragraph>
            View your room and roommates, update your saved application and
            guardian information, track fee records and status, and review
            residence essentials and hostel rules.
          </Paragraph>
          <Space wrap className="hostel-hero-meta">
            <span>
              <HomeOutlined /> My room &amp; Roommates
            </span>
            <span>
              <TeamOutlined /> guardian information
            </span>
          </Space>
        </div>

        <Card className="hostel-hero-card" bordered={false}>
          <div className="hostel-hero-card-icon">
            <SafetyCertificateOutlined />
          </div>
          <Text type="secondary">Hostel overview</Text>
          <Title level={3}>Application and fees</Title>
          <Paragraph>
            Keep your application, contact details, fee records, room
            information, and hostel guidance up to date.
          </Paragraph>

          <Tag color={latestFee?.status === "Paid" ? "green" : "orange"}>
            Fee status: {formatDisplayValue(latestFee?.status, "Pending")}
          </Tag>
        </Card>
      </section>

      <Row
        gutter={[16, 16]}
        className="hostel-stat-grid"
        style={{ marginBottom: 20 }}
      >
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
                {formatDisplayValue(latestFee?.status, "Pending")}
              </Title>
              <Tag color={latestFee?.status === "Paid" ? "green" : "orange"}>
                {latestFee?.status === "Paid" ? "✓ Paid" : "⚠ Reminder"}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

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
            loading={loading || remoteLoading}
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

      <Row gutter={[16, 16]} align="stretch" style={{ marginBottom: 20 }}>
        <Col xs={24} xl={12}>
          <Card
            className="hostel-panel hostel-records-card"
            style={{ height: "100%" }}
            title={
              <Space>
                <HomeOutlined /> My room
              </Space>
            }
            extra={
              <Button
                type="primary"
                onClick={() => {
                  roomForm.setFieldsValue({
                    ...displayedRoom,
                    checkInDate: formatDateInput(displayedRoom.checkInDate),
                    expectedCheckoutDate: formatDateInput(
                      displayedRoom.expectedCheckoutDate,
                    ),
                  });
                  setRoomModalOpen(true);
                }}
              >
                {roomDetails ? "Edit Details" : "Add Details"}
              </Button>
            }
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Room number">
                {formatDisplayValue(displayedRoom.roomNumber)}
              </Descriptions.Item>
              <Descriptions.Item label="Block / building">
                {formatDisplayValue(displayedRoom.block)}
              </Descriptions.Item>
              <Descriptions.Item label="Floor">
                {formatDisplayValue(displayedRoom.floor)}
              </Descriptions.Item>
              <Descriptions.Item label="Room type">
                {formatDisplayValue(displayedRoom.roomType)}
              </Descriptions.Item>
              <Descriptions.Item label="Bed number">
                {formatDisplayValue(displayedRoom.bedNumber)}
              </Descriptions.Item>
              <Descriptions.Item label="Check-in date">
                {formatDisplayValue(displayedRoom.checkInDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Expected checkout date">
                {formatDisplayValue(displayedRoom.expectedCheckoutDate)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            className="hostel-panel hostel-records-card"
            style={{ height: "100%" }}
            title={
              <Space>
                <TeamOutlined /> Roommates
              </Space>
            }
            extra={
              <Space wrap>
                <Tag color="blue">{roommates.length} Assigned</Tag>
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingRoommateId(null);
                    roommateForm.resetFields();
                    setRoommateModalOpen(true);
                  }}
                >
                  Add Roommate
                </Button>
              </Space>
            }
          >
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 2, hideOnSinglePage: true }}
              dataSource={roommates}
              loading={selfManagementLoading || remoteLoading}
              columns={[
                {
                  title: "Name",
                  dataIndex: "name",
                  key: "name",
                  render: (value) => formatDisplayValue(value),
                },
                {
                  title: "Department",
                  key: "department",
                  render: (_, row) =>
                    formatDisplayValue(
                      row.department || row.program || row.semester,
                    ),
                },
                {
                  title: "Email",
                  dataIndex: "email",
                  key: "email",
                  render: (value) => formatDisplayValue(value),
                },
                {
                  title: "Phone Number",
                  dataIndex: "phone",
                  key: "phone",
                  render: (value) => formatDisplayValue(value),
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, row) => (
                    <Space size="small">
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                          const roommateId = row.id || row._id || row.key;
                          setSavedRoommates(roommates);
                          setRoommatesLoaded(true);
                          setEditingRoommateId(roommateId);
                          roommateForm.setFieldsValue(row);
                          setRoommateModalOpen(true);
                        }}
                        aria-label="Edit roommate"
                      >
                        Edit
                      </Button>
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => deleteRoommate(row)}
                        aria-label="Delete roommate"
                      >
                        Delete
                      </Button>
                    </Space>
                  ),
                },
              ]}
              locale={{
                emptyText: "No roommates are assigned to your current room.",
              }}
              scroll={{ x: 560 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="hostel-panel hostel-records-card"
        style={{ marginBottom: 20 }}
        title={
          <Space>
            <FileTextOutlined /> Saved hostel applications & guardian
            information
          </Space>
        }
        extra={
          <Button
            type="primary"
            block
            onClick={() => {
              if (newestApplication) {
                form.setFieldsValue(
                  getApplicationFormValues(newestApplication),
                );
                setEditingKey(newestApplication.key);
              } else {
                form.resetFields();
                setEditingKey(null);
              }
              setApplicationModalOpen(true);
            }}
          >
            Add Application
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={applications}
          loading={loading || remoteLoading}
          locale={{
            emptyText:
              "No hostel applications saved yet. Complete the form above to add one.",
          }}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 820 }}
        />
        <Divider />
        <Alert
          className="hostel-contact-alert"
          type="info"
          showIcon
          message="Contact records are stored with each hostel application."
        />
        <Table
          columns={contactColumns}
          dataSource={applications}
          loading={loading || remoteLoading}
          locale={{
            emptyText:
              "Guardian and emergency contacts will appear here after you save an application.",
          }}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Card
        className="hostel-panel hostel-records-card hostel-fees-table-card"
        title={
          <Space>
            <FileTextOutlined /> Fee records
          </Space>
        }
        extra={
          <Space wrap>
            <Tag color="blue">
              {feesData.length} fees record{feesData.length === 1 ? "" : "s"}
            </Tag>
            <Button
              type="primary"
              onClick={() => {
                setEditingFeeId(null);
                feeForm.resetFields();
                setFeesModalOpen(true);
              }}
            >
              Add Fees
            </Button>
          </Space>
        }
      >
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
            {
              title: "Actions",
              key: "actions",
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      feeForm.setFieldsValue({
                        feeType: record.feeType,
                        amount: record.amount,
                        paidAmount: record.paidAmount,
                        dueDate: formatDateInput(record.dueDate),
                        status: record.status,
                        paymentMethod: record.paymentMethod,
                        invoiceNumber: record.invoiceNumber,
                      });
                      setEditingFeeId(record._id);
                      setFeesModalOpen(true);
                    }}
                    aria-label="Edit fee"
                    disabled={feeSubmitting || Boolean(deletingFeeId)}
                  />
                  <Popconfirm
                    title="Delete this fee record?"
                    onConfirm={() => removeFee(record._id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label="Delete fee"
                      loading={String(deletingFeeId) === String(record._id)}
                      disabled={feeSubmitting || Boolean(deletingFeeId)}
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={feesData}
          loading={feesLoading}
          locale={{
            emptyText: "Add a fee record after saving your hostel application.",
          }}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 1000 }}
        />
      </Card>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} xl={24}>
          <Card
            className="hostel-panel hostel-records-card"
            title={
              <Space>
                <FileTextOutlined /> Hostel rules
              </Space>
            }
          >
            {hostelRules.length ? (
              <div className="hostel-feature-list">
                {hostelRules.map((rule, index) => (
                  <div key={rule.id || rule.title || index}>
                    <span className="hostel-feature-icon">
                      <SafetyCertificateOutlined />
                    </span>
                    <div>
                      <strong>
                        {formatDisplayValue(rule.title || rule.name)}
                      </strong>
                      <Text type="secondary">
                        {formatDisplayValue(rule.description || rule.message)}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Hostel rules are not available yet."
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        open={applicationModalOpen}
        onCancel={() => setApplicationModalOpen(false)}
        footer={null}
        width="min(900px, calc(100vw - 32px))"
        title="Hostel application"
      >
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
                  label="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Enter a valid email address.",
                    },
                  ]}
                >
                  <Input placeholder="student@gmail.com" />
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
                  rules={[{ required: true, message: "Select your semester." }]}
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
              type="secondary"
                htmlType="submit"
                size="large"
                icon={<SendOutlined />}
                loading={applicationSubmitting}
                disabled={applicationSubmitting}
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
      </Modal>

      <Modal
        open={roomModalOpen}
        title="Room details"
        footer={null}
        onCancel={() => setRoomModalOpen(false)}
      >
        <Form form={roomForm} layout="vertical" onFinish={saveRoomDetails}>
          <Form.Item name="roomNumber" label="Room Number">
            <Input />
          </Form.Item>
          <Form.Item name="block" label="Block">
            <Input />
          </Form.Item>
          <Form.Item name="floor" label="Floor">
            <Input />
          </Form.Item>
          <Form.Item name="roomType" label="Room Type">
            <Input />
          </Form.Item>
          <Form.Item name="bedNumber" label="Bed Number">
            <Input />
          </Form.Item>
          <Form.Item name="checkInDate" label="Check-in Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="expectedCheckoutDate" label="Expected checkout date">
            <Input type="date" />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={roomDetailsSaving}
            >
              Save
            </Button>
            <Button onClick={() => setRoomModalOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        open={roommateModalOpen}
        title={editingRoommateId ? "Edit Roommate" : "Head Roommate"}
        footer={null}
        onCancel={() => setRoommateModalOpen(false)}
      >
        <Form form={roommateForm} layout="vertical" onFinish={saveRoommate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={roommateSaving}>
              Save
            </Button>
            <Button onClick={() => setRoommateModalOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        open={feesModalOpen}
        onCancel={() => setFeesModalOpen(false)}
        footer={null}
        width="min(900px, calc(100vw - 32px))"
        title="Hostel fees structure"
      >
        <Alert
          className="hostel-fees-alert"
          type="info"
          showIcon
          message="Manage multiple fee records for your saved hostel application."
          description="Each fee record is stored separately and can be edited or deleted without changing the application."
        />
        <Form
          form={feeForm}
          layout="vertical"
          onFinish={submitFee}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="feeType" label="Fee type" initialValue="Tuition">
                <Input placeholder="e.g. Hostel fee" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="amount"
                label="Amount (PKR)"
                rules={[{ required: true, message: "Enter the fee amount." }]}
              >
                <Input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="paidAmount"
                label="Paid amount (PKR)"
                initialValue={0}
              >
                <Input type="number" min="0" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="dueDate" label="Due date">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Payment status"
                initialValue="Pending"
              >
                <Select
                  options={[
                    { value: "Pending", label: "Pending" },
                    { value: "Partial", label: "Partial" },
                    { value: "Paid", label: "Paid" },
                    { value: "Overdue", label: "Overdue" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="paymentMethod"
                label="Payment method"
                initialValue="Cash"
              >
                <Select
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Bank transfer", label: "Bank transfer" },
                    { value: "Card", label: "Card" },
                    { value: "Online", label: "Online" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="invoiceNumber" label="Invoice number">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<DollarOutlined />}
              loading={feeSubmitting}
              disabled={!newestApplication || feeSubmitting}
            >
              {editingFeeId ? "Update Fee" : "Add Fee"}
            </Button>
            <Button
              onClick={() => {
                feeForm.resetFields();
                setEditingFeeId(null);
                setFeesModalOpen(false);
              }}
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

export default Hostel;
