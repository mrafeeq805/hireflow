import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import { SOCKET_EVENTS } from '@hireflow/shared';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  const token = useAuthStore.getState().accessToken;

  if (socket) {
    if (socket.connected) return socket;
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    useSocketStore.getState().setConnected(true);
    const activeWs = useAuthStore.getState().activeWorkspace;
    if (activeWs && socket) {
      socket.emit(SOCKET_EVENTS.JOIN_WORKSPACE, activeWs.id);
    }
  });

  socket.on('disconnect', () => {
    useSocketStore.getState().setConnected(false);
  });

  socket.on('connect_error', (error) => {
    console.warn('Socket connection error:', error.message);
    useSocketStore.getState().setConnected(false);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    useSocketStore.getState().setConnected(false);
  }
}

