# Bug Fixes Implementation Guide

## Overview
This document explains the two critical bug fixes implemented in your Flutter WebView wrapper app:
1. **Login Persistence** - Session tokens are now saved securely and restored on app launch
2. **Push Notifications** - Notifications now appear in the system tray and as heads-up popups

---

## BUG FIX 1: Login Persistence

### Problem
Users had to log in every time they closed and reopened the app.

### Solution
The app now uses `flutter_secure_storage` to save authentication tokens to the device's secure keychain/keystore. On app launch, the saved token is automatically restored to the WebView.

### How It Works

#### 1. Website sends login token to Flutter
When the user logs in on your website, the JavaScript must send the auth token to Flutter:

```javascript
// When user logs in successfully, send token to Flutter
const authToken = "jwt_token_here_or_session_id";
window.FlutterBridge.postMessage(JSON.stringify({
  type: 'LOGIN',
  token: authToken
}));
```

#### 2. Flutter saves the token
The Flutter app receives the message via the `FlutterBridge` JavaScript channel and saves it to secure storage automatically (no additional code needed).

#### 3. On app restart, token is restored
When the app launches:
- Reads the saved token from secure storage
- Injects it as a cookie into the WebView
- The website sees the user as already logged in

#### 4. Website sends logout event
When the user logs out on your website:

```javascript
// When user logs out, notify Flutter
window.FlutterBridge.postMessage(JSON.stringify({
  type: 'LOGOUT'
}));
```

Flutter will automatically clear the saved token.

### Website Code Integration

Add this code to your login page (e.g., after successful login API call):

```javascript
// After successful login
async function handleLoginSuccess(response) {
  const authToken = response.token; // or response.access_token, depending on your API
  
  // Save to localStorage (for website functionality)
  localStorage.setItem('auth_token', authToken);
  
  // Notify Flutter app to save token securely
  if (window.FlutterBridge) {
    window.FlutterBridge.postMessage(JSON.stringify({
      type: 'LOGIN',
      token: authToken
    }));
    console.log('Token sent to Flutter');
  } else {
    console.log('FlutterBridge not available (running in browser)');
  }
}

// On logout
function handleLogout() {
  // Clear localStorage
  localStorage.removeItem('auth_token');
  
  // Notify Flutter to clear secure storage
  if (window.FlutterBridge) {
    window.FlutterBridge.postMessage(JSON.stringify({
      type: 'LOGOUT'
    }));
    console.log('Logout signal sent to Flutter');
  }
}
```

### Changes Made

**pubspec.yaml:**
- Added `flutter_secure_storage: ^9.0.0`

**main.dart:**
- Added secure storage import and initialization
- Added `_restoreAuthTokens()` method that loads saved tokens on app launch
- Added `_injectAuthCookie()` method that injects token as a cookie
- Added `_setupJavaScriptBridge()` to listen for LOGIN/LOGOUT events from website
- Calls `_restoreAuthTokens()` after WebView loads

### Testing Login Persistence

1. **First time:** User logs in on the website via the app
2. **Close the app** completely
3. **Reopen the app** - user should still be logged in without needing to enter credentials again
4. **Verify in console:** Open Chrome DevTools on the website → Application → Cookies → should see `auth_token`

### ⚠️ Important Notes

- Replace the domain in `_injectAuthCookie()` if different from `yourdomain.com`
- The token is stored securely in:
  - **iOS:** Keychain
  - **Android:** EncryptedSharedPreferences (Android 6+) or Keystore
- Tokens are NOT accessible to other apps
- On device logout, both localStorage AND secure storage are cleared

---

## BUG FIX 2: Push Notifications

### Problem
Notifications were not appearing in the system tray when the app was backgrounded or closed.

### Solution
Implemented proper Firebase Cloud Messaging (FCM) with `flutter_local_notifications` for heads-up popups. The app now handles notifications in all three states:
- **Foreground:** Heads-up popup (like WhatsApp)
- **Background:** Notification in system tray
- **Terminated:** Notification appears when app is closed, tapping it opens the app

### How It Works

#### 1. FCM Token Registration
On first app launch:
- App registers with Firebase Cloud Messaging
- Gets a unique FCM token
- Sends token to your backend (for server to know where to send messages)

#### 2. Foreground Notifications
When app is open and a message arrives:
- `flutter_local_notifications` shows a heads-up popup
- Notification plays sound and vibrates
- User can interact with the notification

#### 3. Background/Terminated Notifications
When app is closed or backgrounded:
- `firebaseMessagingBackgroundHandler` (top-level function) handles the message
- Shows notification in system notification panel
- High importance ensures it pops up on screen

#### 4. Notification Tap
When user taps a notification from the system tray:
- App opens
- If `url` is in notification payload, WebView navigates to that URL
- Firebase automatically handles opening the app

### Server-Side Setup (Backend)

Your backend needs to send push notifications via Firebase Admin SDK. Here's an example Node.js code:

```javascript
// Node.js Example - Using Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  projectId: 'your-firebase-project-id'
});

// Send notification to a specific device
async function sendPushNotification(fcmToken, title, body, urlData) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      url: urlData || '', // Optional: URL to navigate to when notification is tapped
    },
    android: {
      ttl: 86400, // 24 hours
      notification: {
        channelId: 'amana_channel',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          alert: {
            title: title,
            body: body,
          },
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Send to a user
const fcmToken = 'token_from_your_database';
await sendPushNotification(
  fcmToken,
  'Payment Received',
  'Your payment of $100 has been confirmed',
  'https://www.amanamarkets.org/payments/12345'
);
```

### Changes Made

**pubspec.yaml:**
- Already had `firebase_messaging: ^16.2.2` and `flutter_local_notifications: ^17.2.1`

**main.dart:**
- Added `@pragma('vm:entry-point')` to `firebaseMessagingBackgroundHandler` (critical for release builds)
- Enhanced notification channel creation with HIGH importance for heads-up popups
- Added foreground message listener to show heads-up notifications
- Added notification tap handler to navigate WebView to URL from payload
- Created `AndroidNotificationChannel` with `importance: Importance.max`
- Request notification permissions on startup

**android/app/src/main/AndroidManifest.xml:**
- Added comment explaining POST_NOTIFICATIONS permission (Android 13+)
- Added comment for notification channel configuration

**ios/Runner/AppDelegate.swift:**
- Import `UserNotifications` framework
- Register for remote notifications: `application.registerForRemoteNotifications()`
- Set `UNUserNotificationCenter` delegate for foreground notification handling
- Override `userNotificationCenter(_:willPresent:)` to show notifications in foreground
- Added error handling for notification registration failures

### Testing Push Notifications

#### Via Firebase Console (Free & Easy)
1. Go to Firebase Console → Cloud Messaging
2. Create a new campaign
3. Paste the FCM token (printed in console: `FCM TOKEN: xxx`)
4. Send test notification
5. Verify it appears in system tray and as a popup

#### Via Firebase Admin SDK (Programmatic)
Use the Node.js example code above to send notifications from your backend.

### Notification Payload Examples

**Basic notification:**
```json
{
  "notification": {
    "title": "Payment Received",
    "body": "Your payment has been processed"
  },
  "data": {
    "url": "https://www.amanamarkets.org/payments"
  }
}
```

**With data for custom handling:**
```json
{
  "notification": {
    "title": "New Order",
    "body": "Order #12345 has been confirmed"
  },
  "data": {
    "url": "https://www.amanamarkets.org/orders/12345",
    "orderId": "12345",
    "action": "order_received"
  }
}
```

### ⚠️ Important Notes

- **Firebase Setup Required:** Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) from Firebase Console
- **iOS Signing & Capabilities:** Enable "Push Notifications" capability in Xcode (Runner target → Signing & Capabilities)
- **Android 13+:** The app requests POST_NOTIFICATIONS permission on launch
- **Token Changes:** FCM tokens can change periodically; the app listens for `onTokenRefresh` and sends new tokens to backend
- **Notification Channel:** All notifications go to `amana_channel` (configured in code)
- **Timeout:** Notifications have 24-hour TTL (time to live) on Android

---

## Firebase Setup Checklist

Before testing, ensure Firebase is properly configured:

### Android
- [ ] Download `google-services.json` from Firebase Console
- [ ] Place it in `android/app/` directory
- [ ] Ensure `google-services` Gradle plugin is added (usually auto-detected)
- [ ] Test with: `flutter run` on Android device

### iOS
- [ ] Download `GoogleService-Info.plist` from Firebase Console
- [ ] Add to Xcode: Right-click Runner → Add Files → GoogleService-Info.plist
- [ ] In Xcode, open Runner target → Signing & Capabilities
- [ ] Add capability: **Push Notifications**
- [ ] Add capability: **Apple Push Notification service (APNs)** (if available)
- [ ] Test with: `flutter run` on iOS device

### Backend
- [ ] Get Firebase Admin SDK credentials (service account key JSON)
- [ ] Set up your backend to send messages via Firebase Admin SDK
- [ ] Store user FCM tokens in your database (linked to user ID)
- [ ] Implement endpoint to send notifications to users

---

## Troubleshooting

### Issue: Token not persisting
**Solution:**
- Check device has secure storage capability (all modern devices do)
- Verify `FlutterBridge.postMessage()` is being called from website
- Check console logs: `flutter logs` should show "Auth token saved securely"

### Issue: Notifications not appearing
**Check:**
1. **Permissions:** User granted notification permission on app launch?
2. **FCM Token:** Is it being sent to Firebase? Check console: `FCM TOKEN: ...`
3. **Notification Payload:** Ensure `notification` field exists in payload (not just `data`)
4. **Channel ID:** Android notifications must use `amana_channel`
5. **Foreground:** Is app in foreground? Foreground notifications need explicit display

### Issue: Notification tap not navigating
**Solution:**
- Ensure `url` is in notification `data` payload
- URL must be valid and match your domain
- Check console logs for navigation errors

### Issue: iOS notifications not showing
**Check:**
1. Push Notifications capability enabled in Xcode?
2. Device has valid APNs certificate in Apple Developer?
3. App has notification permission (iOS shows prompt)?
4. Restart device after capability changes

---

## Code References

### Flutter
- [firebase_messaging](https://pub.dev/packages/firebase_messaging)
- [flutter_local_notifications](https://pub.dev/packages/flutter_local_notifications)
- [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage)

### Backend
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Send messages to devices](https://firebase.google.com/docs/cloud-messaging/send-message)

---

## Summary of Changes

| File | Change | Bug Fix |
|------|--------|---------|
| pubspec.yaml | Added `flutter_secure_storage: ^9.0.0` | #1 |
| main.dart | Complete rewrite with secure storage, JS bridge, notification handlers | #1, #2 |
| AndroidManifest.xml | Added permission and notification channel comments | #2 |
| AppDelegate.swift | Added remote notification registration and foreground handling | #2 |

---

## Next Steps

1. **Run:** `flutter pub get` to install new dependencies
2. **Setup Firebase:** Download service files (google-services.json, GoogleService-Info.plist)
3. **Website Integration:** Add `FlutterBridge` calls to login/logout code
4. **Test Login Persistence:** Login → close app → reopen (should stay logged in)
5. **Test Notifications:** Send test notification via Firebase Console
6. **Production:** Ensure all Firebase configuration is production-ready

---

## Support

If you encounter issues:
1. Check Flutter logs: `flutter logs`
2. Verify Firebase configuration: `firebase-tools`
3. Test on real device (emulator limitations for notifications)
4. Enable debugging: Add `enableVerboseLogging = true` in Firebase config
