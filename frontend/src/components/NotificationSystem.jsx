import { useState, useEffect, createContext, useContext } from 'react';
import useSocket from '../hooks/useSocket';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { connected } = useSocket();

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: 'info', // success, error, warning, info
      title: '',
      message: '',
      duration: 5000, // Auto-dismiss after 5 seconds
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (title, message, duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration });
  };

  const error = (title, message, duration = 0) => {
    return addNotification({ type: 'error', title, message, duration });
  };

  const warning = (title, message, duration = 5000) => {
    return addNotification({ type: 'warning', title, message, duration });
  };

  const info = (title, message, duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration });
  };

  // Socket event notifications
  useEffect(() => {
    if (connected) {
      // These would be handled by socket events
      // For now, we'll just add connection notifications
      info('Connected', 'Real-time features are now active');
    }
  }, [connected]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        success,
        error,
        warning,
        info
      }}
    >
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-600 border-red-400';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 border-yellow-400';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-400';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`glass-effect rounded-lg p-4 border transition-all duration-300 transform ${getNotificationStyles(
            notification.type
          )} animate-slide-in-right shadow-lg`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {getNotificationIcon(notification.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {notification.title && (
                <h4 className="text-sm font-semibold text-white mb-1">
                  {notification.title}
                </h4>
              )}
              <p className="text-sm text-white/90 break-words">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="flex-shrink-0 p-1 text-white/70 hover:text-white transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationProvider;
