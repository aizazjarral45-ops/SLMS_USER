import { useEffect, useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import "./login.css";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const signupEmail = sessionStorage.getItem("signupEmail");
    const remembered = localStorage.getItem("slms_remember_me");
    try {
      const email = signupEmail || JSON.parse(remembered || "null")?.email;
      if (email) form.setFieldsValue({ email });
    } catch {
      // A malformed preference should not prevent sign-in.
    }
    sessionStorage.removeItem("signupEmail");
  }, [form]);

  const onFinish = async ({ email, password, rememberMe }) => {
    setLoading(true);
    try {
      await login({ email, password, rememberMe });
      if (rememberMe) {
        localStorage.setItem(
          "slms_remember_me",
          JSON.stringify({ email: email.trim() }),
        );
      } else {
        localStorage.removeItem("slms_remember_me");
      }
      message.success("Signed in successfully.");
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const destination =
        redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
      navigate(destination, { replace: true });
    } catch (error) {
      message.error(error.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
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
          onFinishFailed={({ errorFields }) =>
            message.error(
              errorFields[0]?.errors?.[0] || "Check the form fields.",
            )
          }
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
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
