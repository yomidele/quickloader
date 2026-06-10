# Quick-Start Checklist: Bug Fixes Implementation

## ✅ What's Already Done

- [x] **pubspec.yaml** - Added `flutter_secure_storage: ^9.0.0`
- [x] **main.dart** - Complete rewrite with:
  - Secure token storage and restoration
  - JavaScript bridge for login/logout events
  - Enhanced FCM notification handling
  - Foreground notification popups
  - Notification tap navigation
- [x] **AndroidManifest.xml** - Notification configuration
- [x] **AppDelegate.swift** - iOS remote notification registration

---

## 🔧 Next Steps (In Order)

### Step 1: Install Dependencies
```bash
cd amana_app
flutter pub get
```

### Step 2: Firebase Configuration (Required for Notifications)

#### Android Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Select your project (create one if needed)
- [ ] Add Android app: Project Settings → Add App → Android
- [ ] Enter app package name: `com.example.amana_app` (or your actual package name)
- [ ] Download `google-services.json`
- [ ] Save to: `amana_app/android/app/google-services.json`
- [ ] In `android/build.gradle`, ensure this exists:
  ```gradle
  classpath 'com.google.gms:google-services:4.3.15'
  ```
- [ ] In `android/app/build.gradle`, ensure this exists at the bottom:
  ```gradle
  apply plugin: 'com.google.gms.google-services'
  ```

#### iOS Setup
- [ ] In [Firebase Console](https://console.firebase.google.com/), Add iOS app
- [ ] Enter bundle ID (find in Xcode: Runner → General → Bundle Identifier)
- [ ] Download `GoogleService-Info.plist`
- [ ] Open `amana_app/ios/Runner.xcworkspace` in Xcode
- [ ] Drag `GoogleService-Info.plist` into Xcode (check "Copy items if needed")
- [ ] Select Runner target → Signing & Capabilities
- [ ] Click "+ Capability" → Add **Push Notifications**
- [ ] Add capability: **Apple Push Notification service (APNs)** (if available)

### Step 3: Update Website (Login/Logout Integration)

#### Option A: If using HTML/vanilla JS
- [ ] Include `WEBSITE_INTEGRATION.js` in your website:
  ```html
  <script src="/path/to/WEBSITE_INTEGRATION.js"></script>
  ```
- [ ] In your login handler, call:
  ```javascript
  handleLoginSuccess(response); // instead of just setting token
  ```
- [ ] In your logout handler, call:
  ```javascript
  await handleLogout(); // instead of just clearing localStorage
  ```

#### Option B: If using React/Vue/Angular
- [ ] Copy the relevant functions from `WEBSITE_INTEGRATION.js`
- [ ] Call `sendLoginToFlutter(token)` after successful login
- [ ] Call `sendLogoutToFlutter()` on logout
- [ ] Call `checkAuthStatus()` on app initialization

### Step 4: Test Login Persistence (Bug Fix #1)

- [ ] Run app on device: `flutter run`
- [ ] Navigate to login page in WebView
- [ ] Login with valid credentials
- [ ] Check console: `flutter logs` should show: `✓ Login event sent to Flutter app`
- [ ] **Close the app completely** (swipe from recent apps, not just back button)
- [ ] **Reopen the app** - should still be logged in without login prompt
- [ ] ✅ If yes → Bug #1 is fixed!

**Troubleshooting:**
- If not persisting: Check website is calling `sendLoginToFlutter()` or `handleLoginSuccess()`
- If console shows nothing: Verify `FlutterBridge` JavaScript channel is loaded

### Step 5: Test Push Notifications (Bug Fix #2)

- [ ] Run app on device: `flutter run`
- [ ] Watch console: `flutter logs | grep "FCM TOKEN"`
- [ ] Copy the FCM token (looks like: `c1b2a3d4e5f6...`)
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Select your project → Cloud Messaging
- [ ] Click "Send your first message"
- [ ] Enter:
  - **Notification title:** "Test Message"
  - **Notification text:** "This is a test"
  - **Target:** Select "App" → Your App → Topic or specific device
  - **Additional options** → Add custom data (optional):
    - Key: `url`
    - Value: `https://www.amanamarkets.org` (or any URL on your domain)
- [ ] Click "Review" → "Publish"
- [ ] Watch for notification:
  - **If app is open:** Should see popup at top of screen
  - **If app is closed:** Check notification panel (pull down from top)
  - **Tap notification:** App should open and load the URL

**Troubleshooting:**
- No FCM token printed: Firebase not initialized properly
- Notification not appearing: Check notification permissions in device settings
- Notification appears but no popup: Ensure notification channel is HIGH importance

### Step 6: Backend Integration (Notifications)

- [ ] Set up backend to store FCM tokens linked to user IDs
- [ ] When a user logs in via app:
  - [ ] Save their FCM token: `{ userId: "123", fcmToken: "xyz..." }`
  - [ ] This is done by calling `/functions/v1/save-fcm-token` (see `main.dart`)
- [ ] When sending notifications:
  - [ ] Query database for user's FCM token
  - [ ] Send via Firebase Admin SDK
  - [ ] Example notification payload:
    ```json
    {
      "notification": {
        "title": "Payment Received",
        "body": "Your payment of $100 has been confirmed"
      },
      "data": {
        "url": "https://www.amanamarkets.org/payments/12345"
      },
      "token": "user_fcm_token_here"
    }
    ```

---

## 📋 File Summary

| File | Purpose | Status |
|------|---------|--------|
| `main.dart` | Flutter app entry point with all fixes | ✅ Complete |
| `pubspec.yaml` | Dependencies | ✅ Complete |
| `android/app/src/main/AndroidManifest.xml` | Android permissions & config | ✅ Complete |
| `ios/Runner/AppDelegate.swift` | iOS notification handling | ✅ Complete |
| `BUG_FIXES_IMPLEMENTATION_GUIDE.md` | Detailed technical documentation | ✅ Provided |
| `WEBSITE_INTEGRATION.js` | Website-side JavaScript code | ✅ Provided |
| `google-services.json` | Firebase Android config | 🔲 Need to download |
| `GoogleService-Info.plist` | Firebase iOS config | 🔲 Need to download |

---

## 🚀 Deployment Checklist

Before releasing to production:

### Security
- [ ] Replace `yourdomain.com` in `_injectAuthCookie()` with actual domain
- [ ] Ensure HTTPS is used for website (not HTTP)
- [ ] Verify token is JWT or secure session token
- [ ] Enable Firebase security rules to prevent unauthorized access

### Testing
- [ ] Test on real Android device (Android 8.0+)
- [ ] Test on real iOS device (iOS 12.0+)
- [ ] Test login persistence across multiple app restarts
- [ ] Test notifications with various payloads
- [ ] Test on slow network conditions
- [ ] Test on offline mode

### Monitoring
- [ ] Set up Firebase analytics to track notification delivery
- [ ] Monitor console logs for errors
- [ ] Track FCM token refresh events
- [ ] Monitor notification engagement (tap-through rates)

---

## 🔗 Important Links

- [Firebase Console](https://console.firebase.google.com/)
- [Flutter Firebase Setup](https://firebase.flutter.dev/docs/overview)
- [flutter_secure_storage Docs](https://pub.dev/packages/flutter_secure_storage)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [flutter_local_notifications](https://pub.dev/packages/flutter_local_notifications)

---

## ❓ FAQ

**Q: Will tokens persist if user updates the app?**
A: Yes, tokens are stored securely on device and survive app updates.

**Q: What happens if user uninstalls and reinstalls app?**
A: Token will be cleared (device storage is wiped). User needs to log in again.

**Q: Can I send notifications to all users at once?**
A: Yes, use FCM Topics. Subscribe users to a topic when they log in, then send to the topic.

**Q: Do I need the website URL to match the token domain?**
A: Yes, when injecting cookies, specify the correct domain. Update this line in `_injectAuthCookie()`:
```dart
// Change 'yourdomain.com' to your actual domain
document.cookie = "auth_token=$token; path=/; SameSite=Lax; domain=.yourdomain.com;";
```

**Q: What if token expires while user is in app?**
A: App should redirect to login. Implement a 401 error handler on your website.

---

## 📞 Support Resources

- **Flutter Docs:** https://flutter.dev/docs
- **Firebase Support:** https://firebase.google.com/support
- **Stack Overflow:** Tag your questions with `flutter` and `firebase`
- **GitHub Issues:** Report bugs in respective package repositories

---

## ✨ That's It!

Once you complete all steps:
- ✅ Login will persist indefinitely
- ✅ Push notifications will appear in system tray
- ✅ Foreground notifications will popup on screen
- ✅ Notification taps will navigate to correct URLs

Good luck! 🎉
