import React, { createContext, useContext, useState, useCallback } from "react";
import Notification from "./Notification";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  // Lista de notificaciones: {id, message, read}
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // Mostrar notificación y agregar a la lista como no leída
  const showNotification = useCallback((msg, duration = 3000) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, message: msg, read: false }
    ]);
    setCurrentMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Cantidad de no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ showNotification, notifications, unreadCount, markAllAsRead }}>
      {children}
      <Notification message={currentMessage} visible={visible} />
    </NotificationContext.Provider>
  );
}