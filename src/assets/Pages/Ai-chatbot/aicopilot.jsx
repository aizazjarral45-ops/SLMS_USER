import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  List,
  Modal,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./aicopilot.css";
import { isApiConfigured, request } from "../../../api/client";

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
const { Title, Paragraph, Text } = Typography;

const suggestedPrompts = [
  "What assignments are still open?",
  "How is my attendance?",
  "Check my budget.",
  "Summarize my hostel application.",
];

const createId = (prefix) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
const currency = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
const normalizeMessages = (items) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    id: String(item._id ?? item.id ?? createId("message")),
    role: item.role,
    content: item.content,
    createdAt: item.createdAt || new Date().toISOString(),
  }));
const normalizeConversation = (conversation) => ({
  ...conversation,
  _id: String(conversation._id),
  messages: normalizeMessages(conversation.messages),
});
const completedExchangeCount = (items) => {
  let count = 0;
  for (let index = 0; index < (items || []).length - 1; index += 1) {
    if (items[index].role === "user" && items[index + 1].role === "assistant") {
      count += 1;
      index += 1;
    }
  }
  return count;
};

function buildResponse(prompt, data) {
  const text = prompt.toLowerCase();
  const academic = data?.academic || {};
  const assignments = (academic.assignments || []).filter(
    (item) => item.status !== "Completed",
  );
  const attendance = academic.attendance || [];
  const expenses = data?.expenses || [];
  const budget = Number(data?.monthlyBudget || 0);
  const spent = expenses.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  );
  const latestHostel = data?.hostelApplications?.[0];
  const complaints = data?.complaints || [];

  if (text.includes("assignment") || text.includes("deadline")) {
    return assignments.length
      ? `You have ${assignments.length} open assignment${assignments.length === 1 ? "" : "s"}: ${assignments
          .slice(0, 3)
          .map(
            (item) =>
              `${item.title || "Untitled"}${item.dueDate ? ` (due ${item.dueDate})` : ""}`,
          )
          .join(", ")}.`
      : "You have no open assignments recorded. Add assignments in Academic to track them here.";
  }
  if (text.includes("attendance")) {
    if (!attendance.length)
      return "No attendance records are available yet. Add course attendance in Academic to receive a summary.";
    const attended = attendance.reduce(
      (total, item) => total + Number(item.attended || 0),
      0,
    );
    const classes = attendance.reduce(
      (total, item) => total + Number(item.total || 0),
      0,
    );
    const rate = classes ? Math.round((attended / classes) * 100) : 0;
    return `Your overall recorded attendance is ${rate}% (${attended} of ${classes} classes). ${rate < 75 ? "Prioritize upcoming classes to improve it." : "Keep the current consistency going."}`;
  }
  if (
    text.includes("budget") ||
    text.includes("expense") ||
    text.includes("spend")
  ) {
    if (!budget)
      return `You have logged ${currency(spent)} in expenses but have not set a monthly budget yet. Set one in Expense to track remaining funds.`;
    const remaining = budget - spent;
    return `You have spent ${currency(spent)} of your ${currency(budget)} monthly budget. ${remaining >= 0 ? `${currency(remaining)} remains.` : `You are ${currency(Math.abs(remaining))} over budget.`}`;
  }
  if (text.includes("hostel")) {
    return latestHostel
      ? `Your latest hostel application ${latestHostel.applicationNo || ""} is ${latestHostel.status || "saved"}. Fees are marked ${latestHostel.feesStatus || "not set"}${latestHostel.paymentDueDate ? `, with a due date of ${latestHostel.paymentDueDate}` : ""}.`
      : "You have no saved hostel application. Complete the Hostel form to create one.";
  }
  if (text.includes("complaint") || text.includes("support")) {
    const active = complaints.filter(
      (item) => !["Resolved", "Completed"].includes(item.status),
    );
    return active.length
      ? `You have ${active.length} active complaint${active.length === 1 ? "" : "s"}. The latest is “${active[0].title || "Untitled"}” with status ${active[0].status || "Submitted"}.`
      : "You have no active complaints recorded.";
  }
  if (text.includes("exam") || text.includes("quiz")) {
    const exams = (academic.exams || [])
      .slice()
      .sort((first, second) =>
        (first.examDate || "").localeCompare(second.examDate || ""),
      );
    return exams.length
      ? `Your next recorded assessment is ${exams[0].title || "an exam"}${exams[0].examDate ? ` on ${exams[0].examDate}` : ""}${exams[0].course ? ` for ${exams[0].course}` : ""}.`
      : "No exams or quizzes are scheduled in Academic yet.";
  }
  return "I can summarize your current assignments, attendance, budget, hostel application, complaints, or exams using the data saved in SLMS.";
}

function Copilot({ data = {}, messages: messagesProp, onMessagesChange }) {
  const [fallbackMessages, setFallbackMessages] = useState([]);
  const messages = Array.isArray(messagesProp)
    ? messagesProp
    : fallbackMessages;
  const setMessages = useCallback((nextValue) => {
    if (onMessagesChange) {
      onMessagesChange((current) =>
        typeof nextValue === "function"
          ? nextValue(Array.isArray(current) ? current : [])
          : nextValue,
      );
      return;
    }
    setFallbackMessages((current) =>
      typeof nextValue === "function" ? nextValue(current) : nextValue,
    );
  }, [onMessagesChange]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const offlineConversationRef = useRef({
    _id: createId("conversation"),
    title: "New conversation",
    messages: [],
  });
  const [conversationId, setConversationId] = useState(
    () => (isApiConfigured ? null : offlineConversationRef.current._id),
  );
  const [conversations, setConversations] = useState(() =>
    isApiConfigured ? [] : [offlineConversationRef.current],
  );
  const [conversationReady, setConversationReady] = useState(!isApiConfigured);
  const [conversationLoading, setConversationLoading] = useState(isApiConfigured);
  const [historyActionLoading, setHistoryActionLoading] = useState(false);
  const operationRef = useRef(0);
  const setActiveConversation = useCallback((conversation) => {
    const normalized = normalizeConversation(conversation);
    setConversationId(normalized._id);
    setMessages(normalized.messages);
    setConversations((current) => [
      normalized,
      ...current.filter((item) => String(item._id) !== normalized._id),
    ]);
  }, [setMessages]);

  useEffect(() => {
    if (!isApiConfigured) return undefined;
    let cancelled = false;
    const loadConversation = async () => {
      const operation = operationRef.current;
      const result = await request("/ai/conversations");
      let conversation = result.conversations?.[0];
      if (!conversation) {
        conversation = (await request("/ai/conversations", {
            method: "POST",
            body: { title: "New conversation" },
          })).conversation;
      } else {
        conversation = (
          await request(`/ai/conversations/${conversation._id}`)
        ).conversation;
      }
      if (cancelled || operation !== operationRef.current) return;
      setConversations(
        (result.conversations || []).map(normalizeConversation),
      );
      setActiveConversation(conversation);
      setConversationReady(true);
    };
    loadConversation().catch((error) => {
      if (!cancelled) {
        console.error("Unable to load AI conversation:", error);
        setConversationReady(true);
      }
    }).finally(() => {
      if (!cancelled) setConversationLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [setActiveConversation]);
  const recentChats = useMemo(() => {
    return conversations.map((conversation) => {
      const firstUserMessage = conversation.messages?.find(
        (item) => item.role === "user",
      );
      return {
        id: String(conversation._id),
        title:
          (conversation.title &&
            conversation.title !== "New conversation" &&
            conversation.title) ||
          firstUserMessage?.content?.slice(0, 40) ||
          "New conversation",
        preview: `${completedExchangeCount(conversation.messages)} saved message${
          completedExchangeCount(conversation.messages) === 1 ? "" : "s"
        }`,
      };
    });
  }, [conversations]);

  const openConversation = async (id) => {
    if (!id || String(id) === String(conversationId) || typing) return;
    const operation = ++operationRef.current;
    setHistoryActionLoading(true);
    try {
      if (isApiConfigured) {
        const result = await request(`/ai/conversations/${id}`);
        if (operation !== operationRef.current) return;
        setActiveConversation(result.conversation);
      } else {
        const conversation = conversations.find(
          (item) => String(item._id) === String(id),
        );
        if (conversation) setActiveConversation(conversation);
      }
    } catch (error) {
      console.error("Unable to open AI conversation:", error);
    } finally {
      if (operation === operationRef.current) setHistoryActionLoading(false);
    }
  };

  const createNewChat = async () => {
    if (typing) return;
    const operation = ++operationRef.current;
    setHistoryActionLoading(true);
    try {
      const conversation = isApiConfigured
        ? (
            await request("/ai/conversations", {
              method: "POST",
              body: { title: "New conversation" },
            })
          ).conversation
        : {
            _id: createId("conversation"),
            title: "New conversation",
            messages: [],
          };
      if (operation !== operationRef.current) return;
      setActiveConversation(conversation);
      setConversationReady(true);
    } catch (error) {
      console.error("Unable to create AI conversation:", error);
    } finally {
      if (operation === operationRef.current) setHistoryActionLoading(false);
    }
  };

  const submitPrompt = async (value) => {
    const content = value.trim();
    if (!content || typing || !conversationReady) return;
    const userMessage = {
      id: createId("message"),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    const operation = ++operationRef.current;
    setDraft("");
    setTyping(true);
    try {
      if (isApiConfigured) {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const created = await request("/ai/conversations", {
          method: "POST",
          body: { title: "New conversation" },
        });
        activeConversationId = created.conversation._id;
        setConversationId(activeConversationId);
      }
      const result = await request(`/ai/conversations/${activeConversationId}/message`, {
        method: "POST",
        body: { message: content },
      });
      if (operation !== operationRef.current) return;
      setActiveConversation(result.conversation);
      } else {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      const assistantMessage = {
        id: createId("message"),
        role: "assistant",
        content: buildResponse(content, data),
        createdAt: new Date().toISOString(),
      };
      if (operation === operationRef.current) {
        setMessages((current) => [...current, assistantMessage]);
        setConversations((current) =>
          current.map((conversation) =>
            String(conversation._id) === String(conversationId)
              ? {
                  ...conversation,
                  title:
                    conversation.title === "New conversation"
                      ? content.slice(0, 40)
                      : conversation.title,
                  messages: [...(conversation.messages || []), userMessage, assistantMessage],
                }
              : conversation,
          ),
        );
      }
      }
    } catch (error) {
      console.error("Unable to generate AI reply:", error);
      if (operation !== operationRef.current) return;
      setMessages((current) => [
      ...current,
      {
        id: createId("message"),
        role: "assistant",
        content: "I could not reach Gemini right now. Please try again.",
        createdAt: new Date().toISOString(),
      },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const undoLastPrompt = async () => {
    if (!messages.length) return;
    const operation = ++operationRef.current;
    setTyping(false);
    if (isApiConfigured) {
      if (!conversationId) return;
      try {
        setHistoryActionLoading(true);
        const result = await request(`/ai/history/${conversationId}`, {
          method: "DELETE",
        });
        if (operation === operationRef.current)
          setMessages(normalizeMessages(result.conversation?.messages));
      } catch (error) {
        if (operation === operationRef.current)
          console.error("Unable to undo the last AI prompt:", error);
      }
      finally {
        setHistoryActionLoading(false);
      }
      return;
    }
    setMessages((current) => {
      const last = current.at(-1);
      const removeCount = last?.role === "assistant" ? 2 : 1;
      return current.slice(0, Math.max(0, current.length - removeCount));
    });
  };

  const clearChat = async () => {
    ++operationRef.current;
    setTyping(false);
    if (!isApiConfigured) {
      const conversation = {
        _id: createId("conversation"),
        title: "New conversation",
        messages: [],
      };
      setMessages([]);
      setConversationId(conversation._id);
      setConversations([conversation]);
      return;
    }
    try {
      setHistoryActionLoading(true);
      await request("/ai/history", { method: "DELETE" });
      setMessages([]);
      setConversationId(null);
      setConversations([]);
      await createNewChat();
    } catch (error) {
      console.error("Unable to clear AI conversation history:", error);
      throw error;
    } finally {
      setHistoryActionLoading(false);
    }
  };

  const confirmClearChat = () => {
    Modal.confirm({
      title: "Clear all AI chats?",
      content: "This permanently deletes your saved AI conversation history.",
      okText: "Clear all",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await clearChat();
        } catch {
          // Keep the current chat visible when the deletion request fails.
        }
      },
    });
  };

  if (conversationLoading) {
    return <div className="first-section"><Card><Skeleton active /></Card></div>;
  }

  return (
    <>
      <div className="first-section">
        <Card className="copilot-header-card">
          <Space align="start">
            <div>
              <Tag icon={<RobotOutlined />} className="eyebrow">
                Student Copilot
              </Tag>
              <Title level={1} style={{ color: "#fff", fontWeight: "bold" }}>
                Your intelligent SLMS assistant
              </Title>
              <Paragraph style={{ color: "#CED7F3" }}>
                Ask about the information you have saved for academics,
                attendance, exams, spending, hostel, and support.
              </Paragraph>
            </div>
          </Space>
        </Card>
      </div>
      <div className="copilot-page">
        <aside
          className="copilot-sidebar"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Card
            className="copilot-sidebar-card"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "visible",
            }}
          >
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Title level={4} style={{ margin: 0 }}>
                Recent Chats
              </Title>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={confirmClearChat}
                loading={historyActionLoading}
                disabled={conversationLoading || (!conversations.length && !typing)}
                aria-label="Clear chat"
              >
                Clear
              </Button>
            </Space>
            <List
              rowKey="id"
              dataSource={recentChats}
              renderItem={(item) => (
                <List.Item
                  className={`copilot-recent-item ${
                    String(item.id) === String(conversationId)
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() => openConversation(item.id)}
                >
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
            <Button
              type="primary"
              block
              onClick={createNewChat}
              loading={historyActionLoading}
              disabled={conversationLoading || typing}
            >
              New Chat
            </Button>
            <Card className="copilot-panel" title="Suggested Prompts">
              <div className="copilot-chip-group">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    onClick={() => submitPrompt(prompt)}
                    disabled={typing || conversationLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </Card>
          </Card>
        </aside>
        <section
          className="copilot-main"
          style={{ flex: "1 1 auto", minWidth: 0, width: "100%" }}
        >
          <Card className="copilot-chat-card" style={{ width: "100%" }}>
            {conversationLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : null}
            {!conversationLoading && !messages.length && !typing ? (
              <Empty
                description="Start a conversation with your SLMS Copilot"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : null}
            {messages.length ? (
              <div
                className="copilot-chat-history"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  width: "100%",
                  overflowX: "hidden",
                  height: 500,
                  overflowY: "auto",
                }}
              >
                {messages.map((item) => {
                  const isUser = item.role === "user";
                  return (
                    <div
                      key={item.id}
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
                          gap: 10,
                          width: "fit-content",
                          maxWidth: "min(100%, 760px)",
                          marginLeft: isUser ? "auto" : 0,
                        }}
                      >
                        <Avatar
                          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                          className="copilot-avatar"
                          style={{ flexShrink: 0 }}
                        />
                        <div
                          className={`copilot-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {typing ? (
              <div
                className="copilot-bubble-row is-assistant"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <Avatar icon={<RobotOutlined />} className="copilot-avatar" />
                <div className="copilot-bubble assistant-bubble">
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                  <Text className="copilot-typing">
                    Copilot is checking your saved data...
                  </Text>
                </div>
              </div>
            ) : null}
          </Card>
          <Card
            className="copilot-composer-card"
            style={{
              maxWidth: "100%",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Space className="copilot-input-wrap">
              <Input.TextArea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onPressEnter={(event) => {
                  if (!event.shiftKey) {
                    event.preventDefault();
                    submitPrompt(draft);
                  }
                }}
                autoSize={{ minRows: 1, maxRows: 3 }}
                placeholder="Ask about assignments, hostel, budget, exams, or support"
                className="copilot-search-bar"
                style={{
                  minWidth: 0,
                }}
                disabled={typing || conversationLoading}
              />
              <Button
                className="copilot-undo-button"
                onClick={undoLastPrompt}
                loading={historyActionLoading}
                disabled={conversationLoading || (!messages.length && !typing)}
              >
                Undo
              </Button>
              <Button
                type="primary"
                className="copilot-send-button"
                icon={<SendOutlined />}
                onClick={() => submitPrompt(draft)}
                loading={typing}
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
