import React, { useState, useRef } from "react";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  List,
  Result,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  AudioOutlined,
  FontColorsOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./aicopilot.css";

const { Title, Paragraph, Text } = Typography;

const suggestedPrompts = [
  "Is any assignments in this week?",
  "How can I improve my attendance",
  "Create a study plan for my exams.",
  "Give me a hostel budget warning.",
];

const responseRules = [
  {
    keywords: ["assignment"],
    response:
      "You have two academic deadlines approaching: DBMS report on August 2, and AI reflection journal on August 6. Start with the DBMS report because it carries the heavier grade weight.",
  },
  {
    keywords: ["attendance"],
    response:
      "Your attendance looks strongest in Database Systems and weakest in Software Engineering. Aim for perfect attendance this week and review missed lecture notes within 24 hours.",
  },
  {
    keywords: ["budget", "expense"],
    response:
      "You are using your budget a little faster than planned. Reduce entertainment and transport spending for the next few days to stay within the monthly target.",
  },
  {
    keywords: ["hostel"],
    response:
      "For hostel-related help, prioritize active maintenance requests, leave approvals, and fee dues. If you want, I can summarize your current hostel dashboard next.",
  },
  {
    keywords: ["scholarship"],
    response:
      "Scholarship retention usually depends on GPA, attendance, and conduct. Based on your current academic snapshot, keeping attendance above 90% gives you the safest margin.",
  },
  {
    keywords: ["quiz", "exam"],
    response:
      "Your nearest assessment is AI Quiz 3, followed by the AI mid term on August 9, 2026. Spend the next two study blocks on AI topics, then switch to DBMS revision.",
  },
];

const defaultResponse =
  "I can help with academics, attendance, assignments, quizzes, exams, budgets, hostel requests, complaints, scholarships, university rules, and student services. Ask me something specific and I’ll narrow it down.";

function getResponse(prompt) {
  const text = prompt.toLowerCase();
  const rule = responseRules.find((item) =>
    item.keywords.some((keyword) => text.includes(keyword)),
  );

  return rule?.response || defaultResponse;
}

function Copilot() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(false);
  const timeoutRef = useRef(null);

  const recentTitle = messages[0]?.content?.slice(0, 40) || "New conversation";

  const undoLastPrompt = () => {
    setError(false);
    setTyping(false);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setMessages((current) => {
      if (current.length === 0) {
        return current;
      }

      const lastMessage = current[current.length - 1];
      const removeCount = lastMessage?.role === "assistant" ? 2 : 1;
      return current.slice(0, Math.max(0, current.length - removeCount));
    });
  };

  const submitPrompt = (value) => {
    const content = value.trim();
    if (!content) {
      return;
    }

    setError(false);
    setMessages((current) => [...current, { role: "user", content }]);
    setDraft("");
    setTyping(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      const shouldError = content.toLowerCase().includes("error state");
      if (shouldError) {
        setError(true);
        setTyping(false);
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: getResponse(content) },
      ]);
      setTyping(false);
    }, 900);
  };

  return (
    <>
   <div className="first-section">
      <Card className="copilot-header-card">
        <Space align="start">
          <div>
            <Tag icon={<RobotOutlined />} className="eyebrow">
              Student Copilot
            </Tag>
            <Title level={1} style={{color:"#fff",fontWeight:"bold"}}>
              Your intelligent SLMS assistant
            </Title>
            <Paragraph  style={{color:"#CED7F3"}}>
              Ask about academics, attendance, assignments, quizzes, exams,
              study plans, hostel,<br/> expenses, campus services, scholarships, and
              more.
            </Paragraph>
          </div>
        </Space>
      </Card>
      </div>
      <div className="copilot-page" style={{ display: "flex", gap: "16px", minHeight: "calc(100vh - 280px)" }}>
        <aside className="copilot-sidebar" style={{ flex: "0 0 280px", display: "flex", flexDirection: "column" }}>
          <Card className="copilot-sidebar-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "visible" }}>
            <Title level={4}>Recent Chats</Title>
            <List
              rowKey="id"
              dataSource={[
                {
                  id: "live",
                  title: recentTitle,
                  preview: "Current conversation",
                },
              ]}
              renderItem={(item) => (
                <List.Item className="copilot-recent-item">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<RobotOutlined />}
                        className="copilot-avatar"
                      />
                    }
                    title={item.title}
                    description={item.preview}
                  />
                </List.Item>
              )}
            />
            <Card className="copilot-panel" title="Suggested Prompts">
              <div className="copilot-chip-group">
                {suggestedPrompts.map((prompt) => (
                  <Button key={prompt} onClick={() => submitPrompt(prompt)}>
                    {prompt}
                  </Button>
                ))}
              </div>
            </Card>
          </Card>
        </aside>

        <section className="copilot-main" style={{ flex: "1 1 auto", minWidth: 0, width: "100%" }}>
          <Card className="copilot-chat-card" style={{ width: "100%" }}>
            {messages.length === 0 && !typing && !error ? (
              <Empty
                description="Start a conversation with your SLMS Copilot"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : null}

            {messages.length > 0 ? (
              <div
                className="copilot-chat-history"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                  overflowX: "hidden",
                  height: "400px",
                  overflowY: "auto",
                }}
              >
                {messages.map((message, index) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={`${message.role}-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        width: "100%",
                      }}
                    >
                      <div
                        className={`copilot-bubble-row ${isUser ? "is-user" : "is-assistant"}`}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          flexDirection: isUser ? "row-reverse" : "row",
                          gap: "10px",
                          width: "fit-content",
                          maxWidth: "min(100%, 760px)",
                          flexWrap: "nowrap",
                        }}
                      >
                        <Avatar
                          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                          className="copilot-avatar"
                          style={{
                            flexShrink: 0,
                            marginLeft: isUser ? "6px" : 0,
                            marginRight: isUser ? 0 : "6px",
                          }}
                        />
                        <div
                          className={`copilot-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}
                          style={{
                            marginLeft: 0,
                            marginRight: 0,
                            maxWidth: "100%",
                            width: "fit-content",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {typing ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  width: "100%",
                }}
              >
                <div
                  className="copilot-bubble-row is-assistant"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    width: "fit-content",
                    maxWidth: "min(100%, 760px)",
                    flexWrap: "nowrap",
                  }}
                >
                  <Avatar
                    icon={<RobotOutlined />}
                    className="copilot-avatar"
                    style={{ flexShrink: 0, marginRight: "6px" }}
                  />
                  <div
                    className="copilot-bubble assistant-bubble"
                    style={{
                      maxWidth: "100%",
                      width: "fit-content",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    <Skeleton active paragraph={{ rows: 1 }} title={false} />
                    <Text className="copilot-typing">Copilot is thinking...</Text>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <Result
                status="warning"
                title="Temporary response issue"
                subTitle="Please retry your question. The Copilot simulation intentionally exposes this error state for UI completeness."
                extra={<Button onClick={() => setError(false)}>Dismiss</Button>}
              />
            ) : null}
          </Card>

          <Card className="copilot-input-card" style={{ width: "100%" }}>
            <Space className="copilot-input-wrap" style={{ width: "100%" }}>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onPressEnter={() => submitPrompt(draft)}
                placeholder="Ask about assignments, hostel, budget, exams, or campus rules"
                style={{ flex: 1, minWidth: 0 }}
              />
              <Button icon={<AudioOutlined />} />
              <Button onClick={undoLastPrompt} disabled={messages.length === 0}>
                Undo
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => submitPrompt(draft)}
              >
                Send
              </Button>
            </Space>
          </Card>
        </section>
      </div>
    </>
  );
}

export default Copilot;
