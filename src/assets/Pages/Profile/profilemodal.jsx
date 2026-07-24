import React from "react";
import { Button, Form, Input, Modal, Upload } from "antd";

export const ProfileModal = ({
  visible,
  onClose,
  form,
  initialValues,
  onFinish,
  imageUrl,
  uploadButton,
  beforeUpload,
  handleChange,
}) => (
  <Modal
    title="Edit Profile"
    open={visible}
    onOk={onClose}
    onCancel={onClose}
    footer={null}
  >
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      initialValues={initialValues}
    >
      <Form.Item label="Profile Image">
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </Form.Item>
      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input type="text" placeholder="Enter Name" />
      </Form.Item>
      <Form.Item label="Roll No" name="rollNo" rules={[{ required: true }]}>
        <Input type="text" placeholder="Enter Roll No" />
      </Form.Item>
      <Form.Item label="Department" name="department">
        <Input type="text" placeholder="Enter Department" />
      </Form.Item>
      <Form.Item label="Semester" name="semester">
        <Input type="text" placeholder="Enter Semester" />
      </Form.Item>
      <Form.Item label="Batch" name="batch">
        <Input type="text" placeholder="Enter Batch" />
      </Form.Item>
      <Form.Item label="Sessions" name="sessions">
        <Input type="text" placeholder="Enter Sessions" />
      </Form.Item>
      <Button htmlType="submit" type="primary">
        Submit
      </Button>
    </Form>
  </Modal>
);
