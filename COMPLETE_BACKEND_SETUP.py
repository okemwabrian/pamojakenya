# COMPLETE BACKEND SETUP - Copy ALL of this to your Django backend

# ===== 1. MODELS.PY - Add these models =====
MODELS_CODE = '''
from django.db import models
from django.contrib.auth.models import User

class SingleApplication(models.Model):
    firstName = models.CharField(max_length=100)
    middleName = models.CharField(max_length=100, blank=True)
    lastName = models.CharField(max_length=100)
    email = models.EmailField()
    phoneMain = models.CharField(max_length=20)
    address1 = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    stateProvince = models.CharField(max_length=100)
    zip = models.CharField(max_length=20)
    spouse = models.CharField(max_length=100, blank=True)
    spousePhone = models.CharField(max_length=20, blank=True)
    spouseCellPhone = models.CharField(max_length=20, blank=True)  # NEW FIELD
    authorizedRep = models.CharField(max_length=100, blank=True)
    child1 = models.CharField(max_length=100, blank=True)
    child2 = models.CharField(max_length=100, blank=True)
    child3 = models.CharField(max_length=100, blank=True)
    child4 = models.CharField(max_length=100, blank=True)
    child5 = models.CharField(max_length=100, blank=True)
    parent1 = models.CharField(max_length=100, blank=True)
    parent2 = models.CharField(max_length=100, blank=True)
    spouseParent1 = models.CharField(max_length=100, blank=True)
    spouseParent2 = models.CharField(max_length=100, blank=True)
    sibling1 = models.CharField(max_length=100, blank=True)
    sibling2 = models.CharField(max_length=100, blank=True)
    id_document = models.FileField(upload_to='applications/single/', null=True, blank=True)
    declarationAccepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.firstName} {self.lastName} - Single Application"

class DoubleApplication(models.Model):
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    confirm_email = models.EmailField()
    phone = models.CharField(max_length=20)
    address_1 = models.CharField(max_length=200)
    address_2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    zip_postal = models.CharField(max_length=20)
    spouse_name = models.CharField(max_length=100, blank=True)
    spouse_phone = models.CharField(max_length=20, blank=True)
    authorized_rep = models.CharField(max_length=100, blank=True)
    child_1 = models.CharField(max_length=100, blank=True)
    child_2 = models.CharField(max_length=100, blank=True)
    child_3 = models.CharField(max_length=100, blank=True)
    child_4 = models.CharField(max_length=100, blank=True)
    child_5 = models.CharField(max_length=100, blank=True)
    parent_1 = models.CharField(max_length=100, blank=True)
    parent_2 = models.CharField(max_length=100, blank=True)
    spouse_parent_1 = models.CharField(max_length=100, blank=True)
    spouse_parent_2 = models.CharField(max_length=100, blank=True)
    step_parent_1 = models.CharField(max_length=100, blank=True)  # NEW FIELD
    step_parent_2 = models.CharField(max_length=100, blank=True)  # NEW FIELD
    sibling_1 = models.CharField(max_length=100, blank=True)
    sibling_2 = models.CharField(max_length=100, blank=True)
    sibling_3 = models.CharField(max_length=100, blank=True)
    step_sibling_1 = models.CharField(max_length=100, blank=True)  # NEW FIELD
    step_sibling_2 = models.CharField(max_length=100, blank=True)  # NEW FIELD
    step_sibling_3 = models.CharField(max_length=100, blank=True)  # NEW FIELD
    id_document = models.FileField(upload_to='applications/double/', null=True, blank=True)
    constitution_agreed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - Double Application"

class ActivationFeePayment(models.Model):
    PAYMENT_METHODS = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    notes = models.TextField(blank=True)
    evidence_file = models.FileField(upload_to='activation_payments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Activation Fee - {self.transaction_id}"

class SharePurchase(models.Model):
    PAYMENT_METHODS = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    shares_purchased = models.IntegerField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Share Purchase - {self.shares_purchased} shares"
'''

# ===== 2. VIEWS.PY - Add these views =====
VIEWS_CODE = '''
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import SingleApplication, DoubleApplication, ActivationFeePayment, SharePurchase
import json

@csrf_exempt
@require_http_methods(["POST"])
def submit_activation_fee(request):
    try:
        payment = ActivationFeePayment.objects.create(
            payment_method=request.POST.get('payment_method'),
            transaction_id=request.POST.get('transaction_id'),
            amount=request.POST.get('amount', 50.00),
            notes=request.POST.get('notes', ''),
            evidence_file=request.FILES.get('evidence_file'),
            user=request.user if request.user.is_authenticated else None
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Payment submitted successfully',
            'id': payment.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_single_application(request):
    try:
        app = SingleApplication.objects.create(
            firstName=request.POST.get('firstName'),
            middleName=request.POST.get('middleName', ''),
            lastName=request.POST.get('lastName'),
            email=request.POST.get('email'),
            phoneMain=request.POST.get('phoneMain'),
            address1=request.POST.get('address1'),
            city=request.POST.get('city'),
            stateProvince=request.POST.get('stateProvince'),
            zip=request.POST.get('zip'),
            spouse=request.POST.get('spouse', ''),
            spousePhone=request.POST.get('spousePhone', ''),
            spouseCellPhone=request.POST.get('spouseCellPhone', ''),  # NEW FIELD
            authorizedRep=request.POST.get('authorizedRep', ''),
            child1=request.POST.get('child1', ''),
            child2=request.POST.get('child2', ''),
            child3=request.POST.get('child3', ''),
            child4=request.POST.get('child4', ''),
            child5=request.POST.get('child5', ''),
            parent1=request.POST.get('parent1', ''),
            parent2=request.POST.get('parent2', ''),
            spouseParent1=request.POST.get('spouseParent1', ''),
            spouseParent2=request.POST.get('spouseParent2', ''),
            sibling1=request.POST.get('sibling1', ''),
            sibling2=request.POST.get('sibling2', ''),
            id_document=request.FILES.get('id_document'),
            declarationAccepted=request.POST.get('declarationAccepted') == 'true'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Application submitted successfully',
            'id': app.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_double_application(request):
    try:
        app = DoubleApplication.objects.create(
            first_name=request.POST.get('first_name'),
            middle_name=request.POST.get('middle_name', ''),
            last_name=request.POST.get('last_name'),
            email=request.POST.get('email'),
            confirm_email=request.POST.get('confirm_email'),
            phone=request.POST.get('phone'),
            address_1=request.POST.get('address_1'),
            address_2=request.POST.get('address_2', ''),
            city=request.POST.get('city'),
            state_province=request.POST.get('state_province'),
            zip_postal=request.POST.get('zip_postal'),
            spouse_name=request.POST.get('spouse_name', ''),
            spouse_phone=request.POST.get('spouse_phone', ''),
            authorized_rep=request.POST.get('authorized_rep', ''),
            child_1=request.POST.get('child_1', ''),
            child_2=request.POST.get('child_2', ''),
            child_3=request.POST.get('child_3', ''),
            child_4=request.POST.get('child_4', ''),
            child_5=request.POST.get('child_5', ''),
            parent_1=request.POST.get('parent_1', ''),
            parent_2=request.POST.get('parent_2', ''),
            spouse_parent_1=request.POST.get('spouse_parent_1', ''),
            spouse_parent_2=request.POST.get('spouse_parent_2', ''),
            step_parent_1=request.POST.get('step_parent_1', ''),  # NEW FIELD
            step_parent_2=request.POST.get('step_parent_2', ''),  # NEW FIELD
            sibling_1=request.POST.get('sibling_1', ''),
            sibling_2=request.POST.get('sibling_2', ''),
            sibling_3=request.POST.get('sibling_3', ''),
            step_sibling_1=request.POST.get('step_sibling_1', ''),  # NEW FIELD
            step_sibling_2=request.POST.get('step_sibling_2', ''),  # NEW FIELD
            step_sibling_3=request.POST.get('step_sibling_3', ''),  # NEW FIELD
            id_document=request.FILES.get('id_document'),
            constitution_agreed=request.POST.get('constitution_agreed') == 'true'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Application submitted successfully',
            'id': app.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def buy_shares(request):
    try:
        data = json.loads(request.body)
        
        share = SharePurchase.objects.create(
            amount=data.get('amount'),
            shares_purchased=data.get('shares_purchased'),
            payment_method=data.get('payment_method'),
            notes=data.get('notes', ''),
            user=request.user if request.user.is_authenticated else None
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Share purchase submitted successfully',
            'id': share.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
'''

# ===== 3. URLS.PY - Add these URLs =====
URLS_CODE = '''
from django.urls import path
from . import views

urlpatterns = [
    # ... your existing URLs ...
    
    # NEW ENDPOINTS FOR FRONTEND:
    path('api/payments/activation/submit/', views.submit_activation_fee, name='submit_activation_fee'),
    path('api/applications/single/submit/', views.submit_single_application, name='submit_single_application'),
    path('api/applications/double/submit/', views.submit_double_application, name='submit_double_application'),
    path('api/shares/buy/', views.buy_shares, name='buy_shares'),
]
'''

# ===== 4. SETTINGS.PY - Update these settings =====
SETTINGS_CODE = '''
import os

# Add to INSTALLED_APPS:
INSTALLED_APPS = [
    # ... your existing apps ...
    'corsheaders',
    # ... your app name ...
]

# Update MIDDLEWARE (corsheaders FIRST):
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... your other middleware ...
]

# CORS Settings:
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

# Static files:
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
'''

print("COMPLETE BACKEND SETUP READY!")
print("1. Copy models to models.py")
print("2. Copy views to views.py")
print("3. Copy URLs to urls.py")
print("4. Update settings.py")
print("5. Run: pip install django-cors-headers")
print("6. Run: python manage.py makemigrations")
print("7. Run: python manage.py migrate")
print("8. Restart both local and PythonAnywhere servers")