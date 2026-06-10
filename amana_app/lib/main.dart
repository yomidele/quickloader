import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

// Local notifications plugin for showing system notifications
final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

// Secure storage for auth tokens (BUG FIX 1: Login persistence)
const FlutterSecureStorage secureStorage = FlutterSecureStorage();

// Cookie manager for WebView persistence
final CookieManager cookieManager = CookieManager.instance();

// ============================================================================
// BACKGROUND MESSAGE HANDLER (BUG FIX 2: Push notifications when app closed)
// ============================================================================
// CRITICAL: This must be a top-level function (not inside a class)
// The @pragma annotation tells Flutter to keep this function in release builds
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Initialize Firebase for background context
  await Firebase.initializeApp();
  
  print("Background message received: ${message.notification?.title}");
  print("Background message data: ${message.data}");
  
  // Initialize local notifications if not already done
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  const InitializationSettings initializationSettings =
      InitializationSettings(
    android: initializationSettingsAndroid,
  );
  await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  
  RemoteNotification? notification = message.notification;
  
  // Show notification in system notification bar (high importance = heads-up popup)
  if (notification != null) {
    print("Showing background notification: ${notification.title}");
    
    await flutterLocalNotificationsPlugin.show(
      notification.hashCode,
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'amana_channel',
          'Amana Notifications',
          importance: Importance.max,
          priority: Priority.high,
          enableVibration: true,
          playSound: true,
        ),
      ),
      payload: message.data.isNotEmpty ? jsonEncode(message.data) : null,
    );
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Enable fullscreen mode
  SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.immersiveSticky,
  );

  // Initialize Firebase
  await Firebase.initializeApp();

  // Initialize local notifications with proper channel configuration
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');

  final AndroidNotificationChannel channel = AndroidNotificationChannel(
    'amana_channel',
    'Amana Notifications',
    description: 'Important notifications from Amana Markets',
    importance: Importance.max,
    enableVibration: true,
    playSound: true,
  );

  const InitializationSettings initializationSettings =
      InitializationSettings(
    android: initializationSettingsAndroid,
  );

  await flutterLocalNotificationsPlugin.initialize(
    initializationSettings,
  );

  // Create notification channel for Android 8.0+
  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  // Register background message handler (BUG FIX 2)
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Amana Markets',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late InAppWebViewController _webViewController;
  bool _isLoading = true;
  late FirebaseMessaging _firebaseMessaging;

  @override
  void initState() {
    super.initState();
    _setupFirebaseMessaging();
  }

  // =========================================================================
  // BUG FIX 1: Load saved auth token from secure storage on app launch
  // =========================================================================
  Future<void> _restoreAuthTokens() async {
    try {
      print("Checking for saved auth token...");
      final savedToken = await secureStorage.read(key: 'auth_token');
      
      if (savedToken != null) {
        print("Auth token found, restoring to WebView...");
        // Inject token as cookie for the domain
        await _injectAuthCookie(savedToken);
      } else {
        print("No saved auth token found");
      }
    } catch (e) {
      print("Error restoring auth token: $e");
    }
  }

  // =========================================================================
  // BUG FIX 1: Inject auth token as a cookie in WebView
  // =========================================================================
  Future<void> _injectAuthCookie(String token) async {
    try {
      // Replace 'yourdomain.com' with your actual domain
      await _webViewController.evaluateJavascript(source: '''
        document.cookie = "auth_token=$token; path=/; SameSite=Lax;";
        localStorage.setItem('auth_token', '$token');
        console.log('Auth token injected');
      ''');
      print("Auth cookie injected into WebView");
    } catch (e) {
      print("Error injecting auth cookie: $e");
    }
  }

  // =========================================================================
  // BUG FIX 1: Listen for login event from website via JavaScript bridge
  // =========================================================================
  void _setupJavaScriptBridge() {
    // Add a JavaScript channel so the website can communicate with Flutter
    // The website can call: FlutterBridge.postMessage(JSON.stringify({type:'LOGIN', token:'...'}))
    _webViewController.addJavaScriptHandler(
      handlerName: 'FlutterBridge',
      callback: (args) async {
        if (args.isNotEmpty) {
          try {
            final message = jsonDecode(args[0]);
            final type = message['type'] as String?;

            // Handle LOGIN event: Save token to secure storage
            if (type == 'LOGIN') {
              final token = message['token'] as String?;
              if (token != null) {
                print("LOGIN event received, saving token...");
                await secureStorage.write(key: 'auth_token', value: token);
                print("Auth token saved securely");
              }
            }
            // Handle LOGOUT event: Clear token from secure storage
            else if (type == 'LOGOUT') {
              print("LOGOUT event received, clearing token...");
              await secureStorage.delete(key: 'auth_token');
              print("Auth token cleared");
            }
          } catch (e) {
            print("Error handling JavaScript bridge message: $e");
          }
        }
      },
    );
  }

  // =========================================================================
  // BUG FIX 2: Setup Firebase Cloud Messaging (FCM)
  // =========================================================================
  void _setupFirebaseMessaging() {
    _firebaseMessaging = FirebaseMessaging.instance;

    // Request notification permissions (required for iOS + Android 13+)
    _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    // Configure foreground notification presentation
    // Without this, notifications are silent when app is in foreground
    _firebaseMessaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // Get FCM token and send to backend, then inject into WebView
    _firebaseMessaging.getToken().then((token) {
      print("FCM TOKEN: $token");
      if (token != null) {
        _sendTokenToBackend(token);
        // Inject token into WebView once page has loaded
        _injectFCMTokenToWebView(token);
      }
    });

    // =========================================================================
    // BUG FIX 2: Handle foreground messages (app is open)
    // =========================================================================
    // Show heads-up notification even when app is in foreground (like WhatsApp)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Foreground message received: ${message.notification?.title}');
      print('Message data: ${message.data}');
      
      if (message.notification != null) {
        _showSystemNotification(
          message.notification!.title ?? 'Notification',
          message.notification!.body ?? '',
          message.data,
        );
      }
    });

    // =========================================================================
    // BUG FIX 2: Handle notification tap from background/terminated state
    // =========================================================================
    // When user taps a notification from system tray, inject payload into WebView
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('Notification tapped from background/terminated state');
      if (message.data.isNotEmpty) {
        print('Message data: ${message.data}');
        // Inject notification payload into WebView so web app can handle navigation
        _injectNotificationPayloadToWebView(message.data);
      }
    });

    // Token refresh listener (FCM token changes periodically)
    _firebaseMessaging.onTokenRefresh.listen((newToken) {
      print("New FCM Token: $newToken");
      _sendTokenToBackend(newToken);
      // Also inject updated token into WebView
      _injectFCMTokenToWebView(newToken);
    });
  }

  Future<void> _sendTokenToBackend(String token) async {
    try {
      // TODO: Get user ID from your app's auth system
      final userId = "USER_ID_HERE"; // Replace with actual user ID from auth

      final uri = Uri.https(
        'wwtkejyxzllucfsksypn.supabase.co',
        '/functions/v1/save-fcm-token',
      );

      final response = await http.post(
        uri,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "userId": userId,
          "fcmToken": token,
        }),
      );

      if (response.statusCode == 200) {
        print("FCM Token saved successfully");
      } else {
        print("Failed to save FCM token: ${response.statusCode}");
        print("Response: ${response.body}");
      }
    } catch (e) {
      print("Error sending token to backend: $e");
    }
  }

  Future<void> _showSystemNotification(
    String title,
    String message, [
    Map<String, dynamic>? data,
  ]) async {
    await flutterLocalNotificationsPlugin.show(
      title.hashCode,
      title,
      message,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'amana_channel',
          'Amana Notifications',
          importance: Importance.max,
          priority: Priority.high,
          enableVibration: true,
          playSound: true,
        ),
      ),
      payload: data != null ? jsonEncode(data) : null,
    );
  }

  // =========================================================================
  // BUG FIX 2: Inject FCM token into WebView on page load
  // =========================================================================
  // The web app can listen for the 'fcmTokenReady' event to know when the
  // token is available. Example:
  // window.addEventListener('fcmTokenReady', () => {
  //   console.log('FCM Token:', window.fcmToken);
  //   // Send to Supabase to store for this user
  // });
  Future<void> _injectFCMTokenToWebView(String fcmToken) async {
    try {
      await _webViewController.evaluateJavascript(
        source: "window.fcmToken = '$fcmToken'; window.dispatchEvent(new Event('fcmTokenReady'));",
      );
      print("FCM token injected into WebView: $fcmToken");
    } catch (e) {
      print("Error injecting FCM token: $e");
    }
  }

  // =========================================================================
  // BUG FIX 2: Inject notification payload into WebView on tap
  // =========================================================================
  // The web app should implement a global handler:
  // window.handleNotificationTap = (payload) => {
  //   console.log('Notification tapped:', payload);
  //   // Navigate to the relevant page based on payload
  // };
  Future<void> _injectNotificationPayloadToWebView(
    Map<String, dynamic> payloadData,
  ) async {
    try {
      final jsonPayload = jsonEncode(payloadData);
      await _webViewController.evaluateJavascript(
        source: "if (window.handleNotificationTap) { window.handleNotificationTap($jsonPayload); }",
      );
      print("Notification payload injected into WebView");
    } catch (e) {
      print("Error injecting notification payload: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (await _webViewController.canGoBack()) {
          await _webViewController.goBack();
          return false;
        }
        return true;
      },
      child: Scaffold(
        body: Stack(
          children: [
            InAppWebView(
              initialSettings: InAppWebViewSettings(
                useShouldOverrideUrlLoading: true,
                mediaPlaybackRequiresUserGesture: false,
                javaScriptEnabled: true,
                domStorageEnabled: true,
                databaseEnabled: true,
                cacheEnabled: true,
                clearCache: false,
                thirdPartyCookiesEnabled: true,
                useHybridComposition: true,
              ),
              onWebViewCreated: (controller) {
                _webViewController = controller;
                // Setup JavaScript bridge for login/logout events (BUG FIX 1)
                _setupJavaScriptBridge();
              },
              onLoadStart: (controller, url) {
                setState(() => _isLoading = true);
              },
              onLoadStop: (controller, url) async {
                setState(() => _isLoading = false);
                // Restore saved auth tokens after page loads (BUG FIX 1)
                await _restoreAuthTokens();
                // Inject FCM token after page has loaded (BUG FIX 2)
                try {
                  final token = await _firebaseMessaging.getToken();
                  if (token != null) {
                    await _injectFCMTokenToWebView(token);
                  }
                } catch (e) {
                  print("Error injecting FCM token on page load: $e");
                }
              },
              onReceivedError: (controller, request, error) {
                print('WebView error: ${error.description}');
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: ${error.description}')),
                );
              },
              onReceivedServerTrustAuthRequest: (controller, challenge) async {
                // Handle SSL certificate errors by proceeding despite certificate issues
                // This is necessary when loading websites with outdated or misconfigured SSL certificates
                print('SSL Challenge received for: ${challenge.protectionSpace.host}');
                return ServerTrustAuthResponse(
                  action: ServerTrustAuthResponseAction.PROCEED,
                );
              },
              onReceivedClientCertRequest: (controller, challenge) async {
                // Handle client certificate requests by canceling
                // This wrapper format is required by flutter_inappwebview
                return ClientCertResponse(
                  action: ClientCertResponseAction.CANCEL,
                );
              },
              androidOnPermissionRequest:
                  (controller, origin, resources) async {
                return PermissionRequestResponse(
                  resources: resources,
                  action: PermissionRequestResponseAction.GRANT,
                );
              },
              initialUrlRequest: URLRequest(
                url: WebUri("https://www.amanamarkets.org"),
              ),
            ),
            if (_isLoading)
              Container(
                color: Colors.white.withOpacity(0.7),
                child: const Center(
                  child: CircularProgressIndicator(),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
