import React from "react";
import { Menu } from "antd";
import sidebarItems from "./sidebarItems";

const Sidebar = ({ items = sidebarItems }) => {
  return (
    <Menu
      theme="dark"
      defaultSelectedKeys={["1"]}
      mode="inline"
      items={items}
      style={{ background: "#1E3A8A" }}
    />
  );
};

export default Sidebar;