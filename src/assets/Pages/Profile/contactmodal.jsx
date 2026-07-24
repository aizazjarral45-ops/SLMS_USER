import React from "react";
import { Button, Form, Input, Modal } from "antd";

export const ContactModal = ({ visible, onClose, form, initialValues, onFinish }) => (
  <Modal
    title="Edit Contact Info"
    open={visible}
    onOk={onClose}
    onCancel={onClose}
    footer={null}
  >
    <Form form={form} onFinish={onFinish} layout="vertical" initialValues={initialValues}>
      <Form.Item label="University Email" name="universityEmail">
        <Input type="email" placeholder="Enter Your University Email" />
      </Form.Item>
      <Form.Item
        label="Personal Email"
        name="personalEmail"
        rules={[{ required: true, type: "email" }]}
      >
        <Input type="email" placeholder="Enter Your Personal Email" />
      </Form.Item>
      <Form.Item label="Phone No" name="phone" rules={[{ required: true }]}>
        <Input type="text" placeholder="Enter Your Phone" />
      </Form.Item>
      <Form.Item label="Emergency Contact" name="emergencyContact">
        <Input type="text" placeholder="Enter Emergency Contact" />
      </Form.Item>
      <Form.Item label="Current Address" name="currentAddress">
        <Input type="text" placeholder="Enter Your Current Address" />
      </Form.Item>
      <Form.Item label="Permanent Address" name="permanentAddress">
        <Input type="text" placeholder="Enter Your Permanent Address" />
      </Form.Item>
      <Button htmlType="submit" type="primary">
        Submit
      </Button>
    </Form>
  </Modal>
);