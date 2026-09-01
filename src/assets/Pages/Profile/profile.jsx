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
import {
  Avatar,
  Button,
  Card,
  Flex,
  Form,
  message,
  Modal,
  Popconfirm,
  Upload,
} from "antd";
import { PersonalModal } from "./Modal";
import { ContactModal } from "./contactmodal";
import { ProfileModal } from "./profilemodal";
import { loadSharedData, persistSharedData } from "../../../data/sharedData";
import { isApiConfigured, request } from "../../../api/client";

const emptyProfile = { personalData: {}, profileData: {}, contactData: {} };
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
const displayValue = (value) => value || "Not provided";
const profileSections = (profile) => ({
  personalData: profile,
  profileData: profile,
  contactData: profile,
});

function Profile({
  profile: profileProp,
  onProfileChange,
  onResetProfile,
  onAddNotification,
}) {
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

  const savePersonal = async (values) => {
    const nextProfile = { ...personalData, ...values };
    if (isApiConfigured) {
      const result = await request("/students/profile", {
        method: "PUT",
        body: { ...profileData, ...contactData, ...nextProfile },
      });
      setProfile((current) => ({
        ...current,
        ...profileSections(result.profile || nextProfile),
      }));
    } else updateSection("personalData", values);
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
  const saveContact = async (values) => {
    const nextContact = { ...contactData, ...values };
    if (isApiConfigured) {
      const result = await request("/students/profile", {
        method: "PUT",
        body: { ...profileData, ...personalData, ...nextContact },
      });
      setProfile((current) => ({
        ...current,
        ...profileSections(result.profile || nextContact),
      }));
    } else updateSection("contactData", values);
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
  const saveProfile = async (values) => {
    const nextProfile = { ...profileData, ...values };
    if (isApiConfigured) {
      const result = await request("/students/profile", {
        method: "PUT",
        body: { ...personalData, ...contactData, ...nextProfile },
      });
      console.log("Profile updated:", result.profile || nextProfile);
      setProfile((current) => ({
        ...current,
        ...profileSections(result.profile || nextProfile),
      }));
    } else updateSection("profileData", values);
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
      if (isApiConfigured) {
        const result = await request("/students/profile", {
          method: "PUT",
          body: {
            ...personalData,
            ...profileData,
            ...contactData,
            profileImage,
          },
        });
        setProfile((current) => ({
          ...current,
          ...profileSections(
            result.profile || { ...current.profileData, profileImage },
          ),
        }));
      } else updateSection("profileData", { profileImage });
      messageApi.success("Profile photo updated.");
    } catch {
      messageApi.error("Unable to read this image. Please try another file.");
    } finally {
      setLoading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const handleResetProfile = () => {
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
    ["Student ID", profileData.studentId],
    ["Roll No", profileData.rollNo],
    ["Department", profileData.department],
    ["Semester", profileData.semester],
    ["Batch", profileData.batch],
    ["Sessions", profileData.sessions],
  ];
  const personalFields = [
    ["Full Name", personalData.fullName],
    ["Father's Name", personalData.fatherName],
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
          <div className="profile-name">{profileData.studentId || "Student"}</div>
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
          gap: 28,
          marginTop: 32,
          width: "100%",
          paddingBottom: 12,
        }}
      >
        <Card
          className="personal-card"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                shape="square"
                size={40}
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
                }}
                icon={<UserOutlined />}
              />
              <span>Personal Information</span>
            </div>
          }
          extra={
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                personalForm.setFieldsValue(personalData);
                setPersonalVisible(true);
              }}
              style={{
                color: "#1e3a8a",
                fontWeight: 500,
                borderRadius: 8,
              }}
            >
              Edit
            </Button>
          }
          style={{ flex: "1 1 340px", minWidth: 300, width: "100%" }}
          bodyStyle={{ padding: "20px 0" }}
        >
          <div
            style={{
              display: "grid",
              rowGap: 0,
              paddingLeft: 4,
              paddingRight: 4,
            }}
          >
            {infoRows(personalFields)}
          </div>
        </Card>
        <Card
          className="contact-card"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                shape="square"
                size={40}
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
                }}
                icon={<PhoneFilled />}
              />
              <span>Contact Information</span>
            </div>
          }
          extra={
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                contactForm.setFieldsValue(contactData);
                setContactVisible(true);
              }}
              style={{
                color: "#1e3a8a",
                fontWeight: 500,
                borderRadius: 8,
              }}
            >
              Edit
            </Button>
          }
          style={{ flex: "1 1 340px", minWidth: 300, width: "100%" }}
          bodyStyle={{ padding: "20px 0" }}
        >
          <div
            style={{
              display: "grid",
              rowGap: 0,
              paddingLeft: 4,
              paddingRight: 4,
            }}
          >
            {infoRows(contactFields)}
          </div>
        </Card>
      </div>
      <Card className="danger-card" bodyStyle={{ padding: "24px 28px" }}>
        <div className="danger-title">
          <DeleteOutlined style={{ fontSize: 18 }} />
          Profile Data Management
        </div>
        <div className="danger-content">
          Permanently reset the personal, contact, and profile information
          stored in this student workspace. This action does not affect
          academic, hostel, expense, complaint, or settings records.
        </div>
        <div className="resetbutton">
          <Popconfirm
            title="Reset Profile Data"
            description="Reset all profile information stored for this student?"
            onConfirm={handleResetProfile}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="large"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              Reset Profile Data
            </Button>
          </Popconfirm>
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
