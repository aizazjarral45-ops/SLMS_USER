import "./App.css";
import React from "react";
import Header from "./assets/Pages/Header/header";
import Sidebar from "./assets/Pages/sidebar/sidebar";
import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";

function App() {
  return (
    <>
      <Header /> <Sidebar /> 
      <Layout>
      
        <Layout>
          <Content className="content">
            {/* <h1>Add content here</h1> */}
          
         
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
export default App;
