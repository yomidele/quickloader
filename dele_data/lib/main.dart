import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

// Secure storage for auth tokens (for login persistence)
const FlutterSecureStorage secureStorage = FlutterSecureStorage();

// Cookie manager for WebView persistence
final CookieManager cookieManager = CookieManager.instance();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Enable fullscreen mode
  SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.immersiveSticky,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dele Data',
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

  @override
  void initState() {
    super.initState();
  }

  // Load saved auth token from secure storage on app launch
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

  // Inject auth token as a cookie in WebView
  Future<void> _injectAuthCookie(String token) async {
    try {
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

  // Listen for login event from website via JavaScript bridge
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
                javaScriptCanOpenWindowsAutomatically: true,
                domStorageEnabled: true,
                databaseEnabled: true,
                cacheEnabled: true,
                clearCache: false,
                thirdPartyCookiesEnabled: true,
                useHybridComposition: true,
                mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                supportZoom: true,
                allowFileAccessFromFileURLs: true,
                allowUniversalAccessFromFileURLs: true,
              ),
              onReceivedClientCertRequest: (controller, challenge) async {
                return ClientCertResponse(
                  action: ClientCertResponseAction.CANCEL,
                  certificatePath: '',
                );
              },
              onWebViewCreated: (controller) {
                _webViewController = controller;
                // Setup JavaScript bridge for login/logout events
                _setupJavaScriptBridge();
              },
              onLoadStart: (controller, url) {
                setState(() => _isLoading = true);
              },
              onLoadStop: (controller, url) async {
                setState(() => _isLoading = false);
                // Restore saved auth tokens after page loads
                await _restoreAuthTokens();
              },
              onReceivedError: (controller, request, error) {
                print('WebView error: ${error.description}');
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: ${error.description}')),
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
                url: WebUri("https://www.quickloader.lovable.app"),
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
