import React from "react";
import { Button, Form, Input, Modal } from "antd";

export const PersonalModal = ({
  visible,
  onClose,
  form,
  initialValues,
  onFinish,
  loading,
}) => (
  <Modal
    title="Edit Personal info"
    open={visible}
    onOk={onClose}
    onCancel={onClose}
    footer={null}
  >
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      layout="vertical"
    >
      <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
        <Input type="text" placeholder="Enter Your Name" />
      </Form.Item>
      <Form.Item
        label="Father's Name"
        name="fatherName"
        rules={[{ required: true }]}
      >
        <Input type="text" placeholder="Enter Your Father Name" />
      </Form.Item>
      <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
        <Input type="text" placeholder="Enter Your Gender" />
      </Form.Item>
      <Form.Item label="Phone No" name="phone" rules={[{ required: true }]}>
        <Input type="number" placeholder="Enter Your Phone" />
      </Form.Item>
      <Form.Item label="CNIC" name="cnic">
        <Input type="number" placeholder="Enter Your CNIC number" />
      </Form.Item>
      <Form.Item
        label="Nationality"
        name="nationality"
        rules={[{ required: true }]}
      >
        <Input type="text" placeholder="Enter Your Nationality" />
      </Form.Item>
      <Form.Item label="Date of Birth" name="dob">
        <Input type="date" />
      </Form.Item>
      <Form.Item label="Blood Group" name="bloodGroup">
        <Input type="text" placeholder="Enter Your Blood Group" />
      </Form.Item>
      <Form.Item label="Marital Status" name="maritalStatus">
        <Input type="text" placeholder="Enter Your Marital Status" />
      </Form.Item>
      <Button htmlType="submit" type="primary" loading={loading} disabled={loading}>
        Submit
      </Button>
    </Form>
  </Modal>
);
