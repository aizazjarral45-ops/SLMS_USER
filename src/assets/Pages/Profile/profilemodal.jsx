import { Button, Form, Input, Modal, Upload } from "antd";

export const ProfileModal = ({
  visible,
  onClose,
  form,
  initialValues,
  onFinish,
  loading,
  imageUrl,
  uploadButton,
  beforeUpload,
}) => (
  <Modal
    title="Edit Profile"
    open={visible}
    onCancel={onClose}
    footer={null}
    destroyOnClose
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
          beforeUpload={beforeUpload}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </Form.Item>
      <Form.Item
        label="Student ID"
        name="studentId"
        rules={[
          { required: true, whitespace: true, message: "Enter your student ID." },
        ]}
      >
        <Input placeholder="Enter student ID" />
      </Form.Item>
      <Form.Item
        label="Roll No"
        name="rollNo"
        rules={[
          {
            required: true,
            whitespace: true,
            message: "Enter your roll number.",
          },
        ]}
      >
        <Input placeholder="Enter roll number" />
      </Form.Item>
      <Form.Item label="Department" name="department"
       rules={[
          {
            required: true,
            whitespace: true,
            message: "Enter your department.",
          },
        ]}>
        <Input placeholder="Enter department" />
      </Form.Item>
      <Form.Item label="Semester" name="semester">
        <Input placeholder="Enter semester" />
      </Form.Item>
      <Form.Item label="Batch" name="batch">
        <Input placeholder="Enter batch" />
      </Form.Item>
      <Form.Item label="Sessions" name="sessions">
        <Input placeholder="Enter sessions" />
      </Form.Item>
      <Button htmlType="submit" type="primary" loading={loading} disabled={loading}>
        Save Profile
      </Button>
    </Form>
  </Modal>
);
