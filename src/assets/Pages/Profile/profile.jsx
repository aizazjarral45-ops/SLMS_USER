import "./profile.css";
import React, { useState } from "react";
import {
  EditOutlined,
  LoadingOutlined,
  DeleteOutlined,
  PhoneFilled,
  PlusOutlined,
  PullRequestOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Flex, Form, message, Modal, Upload } from "antd";
import { PersonalModal } from "./Modal";
import { ContactModal } from "./contactmodal";
import { ProfileModal } from "./profilemodal";
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};
function Profile() {
  const [visible, setvisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [personalform] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [personalData, setPersonalData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("personalData")) || {};
    } catch {
      return {};
    }
  });
  const [profileData, setProfileData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profileData")) || {};
    } catch {
      return {};
    }
  });
  const [contactData, setContactData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("contactData")) || {};
    } catch {
      return {};
    }
  });
  const [messageApi, contextHolder] = message.useMessage();
  const personalFormHandler = (value) => {
    const updatedPersonal = { ...personalData, ...value };
    setPersonalData(updatedPersonal);
    localStorage.setItem("personalData", JSON.stringify(updatedPersonal));
    messageApi.success("Personal Information updated");
    setvisible(false);
  };
  const contactFormHandler = (value) => {
    const updatedContact = { ...contactData, ...value };
    setContactData(updatedContact);
    localStorage.setItem("contactData", JSON.stringify(updatedContact));
    setContactVisible(false);
    messageApi.success("Contact information updated");
  };
  const profileFormHandler = (value) => {
    const updatedProfile = { ...profileData, ...value };
    setProfileData(updatedProfile);
    localStorage.setItem("profileData", JSON.stringify(updatedProfile));
    setProfileVisible(false);
    messageApi.success("Profile details updated");
  };
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    () => localStorage.getItem("profileImageUrl") || null,
  );
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
        localStorage.setItem("profileImageUrl", url);
      });
    }
  };
  const [previewVisible, setPreviewVisible] = useState(false);
  const handlePreview = () => {
    if (imageUrl) {
      setPreviewVisible(true);
    }
  };

  const resetAllProfileData = () => {
    const confirmed = window.confirm(
      "This will clear all profile data saved on this page. If you are agree than Continue",
    );

    if (!confirmed) return;

    localStorage.removeItem("personalData");
    localStorage.removeItem("profileData");
    localStorage.removeItem("contactData");
    localStorage.removeItem("profileImageUrl");

    setPersonalData({});
    setProfileData({});
    setContactData({});
    setImageUrl(null);
    setLoading(false);
    setvisible(false);
    setProfileVisible(false);
    setContactVisible(false);
    setPreviewVisible(false);
    personalform.resetFields();
    profileForm.resetFields();
    contactForm.resetFields();
    messageApi.success("All profile data has been reset succesfully");
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  const renderPreviewModal = () => (
    <Modal
      open={previewVisible}
      footer={null}
      onCancel={() => setPreviewVisible(false)}
    >
      {imageUrl && (
        <img
          alt="profile preview"
          style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          src={imageUrl}
        />
      )}
    </Modal>
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
              <div style={{ textAlign: "center" }}>
                {imageUrl ? (
                  <img
                    draggable={false}
                    src={imageUrl}
                    alt="avatar"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={handlePreview}
                  />
                ) : (
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                  >
                    {uploadButton}
                  </Upload>
                )}
              </div>
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
      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        form={profileForm}
        initialValues={profileData}
        onFinish={profileFormHandler}
        imageUrl={imageUrl}
        uploadButton={uploadButton}
        beforeUpload={beforeUpload}
        handleChange={handleChange}
      />
      {renderPreviewModal()}
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
          className="personal-card"
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
                personalform.setFieldsValue(personalData);
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
          className="contact-card"
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

      <PersonalModal
        visible={visible}
        onClose={() => setvisible(false)}
        form={personalform}
        initialValues={personalData}
        onFinish={personalFormHandler}
      />
      <ContactModal
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
        form={contactForm}
        initialValues={contactData}
        onFinish={contactFormHandler}
      />
      <Card className="danger-card">
        <div className="danger-title">Danger Zone</div>
        <div className="danger-content">
          If you no longer wish to use your account, you can permanently delete<br/>
          it along with all associated data, including your profile, settings,<br/>
          uploaded content, and activity history. Once deletion is confirmed,<br/>
          the process will begin immediately and cannot be reversed. Please make<br/>
          sure you've saved any information you'd like to keep before
          proceeding.
        </div>
        <div className="resetbutton">
          <Button danger onClick={resetAllProfileData} icon={<DeleteOutlined />}>
            Reset All Data
          </Button>
        </div>
      </Card>
    </>
  );
}
export default Profile;
