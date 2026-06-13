import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiRequest } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerPushToken(): Promise<void> {
  if (Platform.OS === 'web') return;

  // Ask permission
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  // Register Expo push token (works via Expo's FCM relay)
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const expoPushToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    await apiRequest('/notifications/device-tokens', {
      method: 'POST',
      body: JSON.stringify({
        token: expoPushToken.data,
        tokenType: 'EXPO',
        platform: Platform.OS,
      }),
    });
  } catch {}

  // Also register raw FCM token for direct delivery
  try {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    if (deviceToken.type === 'android' || deviceToken.type === 'ios') {
      await apiRequest('/notifications/device-tokens', {
        method: 'POST',
        body: JSON.stringify({
          token: deviceToken.data,
          tokenType: 'FCM',
          platform: Platform.OS,
        }),
      });
    }
  } catch {}
}

export type IncomingNotification = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export function listenForNotifications(
  onNotification: (n: IncomingNotification) => void,
): () => void {
  // Fires when notification arrives while app is open
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    onNotification({
      title: notification.request.content.title ?? 'Alert',
      body: notification.request.content.body ?? '',
      data: (notification.request.content.data as Record<string, unknown>) ?? {},
    });
  });

  // Fires when user taps a notification
  const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotification({
      title: response.notification.request.content.title ?? 'Alert',
      body: response.notification.request.content.body ?? '',
      data: (response.notification.request.content.data as Record<string, unknown>) ?? {},
    });
  });

  return () => {
    foregroundSub.remove();
    tapSub.remove();
  };
}
