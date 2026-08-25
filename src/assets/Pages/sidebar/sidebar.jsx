import React from "react";
import {
  AppstoreOutlined,
  RobotOutlined,
  BookOutlined,
  WalletOutlined,
  HomeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "antd";

function Sidebar({ onNavigate }) {
  const location = useLocation();
  const path = location.pathname;
  const selectedKey = (() => {
    if (path === "/" || path === "/dashboard") return "1";
    if (path === "/aicopilot") return "2";
    if (path === "/academic") return "3";
    if (path === "/hostel") return "4";
    if (path === "/expense") return "5";
    if (path === "/complaints") return "6";
    if (path === "/profile") return "7";
    if (path === "/setting") return "8";

    return "1";
  })();

  return (
    <nav className="sidebar-navigation" aria-label="Main navigation">
      <div className="sidebar-menu-label">MENU</div>
      <Menu
        theme="dark"
        selectedKeys={[selectedKey]}
        mode="inline"
        onClick={onNavigate}
        style={{ background: "#1E3A8A" }}
        items={[
          {
            key: "1",
            icon: <AppstoreOutlined />,
            label: <Link to="/">Dashboard</Link>,
          },
          {
            key: "2",
            icon: <RobotOutlined />,
            label: <Link to="/aicopilot">AI Copilot</Link>,
          },
          {
            key: "3",
            icon: <BookOutlined />,
            label: <Link to="/academic">Academic</Link>,
          },
          {
            key: "4",
            icon: <HomeOutlined />,
            label: <Link to="/hostel">Hostel</Link>,
          },
          {
            key: "5",
            icon: <WalletOutlined />,
            label: <Link to="/expense">Expense</Link>,
          },
          {
            key: "6",
            icon: <InfoCircleOutlined />,
            label: <Link to="/complaints">Complaints</Link>,
          },
          {
            key: "7",
            icon: <UserOutlined />,
            label: <Link to="/profile">Profile</Link>,
          },
          {
            key: "8",
            icon: <SettingOutlined />,
            label: <Link to="/setting">Settings</Link>,
          },
        ]}
      />
    </nav>
  );
}

export default Sidebar;
