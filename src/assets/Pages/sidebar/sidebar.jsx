import React, { useState } from "react";
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
import { Breadcrumb, Layout, Menu, theme } from "antd";
import Link from "antd/es/typography/Link";
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem("Dashboard", "1", <AppstoreOutlined />),
  getItem("AI Copilot", "2", <AuditOutlined />),
  getItem("Academic", "3", <BookOutlined />),
  getItem("Hostel", "4", <HomeOutlined />),
  getItem("Expense ", "5", <WalletOutlined />),
  getItem("Complaints", "6", <InfoCircleOutlined />),
  getItem("Profile", "7", <UserOutlined />),
  getItem("Setting", "8", <SettingOutlined />),
];
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const currentYear = new Date().getFullYear();
  return (
    <Layout style={{ minHeight: "100vh", margin: "-8px" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: "#1E3A8A", paddingTop: "0px" }}
      >
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
          style={{ background: "#1E3A8A" }}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: "0 16px" }}>
         
        </Content>
      </Layout>
    </Layout>
  );
};
export default Sidebar;
