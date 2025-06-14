import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

export const useNotificationService = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Failed to get push token for push notification!');
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register for push notifications');
      return null;
    }
  };

  const updatePushToken = useCallback(async (token: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to update push token');
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/push-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ push_token: token }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update push token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update push token');
      throw err;
    }
  }, [user]);

  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput = null
  ): Promise<string> => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger,
      });

      return notificationId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule notification');
      throw err;
    }
  }, []);

  const cancelNotification = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel notification');
      throw err;
    }
  }, []);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel all notifications');
      throw err;
    }
  }, []);

  const getNotificationSettings = useCallback(async (): Promise<Notifications.NotificationPermissionsStatus> => {
    try {
      return await Notifications.getPermissionsAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get notification settings');
      throw err;
    }
  }, []);

  const requestNotificationPermissions = useCallback(async (): Promise<Notifications.NotificationPermissionsStatus> => {
    try {
      return await Notifications.requestPermissionsAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request notification permissions');
      throw err;
    }
  }, []);

  return {
    expoPushToken,
    notification,
    error,
    updatePushToken,
    scheduleLocalNotification,
    cancelNotification,
    cancelAllNotifications,
    getNotificationSettings,
    requestNotificationPermissions,
  };
}; 