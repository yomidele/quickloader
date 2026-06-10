/**
 * =============================================================================
 * WEBSITE JAVASCRIPT INTEGRATION GUIDE
 * =============================================================================
 * 
 * This file shows how to integrate the Flutter mobile app wrapper with your
 * website. The key is communicating login/logout events to the Flutter app
 * so that the app can persist authentication tokens securely.
 * 
 * =============================================================================
 * HOW IT WORKS
 * =============================================================================
 * 
 * 1. User logs in on the website (via normal login form)
 * 2. Website receives auth token from backend
 * 3. Website calls FlutterBridge.postMessage() to send token to Flutter app
 * 4. Flutter app saves token securely in device keychain/keystore
 * 5. On next app launch, token is automatically restored to WebView
 * 6. Website reads auth token from cookies and logs user in automatically
 * 
 * =============================================================================
 * INTEGRATION STEPS
 * =============================================================================
 */

// Step 1: Detect if running in Flutter app vs regular browser
function isFlutterApp() {
  return typeof window !== 'undefined' && window.FlutterBridge !== undefined;
}

// Step 2: Check if user is already logged in (from secure storage)
function checkAuthStatus() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('User has saved auth token:', token.substring(0, 10) + '...');
    // Website should auto-login if token is valid
    validateTokenWithBackend(token);
  } else {
    console.log('No auth token found, user needs to login');
  }
}

// Step 3: Validate token with your backend
async function validateTokenWithBackend(token) {
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      console.log('Token is valid, user:', user);
      // Auto-login the user (set auth state, redirect, etc.)
      setUserLoggedIn(user);
    } else {
      console.error('Token is invalid or expired');
      // Clear the token
      localStorage.removeItem('auth_token');
      if (isFlutterApp()) {
        sendLogoutToFlutter();
      }
    }
  } catch (error) {
    console.error('Error validating token:', error);
  }
}

// ============================================================================
// LOGIN - Call this after successful login
// ============================================================================
async function handleLoginSuccess(response) {
  // The exact field name depends on your backend API
  // Could be: response.token, response.accessToken, response.access_token, etc.
  const authToken = response.token || response.accessToken || response.access_token;

  if (!authToken) {
    console.error('No token in login response:', response);
    return;
  }

  // Save token to localStorage (for website functionality)
  localStorage.setItem('auth_token', authToken);
  console.log('Auth token saved to localStorage');

  // Notify Flutter app to save token securely
  if (isFlutterApp()) {
    sendLoginToFlutter(authToken);
  } else {
    console.log('Not running in Flutter app, token saved locally only');
  }

  // Set user as logged in (update UI, set auth state, etc.)
  setUserLoggedIn(response.user || response);
}

// ============================================================================
// SEND LOGIN EVENT TO FLUTTER (BUG FIX 1: Login Persistence)
// ============================================================================
function sendLoginToFlutter(authToken) {
  try {
    window.FlutterBridge.postMessage(
      JSON.stringify({
        type: 'LOGIN',
        token: authToken,
      })
    );
    console.log('✓ Login event sent to Flutter app');
  } catch (error) {
    console.error('Error sending login to Flutter:', error);
  }
}

// ============================================================================
// LOGOUT - Call this when user logs out
// ============================================================================
async function handleLogout() {
  try {
    // Call logout endpoint on backend (to invalidate token server-side)
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
  } catch (error) {
    console.error('Error calling logout endpoint:', error);
  }

  // Clear localStorage
  localStorage.removeItem('auth_token');
  console.log('Auth token removed from localStorage');

  // Notify Flutter app to clear secure storage
  sendLogoutToFlutter();

  // Clear user from UI
  setUserLoggedOut();

  // Redirect to login page
  window.location.href = '/login';
}

// ============================================================================
// SEND LOGOUT EVENT TO FLUTTER (BUG FIX 1: Login Persistence)
// ============================================================================
function sendLogoutToFlutter() {
  try {
    window.FlutterBridge.postMessage(
      JSON.stringify({
        type: 'LOGOUT',
      })
    );
    console.log('✓ Logout event sent to Flutter app');
  } catch (error) {
    console.error('Error sending logout to Flutter:', error);
  }
}

// ============================================================================
// EXAMPLE: INTEGRATION WITH YOUR LOGIN FORM
// ============================================================================
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // Call your backend login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();

      // THIS IS THE KEY STEP: Send token to Flutter
      handleLoginSuccess(data);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  });
}

// ============================================================================
// EXAMPLE: INTEGRATION WITH LOGOUT BUTTON
// ============================================================================
function setupLogoutButton() {
  const logoutButton = document.getElementById('logout-btn');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to log out?')) {
      // THIS IS THE KEY STEP: Notify Flutter before logout
      await handleLogout();
    }
  });
}

// ============================================================================
// EXAMPLE: INTEGRATION WITH SESSION EXPIRY HANDLER
// ============================================================================
// If token expires, notify user and clear it
function handleTokenExpired() {
  console.warn('Auth token has expired');
  localStorage.removeItem('auth_token');
  if (isFlutterApp()) {
    sendLogoutToFlutter();
  }
  alert('Your session has expired. Please login again.');
  window.location.href = '/login';
}

// ============================================================================
// EXAMPLE: AUTO-LOGIN ON PAGE LOAD
// ============================================================================
function initAuthOnPageLoad() {
  // Run on page load to auto-login if token exists
  checkAuthStatus();
}

// ============================================================================
// HELPER FUNCTIONS (Customize based on your app)
// ============================================================================

function setUserLoggedIn(userData) {
  // Example: Set user state in your app
  console.log('User logged in:', userData);
  // TODO: Update your app state/UI to show user is logged in
  // - Update navigation bar
  // - Show user profile
  // - Load user data
  // - Redirect to dashboard if on login page
}

function setUserLoggedOut() {
  // Example: Clear user state from your app
  console.log('User logged out');
  // TODO: Update your app state/UI to show user is logged out
  // - Clear user data from state
  // - Hide user profile
  // - Reset form
}

// ============================================================================
// HANDLE 401 ERRORS (Unauthorized)
// ============================================================================
// Add a fetch interceptor to handle 401 responses (token expired)
const originalFetch = window.fetch;
window.fetch = function (...args) {
  return originalFetch.apply(this, args).then((response) => {
    if (response.status === 401) {
      // Token has expired or been revoked
      handleTokenExpired();
    }
    return response;
  });
};

// ============================================================================
// INITIALIZATION
// ============================================================================
// Run these on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🍃 Initializing auth integration');
  console.log('Running in Flutter app:', isFlutterApp());
  
  initAuthOnPageLoad();
  setupLoginForm();
  setupLogoutButton();
});

// ============================================================================
// EXAMPLE BACKEND API CALLS
// ============================================================================

/**
 * Example: Login API
 * 
 * POST /api/auth/login
 * 
 * Request:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * Response (on success):
 * {
 *   "token": "eyJhbGc...",          // JWT or session token
 *   "refreshToken": "xyz...",       // Optional: token refresh endpoint
 *   "user": {
 *     "id": "123",
 *     "name": "John Doe",
 *     "email": "user@example.com"
 *   },
 *   "expiresIn": 86400              // Token expires in 24 hours
 * }
 * 
 * Response (on error):
 * {
 *   "error": "Invalid credentials",
 *   "statusCode": 401
 * }
 */

/**
 * Example: Validate Token API
 * 
 * POST /api/auth/validate
 * Headers: Authorization: Bearer {token}
 * 
 * Response (on success - token is valid):
 * {
 *   "valid": true,
 *   "user": {
 *     "id": "123",
 *     "name": "John Doe"
 *   }
 * }
 * 
 * Response (on error - token is invalid/expired):
 * {
 *   "valid": false,
 *   "error": "Token expired"
 * }
 */

/**
 * Example: Logout API
 * 
 * POST /api/auth/logout
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 */

// ============================================================================
// COMMON ISSUES & SOLUTIONS
// ============================================================================

/**
 * ISSUE: "FlutterBridge is not defined"
 * SOLUTION: Check if window.FlutterBridge exists before calling it
 *           Use isFlutterApp() helper function
 * 
 * ISSUE: Token not persisting across app restarts
 * SOLUTION: Make sure handleLoginSuccess() is called after successful login
 *           Check console for "✓ Login event sent to Flutter app"
 * 
 * ISSUE: User gets logged out after closing app
 * SOLUTION: Check if token is being saved to localStorage
 *           Check if FlutterBridge.postMessage is being called
 *           Check app's secure storage (iOS Keychain/Android Keystore)
 * 
 * ISSUE: Notifications not navigating to correct URL
 * SOLUTION: Ensure notification payload includes "data": { "url": "..." }
 *           URL must be valid and match your domain
 * 
 * ISSUE: JavaScript console shows errors in Flutter app
 * SOLUTION: Run `flutter logs` to see app logs
 *           Check if localhost/development URLs work in WebView
 *           Ensure HTTPS on production
 */

// ============================================================================
// FIREBASE PUSH NOTIFICATION INTEGRATION
// ============================================================================

/**
 * To send push notifications from your backend:
 * 
 * 1. Get user's FCM token (app prints it: "FCM TOKEN: xxx")
 * 2. Store in your database linked to user ID
 * 3. Send notification via Firebase Admin SDK
 * 
 * Example Node.js code:
 * 
 * const admin = require('firebase-admin');
 * 
 * async function sendNotificationToUser(userId) {
 *   const userDoc = await db.collection('users').doc(userId).get();
 *   const fcmToken = userDoc.data().fcmToken;
 *   
 *   const message = {
 *     notification: {
 *       title: 'Payment Received',
 *       body: 'Your payment has been processed'
 *     },
 *     data: {
 *       url: 'https://www.amanamarkets.org/payments'
 *     },
 *     token: fcmToken
 *   };
 *   
 *   await admin.messaging().send(message);
 * }
 */

// ============================================================================
// TESTING
// ============================================================================

/**
 * Test Login Persistence:
 * 1. Open app, go to login page
 * 2. Login with credentials
 * 3. Check console: should see "✓ Login event sent to Flutter app"
 * 4. Close app completely
 * 5. Open app again - should still be logged in
 * 
 * Test Notifications:
 * 1. Open Firebase Console
 * 2. Cloud Messaging → Create Campaign
 * 3. Paste FCM token (from Flutter logs)
 * 4. Send test notification
 * 5. Check system tray for notification
 * 6. Tap notification - app should open and navigate if URL provided
 */

console.log('✓ Auth integration script loaded');
