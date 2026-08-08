import logo from "../../Images/slms.png";
import {
  BellOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import "./header.css";
import { Button } from "antd";
import { useEffect, useState } from "react";
import Search from "antd/es/transfer/search.js";

function Header() {
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
            />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder" />
          )}
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
