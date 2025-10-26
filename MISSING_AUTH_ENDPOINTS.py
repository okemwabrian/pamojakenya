# MISSING AUTHENTICATION ENDPOINTS - Add to Django Backend

# Your frontend is calling these auth endpoints that don't exist:
# /api/auth/login/
# /api/auth/register/
# /api/auth/user/
# /api/auth/logout/

# Add these to your Django backend:

# ===== VIEWS.PY - Add these authentication views =====
AUTH_VIEWS = '''
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def auth_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({
                'success': True,
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
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def auth_register(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        return JsonResponse({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def auth_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        })
    else:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

@csrf_exempt
@require_http_methods(["POST"])
def auth_logout(request):
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})
'''

# ===== URLS.PY - Add these authentication URLs =====
AUTH_URLS = '''
# Add these to your urlpatterns:
path('api/auth/login/', views.auth_login, name='auth_login'),
path('api/auth/register/', views.auth_register, name='auth_register'),
path('api/auth/user/', views.auth_user, name='auth_user'),
path('api/auth/logout/', views.auth_logout, name='auth_logout'),
'''

print("CRITICAL: Your backend is missing authentication endpoints!")
print("1. Add AUTH_VIEWS to views.py")
print("2. Add AUTH_URLS to urls.py")
print("3. Restart Django server")
print("4. Now login/register will work!")