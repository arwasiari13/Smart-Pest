import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export type NotificationRegistrationState = {
  expoPushToken?: string;
  fcmToken?: string;
  error?: string;
};

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'SmartPest Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#16a34a',
    });
  }

  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device');
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (existingPermission.status !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Push notification permission was not granted');
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return token.data;
}

async function getFcmToken(): Promise<string | null> {
  return null;
}

export function useSmartPestNotifications(authToken?: string, onAlertDeepLink?: (alertId: string) => void) {
  const [state, setState] = useState<NotificationRegistrationState>({});
  const receivedSubscription = useRef<Notifications.Subscription>();
  const responseSubscription = useRef<Notifications.Subscription>();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Register Expo push token
        const expoPushToken = await registerForPushNotificationsAsync();
        if (!mounted) return;
        setState((prev) => ({ ...prev, expoPushToken }));

        const fcmToken = await getFcmToken();
        if (fcmToken && mounted) {
          setState((prev) => ({ ...prev, fcmToken }));
        }
      } catch (error) {
        if (mounted) setState({ error: error instanceof Error ? error.message : 'Registration failed' });
      }
    })();

    // Handle foreground notifications
    receivedSubscription.current = Notifications.addNotificationReceivedListener(() => undefined);

    // Handle notification taps
    responseSubscription.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { alertId?: string; deepLink?: string };
      if (data.alertId) onAlertDeepLink?.(data.alertId);
      if (data.deepLink) Linking.openURL(data.deepLink);
    });

    return () => {
      mounted = false;
      receivedSubscription.current?.remove();
      responseSubscription.current?.remove();
    };
  }, [authToken, onAlertDeepLink]);

  return state;
}
