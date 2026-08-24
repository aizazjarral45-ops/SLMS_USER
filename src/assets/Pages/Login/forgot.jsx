import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
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
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const sendReset = async ({ email: enteredEmail }) => {
    setLoading(true);
    try {
      const result = await beginPasswordReset(enteredEmail);
      setEmail(enteredEmail.trim().toLowerCase());
      if (result.delivery === "local") {
        message.info(`Local development code: ${result.code}. Configure VITE_API_BASE_URL to send email.`);
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
      await verifyPasswordResetCode({ email, code: cleanCode });
      setCode(cleanCode);
      setStep(2);
      message.success("Code verified. Choose a new password.");
    } catch (error) {
      message.error(error.message || "Unable to verify this code.");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async ({ password }) => {
    setLoading(true);
    try {
      await resetPassword({ email, code, password });
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
    setStep(0);
  };

  return (
    <div className="slms-forgot-page">
      <div className="slms-forgot-card">
        <div className="slms-brand">
          <h1>SLMS</h1>
          <p>STUDENT LIFE MANAGEMENT SYSTEM</p>
          <h2>Reset Password</h2>
        </div>
        {step === 0 && (
          <Form form={form} layout="vertical" onFinish={sendReset}>
            <Form.Item name="email" label="Email" rules={[
              { required: true, message: "Please input your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}>
              <Input prefix={<MailOutlined />} size="large" placeholder="Email" autoComplete="email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                {loading ? "Preparing..." : "Continue"}
              </Button>
            </Form.Item>
          </Form>
        )}
        {step === 1 && (
          <Form form={form} layout="vertical" onFinish={verifyCode}>
            <Form.Item label={`Verification code for ${email}`}>
              <p className="slms-muted">Enter the six-digit code from your reset request.</p>
            </Form.Item>
            <Form.Item name="code" label="Verification Code" rules={[
              { required: true, message: "Please enter the code" },
              { pattern: /^\d{6}$/, message: "Enter the six-digit code" },
            ]}>
              <Input size="large" placeholder="Enter 6-digit code" maxLength={6} inputMode="numeric" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </Form.Item>
            <div className="slms-forgot-actions">
              <Button type="link" onClick={cancel}>Start over</Button>
              <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        )}
        {step === 2 && (
          <Form form={form} layout="vertical" onFinish={savePassword}>
            <Form.Item name="password" label="New Password" rules={passwordRules} hasFeedback>
              <Input.Password size="large" placeholder="New password" autoComplete="new-password" />
            </Form.Item>
            <Form.Item name="confirm" label="Confirm New Password" dependencies={["password"]} hasFeedback rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}>
              <Input.Password size="large" placeholder="Confirm new password" autoComplete="new-password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                {loading ? "Saving..." : "Reset Password"}
              </Button>
            </Form.Item>
          </Form>
        )}
        {step === 0 && <div className="slms-forgot-actions"><Link to="/login">Back to Login</Link></div>}
      </div>
    </div>
  );
};

export default Forgot;
