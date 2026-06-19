// Run this on the robot/server PC to send a push notification to all farmers
// Usage: node robot-notify.js "Pest detected in sector 3"

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase project config (no service account needed — uses public Firestore read)
// We'll use the REST API instead to avoid needing a service account key

const title = process.argv[2] || 'SmartPest Alert';
const body = process.argv[3] || 'A pest has been detected near your field.';

async function sendNotifications() {
  // Read all push tokens from Firestore via REST (no auth needed since rules are open)
  const projectId = 'smartpest-52d02';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.documents) {
    console.log('No users found in Firestore');
    return;
  }

  const tokens = [];
  for (const doc of data.documents) {
    const fields = doc.fields || {};
    if (fields.expoPushToken?.stringValue) {
      tokens.push(fields.expoPushToken.stringValue);
      const email = fields.email?.stringValue || 'unknown';
      console.log(`Found token for: ${email}`);
    }
  }

  if (tokens.length === 0) {
    console.log('No push tokens found. Make sure farmers have logged in with the app at least once.');
    return;
  }

  // Send via Expo Push API
  const messages = tokens.map(token => ({
    to: token,
    title,
    body,
    sound: 'default',
    data: { type: 'pest_alert' },
  }));

  const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  const pushData = await pushRes.json();
  console.log(`\nSent to ${tokens.length} device(s):`, JSON.stringify(pushData, null, 2));
}

sendNotifications().catch(console.error);
