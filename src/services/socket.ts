import { io, Socket } from 'socket.io-client';
import { config } from '../config';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (!socket || !socket.connected) {
    const token = localStorage.getItem('accessToken');
    socket = io(config.apiUrl, {
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
