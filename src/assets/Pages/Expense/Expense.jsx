import { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  message,
} from "antd";
import {
  ArrowUpOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  LineChartOutlined,
  PlusOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./Expense.css";
import { isApiConfigured, request } from "../../../api/client";
const { Title, Paragraph, Text } = Typography;
const STORAGE_KEY = "slms-expenses";
const BUDGET_STORAGE_KEY = "slms-monthly-budgets";

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
function ChartCard({ title, items, formatValue, budget }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  const referenceValue = budget && budget > 0 ? budget : max;

  return (
    <Card className="expense-panel" title={title}>
      <div className="expense-chart">
        {items.map((item) => {
          const fillPercent = Math.min(
            (item.value / referenceValue) * 100,
            100,
          );
          return (
            <div key={item.label} className="expense-chart-row">
              <div className="expense-chart-meta">
                <Text>{item.label}</Text>
                <Space direction="vertical" align="end" size={0}>
                  <Text strong>{formatValue(item.value)}</Text>
                  {budget ? (
                    <Text type="secondary">
                      {fillPercent.toFixed(0)}% of budget
                    </Text>
                  ) : null}
                </Space>
              </div>
              <div className="expense-chart-track">
                <div
                  className="expense-chart-fill"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
function Expense({
  expenses: expensesProp,
  monthlyBudget: monthlyBudgetProp,
  onExpensesChange,
  onMonthlyBudgetChange,
}) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fallbackExpenses, setFallbackExpenses] = useState(getInitialExpenses);
  const expenses = Array.isArray(expensesProp)
    ? expensesProp
    : fallbackExpenses;
  const setExpenses = (nextValue) => {
    if (onExpensesChange) {
      onExpensesChange(nextValue);
      return;
    }

    setFallbackExpenses((current) =>
      typeof nextValue === "function" ? nextValue(current) : nextValue,
    );
  };
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [fallbackMonthlyBudget, setFallbackMonthlyBudget] = useState(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(BUDGET_STORAGE_KEY) || "[]",
      );
      return stored.length ? Number(stored[stored.length - 1]) : 0;
    } catch {
      return 0;
    }
  });
  const monthlyBudget = Number.isFinite(Number(monthlyBudgetProp))
    ? Number(monthlyBudgetProp)
    : fallbackMonthlyBudget;
  const setMonthlyBudget = (value) => {
    if (onMonthlyBudgetChange) {
      onMonthlyBudgetChange(value);
      return;
    }

    setFallbackMonthlyBudget(value);
  };
  const [newMonthlyBudget, setNewMonthlyBudget] = useState(monthlyBudget);

  useEffect(() => {
    setNewMonthlyBudget(monthlyBudget);
  }, [monthlyBudget]);
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
  const today = dayjs();
  const todaySpent = expenses
    .filter((item) => dayjs(item.date).isSame(today, "day"))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const weeklySpent = expenses
    .filter((item) => dayjs(item.date).isAfter(today.subtract(7, "day")))
    .reduce((sum, item) => sum + Number(item.amount), 0);
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
  const dailySpending = Array.from({ length: 6 }, (_, index) => {
    const date = today.subtract(5 - index, "day");
    return {
      label: date.format("MMM D"),
      value: expenses
        .filter((item) => dayjs(item.date).isSame(date, "day"))
        .reduce((sum, item) => sum + Number(item.amount), 0),
    };
  });
  const weeklyComparison = [
    { label: "Today", value: Number(todaySpent.toFixed(2)) },
    { label: "This Week", value: Number(weeklySpent.toFixed(2)) },
    { label: "This Month", value: Number(weeklySpent.toFixed(2)) },
  ];
  const financialInsights = [
    monthlyBudget
      ? `Budget warning: ${Math.round((totalSpent / monthlyBudget) * 100)}% of your monthly budget has been used.`
      : "Set a monthly budget to see how much of it you've used.",
    highestExpense.title
      ? `Highest spending was on ${highestExpense.title} at $${Number(highestExpense.amount).toFixed(2)}.`
      : "No major expense recorded yet.",
    "Prediction: if this pace continues, you may exceed the monthly budget by around $38.",
    "Recommendation: shift entertainment and transport to lower-cost options for the next 5 days.",
  ];
  const onFinish = async (values) => {
    if (isApiConfigured) {
      try {
        const result = await request("/expenses", {
          method: "POST",
          body: {
            ...values,
            date: values.date.format("YYYY-MM-DD"),
            amount: Number(values.amount),
          },
        });
        setExpenses((current) => [result.expense, ...current]);
        setOpen(false);
        form.resetFields();
        messageApi.success("Expense added successfully.");
        return;
      } catch (error) {
        messageApi.error(error.message || "Unable to add expense.");
        return;
      }
    }
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
          <Tag icon={<WalletOutlined />} className="hostel-eyebrow">
            Expense Portal
          </Tag>
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
              <Text type="secondary">Total Budget</Text>
              <Title level={3}>${monthlyBudget.toFixed(2)}</Title>
              <Progress
                percent={Math.round((remainingBudget / monthlyBudget) * 100)}
                showInfo={false}
                strokeColor="#2563eb"
              />
              <Button
                type="text"
                icon={<DollarCircleOutlined />}
                onClick={() => {
                  setNewMonthlyBudget(monthlyBudget);
                  setBudgetModal(true);
                }}
              >
                Add Budget
              </Button>
            </div>
          </Space>
        </Card>
      </div>
      <Modal
        title="Add Budget"
        open={budgetModal}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => {
          setNewMonthlyBudget(monthlyBudget);
          setBudgetModal(false);
        }}
        onOk={() => {
          const val = Number(newMonthlyBudget) || 0;
          setMonthlyBudget(val);
          setNewMonthlyBudget(val);
          setBudgetModal(false);
        }}
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Current monthly budget: ${monthlyBudget.toFixed(2)}. Remaining budget:
          ${remainingBudget.toFixed(2)}.
        </Paragraph>
        <InputNumber
          placeholder="Enter new monthly budget"
          style={{ width: "100%" }}
          value={newMonthlyBudget}
          min={0}
          formatter={(value) => `$ ${value}`}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          onChange={(value) => setNewMonthlyBudget(Number(value) || 0)}
        />
      </Modal>
      <Card
        className="expense-panel"
        title="Expense Overview"
        style={{ borderRadius: "8px", marginBottom: 24 }}
      >
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
                <ArrowUpOutlined
                  style={{ fontSize: "24px", color: "#f5222d" }}
                />
              ),
            },
          ].map((item) => (
            <Col key={item.title} xs={24} md={12} xl={6}>
              <Card
                bordered={false}
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
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
      </Card>
      <Card
        className="expense-panel"
        title="Expense Table"
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search expenses"
              style={{ width: 210 }}
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
          formatValue={(value) => `$${value.toFixed(1)}`}
        />
        <ChartCard
          title="Expense Categories"
          items={categoryTotals}
          formatValue={(value) => `$${value.toFixed(2)}`}
        />
        <ChartCard
          title="Comparison"
          items={weeklyComparison}
          formatValue={(value) => `$${value.toFixed(3)}`}
        />
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="expense-panel" title="Monthly Budget ">
            <div className="expense-budget-ring">
              <Paragraph>
                This is the budget you've planned for this month. Keep an eye
                <br />
                on your spending and stay within your budget. <hr />
              </Paragraph>
              <Progress
                type="circle"
                percent={Math.round((remainingBudget / monthlyBudget) * 100)}
                format={() => `$${monthlyBudget.toFixed(0)}`}
                strokeColor={{ "0%": "#60a5fa", "100%": "#1d4ed8" }}
              />
              <Paragraph>
                <hr />
                Advice: Review your budget every week so you can make small
                <br />
                adjustments before it's too late.
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="expense-panel" title="Budget Remaining">
            <div className="expense-budget-ring">
              <Paragraph>
                Budget warning ${Math.round((totalSpent / monthlyBudget) * 100)}
                % of your monthly budget has been used <br />
                in this month.
                <hr></hr>
              </Paragraph>
              <Progress
                type="circle"
                percent={Math.round((remainingBudget / monthlyBudget) * 100)}
                format={() => `$${remainingBudget.toFixed(0)}`}
                strokeColor={{ "0%": "#60a5fa", "100%": "#1d4ed8" }}
              />
              <Paragraph>
                <hr></hr>
                Only $
                {Math.round(
                  ((monthlyBudget - totalSpent) / monthlyBudget) * 100,
                )}
                % remains. Review your recent expenses and plan <br />
                your spending carefully to avoid exceeding your budget.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
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
