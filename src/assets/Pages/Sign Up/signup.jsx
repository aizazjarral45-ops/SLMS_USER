import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

import "./signup.css";
import "../Login/forgot.css";

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

      message.success("Your account has been created.");
      try {
        sessionStorage.setItem("signupEmail", (email || "").toLowerCase());
      } catch {}
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(
        error.message || "Unable to create the account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slms-forgot-page slms-signup-page">
      <div className="slms-forgot-card slms-signup-card">
        <aside className="slms-forgot-visual">
          <div className="slms-forgot-logo-mark">
            <UserOutlined />
          </div>
          <div className="slms-forgot-brand">
            <span className="slms-forgot-brand-name">SLMS</span>
            <span className="slms-forgot-brand-caption">
              STUDENT LIFE MANAGEMENT SYSTEM
            </span>
          </div>
          <div className="slms-forgot-visual-copy">
            <span className="slms-forgot-eyebrow">START YOUR JOURNEY</span>
            <h1>Build a stronger student life, one step at a time.</h1>
            <p>Create your secure account and bring your academic experience together.</p>
          </div>
          <div className="slms-forgot-orbit" aria-hidden="true" />
        </aside>
        <main className="slms-forgot-content">
          <div className="slms-forgot-heading">
            <span className="slms-forgot-heading-icon">
              <UserOutlined />
            </span>
            <div>
              <h2>Create your account</h2>
              <p>Set up your student profile to get started with SLMS.</p>
            </div>
          </div>
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
        </main>
      </div>
    </div>
  );
};

export default Signup;
