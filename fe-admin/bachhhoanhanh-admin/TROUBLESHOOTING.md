# Troubleshooting Guide - Admin Dashboard

## Issue: "net::ERR_FAILED" on Login

This error occurs when CORS (Cross-Origin Resource Sharing) is not properly configured on your Keycloak server.

### Quick Fixes:

#### 1. **For Development (Recommended)**
The app now includes a Vite proxy that automatically routes requests through the dev server:
- The proxy intercepts `/auth` and `/api` requests
- Routes them to `http://bachhoanhanh` without CORS issues
- Automatically configured in `vite.config.js`

**Just run and it should work:**
```bash
npm run dev
```

#### 2. **For Production - Enable CORS on Keycloak**

Edit your Keycloak realm configuration to enable CORS:

```json
{
  "realm": "bachhoanhanh",
  "corsAllowedProtocols": ["http", "https"],
  "corsAllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://your-frontend-domain.com"
  ],
  "corsMaxAge": 3600,
  "corsAllowCredentials": true,
  "corsExposedHeaders": "WWW-Authenticate, My-Custom-Header"
}
```

**Or configure in Keycloak Admin Console:**
1. Go to Realm Settings → General
2. Scroll down to CORS settings
3. Add your frontend URL to "Valid Redirect URIs"
4. Enable CORS with appropriate origins

#### 3. **Check Server Connectivity**

In the app, click "Advanced Settings" → "Test Connection" to verify the server is reachable.

---

## Login Credentials

Your Keycloak is configured with 3 demo accounts:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | 123456 | ADMIN | System Administrator (Full Access) |
| teststaff | 123456 | STAFF | Staff Member (Limited Access) |
| testcustomer | 123456 | CUSTOMER | Customer (View Only) |

**⚠️ Important:** Only users with **ADMIN** role can access the dashboard. Other roles will see "Access Denied".

---

## Common Issues & Solutions

### Issue: "Invalid credentials or server error"
**Cause:** Wrong username/password
**Solution:** 
- Check username is spelled correctly
- All default passwords are `123456`
- Verify user is enabled in Keycloak

### Issue: "Access Denied - ADMIN role required"
**Cause:** Logged in with non-admin user
**Solution:**
- Logout and login with `admin` account
- Or add ADMIN role to your user in Keycloak

### Issue: Blank page after login
**Cause:** Token decoding failed or network error
**Solution:**
1. Check browser console (F12) for JavaScript errors
2. Check Network tab for failed requests
3. Try "Test Connection" in Advanced Settings

### Issue: "The server is reachable but login still fails"
**Cause:** Possible issues with the token endpoint
**Solution:**
1. Verify Keycloak is running
2. Check if `/auth/realms/bachhoanhanh/protocol/openid-connect/token` endpoint exists
3. Verify `grant_type=password` and `directAccessGrantsEnabled=true` for the client

---

## API Endpoint Configuration

Update your API endpoints in [src/components/UserManagement.jsx](src/components/UserManagement.jsx), [src/components/DataManagement.jsx](src/components/DataManagement.jsx), etc.:

```javascript
// Replace '/api/users' with your actual endpoint
fetchData('/api/users', token)
createData('/api/users', data, token)
updateData('/api/users', id, data, token)
deleteData('/api/users', id, token)
```

The app uses demo data as fallback, so you can test the UI without a backend.

---

## Development vs Production

### Development Mode (`npm run dev`)
- Uses Vite proxy server
- No CORS issues
- Requests to `/auth` and `/api` are proxied to `http://bachhoanhanh`

### Production Mode (`npm run build`)
- Uses full URLs (`http://bachhoanhanh`)
- Requires CORS to be configured on the backend
- Requests go directly from browser

---

## Token Storage & Security

- Tokens are stored in `localStorage` under key `auth_token`
- Automatically cleared on logout
- Auto-login on page reload if token exists
- **For production:** Consider using secure cookies or more secure token storage

---

## Browser Console Debugging

Open Developer Tools (F12) and check:

**Network Tab:**
- POST request to `/auth/realms/bachhoanhanh/protocol/openid-connect/token`
- Check response status and body
- Look for CORS errors in console

**Console Tab:**
- Login error messages
- Connection test results
- Token decoding errors

---

## Need More Help?

1. Check that Keycloak is running: `http://bachhoanhanh/auth/admin`
2. Verify the realm and users exist
3. Check browser network requests (F12 → Network)
4. Enable verbose logging in console
