import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import './forgot.css';

// Simulated backend calls - replace with real API integration
const fakeSendResetEmail = async (email) => {
  await new Promise((res) => setTimeout(res, 1000));
  if (!email || !email.includes('@')) return { ok: false, message: 'Email not found' };

  const otp = '123456';
  sessionStorage.setItem('slms_demo_otp', otp);

  const expiry = Date.now() + 60_000;
  sessionStorage.setItem('slms_otp_expiry', String(expiry));
  return { ok: true, message: 'OTP sent to email' };
};

const fakeVerifyOtp = async (otp) => {
  await new Promise((res) => setTimeout(res, 800));
  const saved = sessionStorage.getItem('slms_demo_otp');
  return { ok: saved === otp };
};

const fakeResetPassword = async (email, password) => {
  await new Promise((res) => setTimeout(res, 1000));
  return { ok: true };
};

const Forgot = () => {
  const [step, setStep] = useState(() => Number(sessionStorage.getItem('slms_fp_step') || 0));
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(() => sessionStorage.getItem('slms_demo_reset_email') || '');
  const [otpValue, setOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(() => !!sessionStorage.getItem('slms_demo_otp'));
  const [resendRemaining, setResendRemaining] = useState(() => {
    const e = Number(sessionStorage.getItem('slms_otp_expiry') || 0);
    return e > Date.now() ? Math.ceil((e - Date.now()) / 1000) : 0;
  });
  const timerRef = useRef(null);
  const navigate = typeof useNavigate === 'function' ? useNavigate() : null;

  useEffect(() => {
    sessionStorage.setItem('slms_fp_step', String(step));
  }, [step]);

  useEffect(() => {

    if (resendRemaining > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setResendRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            sessionStorage.removeItem('slms_otp_expiry');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resendRemaining]);

  const startResendTimer = (seconds = 60) => {
    const expiry = Date.now() + seconds * 1000;
    sessionStorage.setItem('slms_otp_expiry', String(expiry));
    setResendRemaining(seconds);
  };

  const sendEmail = async (values) => {
    setLoading(true);
    try {
      const entered = values.email.trim();
      setEmail(entered);
      const res = await fakeSendResetEmail(entered);
      if (res.ok) {
        message.success(res.message || 'OTP sent');
        setOtpSent(true);
        setStep(1);
       
        startResendTimer(60);
      } else {
        message.error(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      message.error('An error occurred while sending email');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (values) => {
    setLoading(true);
    try {
      const entered = (values.otp || otpValue).trim();
      if (!/^[0-9]{4,6}$/.test(entered)) {
        message.error('Please enter a valid OTP');
        setLoading(false);
        return;
      }
      const res = await fakeVerifyOtp(entered);
      if (res.ok) {
        message.success('OTP verified');
        setStep(2);
      } else {
        message.error('Invalid OTP. Please try again');
      }
    } catch (err) {
      console.error(err);
      message.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendRemaining > 0) return; 
    setLoading(true);
    try {
      const res = await fakeSendResetEmail(email);
      if (res.ok) {
        message.success('OTP resent');
        startResendTimer(60);
        setOtpSent(true);
      } else {
        message.error(res.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error(err);
      message.error('Error while resending OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values) => {
    setLoading(true);
    try {
      const { password } = values;
      const res = await fakeResetPassword(email, password);
      if (res.ok) {
        message.success('Password reset successful');
        sessionStorage.removeItem('slms_demo_otp');
        sessionStorage.removeItem('slms_demo_reset_email');
        sessionStorage.removeItem('slms_fp_step');
        sessionStorage.removeItem('slms_otp_expiry');
        if (navigate) navigate('/login'); else window.location.href = '/login';
      } else {
        message.error(res.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      message.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { required: true, message: 'Please enter a new password' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value) return Promise.reject();
        const hasMin = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasNum = /[0-9]/.test(value);
        const hasSpecial = /[^A-Za-z0-9]/.test(value);
        if (!hasMin) return Promise.reject(new Error('Password must be at least 8 characters'));
        if (!hasUpper) return Promise.reject(new Error('Include at least one uppercase letter'));
        if (!hasNum) return Promise.reject(new Error('Include at least one number'));
        if (!hasSpecial) return Promise.reject(new Error('Include at least one special character'));
        return Promise.resolve();
      },
    }),
  ];

  return (
    <div className="slms-forgot-page">
      <div className="slms-forgot-card">
        <div className="slms-forgot-brand">
          <h2>Reset Password</h2>
          <p>Please follow the steps to reset your password</p>
        </div>

        {step === 0 && (
          <Form layout="vertical" onFinish={sendEmail} initialValues={{ email }}>
            <Form.Item
              name="email"
              label="Enter your email"
              rules={[{ required: true, message: 'Please input your email' }, { type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input prefix={<MailOutlined />} size="large" placeholder="Email" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                {loading ? 'Sending...' : 'Continue'}
              </Button>
            </Form.Item>

            <div className="slms-forgot-actions">
              <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        )}

        {step === 1 && (
          <Form layout="vertical" onFinish={verifyOtp}>
            <Form.Item label={`OTP sent to ${email}`}>
              <p className="slms-muted">Enter the one-time code you received via email</p>
            </Form.Item>

            <Form.Item name="otp" label="Enter OTP" rules={[{ required: true, message: 'Please enter the OTP' }]}> 
              <Input
                size="large"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </Form.Item>

            <div className="slms-forgot-actions">
              <div>
                <Button type="link" onClick={handleResend} disabled={resendRemaining > 0} className="slms-resend-btn">
                  {resendRemaining > 0 ? `Resend in ${resendRemaining}s` : 'Resend OTP'}
                </Button>
                <Button type="link" onClick={() => { sessionStorage.removeItem('slms_demo_otp'); sessionStorage.removeItem('slms_demo_reset_email'); sessionStorage.removeItem('slms_otp_expiry'); setOtpSent(false); setStep(0); message.info('Cancelled'); }}>
                  Cancel
                </Button>
              </div>
              <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        )}

        {step === 2 && (
          <Form layout="vertical" onFinish={resetPassword}>
            <Form.Item name="password" label="New password" rules={passwordRules} hasFeedback>
              <Input.Password size="large" placeholder="New password" />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm password"
              dependencies={["password"]}
              hasFeedback
              rules={[{ required: true, message: 'Please confirm your password' }, ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              })]}
            >
              <Input.Password size="large" placeholder="Confirm password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form.Item>

            <div className="slms-forgot-actions">
              <Link to="/login">Back to Login</Link>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Forgot;
