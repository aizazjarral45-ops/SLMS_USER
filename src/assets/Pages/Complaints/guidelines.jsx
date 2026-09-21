import {
  CalendarOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  PaperClipOutlined,
  WarningOutlined,
} from "@ant-design/icons";

export const guidanceItems = () => [
  {
    icon: <PaperClipOutlined style={{ color: "#1890ff" }} />,
    text: "Take ownership of your complaint: explain the issue clearly and attach evidence or screenshots.",
  },
  {
    icon: <WarningOutlined style={{ color: "#fa8c16" }} />,
    text: "Set the priority yourself. Use High only for safety risks, exam disruption, or issues needing immediate action.",
  },
  {
    icon: <EnvironmentOutlined style={{ color: "#52c41a" }} />,
    text: "Enter the exact location, room, device, or service affected so the right team can resolve it faster.",
  },
  {
    icon: <InboxOutlined style={{ color: "#1890ff" }} />,
    text: "Review your details before submitting, then track the complaint status and respond to follow-up requests.",
  },
  {
    icon: <CalendarOutlined style={{ color: "#fa8c16" }} />,
    text: "Record when the issue started, add updates as it changes, and close the complaint after confirming the solution.",
  },
];
