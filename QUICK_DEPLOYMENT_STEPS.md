# Quick Fix for Netlify → PythonAnywhere Connection

## Immediate Actions Required:

### 1. Netlify Environment Variable
- Go to https://app.netlify.com → Your Site → Site Settings → Environment Variables
- Add: `REACT_APP_API_URL = https://okemwabrianny.pythonanywhere.com/api`
- Click **Save**

### 2. Redeploy Netlify Site
- Go to **Deploys** tab
- Click **Trigger deploy → Deploy site**

### 3. PythonAnywhere CORS Update
Add to your Django `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "https://pamojake.netlify.app",
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

### 4. Reload PythonAnywhere Web App
- Go to PythonAnywhere Web tab
- Click **Reload** button

## Test Connection
Visit: https://pamojake.netlify.app/test-connection

Expected result: All API calls should show the full PythonAnywhere URL in browser console.

## If Still Not Working
The code now has a hardcoded fallback to PythonAnywhere, so it should work even without environment variables.