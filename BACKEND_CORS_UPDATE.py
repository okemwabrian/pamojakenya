# CRITICAL: Update your Django backend settings.py with these CORS settings

CORS_SETTINGS_UPDATE = """
# Add these to your Django settings.py file

# CORS Settings - CRITICAL for Netlify frontend connectivity
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pamojake.netlify.app",  # Your Netlify frontend URL
    "https://okemwabrianny.pythonanywhere.com",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

# Additional CORS headers for file uploads and API calls
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

# Ensure corsheaders is in INSTALLED_APPS
INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
    'rest_framework',
    # ... your apps
]

# Ensure CorsMiddleware is first in MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# File upload settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
"""

# After updating settings.py, restart your PythonAnywhere web app:
# 1. Go to PythonAnywhere Web tab
# 2. Click "Reload" button
# 3. Test the connection from https://pamojake.netlify.app

print("IMPORTANT: Copy the CORS settings above to your Django backend settings.py")
print("Then reload your PythonAnywhere web app to apply changes.")