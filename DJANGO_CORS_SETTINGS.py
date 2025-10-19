# Add these settings to your Django settings.py file

# CORS settings for your deployed frontend
CORS_ALLOWED_ORIGINS = [
    "https://pamojake.netlify.app",
    "http://localhost:3000",
]

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [
    "https://pamojake.netlify.app",
]

# Make sure you have django-cors-headers installed and added to INSTALLED_APPS:
# pip install django-cors-headers

# INSTALLED_APPS = [
#     ...
#     'corsheaders',
#     ...
# ]

# MIDDLEWARE = [
#     ...
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     ...
# ]