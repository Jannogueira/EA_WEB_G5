import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import useUser from '../hooks/useUser';

interface SocketContextType {
  socket: Socket | null;
  notifications: any[];
  unreadCounts: Record<string, number>; // userId -> count
  notificationCount: number;
  clearNotifications: () => void;
  markAsRead: (userId: string) => void;
  setNotificationCount: (count: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCounts: {},
  notificationCount: 0,
  clearNotifications: () => {},
  markAsRead: () => {},
  setNotificationCount: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (usuario) {
      const token = localStorage.getItem('accessToken');
      const newSocket = io('http://localhost:1337', {
        auth: { token },
        transports: ['websocket'],
      });

      setSocket(newSocket);

      // Al recibir un mensaje
      newSocket.on('receive_message', (msg) => {
        setUnreadCounts(prev => ({
          ...prev,
          [msg.remitente._id]: (prev[msg.remitente._id] || 0) + 1
        }));
      });

      newSocket.on('new_follow', (data) => {
        // alert(`¡${data.follower.nombre} te ha empezado a seguir!`);
        setNotificationCount(prev => prev + 1);
      });

      newSocket.on('new_notification', () => {
        setNotificationCount(prev => prev + 1);
      });

      newSocket.on('new_follow_request', () => {
        setNotificationCount(prev => prev + 1);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [usuario]);

  const markAsRead = useCallback((userId: string) => {
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[userId];
      return newCounts;
    });
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      notifications, 
      unreadCounts, 
      notificationCount,
      clearNotifications, 
      markAsRead,
      setNotificationCount
    }}>
      {children}
    </SocketContext.Provider>
  );
};
