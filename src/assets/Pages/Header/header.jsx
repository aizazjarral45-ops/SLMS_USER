import logo from "../../Images/slms.png";
import {
  BellOutlined,
  NotificationOutlined,
  QwenFilled,
  LogoutOutlined,
} from "@ant-design/icons";
import Profile from "../Profile/profile.jsx";
import "./header.css";
import { Card, Input } from "antd";
import { useEffect, useState } from "react";
import Search from "antd/es/transfer/search.js";


function Header() {
  const [profileData, setProfile] = useState({});
  useEffect(() => {
    try {
      const stored = localStorage.getItem("profileData");
      if (stored) setProfile(JSON.parse(stored));
    } catch (e) {}
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
        
        <QwenFilled />
        <BellOutlined />
        <LogoutOutlined />
        <div className="profile-parent">
          <img
            className="profile-avatar"
            src={profileData.profileImage || ""}
            alt={"profile"}
          />
          <div>
            <div className="student-name">
              {profileData.name || "student name"}
            </div>
            <div className="student-dept">
              {profileData.department || "department"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
