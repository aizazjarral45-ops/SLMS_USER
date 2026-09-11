import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FormOutlined,
  PaperClipOutlined,
  SendOutlined,
  SolutionOutlined,
  TagOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "./Complaints.css";
import { guidanceItems } from "./guidelines";
import { isApiConfigured, request } from "../../../api/client";

const { Title, Paragraph, Text } = Typography;
const categories = [
  "Academic",
  "Hostel",
  "IT",
  "Library",
  "Transport",
  "Administration",
  "Medical",
  "Other",
];
const EMPTY_COMPLAINTS = [];

function Complaints({ complaints: complaintsProp, onComplaintsChange, loading = false }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const complaints = Array.isArray(complaintsProp)
    ? complaintsProp
    : EMPTY_COMPLAINTS;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const refreshComplaints = async () => {
    if (!isApiConfigured) return;
    setTableLoading(true);
    try {
      const result = await request("/complaints");
      onComplaintsChange?.(result.complaints || []);
    } finally {
      setTableLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "All" || item.status === filter || item.category === filter;
      return matchesQuery && matchesFilter;
    });
  }, [complaints, filter, query]);

  const submitComplaint = async (values) => {
    setSubmitting(true);
    try {
    if (!isApiConfigured) {
      messageApi.error("Complaint service is unavailable.");
      return;
    }
    try {
      await request("/complaints", {
        method: "POST",
        body: values,
      });
      await refreshComplaints();
      form.resetFields();
      messageApi.success("Complaint submitted successfully.");
    } catch (error) {
      messageApi.error(error.message || "Unable to submit complaint.");
    }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (value) => (
        <Tag color="blue">
          <TagOutlined style={{ marginRight: 6 }} />
          {value}
        </Tag>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (value) => (
        <span>
          <TeamOutlined style={{ marginRight: 6 }} />
          {value}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => {
        const badgeStatus =
          value === "Resolved"
            ? "success"
            : value === "In Progress"
              ? "processing"
              : "warning";
        const statusIcon =
          value === "Resolved" ? (
            <CheckCircleOutlined />
          ) : value === "In Progress" ? (
            <ClockCircleOutlined />
          ) : (
            <ExclamationCircleOutlined />
          );
        return (
          <Badge
            status={badgeStatus}
            text={
              <span>
                {statusIcon}
                <span style={{ marginLeft: 6 }}>{value}</span>
              </span>
            }
          />
        );
      },
    },
    {
      title: "Resolution",
      dataIndex: "resolution",
      key: "resolution",
      ellipsis: true,
      render: (value) => (
        <span>
          <SolutionOutlined style={{ marginRight: 6 }} />
          {value}
        </span>
      ),
    },
  ];
  return (
    <div className="complaints-page">
      {contextHolder}
      <div className="complaints-hero">
        <div>
          <Tag icon={<InfoCircleOutlined />} className="hostel-eyebrow">
            Complaints Portal
          </Tag>
          <Title level={2}>Raise concerns and follow their resolution</Title>
          <Paragraph>
            Submit academic, hostel, IT, library, medical, or administrative
            complaints and keep their status visible.
          </Paragraph>
        </div>
        <Card className="complaints-panel">
          <Alert
            type="info"
            showIcon
            message="Student support is active"
            description="High-priority complaints are routed for same-day review whenever possible."
          />
        </Card>
      </div>
      <Card
        className="complaints-panel"
        title={
          <span>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Complaint History
          </span>
        }
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search complaints"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              value={filter}
              onChange={setFilter}
              options={[
                { value: "All", label: "All" },
                { value: "Submitted", label: "Submitted" },
                { value: "In Progress", label: "In Progress" },
                { value: "Resolved", label: "Resolved" },
                ...categories.map((item) => ({ value: item, label: item })),
              ]}
              style={{ width: 150 }}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredComplaints}
          loading={loading || tableLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 760 }}
        />
      </Card>
      <Card
        className="complaints-panel"
        title={
          <span>
            <FormOutlined style={{ marginRight: 8 }} />
            Complaint Form
          </span>
        }
      >
        <Form form={form} layout="vertical" onFinish={submitComplaint}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter a complaint title." }]}
          >
            <Input placeholder="Please enter a complaint title" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Select a category." }]}
          >
            <Select
              options={categories.map((item) => ({
                value: item,
                label: item,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Select priority." }]}
          >
            <Select
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Describe the issue." }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe your complaint clearly"
            />
          </Form.Item>
          <Form.Item name="attachment" label="Attachment">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<PaperClipOutlined />}>Attach File</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting} disabled={submitting}>
            Submit
          </Button>
        </Form>
      </Card>
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={11} style={{ display: "flex" }}>
          <Card
            className="complaints-panel"
            style={{ flex: 1 }}
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Resolution Timeline
              </span>
            }
          >
            <Timeline
              items={complaints.slice(0, 5).map((item) => ({
                color:
                  item.status === "Resolved"
                    ? "green"
                    : item.status === "In Progress"
                      ? "blue"
                      : "orange",
                children: `${item.date}: ${item.title} • ${item.status}`,
              }))}
            />
          </Card>
        </Col>
        <Col xs={24} lg={13} style={{ display: "flex" }}>
          <Card
            className="complaints-panel"
            style={{ flex: 1 }}
            title={
              <span>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Support Guidance
              </span>
            }
          >
            <List
              dataSource={guidanceItems()}
              renderItem={(item) => (
                <List.Item>
                  <Space align="start">
                    {item.icon}
                    <Text>{item.text}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
export default Complaints;
