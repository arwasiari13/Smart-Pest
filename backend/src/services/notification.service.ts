import { Expo } from 'expo-server-sdk';
import { emitToUser } from '../realtime/socket';
import { sendFcmNotification } from './fcm.service';
import * as firestoreService from './firestore.service';

const expo = new Expo();

export async function registerDeviceToken(input: {
  userId: string;
  token: string;
  tokenType?: string;
  platform: string;
  deviceId?: string;
}) {
  await firestoreService.upsertDeviceToken(input.userId, {
    token: input.token,
    tokenType: input.tokenType ?? 'EXPO',
    platform: input.platform,
    deviceId: input.deviceId,
  });
  return { userId: input.userId, token: input.token, tokenType: input.tokenType ?? 'EXPO' };
}

export async function createNotification(input: {
  userId: string;
  alertId?: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  deepLink?: string;
}): Promise<firestoreService.NotificationDoc | null> {
  try {
    const notification = await firestoreService.createNotificationDoc({
      userId: input.userId,
      alertId: input.alertId,
      type: input.type,
      status: 'PENDING',
      title: input.title,
      body: input.body,
      data: input.data,
      deepLink: input.deepLink,
    });
    emitToUser(input.userId, 'notification:new', notification);
    return notification;
  } catch {
    // Firestore not configured — emit real-time event only (no push notification)
    console.warn('[Notification] Firestore unavailable — Socket.IO only for userId:', input.userId);
    emitToUser(input.userId, 'notification:new', {
      id: `local-${Date.now()}`,
      userId: input.userId,
      alertId: input.alertId,
      type: input.type,
      status: 'SENT' as const,
      title: input.title,
      body: input.body,
      data: input.data,
      deepLink: input.deepLink,
    });
    return null;
  }
}

export async function sendPushNotification(notificationId: string) {
  const notification = await firestoreService.getNotificationDoc(notificationId);
  if (!notification) return;

  const tokens = await firestoreService.getActiveDeviceTokens(notification.userId);
  if (tokens.length === 0) {
    await firestoreService.updateNotificationDoc(notificationId, {
      status: 'FAILED',
      failureText: 'No active push token',
    });
    return;
  }

  const fcmTokens = tokens.filter((d) => d.tokenType === 'FCM');
  const expoTokens = tokens.filter((d) => d.tokenType === 'EXPO' && Expo.isExpoPushToken(d.token));

  const notifData: Record<string, string> = {
    notificationId: notification.id,
    deepLink: notification.deepLink ?? '',
    ...Object.fromEntries(
      Object.entries(notification.data ?? {}).map(([k, v]) => [k, String(v)]),
    ),
  };

  // Send via FCM
  for (const device of fcmTokens) {
    await sendFcmNotification({
      token: device.token,
      title: notification.title,
      body: notification.body,
      data: notifData,
    });
  }

  // Send via Expo
  const expoMessages = expoTokens.map((device) => ({
    to: device.token,
    sound: 'default' as const,
    title: notification.title,
    body: notification.body,
    data: notifData,
  }));

  if (expoMessages.length > 0) {
    try {
      for (const chunk of expo.chunkPushNotifications(expoMessages)) {
        await expo.sendPushNotificationsAsync(chunk);
      }
    } catch {
      // Expo failures don't block FCM success
    }
  }

  await firestoreService.updateNotificationDoc(notificationId, {
    status: 'SENT',
    pushToken: tokens[0]?.token,
  });
}

export async function listNotifications(userId: string) {
  return firestoreService.listNotificationDocs(userId);
}

export async function markNotificationRead(userId: string, id: string) {
  await firestoreService.updateNotificationDoc(id, { status: 'READ' });
  return { id, status: 'READ' };
}
