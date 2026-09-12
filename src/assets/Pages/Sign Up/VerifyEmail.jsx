import { useEffect, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  resendEmailVerification,
  verifyEmail,
} from "../../../services/authService";
import "./VerifyEmail.css";
import "../Login/forgot.css";

const readVerification = (locationState) => {
  if (locationState?.verificationId && locationState?.email) return locationState;
  try {
    return JSON.parse(sessionStorage.getItem("slms_email_verification") || "null") || {};
  } catch {
    return {};
  }
};

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verification] = useState(() => readVerification(location.state));

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const onFinish = async ({ otp }) => {
    if (!verification.verificationId) {
      message.error("This verification session is no longer available.");
      navigate("/register", { replace: true });
      return;
    }
    setLoading(true);
    try {
      await verifyEmail({ verificationId: verification.verificationId, otp });
      sessionStorage.removeItem("slms_email_verification");
      sessionStorage.setItem("signupEmail", verification.email);
      message.success("Email verified. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error.message || "Unable to verify your email.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (loading || cooldown || !verification.verificationId) return;
    setLoading(true);
    try {
      await resendEmailVerification(verification.verificationId);
      form.resetFields(["otp"]);
      setCooldown(60);
      message.success("A new verification code was sent.");
    } catch (error) {
      message.error(error.message || "Unable to resend the verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slms-forgot-page slms-verify-email-page">
      <div className="slms-forgot-card slms-verify-email-card">
        <aside className="slms-forgot-visual">
          <div className="slms-forgot-logo-mark"><LockOutlined /></div>
          <div className="slms-forgot-brand">
            <span className="slms-forgot-brand-name">SLMS</span>
            <span className="slms-forgot-brand-caption">STUDENT LIFE MANAGEMENT SYSTEM</span>
          </div>
          <div className="slms-forgot-visual-copy">
            <span className="slms-forgot-eyebrow">SECURE STUDENT ACCESS</span>
            <h1>Confirm your email and get started.</h1>
            <p>One more secure step before you access your student life tools.</p>
          </div>
          <div className="slms-forgot-orbit" aria-hidden="true" />
        </aside>
        <main className="slms-forgot-content">
          <div className="slms-forgot-heading">
            <span className="slms-forgot-heading-icon"><MailOutlined /></span>
            <div>
              <h2>Verify Your Email</h2>
              <p>Enter the six-digit code sent to {verification.email || "your email"}.</p>
            </div>
          </div>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="otp"
              label="Verification Code"
              rules={[
                { required: true, message: "Please enter the verification code" },
                { pattern: /^\d{6}$/, message: "Enter the six-digit code" },
              ]}
            >
              <Input size="large" maxLength={6} inputMode="numeric" placeholder="Enter 6-digit code" autoComplete="one-time-code" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </Form.Item>
            <div className="slms-forgot-actions">
              <Button type="link" onClick={resend} disabled={loading || Boolean(cooldown)}>
                {cooldown ? `Resend in ${cooldown}s` : "Resend OTP"}
              </Button>
              <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        </main>
      </div>
    </div>
  );
};

export default VerifyEmail;
