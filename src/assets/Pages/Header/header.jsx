import logo from "../../Images/slms.png";
import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import "./header.css";
import { Button } from "antd";
import Search from "antd/es/transfer/search.js";
import { useNavigate } from "react-router-dom";

function Header({ profileData = {}, onToggleSidebar }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-brand">
        <Button
          className="header-menu-toggle"
          type="text"
          icon={<MenuOutlined />}
          aria-label="Open navigation menu"
          onClick={onToggleSidebar}
        />
        <div className="logo">
          <img src={logo} alt="SLMS" />
        </div>
      </div>
      <div className="search">
        <Search placeholder="Search here" />
      </div>
      <div className="icons">
        <Button
          onClick={() => navigate("/aicopilot")}
          className="header-icon-button"
          type="text"
          icon={<RobotOutlined />}
          aria-label="Open AI Copilot"
        />
        <Button
          className="header-icon-button"
          type="text"
          icon={<BellOutlined />}
          aria-label="Notifications"
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
          <div className="header-profile-copy">
            <div className="student-name" onClick={() => navigate("/profile")}>
              {profileData.name || "student name"}
            </div>
            <div className="student-dept" onClick={() => navigate("/profile")}>
              {profileData.department || "department"}
            </div>
          </div>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            className="header-icon-button header-logout-button"
            aria-label="Log out"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
