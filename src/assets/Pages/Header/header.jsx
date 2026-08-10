import logo from "../../Images/slms.png";
import { BellOutlined, LogoutOutlined, RobotOutlined } from "@ant-design/icons";
import "./header.css";
import { Button } from "antd";
import { useEffect, useState } from "react";
import Search from "antd/es/transfer/search.js";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [profileData, setProfile] = useState({});
  useEffect(() => {
    try {
      const stored = localStorage.getItem("profileData");
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, []);

  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="search">
        <Search placeholder="Search here"></Search>
      </div>
      <div className="icons">
        <Button
          onClick={() => navigate("/aicopilot")}
          style={{
            color: "#fff",
            fontSize: 25,
          }}
          type="text"
          icon={<RobotOutlined />}
        />
        <Button
          style={{
            color: "#fff",
            fontSize: 25,
          }}
          type="text"
          icon={<BellOutlined />}
        />
        <div className="profile-parent">
          {profileData.profileImage ? (
            <img
              className="profile-avatar"
              src={profileData.profileImage}
              alt="profile"
              onClick={() => navigate("/profile")}
            />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder" />
          )}
          <div>
            <div className="student-name"   onClick={() => navigate("/profile")}>
              {profileData.name || "student name"}
            </div>
            <div className="student-dept"   onClick={() => navigate("/profile")}>
              {profileData.department || "department"}
            </div>
          </div>
          <Button type="text" icon={<LogoutOutlined />} 
           style={{
            color: "#fff",
            fontSize: 25,
          }}>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Header;
