import React from "react";

const notificationStyle = {
  position: "fixed",
  right: "1.5rem",
  bottom: "1.5rem",
  background: "#7F23D0",
  color: "#fff",
  padding: "1rem 2rem",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  zIndex: 9999,
  fontSize: "1rem",
  minWidth: "100px",
  maxWidth: "440px",
  textAlign: "center",
  opacity: 0.95,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default function Notification({ message, visible }) {
  if (!visible) return null;
  return (
    <div style={notificationStyle} title={message}>
      {message}
    </div>
  );
}