# Update your existing Django backend settings.py

# Add to INSTALLED_APPS:
INSTALLED_APPS = [
    # ... your existing apps ...
    'corsheaders',  # Add this if not already there
]

# Update MIDDLEWARE (corsheaders must be FIRST):
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this FIRST
    'django.middleware.common.CommonMiddleware',
    # ... your other middleware ...
]

# Add CORS settings:
CORS_ALLOWED_ORIGINS = [
    "https://pamojake.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://Okemwabrianny.pythonanywhere.com",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

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

# File upload settings:
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Install corsheaders if not installed:
# pip install django-cors-headers