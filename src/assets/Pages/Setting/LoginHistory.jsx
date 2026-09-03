import React, { useEffect, useState } from "react";
import { Card, List, Button, Empty } from "antd";
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getLoginHistory } from "../../../services/authService";
import "./LoginHistory.css";

export default function LoginHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  const refresh = async () => {
    try {
      setHistory(await getLoginHistory());
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="setting-page">
      <div className="setting-content-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/setting")}
          className="setting-back-button"
        >
          Back to Settings
        </Button>
      </div>

      <Card
        className="setting-inner-card"
        title="Login History"
        extra={<HistoryOutlined />}
      >
        <div className="login-history-actions">
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
            style={{ marginRight: 8 }}
          >
            Refresh
          </Button>
        </div>

        {history?.length ? (
          <List
            dataSource={history}
            renderItem={(item, index) => {
              const eventType = String(
                item.eventType || item.event || ""
              ).toUpperCase();
              const badgeLabel = eventType.includes("SIGN_UP") ||
                eventType.includes("SIGNUP") ||
                eventType.includes("REGISTER")
                ? "Sign Up"
                : eventType.includes("LOGOUT")
                  ? "Logout"
                  : eventType.includes("LOGIN")
                    ? index === 0
                      ? "Current Active"
                      : index === 2
                        ? "Last Active"
                        : index === 3
                          ? "Previous Active"
                          : "---"
                    : "------";

              return (
                <List.Item>
                  <List.Item.Meta
                    title={`${item.eventType || item.status} — ${new Date(item.createdAt || item.timestamp).toLocaleString()}`}
                    description={item.userAgent || item.ipAddress || ""}
                  />
                  <div>{badgeLabel}</div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="No login activity found" />
        )}
      </Card>
    </div>
  );
}
