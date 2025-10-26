# CRITICAL: Netlify Environment Variable Fix

## Problem
Your React app on Netlify is not reading the environment variable correctly.

## Solution

### Step 1: Set Environment Variable in Netlify Dashboard
1. Go to https://app.netlify.com
2. Select your site (pamojake)
3. Go to **Site Settings → Environment Variables**
4. Add this variable:
   ```
   Key: REACT_APP_API_URL
   Value: https://okemwabrianny.pythonanywhere.com/api
   ```

### Step 2: Trigger Rebuild
After adding the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy → Deploy site**

### Step 3: Verify
Visit https://pamojake.netlify.app and check browser console for:
```
API Base URL: https://okemwabrianny.pythonanywhere.com/api
```

## Alternative Quick Fix
If environment variables don't work, hardcode the URL temporarily:

In `src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://okemwabrianny.pythonanywhere.com/api',
  timeout: 30000,
});
```

Then rebuild and redeploy.