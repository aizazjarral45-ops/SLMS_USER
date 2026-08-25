import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { ArrowLeftOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { changePassword } from "../../../services/authService";
import "./ChangePassword.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const validatePassword = (_, value) => {
    if (!value) return Promise.reject(new Error("Please enter a password."));
    if (value.length < 8)
      return Promise.reject(
        new Error("Password must be at least 8 characters."),
      );
    if (!/[A-Z]/.test(value))
      return Promise.reject(
        new Error("Password must include an uppercase letter."),
      );
    if (!/[a-z]/.test(value))
      return Promise.reject(
        new Error("Password must include a lowercase letter."),
      );
    if (!/[0-9]/.test(value))
      return Promise.reject(new Error("Password must include a number."));
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await changePassword({
        email: user?.email,
        currentPassword: values.current,
        newPassword: values.newPassword,
      });
      message.success("Password updated successfully.");
      form.resetFields();
    } catch (err) {
      message.error(err?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setting-page">
      <div className="setting-content-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/setting")}
          className="setting-back-button"
        >
          Back to Settings
        </Button>
      </div>

      <Card
        className="setting-inner-card"
        title="Change Password"
        extra={<LockOutlined />}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="current"
            label="Current password"
            rules={[
              { required: true, message: "Enter your current password." },
            ]}
          >
            <Input.Password placeholder="Current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password placeholder="New password" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm new password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match."),
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <div className="change-password-actions">
            <Button htmlType="submit" type="primary" loading={loading}>
              Update Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
