import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { recordLoginEvent } from "../../../services/authService";
import { loadSharedData, persistSharedData } from "../../../data/sharedData";

import "./signup.css";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register } = useAuth();

  const validatePasswordMatch = (_, value) => {
    const password = form.getFieldValue("password");
    return value && password && value !== password
      ? Promise.reject(new Error("Passwords do not match"))
      : Promise.resolve();
  };

  const onFinish = async ({ name, email, password }) => {
    setLoading(true);
    try {
      await register({ name, email, password, rememberMe: true });

      // Add an entry to login history for account creation
      try {
        await recordLoginEvent({ email: (email || "").toLowerCase(), status: "account_created" });
      } catch (e) {
        // non-fatal
      }

      // Add a persistent notification for account creation so it appears in the Notifications page
      try {
        const shared = loadSharedData();
        const next = {
          ...shared,
          settings: {
            ...shared.settings,
            customNotifications: [
              ...(shared.settings?.customNotifications || []),
              {
                id: `account-created:${(email || "").toLowerCase()}:${Date.now()}`,
                title: "Account created",
                description: `Your account ${(email || "").toLowerCase()} has been created successfully.`,
                type: "reminder",
                module: "auth",
                createdAt: new Date().toISOString(),
                date: new Date().toISOString(),
              },
            ],
          },
        };
        persistSharedData(next);
      } catch (e) {
        // non-fatal
      }

      message.success("Your account has been created.");
      // prefill login email for convenience
      try {
        sessionStorage.setItem("signupEmail", (email || "").toLowerCase());
      } catch {}
      navigate("/", { replace: true });
    } catch (error) {
      message.error(
        error.message || "Unable to create the account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slms-signup-page">
      <div className="slms-signup-card">
        <div className="slms-brand">
          <h1>SLMS</h1>
          <p>STUDENT LIFE MANAGEMENT SYSTEM</p>
        </div>
        <h2 className="signup-title">Create Your Account</h2>
        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          onFinishFailed={({ errorFields }) =>
            message.error(
              errorFields[0]?.errors?.[0] || "Check the form fields.",
            )
          }
          layout="vertical"
          className="slms-signup-form"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter your full name" },
              { min: 2, message: "Name must be at least 2 characters" },
              { max: 50, message: "Name must not exceed 50 characters" },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message:
                  "Password must contain uppercase, lowercase, number, and special character",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              { validator: validatePasswordMatch },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="slms-signup-button"
              block
              size="large"
              loading={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </Form.Item>
          <div className="slms-alt-actions">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
