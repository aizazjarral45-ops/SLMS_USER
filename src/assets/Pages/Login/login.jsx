import React, { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

// Backend API endpoint - replace with your actual API URL
const API_BASE_URL =
  typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000/api";

const loginApi = async ({ email, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, message: data.message || "Login failed" };
    }

    return {
      ok: true,
      token: data.token,
      user: data.user,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login API error:", error);
    return {
      ok: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-fill email if coming from signup
    const signupEmail = sessionStorage.getItem("signupEmail");
    if (signupEmail) {
      form.setFieldsValue({ email: signupEmail });
      sessionStorage.removeItem("signupEmail");
    }

    // Restore remembered email if available
    const remembered = localStorage.getItem("slms_remember_me");
    if (remembered) {
      try {
        const parsed = JSON.parse(remembered);
        if (parsed?.email) {
          form.setFieldsValue({ email: parsed.email });
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { email, password, rememberMe } = values;
      const res = await loginApi({ email: email.trim(), password });

      if (res.ok) {
        message.success("Login successful");

        if (rememberMe) {
          localStorage.setItem("slms_token", res.token);
          localStorage.setItem("slms_user", JSON.stringify(res.user));
          localStorage.setItem("slms_remember_me", JSON.stringify({ email }));
        } else {
          sessionStorage.setItem("slms_token", res.token);
          sessionStorage.setItem("slms_user", JSON.stringify(res.user));
          localStorage.removeItem("slms_remember_me");
        }

        // Navigate to dashboard
        navigate("/");
      } else {
        message.error(res.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      message.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = ({ errorFields }) => {
    if (errorFields && errorFields.length) {
      const firstError = Array.isArray(errorFields[0]?.errors)
        ? errorFields[0].errors[0]
        : "Please check the form fields";
      message.error(firstError);
    }
  };

  return (
    <div className="slms-login-page">
      <div className="slms-login-card">
        <div className="slms-brand">
          <h1>SLMS</h1>
          <p>STUDENT LIFE MANAGEMENT SYSTEM</p>
          <h2>Login</h2>
        </div>
        <Form
          form={form}
          name="login"
          initialValues={{ rememberMe: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          className="slms-login-form"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email" },
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
            rules={[{ required: true, message: "Please input your password" }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <div className="slms-form-row">
            <Form.Item name="rememberMe" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Link to="/forgot" className="slms-forgot-link">
              Forgot Password?
            </Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="slms-login-button"
              block
              size="large"
              loading={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </Form.Item>

          <div className="slms-alt-actions">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
