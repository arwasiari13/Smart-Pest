import { fcm, firebaseReady } from '../config/firebase';

export async function sendFcmNotification(input: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<{ success: boolean; error?: string }> {
  if (!firebaseReady || !fcm) {
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    await fcm.send({
      token: input.token,
      notification: { title: input.title, body: input.body },
      data: input.data ?? {},
      android: { priority: 'high', notification: { sound: 'default', channelId: 'alerts' } },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'FCM send failed' };
  }
}
