# Netlify Deployment Configuration for Pamoja Frontend

## Environment Variables Setup

In your Netlify dashboard (https://app.netlify.com), go to:
**Site Settings → Environment Variables**

Add the following environment variable:
```
REACT_APP_API_URL = https://okemwabrianny.pythonanywhere.com/api
```

## Build Settings

In Netlify dashboard, set:
- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Node version:** `18` (in Environment Variables: `NODE_VERSION = 18`)

## Redirects Configuration

Create `public/_redirects` file with:
```
/*    /index.html   200
```

## Backend CORS Update

Update your Django backend settings.py with:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "https://pamojake.netlify.app",
    "https://okemwabrianny.pythonanywhere.com",
]

# Additional CORS headers for file uploads
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

## Deployment Steps

1. **Push to GitHub/GitLab**
2. **Connect to Netlify**
3. **Set environment variables**
4. **Deploy**

## Testing Connectivity

After deployment, test these endpoints:
- Frontend: https://pamojake.netlify.app
- Backend API: https://okemwabrianny.pythonanywhere.com/api
- Test form submissions and file uploads

## Troubleshooting

If you get CORS errors:
1. Check backend CORS settings include Netlify URL
2. Verify environment variable is set correctly
3. Check browser network tab for actual API calls
4. Ensure backend is running on PythonAnywhere