import { useEffect } from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const SESSION_EXPIRED_MESSAGE =
  "Your session has been expired. Please login again.";

export default function SessionExpiryHandler() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleSessionExpired = (event) => {
      const redirectTo = event.detail?.redirectTo || `${location.pathname}${location.search}`;
      messageApi.error(event.detail?.message || SESSION_EXPIRED_MESSAGE);
      navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`, {
        replace: true,
      });
    };

    window.addEventListener("slms:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("slms:session-expired", handleSessionExpired);
  }, [location.pathname, location.search, messageApi, navigate]);

  return contextHolder;
}
