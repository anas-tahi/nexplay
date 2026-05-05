import { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';

const GlobalChat = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    connected,
    onlineUsers,
    messages,
    typingUsers,
    sendMessage,
    sendTyping
  } = useSocket();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 1000);
  };

  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (message.trim() && connected) {
      sendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      sendTyping(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-xl border border-white/10 w-full max-w-4xl max-h-[80vh] flex">
        {/* Sidebar - Online Users */}
        <div className="w-64 border-r border-white/10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Online Users</h3>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {onlineUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">No users online</p>
            ) : (
              onlineUsers.map((user, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-white/5">
                  <div className={`w-2 h-2 rounded-full bg-green-500`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      {user.username}
                      {user.isGuest && (
                        <span className="text-xs text-gray-400 ml-1">(Guest)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Joined {formatTime(user.joinedAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-gray-400">
              {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-bold font-gamer neon-text">Global Chat</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-gray-400">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {msg.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        {msg.username}
                        {msg.isGuest && (
                          <span className="text-xs text-gray-400 ml-1">(Guest)</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 break-words">
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-400 italic">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>
                  {Array.from(typingUsers).join(', ')} 
                  {typingUsers.size === 1 ? ' is' : ' are'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder={connected ? "Type a message..." : "Connecting..."}
                disabled={!connected}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 transition-all duration-200 disabled:opacity-50"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!connected || !message.trim()}
                className="px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            {!connected && (
              <p className="text-xs text-red-400 mt-2">Connection lost. Trying to reconnect...</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
