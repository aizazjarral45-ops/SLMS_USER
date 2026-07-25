import "./App.css";
import React, { useState } from "react";
import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import Header from "./assets/Pages/Header/header";
import Sidebar from "./assets/Pages/sidebar/sidebar";
import Profile from "./assets/Pages/Profile/profile";
import sidebarItems from "./assets/Pages/sidebar/sidebarItems";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Header />
      <Layout className="app-body">
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={220}
          theme="dark"
          className="app-sidebar"
        >
          <Sidebar items={sidebarItems} />
        </Sider>
        <Content className="app-content">
          <Profile />
          <h1>Add File Name below there</h1>
          <h3>here</h3>
          <h4>
            create a content in your own pages that is created in pages section
            only add a file name here and when you start your project please commit this lines
          </h4>HOPE FOR THE BEST<h4/>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
