import React, { useState } from "react";
import {
  AuditOutlined,
  BookOutlined,
  FileOutlined,
  HomeOutlined,
  PieChartOutlined,
  SettingOutlined,
  CommentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
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
  getItem("Dashboard", "1", <PieChartOutlined />),
  getItem("AI Copilot", "2", <AuditOutlined />),
  getItem("Academic", "3", <BookOutlined />),
  getItem("Hostel", "4", <HomeOutlined />),
  getItem("Expense ", "5", <FileOutlined />),
  getItem("Complaints", "6", <CommentOutlined />),
  getItem("Profile", "7", <UserOutlined />),
  getItem("Setting", "8", <SettingOutlined />),
];
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  // const {
  //   token: { colorBgContainer, borderRadiusLG },
  // } = theme.useToken();
  const currentYear = new Date().getFullYear();
  return (
    <Layout style={{ minHeight: "100vh", margin: "-8px" }}>
      
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: "#1E3A8A", paddingTop: "20px"}}
      >
        <div style={{ color: '#ffffff', fontSize: '30px', fontWeight: 400,paddingBottom:"40px",alignItems:"center",justifyContent:"center",display:"flex" }}>SLMS logo</div>
        <div />
        
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
          style={{ background: "#1E3A8A" }}
        />
      </Sider>
      <Layout>
        {/* <Header style={{ background:" #1E3A8A"}} />
        <Content style={{ margin: "0px 30px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "TITLE" }, { title: "NAME" }]}
          />
          <div
            style={{
              padding: 24,             
              borderRadius: "borderRadiusLG",
            }}
          >
            CONTENT
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>create a footer</Footer> */}
      </Layout>
    </Layout>
  );
};
export default Sidebar;
