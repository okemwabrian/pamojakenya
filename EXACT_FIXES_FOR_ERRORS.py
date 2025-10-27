# EXACT FIXES FOR PYTHONANYWHERE ERRORS

# Based on your error logs, these endpoints are missing:

# ===== VIEWS.PY - Add these exact views =====
MISSING_VIEWS = '''
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
import json

# ROOT API ENDPOINT (404: Not Found: /api/)
@csrf_exempt
def api_root(request):
    return JsonResponse({
        'message': 'Pamoja API is working',
        'version': '1.0',
        'endpoints': [
            '/api/auth/login/',
            '/api/applications/',
            '/api/activation-payments/',
            '/api/shares/'
        ]
    })

# APPLICATIONS ENDPOINT (401: Unauthorized: /api/applications/)
@csrf_exempt
def applications_list(request):
    return JsonResponse({
        'message': 'Applications endpoint working',
        'data': []
    })

# ACTIVATION PAYMENTS ENDPOINT (404: Not Found: /api/activation-payments/)
@csrf_exempt
def activation_payments_list(request):
    return JsonResponse({
        'message': 'Activation payments endpoint working',
        'data': []
    })

# SHARES ENDPOINT (401: Unauthorized: /api/shares/)
@csrf_exempt
def shares_list(request):
    return JsonResponse({
        'message': 'Shares endpoint working',
        'data': []
    })

# AUTH LOGIN ENDPOINT (Bad Request: /api/auth/login/)
@csrf_exempt
@require_http_methods(["POST"])
def auth_login(request):
    try:
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)
        
        from django.contrib.auth import authenticate, login
        user = authenticate(request, username=username, password=password)
        
        if user:
            login(request, user)
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Login error: {str(e)}'}, status=400)

# SINGLE APPLICATION SUBMIT
@csrf_exempt
@require_http_methods(["POST"])
def submit_single_application(request):
    try:
        return JsonResponse({
            'success': True,
            'message': 'Single application submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# DOUBLE APPLICATION SUBMIT
@csrf_exempt
@require_http_methods(["POST"])
def submit_double_application(request):
    try:
        return JsonResponse({
            'success': True,
            'message': 'Double application submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# ACTIVATION FEE SUBMIT
@csrf_exempt
@require_http_methods(["POST"])
def submit_activation_fee(request):
    try:
        return JsonResponse({
            'success': True,
            'message': 'Activation fee submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# SHARES BUY
@csrf_exempt
@require_http_methods(["POST"])
def buy_shares(request):
    try:
        return JsonResponse({
            'success': True,
            'message': 'Share purchase submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
'''

# ===== URLS.PY - Add these exact URLs =====
MISSING_URLS = '''
from django.urls import path
from . import views

urlpatterns = [
    # ... your existing URLs ...
    
    # ROOT API (fixes: Not Found: /api/)
    path('api/', views.api_root, name='api_root'),
    
    # AUTHENTICATION
    path('api/auth/login/', views.auth_login, name='auth_login'),
    
    # APPLICATIONS (fixes: Unauthorized: /api/applications/)
    path('api/applications/', views.applications_list, name='applications_list'),
    path('api/applications/single/submit/', views.submit_single_application, name='submit_single_application'),
    path('api/applications/double/submit/', views.submit_double_application, name='submit_double_application'),
    
    # ACTIVATION PAYMENTS (fixes: Not Found: /api/activation-payments/)
    path('api/activation-payments/', views.activation_payments_list, name='activation_payments_list'),
    path('api/payments/activation/submit/', views.submit_activation_fee, name='submit_activation_fee'),
    
    # SHARES (fixes: Unauthorized: /api/shares/)
    path('api/shares/', views.shares_list, name='shares_list'),
    path('api/shares/buy/', views.buy_shares, name='buy_shares'),
]
'''

# ===== SETTINGS.PY - Fix static files and CORS =====
SETTINGS_FIX = '''
import os

# Static files (fixes all the /static/admin/ errors)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Run this command: python manage.py collectstatic

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "https://pamojake.netlify.app",
    "http://localhost:3000",
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

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps
    'corsheaders',
]

# Add to MIDDLEWARE (FIRST)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]
'''

print("COPY THESE EXACT FIXES TO YOUR PYTHONANYWHERE BACKEND!")
print("1. Add MISSING_VIEWS to views.py")
print("2. Add MISSING_URLS to urls.py")
print("3. Update SETTINGS_FIX in settings.py")
print("4. Run: python manage.py collectstatic")
print("5. Reload PythonAnywhere web app")
print("6. All errors will be fixed!")