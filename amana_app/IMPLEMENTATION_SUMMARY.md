# Flutter WebView App - Implementation Summary

## Overview
Created a Flutter mobile app that wraps www.amanamarkets.org in a native Android app with Firebase Cloud Messaging (FCM) push notifications.

## Architecture

### Frontend: Flutter App
- **Location**: `amana_app/`
- **Main Entry**: `lib/main.dart`
- **Framework**: Flutter with InAppWebView
- **Purpose**: Provides native Android wrapper around website with Firebase integration

### Backend: Supabase Edge Functions
- **Save FCM Token**: `supabase/functions/save-fcm-token/`
  - Endpoint: `POST /functions/v1/save-fcm-token`
  - Stores user's FCM token for push notification targeting
  
- **Send Notifications**: `supabase/functions/send-notification/`
  - Endpoint: `POST /functions/v1/send-notification`
  - Sends FCM messages to users/teams

### Database
- **Supabase PostgreSQL**: `profiles` table
- **New Column**: `fcm_token` (added via migration)

---

## Key Features Implemented

### 1. Login Persistence ✅
**Problem**: Users not staying logged in after restart

**Solution**:
```dart
InAppWebViewSettings(
  domStorageEnabled: true,      // localStorage/sessionStorage
  databaseEnabled: true,        // WebSQL
  cacheEnabled: true,           // HTTP cache
  clearCache: false,            // Keep cache on app restart
  thirdPartyCookiesEnabled: true // Cross-domain cookies
  useHybridComposition: true,   // Better performance
)
```

**How it works**:
- Enables all storage mechanisms the website needs
- Cookies survive app restarts
- localStorage and sessionStorage persist
- Website session maintained across sessions

---

### 2. System Notifications ✅
**Problem**: Notifications only showing as AlertDialog inside app, not in Android notification bar

**Solution**: Added `flutter_local_notifications` package with Firebase integration

**Implementation**:
```dart
// Initialize local notifications in main()
const AndroidInitializationSettings initializationSettingsAndroid =
    AndroidInitializationSettings('@mipmap/ic_launcher');
const InitializationSettings initializationSettings =
    InitializationSettings(android: initializationSettingsAndroid);
await flutterLocalNotificationsPlugin.initialize(initializationSettings);

// Show system notification on foreground message
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  flutterLocalNotificationsPlugin.show(
    notification.hashCode,
    notification.title,
    notification.body,
    const NotificationDetails(
      android: AndroidNotificationDetails(
        'amana_channel',
        'Amana Notifications',
        importance: Importance.max,
        priority: Priority.high,
      ),
    ),
  );
});
```

**What users will see**:
- ✅ System notification bar alert (Android 8+)
- ✅ Sound + vibration
- ✅ High priority notifications
- ✅ Appears even when app is closed (via FCM)

---

### 3. FCM Token Management ✅
**Flow**:
1. App starts → Firebase initializes
2. Get FCM token
3. POST token to `save-fcm-token` Edge Function
4. Backend stores in `profiles.fcm_token`
5. Admin sends notification via `send-notification` function
6. Firebase delivers to all stored tokens
7. App displays as system notification

**Configuration**:
- Firebase Project: `android-app-14bfe`
- Android MinSDK: 21+
- Automatic credential setup via `firebase_options.dart`

---

### 4. Fullscreen Native Experience ✅
- Immersive sticky mode (edge-to-edge display)
- No Flutter UI chrome (removed AppBar)
- Proper Android back button handling
- Debug banner disabled

---

## File Structure

```
amana_app/
├── lib/
│   ├── main.dart                    # Main app logic (FCM + WebView)
│   └── firebase_options.dart        # Auto-generated Firebase config
├── android/
│   ├── app/build.gradle.kts         # Gradle config with desugaring
│   ├── app/src/main/AndroidManifest.xml  # Permissions + notification config
│   └── gradle.properties            # Gradle optimizations
└── pubspec.yaml                     # Dependencies

supabase/functions/
├── save-fcm-token/                  # Store device tokens
├── send-notification/               # Send push notifications
└── migrations/                      # Add fcm_token column
```

---

## Dependencies Added

```yaml
flutter_local_notifications: ^17.2.1  # System notifications
firebase_messaging: ^16.2.2           # FCM
flutter_inappwebview: ^6.1.5          # WebView
firebase_core: ^4.9.0                 # Firebase setup
http: ^1.6.0                          # HTTP requests
```

---

## Android Build Configuration

**Key Settings** (`android/app/build.gradle.kts`):
```kotlin
compileOptions {
  isCoreLibraryDesugaringEnabled = true  // For flutter_local_notifications
}

dependencies {
  coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.4")
}
```

**AndroidManifest.xml**:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="amana_channel"/>
```

---

## Testing the App

### 1. Build APK
```bash
cd amana_app
flutter clean
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### 2. Install on Device/Emulator
```bash
flutter install --release
# or
adb install build/app/outputs/flutter-apk/app-release.apk
```

### 3. Test Login Persistence
1. Open app
2. Navigate to amanamarkets.org
3. Log in
4. Close app completely
5. Reopen app
6. Should still be logged in ✅

### 4. Test Notifications
1. Go to admin dashboard
2. Send test notification via `notifyUser()` or `notifyTeam()`
3. Watch device notification bar
4. Notification should appear as system alert ✅

---

## Deployment Notes

### For Admin Dashboard
Call notification functions from React:
```typescript
import { notifyUser, notifyTeam } from '@/lib/notificationService';

// When recording payment
await notifyPaymentRecorded(userId, amount);

// When announcing team update
await notifyTeamRotation(teamId, message);
```

### APK Distribution
- **Development**: `app-debug.apk` for testing
- **Release**: `app-release.apk` for Play Store / manual distribution
- **Size**: ~50-60 MB typical

---

## Common Issues & Fixes

### Issue: Login not persisting
**Fix**: Ensure `clearCache: false` and `domStorageEnabled: true`

### Issue: No notification bar alerts
**Fix**: Use `flutter_local_notifications` instead of just Firebase callbacks

### Issue: Core library desugaring error
**Fix**: Add `isCoreLibraryDesugaringEnabled = true` to build.gradle.kts

### Issue: App crashing on Android 6-7
**Fix**: Already handled with minSdk: 21+

---

## Future Enhancements

1. **Deep Linking**: Handle notification taps to open specific pages
2. **In-App Messaging**: Firebase In-App Messaging for promotions
3. **Analytics**: Track user engagement, payment actions
4. **Offline Support**: Cache website for offline access
5. **Biometric Login**: Add fingerprint unlock
6. **Push Notification History**: Show past notifications in app

---

## Support & Troubleshooting

### Check FCM Token
```dart
_firebaseMessaging.getToken().then((token) {
  print("FCM Token: $token");
});
```

### Verify Token Saved
```sql
SELECT id, email, fcm_token FROM profiles LIMIT 10;
```

### Test Notification Send
```bash
curl -X POST https://wwtkejyxzllucfsksypn.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","title":"Test","body":"Hello"}'
```

---

**Build Date**: May 2026
**Flutter Version**: 3.x+
**Android Target**: SDK 21+ (Android 5.0+)
