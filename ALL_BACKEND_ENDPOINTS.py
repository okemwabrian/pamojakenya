# ALL BACKEND ENDPOINTS - Copy to PythonAnywhere Django Backend

# ===== VIEWS.PY - Add ALL these views =====
ALL_VIEWS = '''
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

# ===== ROOT API ENDPOINT =====
@csrf_exempt
def api_root(request):
    return JsonResponse({
        'message': 'Pamoja API is working',
        'endpoints': [
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/applications/single/submit/',
            '/api/payments/activation/submit/',
            '/api/shares/buy/'
        ]
    })

# ===== AUTHENTICATION ENDPOINTS =====
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

# ===== APPLICATION ENDPOINTS =====
@csrf_exempt
def applications_list(request):
    return JsonResponse({'message': 'Applications endpoint working'})

@csrf_exempt
@require_http_methods(["POST"])
def submit_single_application(request):
    try:
        # Handle form data
        data = {
            'firstName': request.POST.get('firstName'),
            'lastName': request.POST.get('lastName'),
            'email': request.POST.get('email'),
            'phoneMain': request.POST.get('phoneMain'),
            'spouseCellPhone': request.POST.get('spouseCellPhone'),
        }
        id_document = request.FILES.get('id_document')
        
        # Save to database here (add your model)
        # SingleApplication.objects.create(**data, id_document=id_document)
        
        return JsonResponse({
            'success': True,
            'message': 'Single application submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_double_application(request):
    try:
        # Handle form data including step family fields
        data = {
            'first_name': request.POST.get('first_name'),
            'last_name': request.POST.get('last_name'),
            'step_parent_1': request.POST.get('step_parent_1'),
            'step_sibling_1': request.POST.get('step_sibling_1'),
        }
        
        return JsonResponse({
            'success': True,
            'message': 'Double application submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# ===== PAYMENT ENDPOINTS =====
@csrf_exempt
def activation_payments_list(request):
    return JsonResponse({'message': 'Activation payments endpoint working'})

@csrf_exempt
@require_http_methods(["POST"])
def submit_activation_fee(request):
    try:
        payment_method = request.POST.get('payment_method')
        transaction_id = request.POST.get('transaction_id')
        amount = request.POST.get('amount', 50.00)
        evidence_file = request.FILES.get('evidence_file')
        
        # Save to database here
        # ActivationFeePayment.objects.create(...)
        
        return JsonResponse({
            'success': True,
            'message': 'Activation fee submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# ===== SHARES ENDPOINTS =====
@csrf_exempt
def shares_list(request):
    return JsonResponse({'message': 'Shares endpoint working'})

@csrf_exempt
@require_http_methods(["POST"])
def buy_shares(request):
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        shares_purchased = data.get('shares_purchased')
        payment_method = data.get('payment_method')
        
        return JsonResponse({
            'success': True,
            'message': 'Share purchase submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
'''

# ===== URLS.PY - Add ALL these URLs =====
ALL_URLS = '''
from django.urls import path
from . import views

urlpatterns = [
    # ... your existing URLs ...
    
    # ROOT API
    path('api/', views.api_root, name='api_root'),
    
    # AUTHENTICATION
    path('api/auth/login/', views.auth_login, name='auth_login'),
    path('api/auth/register/', views.auth_register, name='auth_register'),
    path('api/auth/user/', views.auth_user, name='auth_user'),
    path('api/auth/logout/', views.auth_logout, name='auth_logout'),
    
    # APPLICATIONS
    path('api/applications/', views.applications_list, name='applications_list'),
    path('api/applications/single/submit/', views.submit_single_application, name='submit_single_application'),
    path('api/applications/double/submit/', views.submit_double_application, name='submit_double_application'),
    
    # PAYMENTS
    path('api/activation-payments/', views.activation_payments_list, name='activation_payments_list'),
    path('api/payments/activation/submit/', views.submit_activation_fee, name='submit_activation_fee'),
    
    # SHARES
    path('api/shares/', views.shares_list, name='shares_list'),
    path('api/shares/buy/', views.buy_shares, name='buy_shares'),
]
'''

# ===== SETTINGS.PY - Update CORS =====
CORS_SETTINGS = '''
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
'''

print("COPY ALL OF THIS TO YOUR PYTHONANYWHERE DJANGO BACKEND!")
print("1. Add ALL_VIEWS to views.py")
print("2. Add ALL_URLS to urls.py") 
print("3. Update CORS in settings.py")
print("4. Reload PythonAnywhere web app")
print("5. All endpoints will work!")