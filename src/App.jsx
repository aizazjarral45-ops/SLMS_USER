import "./App.css";
import React, { useState } from "react";
import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import Header from "./assets/Pages/Header/header";
import Sidebar from "./assets/Pages/sidebar/sidebar";
import Profile from "./assets/Pages/Profile/profile";
import Settings from "./assets/Pages/Setting/Setting";
import Complaints from "./assets/Pages/Complaints/Complaints";
import Hostel from "./assets/Pages/Hostel/Hostel";
import Expense from "./assets/Pages/Expense/Expense";
import Academic from "./assets/Pages/Academic/Academic";
import { Routes, Route } from "react-router-dom";
import Copilot from "./assets/Pages/Ai-chatbot/aicopilot";

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
          <Sidebar />
        </Sider>
        <Content className="app-content">
          <Routes>
            
            <Route path="/aicopilot" element={<Copilot />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/setting" element={<Settings />} />
            <Route path="/hostel" element={<Hostel />} />
            <Route path="/academic" element={<Academic />} />
          </Routes>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
