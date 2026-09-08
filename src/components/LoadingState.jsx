import { Spin } from "antd";

export default function LoadingState({ loading, children, tip = "Loading..." }) {
  if (!loading) return children;
  return (
    <div className="resource-loading" aria-live="polite">
      <Spin description={tip} />
    </div>
  );
}
