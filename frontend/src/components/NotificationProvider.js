import React, { createContext, useContext, useState, useCallback } from "react";
import Notification from "./Notification";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  // Lista de notificaciones: {id, message, read}
  const [notifications, setNotifications] = useState([]);
  const [queue, setQueue] = useState([]); // Cola de mensajes a mostrar
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // Mostrar notificación y agregar a la lista y cola
  // Permite pasar datos extra (ej: jobId) en la notificación
  // Si la notificación es de insignia, data puede ser { type: 'insignia' }
  const showNotification = useCallback((msg, duration = 3000, data = null) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      ...prev,
      { id, message: msg, read: false, data }
    ]);
    setQueue((prev) => [...prev, { id, message: msg, duration }]);
  }, []);

  // Efecto para mostrar la siguiente notificación de la cola
  React.useEffect(() => {
    if (!visible && queue.length > 0) {
      const { message, duration } = queue[0];
      setCurrentMessage(message);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setQueue((prev) => prev.slice(1));
      }, duration);
    }
  }, [queue, visible]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Eliminar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Cantidad de no leídas (excluyendo bienvenida y cierre de sesión)
  const unreadCount = notifications.filter(
    n => !n.read &&
      n.message !== "¡Bienvenid@ a NextStep! 🎉" &&
      n.message !== "Sesión cerrada correctamente"
  ).length;

  return (
    <NotificationContext.Provider value={{ showNotification, notifications, unreadCount, markAllAsRead, clearNotifications }}>
      {children}
      <Notification message={currentMessage} visible={visible} />
    </NotificationContext.Provider>
  );
}