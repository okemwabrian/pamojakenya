# COMPLETE BACKEND IMPLEMENTATION FOR PAMOJA SYSTEM
# Fix for Payment and Claims Issues

# ===== MODELS.PY ADDITIONS =====
MODELS_CODE = '''
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    MEMBERSHIP_CHOICES = [
        ('single', 'Single Membership'),
        ('double', 'Double Membership'),
        ('none', 'No Membership'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_CHOICES, default='none')
    membership_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    shares_owned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class MembershipApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    membership_type = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class MembershipPayment(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('membership_single', 'Single Membership Fee'),
        ('membership_double', 'Double Membership Fee'),
        ('activation_fee', 'Activation Fee'),
        ('shares', 'Share Purchase'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_type = models.CharField(max_length=30, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    payment_proof = models.FileField(upload_to='payments/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Claim(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processing', 'Processing'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)
    supporting_documents = models.FileField(upload_to='claims/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True)
    amount_approved = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SharePurchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    shares_requested = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_proof = models.FileField(upload_to='shares/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
'''

# ===== VIEWS.PY - PAYMENTS APP =====
PAYMENTS_VIEWS = '''
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
import json

@csrf_exempt
@require_http_methods(["GET"])
def get_user_payments(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
    payments_data = [{
        'id': payment.id,
        'payment_type': payment.payment_type,
        'amount': str(payment.amount),
        'payment_method': payment.payment_method,
        'status': payment.status,
        'admin_notes': payment.admin_notes,
        'created_at': payment.created_at.isoformat(),
    } for payment in payments]
    
    return JsonResponse({'payments': payments_data})

@csrf_exempt
@require_http_methods(["POST"])
def create_payment(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        payment = MembershipPayment.objects.create(
            user=request.user,
            payment_type=request.POST.get('payment_type'),
            amount=request.POST.get('amount'),
            payment_method=request.POST.get('payment_method'),
            payment_proof=request.FILES.get('payment_proof'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Payment submitted successfully!',
            'payment_id': payment.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_activation_payment(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        payment = MembershipPayment.objects.create(
            user=request.user,
            payment_type='activation_fee',
            amount=request.POST.get('amount'),
            payment_method=request.POST.get('payment_method'),
            payment_proof=request.FILES.get('payment_proof'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Activation fee payment submitted successfully!',
            'payment_id': payment.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
'''

# ===== VIEWS.PY - CLAIMS APP =====
CLAIMS_VIEWS = '''
@csrf_exempt
@require_http_methods(["GET"])
def get_user_claims(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    claims = Claim.objects.filter(user=request.user).order_by('-created_at')
    claims_data = [{
        'id': claim.id,
        'title': claim.title,
        'description': claim.description,
        'amount_requested': str(claim.amount_requested),
        'status': claim.status,
        'admin_response': claim.admin_response,
        'amount_approved': str(claim.amount_approved) if claim.amount_approved else None,
        'created_at': claim.created_at.isoformat(),
    } for claim in claims]
    
    return JsonResponse({'claims': claims_data})

@csrf_exempt
@require_http_methods(["POST"])
def create_claim(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        claim = Claim.objects.create(
            user=request.user,
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            amount_requested=request.POST.get('amount_requested'),
            supporting_documents=request.FILES.get('supporting_documents'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Claim submitted successfully!',
            'claim_id': claim.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_claim(request):
    # Alias for create_claim to match frontend expectations
    return create_claim(request)
'''

# ===== VIEWS.PY - USERS APP =====
USERS_VIEWS = '''
@csrf_exempt
@require_http_methods(["GET"])
def get_user_dashboard(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    # Get or create user profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Get user data
    applications = MembershipApplication.objects.filter(user=request.user).order_by('-created_at')
    claims = Claim.objects.filter(user=request.user).order_by('-created_at')
    payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
    shares = SharePurchase.objects.filter(user=request.user).order_by('-created_at')
    
    return JsonResponse({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        },
        'profile': {
            'membership_type': profile.membership_type,
            'membership_status': profile.membership_status,
            'shares_owned': profile.shares_owned,
            'phone': profile.phone,
        },
        'applications': [{
            'id': app.id,
            'membership_type': app.membership_type,
            'status': app.status,
            'created_at': app.created_at.isoformat(),
            'admin_notes': app.admin_notes,
        } for app in applications],
        'claims': [{
            'id': claim.id,
            'title': claim.title,
            'status': claim.status,
            'amount_requested': str(claim.amount_requested),
            'created_at': claim.created_at.isoformat(),
        } for claim in claims],
        'payments': [{
            'id': payment.id,
            'payment_type': payment.payment_type,
            'amount': str(payment.amount),
            'status': payment.status,
            'created_at': payment.created_at.isoformat(),
        } for payment in payments],
        'shares': [{
            'id': share.id,
            'shares_requested': share.shares_requested,
            'amount': str(share.amount),
            'status': share.status,
            'created_at': share.created_at.isoformat(),
        } for share in shares],
        'stats': {
            'total_applications': applications.count(),
            'total_claims': claims.count(),
            'total_payments': payments.count(),
            'total_shares': shares.count(),
        }
    })
'''

# ===== URL PATTERNS =====
URL_PATTERNS = '''
# payments/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_user_payments, name='get_user_payments'),
    path('create/', views.create_payment, name='create_payment'),
    path('activation/submit/', views.submit_activation_payment, name='submit_activation_payment'),
]

# claims/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_user_claims, name='get_user_claims'),
    path('create/', views.create_claim, name='create_claim'),
    path('submit/', views.submit_claim, name='submit_claim'),
]

# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.get_user_dashboard, name='get_user_dashboard'),
]

# main urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/payments/', views.create_payment),  # Direct mapping for POST /api/payments/
    path('api/payments/', include('payments.urls')),
    path('api/shares/', include('shares.urls')),
    path('api/claims/', include('claims.urls')),
    path('api/user/', include('users.urls')),
    path('api/admin/', include('admin_panel.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
'''

# ===== SETTINGS.PY ADDITIONS =====
SETTINGS_ADDITIONS = '''
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'authentication',
    'applications',
    'payments',  # Add this
    'claims',    # Add this
    'users',     # Add this
    'shares',
    'admin_panel',
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "https://pamojake.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_ALL_ORIGINS = True  # For development only

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
'''

print("COMPLETE BACKEND IMPLEMENTATION CREATED")
print("=" * 50)
print("CRITICAL FIXES:")
print("1. Payment creation endpoint: POST /api/payments/")
print("2. Claims endpoints: GET/POST /api/claims/")
print("3. User dashboard endpoint: GET /api/user/dashboard/")
print("4. All missing models and views included")