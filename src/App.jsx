import React from "react";
import Header from "./assets/Pages/Header/header";
import Sidebar from "./assets/Pages/sidebar/sidebar";
import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";

import "./App.css";
// import Profile from "./assets/Pages/Profile/profile";


function App() {
  return (
    <>
      <Header />
      <Layout>
        <Sider style={{ marginTop: "8px" }}>
          <Sidebar />
        </Sider>
        <Layout>
          <Content className="content">
            {/* <h1>Add content here</h1> */}
          
            {/* <Profile></Profile> */}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default App;
