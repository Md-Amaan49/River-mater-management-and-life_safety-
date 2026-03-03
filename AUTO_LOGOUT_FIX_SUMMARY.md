# Auto Logout Issue - Fixed

## Problem
Users were being automatically logged out after a few minutes (approximately 15 minutes) because the JWT access token was expiring.

## Root Cause
The JWT access token was configured with a short expiration time of **15 minutes** (`JWT_EXPIRE=15m` in `.env`). This is a security best practice, but without automatic token refresh, users would be logged out when the token expired.

## Solution Implemented
Implemented **automatic token refresh** using the refresh token mechanism that was already in place but not being utilized.

### Changes Made:

#### 1. Updated AuthContext (`frontend/src/context/AuthContext.jsx`)
- Added `refreshAccessToken` function that calls the backend refresh endpoint
- Implemented automatic token refresh every **10 minutes** (before the 15-minute expiry)
- Properly stores and manages both access token and refresh token in localStorage
- Updates the user state with the new token automatically

#### 2. Backend Already Had:
- Refresh token generation with 7-day expiry (`JWT_REFRESH_EXPIRE=7d`)
- `/api/users/refresh` endpoint to exchange refresh token for new access token
- Proper token validation and generation logic

### How It Works:

1. **Login**: User logs in and receives:
   - Access Token (expires in 15 minutes)
   - Refresh Token (expires in 7 days)

2. **Auto-Refresh**: Every 10 minutes, the AuthContext automatically:
   - Checks if user is logged in
   - Calls the refresh endpoint with the refresh token
   - Gets a new access token
   - Updates localStorage and user state

3. **Session Duration**: Users can now stay logged in for up to **7 days** without manual re-login, as long as they're actively using the app.

### Token Expiration Times:
- **Access Token**: 15 minutes (secure, short-lived)
- **Refresh Token**: 7 days (allows extended sessions)
- **Auto-Refresh Interval**: 10 minutes (before access token expires)

### Benefits:
✅ Users stay logged in for extended periods
✅ Maintains security with short-lived access tokens
✅ Automatic and transparent to the user
✅ No manual intervention required

### Testing:
1. Login to the application
2. Wait for more than 15 minutes
3. Perform any action (navigate, click buttons, etc.)
4. You should remain logged in without being redirected to login page

### Alternative Solution (If Issues Persist):
If you want even longer sessions without refresh, you can modify `.env`:

```env
JWT_EXPIRE=24h          # 24 hours instead of 15 minutes
JWT_REFRESH_EXPIRE=30d  # 30 days instead of 7 days
```

However, the automatic refresh approach is more secure and is the recommended solution.
