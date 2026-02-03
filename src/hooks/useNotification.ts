import { useState, useCallback, useEffect } from 'react';

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

interface UseNotificationReturn {
  permission: NotificationPermissionState;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermissionState>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

/**
 * Hook to wrap Web Notification API
 */
const useNotification = (): UseNotificationReturn => {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  const [permission, setPermission] = useState<NotificationPermissionState>(
    isSupported ? (Notification.permission as NotificationPermissionState) : 'denied'
  );

  // Sync permission state on mount
  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission as NotificationPermissionState);
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionState);
      return result as NotificationPermissionState;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || Notification.permission !== 'granted') {
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });

        // Focus window when notification is clicked
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    },
    [isSupported]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
  };
};

export default useNotification;
