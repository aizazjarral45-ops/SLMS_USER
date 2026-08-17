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
    text: "Add clear evidence or screenshots for faster review.",
  },
  {
    icon: <WarningOutlined style={{ color: "#fa8c16" }} />,
    text: "Mark truly urgent issues as High priority only when they affect safety or exams.",
  },
  {
    icon: <EnvironmentOutlined style={{ color: "#52c41a" }} />,
    text: "Hostel and IT complaints usually resolve fastest when the exact location is included.",
  },
  {
    icon: <InboxOutlined style={{ color: "#1890ff" }} />,
    text: "Attach any relevant reference details to avoid delays and reduce follow-up questions.",
  },
  {
    icon: <CalendarOutlined style={{ color: "#fa8c16" }} />,
    text: "Include date and time when the issue occurred to help the support team investigate accurately.",
  },
];
