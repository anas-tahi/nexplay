import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      return;
    }

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token,
        username: user.username
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.io server');
      setConnected(true);
      reconnectAttempts.current = 0;
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.io server:', reason);
      setConnected(false);
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          socketInstance.connect();
        }, 1000 * reconnectAttempts.current);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Online users
    socketInstance.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    // Chat messages
    socketInstance.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Typing indicators
    socketInstance.on('user-typing', ({ username, isTyping }) => {
      setTypingUsers(prev => {
        const newTypingUsers = new Set(prev);
        if (isTyping) {
          newTypingUsers.add(username);
        } else {
          newTypingUsers.delete(username);
        }
        return newTypingUsers;
      });
    });

    // Room events
    socketInstance.on('room-created', (room) => {
      console.log('Room created:', room);
    });

    socketInstance.on('room-joined', (room) => {
      console.log('Room joined:', room);
    });

    socketInstance.on('room-updated', (room) => {
      console.log('Room updated:', room);
    });

    socketInstance.on('game-move', (data) => {
      console.log('Game move received:', data);
    });

    socketInstance.on('game-over', (data) => {
      console.log('Game over:', data);
    });

    socketInstance.on('player-disconnected', (data) => {
      console.log('Player disconnected:', data);
    });

    socketInstance.on('room-message', (message) => {
      console.log('Room message:', message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Chat functions
  const sendMessage = (message, room = 'global-chat') => {
    if (socket && connected) {
      socket.emit('chat-message', { message, room });
    }
  };

  const joinChat = (room) => {
    if (socket && connected) {
      socket.emit('join-chat', room);
    }
  };

  const sendTyping = (isTyping, room = 'global-chat') => {
    if (socket && connected) {
      socket.emit('typing', { isTyping, room });
    }
  };

  // Room functions
  const createRoom = (gameType) => {
    return new Promise((resolve, reject) => {
      if (socket && connected) {
        socket.emit('create-room', gameType);
        socket.once('room-created', resolve);
        socket.once('room-error', reject);
      } else {
        reject(new Error('Not connected to server'));
      }
    });
  };

  const joinRoom = (roomId) => {
    return new Promise((resolve, reject) => {
      if (socket && connected) {
        socket.emit('join-room', roomId);
        socket.once('room-joined', resolve);
        socket.once('room-error', reject);
      } else {
        reject(new Error('Not connected to server'));
      }
    });
  };

  const sendGameMove = (roomId, move) => {
    if (socket && connected) {
      socket.emit('game-move', { roomId, move });
    }
  };

  const sendGameOver = (roomId, winner, isDraw = false) => {
    if (socket && connected) {
      socket.emit('game-over', { roomId, winner, isDraw });
    }
  };

  const sendRoomMessage = (roomId, message) => {
    if (socket && connected) {
      socket.emit('room-message', { roomId, message });
    }
  };

  return {
    socket,
    connected,
    onlineUsers,
    messages,
    typingUsers,
    sendMessage,
    joinChat,
    sendTyping,
    createRoom,
    joinRoom,
    sendGameMove,
    sendGameOver,
    sendRoomMessage
  };
};

export default useSocket;
