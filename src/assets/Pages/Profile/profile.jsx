import "./profile.css";
import { useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PhoneFilled,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Flex, Form, message, Modal, Upload } from "antd";
import { PersonalModal } from "./Modal";
import { ContactModal } from "./contactmodal";
import { ProfileModal } from "./profilemodal";
import { loadSharedData, persistSharedData } from "../../../data/sharedData";

const emptyProfile = { personalData: {}, profileData: {}, contactData: {} };
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
const displayValue = (value) => value || "Not provided";

function Profile({ profile: profileProp, onProfileChange, onResetProfile, onAddNotification }) {
  const [fallbackProfile, setFallbackProfile] = useState(emptyProfile);
  const profile = profileProp || fallbackProfile;
  const setProfile = (nextValue) => {
    if (onProfileChange) {
      onProfileChange((current) =>
        typeof nextValue === "function"
          ? nextValue(current || emptyProfile)
          : nextValue,
      );
      return;
    }
    setFallbackProfile((current) =>
      typeof nextValue === "function" ? nextValue(current) : nextValue,
    );
  };

  const [personalVisible, setPersonalVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personalForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const personalData = profile.personalData || {};
  const profileData = profile.profileData || {};
  const contactData = profile.contactData || {};
  const imageUrl = profileData.profileImage || null;

  const updateSection = (section, values) => {
    setProfile((current) => ({
      ...current,
      [section]: { ...(current?.[section] || {}), ...values },
    }));
  };

  const savePersonal = (values) => {
    updateSection("personalData", values);
    setPersonalVisible(false);
    messageApi.success("Personal information updated.");

    // create a persistent notification for profile update
    try {
      const note = {
        id: `profile-updated:${Date.now()}`,
        title: "Profile submitted",
        description: "Your personal information has been updated successfully.",
        type: "reminder",
        module: "profile",
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
      };
      if (typeof onAddNotification === "function") {
        onAddNotification(note);
      } else {
        const shared = loadSharedData();
        const next = {
          ...shared,
          settings: {
            ...shared.settings,
            customNotifications: [
              ...(shared.settings?.customNotifications || []),
              note,
            ],
          },
        };
        persistSharedData(next);
      }
    } catch (e) {
      // non-fatal
    }
  };
  const saveContact = (values) => {
    updateSection("contactData", values);
    setContactVisible(false);
    messageApi.success("Contact information updated.");

    try {
      const note = {
        id: `profile-contact-updated:${Date.now()}`,
        title: "Profile submitted",
        description: "Your contact information has been updated successfully.",
        type: "reminder",
        module: "profile",
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
      };
      if (typeof onAddNotification === "function") {
        onAddNotification(note);
      } else {
        const shared = loadSharedData();
        const next = {
          ...shared,
          settings: {
            ...shared.settings,
            customNotifications: [
              ...(shared.settings?.customNotifications || []),
              note,
            ],
          },
        };
        persistSharedData(next);
      }
    } catch (e) {
      // non-fatal
    }
  };
  const saveProfile = (values) => {
    updateSection("profileData", values);
    setProfileVisible(false);
    messageApi.success("Profile details updated.");

    try {
      const note = {
        id: `profile-details-updated:${Date.now()}`,
        title: "Profile submitted",
        description: "Your profile details have been updated successfully.",
        type: "reminder",
        module: "profile",
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
      };
      if (typeof onAddNotification === "function") {
        onAddNotification(note);
      } else {
        const shared = loadSharedData();
        const next = {
          ...shared,
          settings: {
            ...shared.settings,
            customNotifications: [
              ...(shared.settings?.customNotifications || []),
              note,
            ],
          },
        };
        persistSharedData(next);
      }
    } catch (e) {
      // non-fatal
    }
  };

  const uploadImage = async (file) => {
    const validType = ["image/jpeg", "image/png", "image/webp"].includes(
      file.type,
    );
    const validSize = file.size / 1024 / 1024 < 2;
    if (!validType) {
      messageApi.error("Use a JPG, PNG, or WEBP image.");
      return Upload.LIST_IGNORE;
    }
    if (!validSize) {
      messageApi.error("Image must be smaller than 2 MB.");
      return Upload.LIST_IGNORE;
    }
    setLoading(true);
    try {
      const profileImage = await getBase64(file);
      updateSection("profileData", { profileImage });
      messageApi.success("Profile photo updated.");
    } catch {
      messageApi.error("Unable to read this image. Please try another file.");
    } finally {
      setLoading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const resetProfile = () => {
    const confirmed = window.confirm(
      "Reset all profile information stored for this student?",
    );
    if (!confirmed) return;
    if (onResetProfile) onResetProfile();
    else setProfile(emptyProfile);
    personalForm.resetFields();
    contactForm.resetFields();
    profileForm.resetFields();
    setPersonalVisible(false);
    setProfileVisible(false);
    setContactVisible(false);
    setPreviewVisible(false);
    messageApi.success("Profile information has been reset.");
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const profileFields = [
    ["Roll No", profileData.rollNo],
    ["Department", profileData.department],
    ["Semester", profileData.semester],
    ["Batch", profileData.batch],
    ["Sessions", profileData.sessions],
  ];
  const personalFields = [
    ["Full Name", personalData.fullName],
    ["Father's Name", personalData.fname],
    ["Gender", personalData.gender],
    ["Date of Birth", personalData.dob],
    ["CNIC", personalData.cnic],
    ["Blood Group", personalData.bloodGroup],
    ["Nationality", personalData.nationality],
    ["Marital Status", personalData.maritalStatus],
  ];
  const contactFields = [
    ["University Email", contactData.universityEmail],
    ["Personal Email", contactData.personalEmail],
    ["Phone", contactData.phone],
    ["Emergency Contact", contactData.emergencyContact],
    ["Current Address", contactData.currentAddress],
    ["Permanent Address", contactData.permanentAddress],
  ];
  const infoRows = (fields) =>
    fields.map(([label, value]) => (
      <div className="cardinfo-content" key={label}>
        <span>{label}</span>
        <span className="cardinfo-data">{displayValue(value)}</span>
      </div>
    ));

  return (
    <>
      {contextHolder}
      <div className="profile-card">
        <div className="gradient">
          <Button
            style={{ color: "white" }}
            type="text"
            icon={<EditOutlined />}
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
                    alt="Profile"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => setPreviewVisible(true)}
                  />
                ) : (
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader"
                    showUploadList={false}
                    beforeUpload={uploadImage}
                  >
                    {uploadButton}
                  </Upload>
                )}
              </div>
            </Flex>
          </div>
        </div>
        <div style={{ padding: "0 20px 20px", boxSizing: "border-box" }}>
          <div className="profile-name">{profileData.name || "Your Name"}</div>
          <div className="profile-bio">
            {profileData.department
              ? `${profileData.department} Student`
              : "Department not provided"}
          </div>
        </div>
        <div
          className="cardrapper"
          style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}
        >
          {profileFields.map(([label, value]) => (
            <div
              className="card"
              style={{ flex: "1 1 180px", minWidth: 140 }}
              key={label}
            >
              <div className="info">{label}</div>
              <div className="detail">{displayValue(value)}</div>
            </div>
          ))}
        </div>
      </div>
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
              icon={<EditOutlined />}
              onClick={() => {
                personalForm.setFieldsValue(personalData);
                setPersonalVisible(true);
              }}
            >
              Edit
            </Button>
          }
          style={{ flex: "1 1 320px", minWidth: 280, width: "100%" }}
        >
          <div style={{ display: "grid", rowGap: 20 }}>
            {infoRows(personalFields)}
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
              icon={<EditOutlined />}
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
            {infoRows(contactFields)}
          </div>
        </Card>
      </div>
      <Card className="danger-card">
        <div className="danger-title">Profile data</div>
        <div className="danger-content">
          Reset the personal, contact, and profile information stored in this
          student workspace. This does not remove academic, hostel, expense,
          complaint, or settings records.
        </div>
        <div className="resetbutton">
          <Button danger onClick={resetProfile} icon={<DeleteOutlined />}>
            Reset Profile Data
          </Button>
        </div>
      </Card>
      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        form={profileForm}
        initialValues={profileData}
        onFinish={saveProfile}
        imageUrl={imageUrl}
        uploadButton={uploadButton}
        beforeUpload={uploadImage}
      />
      <PersonalModal
        visible={personalVisible}
        onClose={() => setPersonalVisible(false)}
        form={personalForm}
        initialValues={personalData}
        onFinish={savePersonal}
      />
      <ContactModal
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
        form={contactForm}
        initialValues={contactData}
        onFinish={saveContact}
      />
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {imageUrl && (
          <img
            alt="Profile preview"
            style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            src={imageUrl}
          />
        )}
      </Modal>
    </>
  );
}

export default Profile;
