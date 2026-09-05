import { useEffect, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import {
  beginPasswordReset,
  cancelPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from "../../../services/authService";
import "./forgot.css";

const passwordRules = [
  { required: true, message: "Please enter a new password" },
  { min: 8, message: "Password must be at least 8 characters" },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    message: "Use uppercase, lowercase, a number, and a special character",
  },
];

const Forgot = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const requestOtp = async (enteredEmail) => {
    const result = await beginPasswordReset(enteredEmail);
    setEmail(enteredEmail.trim().toLowerCase());
    setCooldown(60);
    return result;
  };

  const sendReset = async ({ email: enteredEmail }) => {
    setLoading(true);
    try {
      const result = await requestOtp(enteredEmail);
      if (result.delivery === "local") {
        message.info(
          `Local development code: ${result.code}. Configure VITE_API_BASE_URL to send email.`,
        );
      } else {
        message.success("A verification code has been sent to your email.");
      }
      setStep(1);
    } catch (error) {
      message.error(error.message || "Unable to start password reset.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async ({ code: enteredCode }) => {
    setLoading(true);
    try {
      const cleanCode = enteredCode.trim();
      const result = await verifyPasswordResetCode({ email, code: cleanCode });
      setCode(cleanCode);
      setResetToken(result?.resetToken || "");
      setStep(2);
      message.success("Code verified. Choose a new password.");
    } catch (error) {
      message.error(error.message || "Unable to verify this code.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (loading || cooldown) return;
    setLoading(true);
    try {
      await requestOtp(email);
      form.setFieldsValue({ code: "" });
      message.success("A new verification code has been sent.");
    } catch (error) {
      message.error(error.message || "Unable to resend the verification code.");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async ({ password }) => {
    setLoading(true);
    try {
      await resetPassword({ email, code, resetToken, password });
      message.success("Password updated. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error.message || "Unable to update your password.");
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    cancelPasswordReset();
    form.resetFields();
    setEmail("");
    setCode("");
    setResetToken("");
    setCooldown(0);
    setStep(0);
  };

  return (
    <div className="slms-forgot-page">
      <div className="slms-forgot-card">
        <aside className="slms-forgot-visual">
          <div className="slms-forgot-logo-mark">
            <LockOutlined />
          </div>
          <div className="slms-forgot-brand">
            <span className="slms-forgot-brand-name">SLMS</span>
            <span className="slms-forgot-brand-caption">
              STUDENT LIFE MANAGEMENT SYSTEM
            </span>
          </div>
          <div className="slms-forgot-visual-copy">
            <span className="slms-forgot-eyebrow">SECURE STUDENT ACCESS</span>
            <h1>Keep your academic journey moving forward.</h1>
            <p>
              Recover your account securely and get back to the tools that
              support your student life.
            </p>
          </div>
          <div className="slms-forgot-orbit" aria-hidden="true" />
        </aside>
        <main className="slms-forgot-content">
          <div className="slms-forgot-heading">
            <span className="slms-forgot-heading-icon">
              <LockOutlined />
            </span>
            <div>
              <h2>{step === 2 ? "Reset Password" : "Forgot Password?"}</h2>
              <p>
                {step === 0
                  ? "Enter your email and we&apos;ll help you securely regain access."
                  : step === 1
                    ? "Verify your code to continue securely."
                    : "Choose a strong new password for your account."}
              </p>
            </div>
          </div>
        {step === 0 && (
          <Form form={form} layout="vertical" onFinish={sendReset}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                size="large"
                placeholder="Email"
                autoComplete="email"
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
                {loading ? "Preparing..." : "Continue"}
              </Button>
            </Form.Item>
          </Form>
        )}
        {step === 1 && (
          <Form form={form} layout="vertical" onFinish={verifyCode}>
            <Form.Item label={`Verification code for ${email}`}>
              <p className="slms-muted">
                Enter the six-digit code from your reset request.
              </p>
            </Form.Item>
            <Form.Item
              name="code"
              label="Verification Code"
              rules={[
                { required: true, message: "Please enter the code" },
                { pattern: /^\d{6}$/, message: "Enter the six-digit code" },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter 6-digit code"
                maxLength={6}
                inputMode="numeric"
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
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </Form.Item>
            <div className="slms-forgot-actions">
              <Button type="link" onClick={cancel}>
                Start over
              </Button>
              <Button
                type="link"
                className="slms-resend-btn"
                onClick={resend}
                disabled={loading || Boolean(cooldown)}
              >
                {cooldown ? `Resend in ${cooldown}s` : "Resend OTP"}
              </Button>
              <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        )}
        {step === 2 && (
          <Form form={form} layout="vertical" onFinish={savePassword}>
            <Form.Item
              name="password"
              label="New Password"
              rules={passwordRules}
              hasFeedback
            >
              <Input.Password
                size="large"
                placeholder="New password"
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm New Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    return !value || getFieldValue("password") === value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Confirm new password"
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
                {loading ? "Saving..." : "Reset Password"}
              </Button>
            </Form.Item>
          </Form>
        )}
        {step === 0 && (
          <div className="slms-forgot-actions">
            <Link to="/login">Back to Login</Link>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default Forgot;
