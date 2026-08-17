import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import "./signup.css";

// Backend API endpoint - replace with your actual API URL
const API_BASE_URL =
  typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000/api";

const signupApi = async ({ name, email, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, message: data.message || "Signup failed" };
    }

    return { ok: true, message: "Signup successful", user: data.user };
  } catch (error) {
    console.error("Signup API error:", error);
    return {
      ok: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const validatePasswordMatch = (_, value) => {
    const password = form.getFieldValue("password");
    if (value && password && value !== password) {
      return Promise.reject(new Error("Passwords do not match"));
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { name, email, password } = values;
      const res = await signupApi({ name, email, password });

      if (res.ok) {
        message.success("Signup successful! Redirecting to login...");

        // Store signup info temporarily for auto-fill on login
        sessionStorage.setItem("signupEmail", email);

        // Redirect to login page after 1.5 seconds
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        message.error(res.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      message.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = ({ errorFields }) => {
    if (errorFields && errorFields.length) {
      message.error(errorFields[0].errors[0]);
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
          onFinishFailed={onFinishFailed}
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
              {
                type: "email",
                message: "Please enter a valid email address",
              },
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
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
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
              {loading ? "Creating Account..." : "Sign Up"}
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
