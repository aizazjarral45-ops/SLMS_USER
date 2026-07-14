import logo from "../../Images/slms.png";
import {
  BellOutlined,
  NotificationOutlined,
  QwenFilled,
  LogoutOutlined,
} from "@ant-design/icons";
import "./header.css";
import Search from "antd/es/transfer/search";

function Header() {
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="search">
        <Search placeholder="Search..." />
      </div>
      <div className="icons">
        <QwenFilled />
        <BellOutlined />

        <LogoutOutlined />
      </div>
    </div>
  );
}

export default Header;
