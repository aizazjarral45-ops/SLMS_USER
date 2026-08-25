import logo from "../../Images/slms.png";
import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import "./header.css";
import { Badge, Button } from "antd";
import { useNavigate } from "react-router-dom";

function Header({
  profileData = {},
  unreadNotificationCount = 0,
  onToggleSidebar,
  onLogout,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate("/login", { replace: true });
  };

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
      <div className="icons">
        <Button
          onClick={() => navigate("/aicopilot")}
          className="header-icon-button"
          type="text"
          icon={<RobotOutlined />}
          aria-label="Open AI Copilot"
        />
        <Badge
          className="header-notification-badge"
          count={unreadNotificationCount}
          overflowCount={99}
          size="small"
        >
          <Button
            className="header-icon-button"
            type="text"
            icon={<BellOutlined />}
            aria-label={
              unreadNotificationCount
                ? `${unreadNotificationCount} unread notifications`
                : "Notifications"
            }
            onClick={() => navigate("/notifications")}
          />
        </Badge>
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
              {profileData.name || "Student"}
            </div>
            <div className="student-dept" onClick={() => navigate("/profile")}>
              {profileData.department || "Profile not completed"}
            </div>
          </div>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            className="header-icon-button header-logout-button"
            aria-label="Log out"
            onClick={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
