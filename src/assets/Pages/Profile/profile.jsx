import "./profile.css";
import React, { useState } from "react";
import {
  ContactsOutlined,
  EditOutlined,
  LoadingOutlined,
  PhoneFilled,
  PlusOutlined,
  ProfileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Upload,
} from "antd";
import { CgEnter } from "react-icons/cg";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};
function Profile() {
  const [visible, setvisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [form] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [personalData, setPersonalData] = useState({
    fullName: "",
    fname: "",
    gender: "",
    dob: "",
    phone: "",
    cnic: "",
    bloodGroup: "",
    nationality: "",
    maritalStatus: "",
  });
  const [profileData, setProfileData] = useState({
    name: "",
    rollNo: "",
    department: "",
    semester: "",
    batch: "",
    sessions: "",
  });
  const [contactData, setContactData] = useState({
    universityEmail: "",
    personalEmail: "",
    phone: "",
    emergencyContact: "",
    currentAddress: "",
    permanentAddress: "",
  });
  const [messageApi, contextHolder] = message.useMessage();
  const personalFormHandler = (value) => {
    setPersonalData((prev) => ({ ...prev, ...value }));
    setvisible(false);
    messageApi.success("Personal Information updated");
  };
  const contactFormHandler = (value) => {
    setContactData((prev) => ({ ...prev, ...value }));
    setContactVisible(false);
    messageApi.success("Contact information updated");
  };
  const profileFormHandler = (value) => {
    setProfileData((prev) => ({ ...prev, ...value }));
    setProfileVisible(false);
    messageApi.success("Profile details updated");
  };
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      messageApi.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  return (
    <>
      <div className="profile-card">
        <div className="gradient">
          <Button
            style={{
              color: "white",
            }}
            type="text"
            icon={<EditOutlined></EditOutlined>}
            onClick={() => {
              profileForm.setFieldsValue(profileData);
              setProfileVisible(true);
            }}
          >
            Edit Profile
          </Button>
        </div>
        <div className="profile-down">
          <div className="profile">
            <Flex gap="medium" wrap>
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                {imageUrl ? (
                  <img draggable={false} src={imageUrl} alt="avatar" />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Flex>
          </div>
        </div>
        <div style={{ padding: "0 20px 20px", boxSizing: "border-box" }}>
          <div className="profile-name">
            {profileData.name ? `${profileData.name} ` : "Your Name"}
          </div>
          <div className="profile-bio">
            {profileData.department
              ? `${profileData.department} Student`
              : "Department Name"}
          </div>
        </div>
        <div
          className="cardrapper"
          style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}
        >
          <div className="card" style={{ flex: "1 1 180px", minWidth: 140 }}>
            <div className="info"> Roll No</div>
            <div className="detail">{profileData.rollNo}</div>
          </div>
          <div className="card" style={{ flex: "1 1 180px", minWidth: 140 }}>
            <div className="info"> Department</div>
            <div className="detail">{profileData.department}</div>
          </div>
          <div className="card" style={{ flex: "1 1 180px", minWidth: 140 }}>
            <div className="info"> Semester</div>
            <div className="detail">{profileData.semester}</div>
          </div>
          <div className="card" style={{ flex: "1 1 180px", minWidth: 140 }}>
            <div className="info"> Batch</div>
            <div className="detail">{profileData.batch}</div>
          </div>
          <div className="card" style={{ flex: "1 1 180px", minWidth: 140 }}>
            <div className="info"> Sessions</div>
            <div className="detail">{profileData.sessions}</div>
          </div>
        </div>
      </div>
      {contextHolder}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          marginTop: 24,
          width: "100%",
        }}
      >
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar
                shape="square"
                style={{ background: "#307EF8" }}
                icon={<UserOutlined />}
              />
              <span>Personal Information</span>
            </div>
          }
          extra={
            <Button
              icon={<EditOutlined></EditOutlined>}
              onClick={() => {
                form.setFieldsValue(personalData);
                setvisible(true);
              }}
            >
              Edit
            </Button>
          }
          style={{ flex: "1 1 320px", minWidth: 280, width: "100%" }}
        >
          <div style={{ display: "grid", rowGap: 20 }}>
            <div className="cardinfo-content">
              <span>Full Name</span>
              <span className="cardinfo-data">{personalData.fullName}</span>
            </div>
            <div className="cardinfo-content">
              <span>Father's Name</span>
              <span className="cardinfo-data">{personalData.fname}</span>
            </div>
            <div className="cardinfo-content">
              <span>Gender</span>
              <span className="cardinfo-data">{personalData.gender}</span>
            </div>
            <div className="cardinfo-content">
              <span>Date of Birth</span>
              <span className="cardinfo-data">{personalData.dob}</span>
            </div>
            <div className="cardinfo-content">
              <span>CNIC</span>
              <span className="cardinfo-data">{personalData.cnic}</span>
            </div>
            <div className="cardinfo-content">
              <span>Blood Group</span>
              <span className="cardinfo-data">{personalData.bloodGroup}</span>
            </div>
            <div className="cardinfo-content">
              <span>Nationality</span>
              <span className="cardinfo-data">{personalData.nationality}</span>
            </div>
            <div className="cardinfo-content">
              <span>Marital Status</span>
              <span className="cardinfo-data">
                {personalData.maritalStatus}
              </span>
            </div>
          </div>
        </Card>
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar
                shape="square"
                style={{ background: "#307EF8" }}
                icon={<PhoneFilled />}
              />
              <span>Contact Information</span>
            </div>
          }
          extra={
            <Button
              icon={<EditOutlined></EditOutlined>}
              onClick={() => {
                contactForm.setFieldsValue(contactData);
                setContactVisible(true);
              }}
            >
              Edit
            </Button>
          }
          style={{ flex: "1 1 320px", minWidth: 280, width: "100%" }}
        >
          <div style={{ display: "grid", rowGap: 20 }}>
            <div className="cardinfo-content">
              <span>University Email</span>
              <span className="cardinfo-data">
                {contactData.universityEmail}
              </span>
            </div>
            <div className="cardinfo-content">
              <span>Personal Email</span>
              <span className="cardinfo-data">{contactData.personalEmail}</span>
            </div>
            <div className="cardinfo-content">
              <span>Phone</span>
              <span className="cardinfo-data">{contactData.phone}</span>
            </div>
            <div className="cardinfo-content">
              <span>Emergency Contact</span>
              <span className="cardinfo-data">
                {contactData.emergencyContact}
              </span>
            </div>
            <div className="cardinfo-content">
              <span>Current Address</span>
              <span className="cardinfo-data">
                {contactData.currentAddress}
              </span>
            </div>
            <div className="cardinfo-content">
              <span>Permanent Address</span>
              <span className="cardinfo-data">
                {contactData.permanentAddress}
              </span>
            </div>
          </div>
        </Card>
      </div>
      <Modal
        title="Edit Personal info"
        open={visible}
        onOk={() => setvisible(false)}
        onCancel={() => setvisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={personalFormHandler}
          layout="vertical"
          initialValues={personalData}
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input type="text" placeholder="Enter Your Name"></Input>
          </Form.Item>
          <Form.Item
            label="Father's Name"
            name="fname"
            rules={[{ required: true }]}
          >
            <Input type="text" placeholder="Enter Your Father Name"></Input>
          </Form.Item>
          <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
            <Input type="text" placeholder="Enter Your Gender"></Input>
          </Form.Item>
          <Form.Item label="Phone No" name="phone" rules={[{ required: true }]}>
            <Input type="number" placeholder="Enter Your Phone"></Input>
          </Form.Item>
          <Form.Item label="CNIC" name="cnic">
            <Input type="number" placeholder="Enter Your CNIC number"></Input>
          </Form.Item>
          <Form.Item
            label="Nationality"
            name="nationality"
            rules={[{ required: true }]}
          >
            <Input type="text" placeholder="Enter Your Nationality"></Input>
          </Form.Item>
          <Form.Item label="Date of Birth" name="dob">
            <Input type="date"></Input>
          </Form.Item>
          <Form.Item label="Blood Group" name="bloodGroup">
            <Input type="text" placeholder="Enter Your Blood Group"></Input>
          </Form.Item>
          <Form.Item label="Marital Status" name="maritalStatus">
            <Input type="text" placeholder="Enter Your Marital Status"></Input>
          </Form.Item>
          <Button htmlType="submit" type="primary">
            Submit
          </Button>
        </Form>
      </Modal>
      <Modal
        title="Edit Contact Info"
        open={contactVisible}
        onOk={() => setContactVisible(false)}
        onCancel={() => setContactVisible(false)}
        footer={null}
      >
        <Form
          form={contactForm}
          onFinish={contactFormHandler}
          layout="vertical"
          initialValues={contactData}
        >
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
      <Modal
        title="Edit Profile "
        open={profileVisible}
        onOk={() => setProfileVisible(false)}
        onCancel={() => setProfileVisible(false)}
        footer={null}
      >
        <Form
          form={profileForm}
          onFinish={profileFormHandler}
          layout="vertical"
          initialValues={profileData}
        >
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
    </>
  );
}
export default Profile;
