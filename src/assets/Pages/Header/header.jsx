import logo from "../../Images/slms.png";
import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import "./header.css";
import { Badge, Button, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";

function Header({
  profileData = {},
  unreadNotificationCount = 0,
  onNotificationsOpen,
  onToggleSidebar,
  onLogout,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await onLogout?.();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleButtonMouseEnter = (event) => {
    event.currentTarget.style.transform = "scale(1.2)";
  };

  const handleButtonMouseLeave = (event) => {
    event.currentTarget.style.transform = "scale(1)";
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
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        />
        <div type="text" className="logo">
          <img
            src={logo}
            alt="SLMS"
            style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
            onClick={() => navigate("/dashboard")}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "scale(1)";
            }}
          />
        </div>
      </div>
      <div className="icons">
        <Button
          onClick={() => navigate("/aicopilot")}
          className="header-icon-button"
          type="text"
          icon={<RobotOutlined />}
          aria-label="Open AI Copilot"
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
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
            icon={<BellOutlined/>}
            aria-label={
              unreadNotificationCount
                ? `${unreadNotificationCount} unread notifications`
                : "Notifications"
            }
            onClick={() => {
              onNotificationsOpen?.();
              navigate("/notifications");
            }}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
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
              {profileData.studentId || "Student"}
            </div>
            <div className="student-dept" onClick={() => navigate("/profile")}>
              {profileData.department || "Profile not completed"}
            </div>
          </div>
          <Popconfirm
            title="Confirm Logout"
            description="Are you sure you want to log out?"
            onConfirm={handleLogout}
            okText="Log out"
            cancelText="Cancel"
          >
            <Button
              type="text"
              icon={<LogoutOutlined />}
              className="header-icon-button header-logout-button"
              aria-label="Log out"
              onMouseEnter={handleButtonMouseEnter}
              onMouseLeave={handleButtonMouseLeave}
            />
          </Popconfirm>
        </div>
      </div>
    </header>
  );
}

export default Header;
