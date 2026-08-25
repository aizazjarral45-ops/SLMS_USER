import React, { useEffect, useState } from "react";
import { Card, List, Button, Empty } from "antd";
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  getLoginHistory,
  clearLoginHistoryForEmail,
} from "../../../services/authService";
import "./LoginHistory.css";

export default function LoginHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  const refresh = () => {
    setHistory(getLoginHistory(user?.email));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const clearForUser = () => {
    clearLoginHistoryForEmail(user?.email);
    refresh();
  };

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
          <Button danger onClick={clearForUser}>
            Clear History
          </Button>
        </div>

        {history?.length ? (
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${new Date(item.timestamp).toLocaleString()} — ${item.status}`}
                  description={`${item.userAgent} ${item.ip ? "• " + item.ip : ""}`}
                />
                <div>{item.sessionId ? "Current" : "—"}</div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No login activity found" />
        )}
      </Card>
    </div>
  );
}
