import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

// Strip /api/v1 suffix — Socket.IO connects to the HTTP root
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');

let socket: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socket?.connected) {
    socket.emit('join:user', userId);
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    socket?.emit('join:user', userId);
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
