# Quick Copy-Paste Website Integration

This file contains ready-to-use code snippets you can copy directly into your website.

---

## Installation

### Step 1: Include the Script
Add this to your `index.html` or main layout file:

```html
<!-- Before closing </body> tag -->
<script src="/js/flutter-integration.js"></script>
```

Or if using a bundler (webpack, vite, etc.), import directly:

```javascript
import './flutter-integration.js';
```

### Step 2: Update Your Login Handler

**If using HTML form:**
```html
<form id="login-form" onsubmit="handleLoginFormSubmit(event)">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Login</button>
</form>

<script>
async function handleLoginFormSubmit(event) {
  event.preventDefault();
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    
    // THIS IS THE KEY LINE - Send token to Flutter app
    handleLoginSuccess(data);
    
    // Redirect after successful login
    window.location.href = '/dashboard';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}
</script>
```

**If using React:**
```jsx
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      // Send token to Flutter app
      window.handleLoginSuccess?.(data);
      
      // Redirect
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      handleLogin(email, password);
    }}>
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**If using Vue:**
```vue
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });
        
        const data = await response.json();
        
        // Send token to Flutter app
        window.handleLoginSuccess?.(data);
        
        this.$router.push('/dashboard');
      } catch (error) {
        alert('Login failed: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

**If using Angular:**
```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="login()">
      <input [(ngModel)]="email" name="email" type="email" placeholder="Email" required />
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
      <button [disabled]="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  async login() {
    this.loading = true;
    try {
      const response = await this.http.post('/api/auth/login', {
        email: this.email,
        password: this.password,
      }).toPromise();
      
      // Send token to Flutter app
      (window as any).handleLoginSuccess?.(response);
      
      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert('Login failed');
    } finally {
      this.loading = false;
    }
  }
}
```

---

## Step 3: Update Your Logout Handler

**HTML:**
```html
<button id="logout-btn">Logout</button>

<script>
document.getElementById('logout-btn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to log out?')) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage and notify Flutter
    localStorage.removeItem('auth_token');
    window.sendLogoutToFlutter?.();
    
    // Redirect to login
    window.location.href = '/login';
  }
});
</script>
```

**React:**
```jsx
export default function Header() {
  const handleLogout = async () => {
    if (window.confirm('Are you sure?')) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      localStorage.removeItem('auth_token');
      window.sendLogoutToFlutter?.();
      window.location.href = '/login';
    }
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

**Vue:**
```vue
<template>
  <button @click="handleLogout">Logout</button>
</template>

<script>
export default {
  methods: {
    async handleLogout() {
      if (confirm('Are you sure?')) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        localStorage.removeItem('auth_token');
        window.sendLogoutToFlutter?.();
        window.location.href = '/login';
      }
    },
  },
};
</script>
```

**Angular:**
```typescript
export class HeaderComponent {
  constructor(private http: HttpClient, private router: Router) {}
  
  async logout() {
    if (confirm('Are you sure?')) {
      try {
        await this.http.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }).toPromise();
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      localStorage.removeItem('auth_token');
      (window as any).sendLogoutToFlutter?.();
      this.router.navigate(['/login']);
    }
  }
}
```

---

## Step 4: Auto-Login on Page Load

Add this to run after login handlers are defined:

```javascript
// Runs on page load - auto-login if token exists
document.addEventListener('DOMContentLoaded', () => {
  window.initAuthOnPageLoad?.();
});
```

---

## Minimal Example (Copy-Paste Ready)

If you want the absolute minimum setup, copy this into your `<head>`:

```html
<script>
// Check if running in Flutter
function isFlutterApp() {
  return typeof window !== 'undefined' && window.FlutterBridge !== undefined;
}

// Handle successful login
async function sendLoginToFlutter(token) {
  if (!isFlutterApp()) return;
  
  localStorage.setItem('auth_token', token);
  window.FlutterBridge.postMessage(JSON.stringify({
    type: 'LOGIN',
    token: token
  }));
  console.log('✓ Token sent to Flutter');
}

// Handle logout
async function sendLogoutToFlutter() {
  if (!isFlutterApp()) return;
  
  localStorage.removeItem('auth_token');
  window.FlutterBridge.postMessage(JSON.stringify({
    type: 'LOGOUT'
  }));
  console.log('✓ Logout sent to Flutter');
}

// Auto-login on page load
function checkAuthStatus() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    // Token exists - validate with backend
    fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(r => r.ok ? r.json() : null)
    .then(user => {
      if (user) {
        // Token is valid - user is logged in
        console.log('✓ User auto-logged in');
      }
    });
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);
</script>
```

Then in your login button handler:

```javascript
// After successful login from API
const token = response.token; // or response.access_token
sendLoginToFlutter(token);
```

And in your logout button:

```javascript
// On logout click
sendLogoutToFlutter();
window.location.href = '/login';
```

---

## API Response Mapping

Adjust the token field name based on your API:

```javascript
// Check which field your API returns
const response = {
  // Possibility 1
  token: 'jwt_here',
  
  // Possibility 2
  accessToken: 'jwt_here',
  
  // Possibility 3
  access_token: 'jwt_here',
  
  // Possibility 4
  data: {
    token: 'jwt_here'
  }
};

// Mapping function
function extractToken(response) {
  return response.token 
    || response.accessToken 
    || response.access_token 
    || response.data?.token
    || null;
}

// Usage
const token = extractToken(response);
if (token) {
  sendLoginToFlutter(token);
}
```

---

## Testing

Once you've integrated the code, test it:

1. **In Flutter App:**
   - Open app → go to login
   - Login with credentials
   - Check browser console: `✓ Token sent to Flutter`
   - Close app completely
   - Reopen app → should be logged in automatically ✅

2. **In Regular Browser:**
   - Same test as above
   - Console should show: "Running in Flutter app: false"
   - Token should be saved to localStorage
   - No errors should appear ✅

3. **Logout:**
   - Click logout
   - Check console: `✓ Logout sent to Flutter`
   - Verify redirected to login page ✅

---

## Debugging

If something isn't working:

```javascript
// Check if FlutterBridge is available
console.log('FlutterBridge available:', typeof window.FlutterBridge !== 'undefined');

// Check if token is being saved
console.log('Token saved:', localStorage.getItem('auth_token'));

// Send test message
if (window.FlutterBridge) {
  window.FlutterBridge.postMessage(JSON.stringify({
    type: 'TEST',
    message: 'Hello from website'
  }));
}
```

---

## Common Issues

### Issue: "window.sendLoginToFlutter is not a function"
**Solution:** Make sure you:
1. Included the script file or defined the functions
2. Called it AFTER the login API succeeds
3. Passed the token as parameter: `sendLoginToFlutter(token)`

### Issue: Token not persisting
**Solution:** 
1. Check: `isFlutterApp()` returns true
2. Check: `localStorage` has the token
3. Check: Flutter logs show "✓ Login event sent to Flutter app"
4. Update website integration file path in Flutter code if needed

### Issue: Works in browser but not in app
**Solution:**
1. Check Flutter app is using your domain (not localhost)
2. Check `FlutterBridge` is available: `typeof window.FlutterBridge`
3. Check console logs: `flutter logs | grep "LOGIN\|LOGOUT"`

---

## That's It!

You now have everything needed to:
- ✅ Save auth tokens securely on app
- ✅ Auto-login users on app restart
- ✅ Clear tokens on logout
- ✅ Work in both Flutter app and regular browser

Copy, paste, and go! 🚀
