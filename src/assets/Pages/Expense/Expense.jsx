import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  ArrowUpOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CameraOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  LineChartOutlined,
  PlusOutlined,
  RiseOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./Expense.css";

const { Title, Paragraph, Text } = Typography;
const STORAGE_KEY = "slms-expenses";

const categories = [
  "Food",
  "Transport",
  "Books",
  "Stationery",
  "Internet",
  "Hostel",
  "Medical",
  "Projects",
  "Entertainment",
  "Shopping",
  "Printing",
  "Miscellaneous",
];

const seedExpenses = [
  {
    key: "1",
    title: "Cafeteria Lunch Combo",
    category: "Food",
    amount: 12.5,
    date: "2026-07-30",
    paymentMethod: "Card",
    description: "Lunch between lab sessions",
    location: "Main Cafeteria",
    status: "Approved",
    receipt: "Available",
  },
  {
    key: "2",
    title: "Project Printing",
    category: "Printing",
    amount: 8.25,
    date: "2026-07-29",
    paymentMethod: "Cash",
    description: "Capstone draft print",
    location: "Campus Print Hub",
    status: "Logged",
    receipt: "Uploaded",
  },
  {
    key: "3",
    title: "Hostel Laundry",
    category: "Hostel",
    amount: 15,
    date: "2026-07-28",
    paymentMethod: "Wallet",
    description: "Weekly laundry cycle",
    location: "Hostel Block B",
    status: "Approved",
    receipt: "N/A",
  },
  {
    key: "4",
    title: "Ride to Internship Fair",
    category: "Transport",
    amount: 19.75,
    date: "2026-07-26",
    paymentMethod: "Wallet",
    description: "Shared cab fare",
    location: "City Expo Center",
    status: "Approved",
    receipt: "Uploaded",
  },
];

function getInitialExpenses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : seedExpenses;
  } catch {
    return seedExpenses;
  }
}

function ChartCard({ title, items, formatValue }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card className="expense-panel" title={title}>
      <div className="expense-chart">
        {items.map((item) => (
          <div key={item.label} className="expense-chart-row">
            <div className="expense-chart-meta">
              <Text>{item.label}</Text>
              <Text strong>{formatValue(item.value)}</Text>
            </div>
            <div className="expense-chart-track">
              <div
                className="expense-chart-fill"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Expense() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [expenses, setExpenses] = useState(getInitialExpenses);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [categoryFilter, expenses, query]);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses],
  );

  const today = dayjs("2026-07-30");

  const todaySpent = expenses
    .filter((item) => dayjs(item.date).isSame(today, "day"))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const weeklySpent = expenses
    .filter((item) => dayjs(item.date).isAfter(today.subtract(7, "day")))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const monthlyBudget = 30000;
  const remainingBudget = Math.max(monthlyBudget - totalSpent, 0);
  const highestExpense = expenses.reduce((largest, item) => {
    return Number(item.amount) > Number(largest.amount || 0) ? item : largest;
  }, {});

  const categoryTotals = categories
    .map((category) => ({
      label: category,
      value: Number(
        expenses
          .filter((item) => item.category === category)
          .reduce((sum, item) => sum + Number(item.amount), 0)
          .toFixed(2),
      ),
    }))
    .filter((item) => item.value > 0)
    .slice(0, 6);

  const dailySpending = [
    "Jul 25",
    "Jul 26",
    "Jul 27",
    "Jul 28",
    "Jul 29",
    "Jul 30",
  ].map((label, index) => ({
    label,
    value: expenses
      .filter((item) =>
        dayjs(item.date).isSame(today.subtract(5 - index, "day"), "day"),
      )
      .reduce((sum, item) => sum + Number(item.amount), 0),
  }));

  const weeklyComparison = [
    { label: "Today", value: Number(todaySpent.toFixed(2)) },
    { label: "This Week", value: Number(weeklySpent.toFixed(2)) },
    { label: "This Month", value: Number(weeklySpent.toFixed(2)) },
  ];

  const financialInsights = [
    `Budget warning: ${Math.round((totalSpent / monthlyBudget) * 100)}% of your monthly budget has been used.`,
    highestExpense.title
      ? `Highest spending was on ${highestExpense.title} at $${Number(highestExpense.amount).toFixed(2)}.`
      : "No major expense recorded yet.",
    "Prediction: if this pace continues, you may exceed the monthly budget by around $38.",
    "Recommendation: shift entertainment and transport to lower-cost options for the next 5 days.",
  ];

  const onFinish = (values) => {
    const record = {
      key: `${Date.now()}`,
      date: values.date.format("YYYY-MM-DD"),
      title: values.title,
      category: values.category,
      amount: Number(values.amount),
      paymentMethod: values.paymentMethod,
      description: values.description,
      location: values.location,
    };

    setExpenses((current) => [record, ...current]);
    setOpen(false);
    form.resetFields();
    messageApi.success("Expense added successfully.");
  };

  const handleDelete = (key) => {
    setExpenses((current) => current.filter((item) => item.key !== key));
    messageApi.success("Expense removed.");
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (value) => <Tag color="blue">{value}</Tag>,
      filters: categories.map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    { title: "Payment", dataIndex: "paymentMethod", key: "paymentMethod" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (value) => `$${Number(value).toFixed(2)}`,
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="expense-page">
      {contextHolder}
      <div className="expense-hero">
        <div>
          <tag color="blue" className="expense-pill">
            Expense Management
          </tag>
          <Title level={2}>Control student spending with clarity</Title>
          <Paragraph>
            Track daily university expenses, monitor your budget, and get quick
            AI-style insights before overspending.
          </Paragraph>
        </div>
        <Card className="expense-panel expense-highlight">
          <Space align="start">
            <WalletOutlined className="expense-highlight-icon" />
            <div>
              <Text type="secondary">Budget Remaining</Text>
              <Title level={3}>${remainingBudget.toFixed(2)}</Title>
              <Progress
                percent={Math.round((remainingBudget / monthlyBudget) * 100)}
                showInfo={false}
                strokeColor="#2563eb"
              />
            </div>
          </Space>
        </Card>
      </div>

      <Row gutter={[25, 25]} style={{ width: "100%" }}>
        {[
          {
            title: "Today's Expense",
            value: todaySpent,
            icon: (
              <CalendarOutlined
                style={{ fontSize: "24px", color: "#1890ff" }}
              />
            ),
          },
          {
            title: "Weekly Expense",
            value: weeklySpent,
            icon: (
              <LineChartOutlined
                style={{ fontSize: "24px", color: "#52c41a" }}
              />
            ),
          },
          {
            title: "Monthly Expense",
            value: totalSpent,
            icon: (
              <BarChartOutlined
                style={{ fontSize: "24px", color: "#faad14" }}
              />
            ),
          },
          {
            title: "Highest Expense",
            value: highestExpense.amount || 0,
            icon: (
              <ArrowUpOutlined style={{ fontSize: "24px", color: "#f5222d" }} />
            ),
          },
        ].map((item) => (
          <Col key={item.title} xs={24} md={12} xl={6}>
            <Card
              className="expense-panel"
              hoverable
              style={{
                border: "none",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text type="secondary" strong>
                    {item.title}
                  </Text>
                  {item.icon}
                </div>
                <Statistic
                  value={item.value}
                  prefix="$"
                  precision={2}
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "20px",
                    fontWeight: "600",
                  }}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Card
        className="expense-panel"
        title="Expense Table"
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search expenses"
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "All", label: "All Categories" },
                ...categories.map((item) => ({ value: item, label: item })),
              ]}
              style={{ width: 170 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              Add Expense
            </Button>
          </Space>
        }
      >
        <Table
          className="expense-table"
          columns={columns}
          dataSource={filteredExpenses}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 900 }}
        />
      </Card>
      <Col xs={24} xl={100}>
        <Card className="expense-panel" title="AI Financial Assistant">
          <Space
            direction="vertical"
            size={12}
            className="expense-insight-list"
          >
            {financialInsights.map((insight) => (
              <Alert key={insight} type="info" showIcon message={insight} />
            ))}
          </Space>
        </Card>
      </Col>

      <div className="expense-chart-grid">
        <ChartCard
          title="Daily Spending"
          items={dailySpending}
          formatValue={(value) => `$${value.toFixed(2)}`}
        />
        <ChartCard
          title="Expense Categories"
          items={categoryTotals}
          formatValue={(value) => `$${value.toFixed(2)}`}
        />
        <ChartCard
          title="Weekly Comparison"
          items={weeklyComparison}
          formatValue={(value) => `$${value.toFixed(2)}`}
        />
      </div>
      <Card className="expense-panel" title="Budget Remaining">
        <div className="expense-budget-ring">
          <Progress
            type="circle"
            percent={Math.round((remainingBudget / monthlyBudget) * 100)}
            format={() => `$${remainingBudget.toFixed(0)}`}
            strokeColor={{ "0%": "#60a5fa", "100%": "#1d4ed8" }}
          />
          <Paragraph>
            Stay below $18/day for the rest of July to remain comfortably inside
            your monthly target.
          </Paragraph>
        </div>
      </Card>
      <Modal
        title="Add Expense"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ paymentMethod: "Card", date: dayjs("2026-07-30") }}
        >
          <Form.Item
            name="title"
            label="Expense Title"
            rules={[{ required: true, message: "Enter the expense title." }]}
          >
            <Input placeholder="Expense title" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Select a category." }]}
          >
            <Select
              options={categories.map((item) => ({ value: item, label: item }))}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Enter amount." }]}
          >
            <InputNumber
              min={0}
              precision={2}
              className="expense-full-width"
              placeholder="$ 0.00"
            />
          </Form.Item>
          <Form.Item
            name="date"
            label="Expense Date"
            rules={[{ required: true, message: "Pick the date." }]}
          >
            <DatePicker className="expense-full-width" />
          </Form.Item>
          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: "Select payment method." }]}
          >
            <Select
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Card", label: "Card" },
                { value: "Wallet", label: "Mobile Wallet" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Enter a description." }]}
          >
            <Input.TextArea rows={3} placeholder="Where was the money used?" />
          </Form.Item>
          <Form.Item name="location" label="Where was the money used?">
            <Input placeholder="Location" />
          </Form.Item>

          <div className="expense-modal-actions">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              htmlType="submit"
              type="primary"
              icon={<DollarCircleOutlined />}
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Expense;
