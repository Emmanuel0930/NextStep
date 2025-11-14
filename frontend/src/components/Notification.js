import React from "react";

export default function Notification({ message, visible }) {
  if (!visible) return null;
  return (
    <div 
      className="fixed right-6 bottom-6 bg-tertiaryBrand-purple300 text-white px-8 py-4 rounded-lg shadow-lg z-[9999] text-base min-w-[100px] max-w-[440px] text-center opacity-95 whitespace-nowrap overflow-hidden text-ellipsis"
      title={message}
    >
      {message}
    </div>
  );
}