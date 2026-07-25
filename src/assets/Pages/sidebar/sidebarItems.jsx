import React from "react";
import {
  AppstoreOutlined,
  AuditOutlined,
  BookOutlined,
  WalletOutlined,
  HomeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

const sidebarItems = [
  { key: "1", label: "Dashboard", icon: <AppstoreOutlined /> },
  { key: "2", label: "AI Copilot", icon: <AuditOutlined /> },
  { key: "3", label: "Academic", icon: <BookOutlined /> },
  { key: "4", label: "Hostel", icon: <HomeOutlined /> },
  { key: "5", label: "Expense", icon: <WalletOutlined /> },
  { key: "6", label: "Complaints", icon: <InfoCircleOutlined /> },
  { key: "7", label: "Profile", icon: <UserOutlined /> },
  { key: "8", label: "Setting", icon: <SettingOutlined /> },
];

export default sidebarItems;
