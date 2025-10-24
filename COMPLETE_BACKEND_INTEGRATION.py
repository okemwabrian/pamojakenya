# Complete Backend Integration for Pamoja Application
# This file contains all necessary backend updates for both local and PythonAnywhere deployment

# ===== DJANGO SETTINGS UPDATES =====

# Add to settings.py
CORS_SETTINGS = """
# CORS Settings for both local and production
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pamojake.netlify.app",
    "https://okemwabrianny.pythonanywhere.com",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Set to True only for development

# File Upload Settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Security Settings for Production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# For PythonAnywhere MySQL (uncomment and configure)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'okemwabrianny$pamoja',
#         'USER': 'okemwabrianny',
#         'PASSWORD': 'your_password',
#         'HOST': 'okemwabrianny.mysql.pythonanywhere-services.com',
#         'OPTIONS': {
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#         },
#     }
# }
"""

# ===== UPDATED MODELS =====

MODELS_CODE = '''
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    shares_owned = models.IntegerField(default=0)
    is_active_member = models.BooleanField(default=False)
    activation_date = models.DateTimeField(null=True, blank=True)
    membership_type = models.CharField(max_length=20, choices=[
        ('single', 'Single Family'),
        ('double', 'Double Family')
    ], default='single')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Profile"

class SingleApplication(models.Model):
    # Personal Information
    firstName = models.CharField(max_length=100)
    middleName = models.CharField(max_length=100, blank=True)
    lastName = models.CharField(max_length=100)
    email = models.EmailField()
    phoneMain = models.CharField(max_length=20)
    
    # Address Information
    address1 = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    stateProvince = models.CharField(max_length=100)
    zip = models.CharField(max_length=20)
    
    # Family Information
    spouse = models.CharField(max_length=100, blank=True)
    spousePhone = models.CharField(max_length=20, blank=True)
    spouseCellPhone = models.CharField(max_length=20, blank=True)  # NEW FIELD
    authorizedRep = models.CharField(max_length=100, blank=True)
    
    # Children
    child1 = models.CharField(max_length=100, blank=True)
    child2 = models.CharField(max_length=100, blank=True)
    child3 = models.CharField(max_length=100, blank=True)
    child4 = models.CharField(max_length=100, blank=True)
    child5 = models.CharField(max_length=100, blank=True)
    
    # Parents
    parent1 = models.CharField(max_length=100, blank=True)
    parent2 = models.CharField(max_length=100, blank=True)
    spouseParent1 = models.CharField(max_length=100, blank=True)
    spouseParent2 = models.CharField(max_length=100, blank=True)
    
    # Siblings
    sibling1 = models.CharField(max_length=100, blank=True)
    sibling2 = models.CharField(max_length=100, blank=True)
    
    # Documents and Status
    id_document = models.FileField(upload_to='applications/single/')
    declarationAccepted = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='pending')
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.firstName} {self.lastName} - Single Application"

class DoubleApplication(models.Model):
    # Personal Information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    confirm_email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Address Information
    address_1 = models.CharField(max_length=200)
    address_2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    zip_postal = models.CharField(max_length=20)
    
    # Family Information
    spouse_name = models.CharField(max_length=100, blank=True)
    spouse_phone = models.CharField(max_length=20, blank=True)
    authorized_rep = models.CharField(max_length=100, blank=True)
    
    # Children
    child_1 = models.CharField(max_length=100, blank=True)
    child_2 = models.CharField(max_length=100, blank=True)
    child_3 = models.CharField(max_length=100, blank=True)
    child_4 = models.CharField(max_length=100, blank=True)
    child_5 = models.CharField(max_length=100, blank=True)
    
    # Parents
    parent_1 = models.CharField(max_length=100, blank=True)
    parent_2 = models.CharField(max_length=100, blank=True)
    spouse_parent_1 = models.CharField(max_length=100, blank=True)
    spouse_parent_2 = models.CharField(max_length=100, blank=True)
    
    # Step Parents (NEW FIELDS)
    step_parent_1 = models.CharField(max_length=100, blank=True)
    step_parent_2 = models.CharField(max_length=100, blank=True)
    
    # Siblings
    sibling_1 = models.CharField(max_length=100, blank=True)
    sibling_2 = models.CharField(max_length=100, blank=True)
    sibling_3 = models.CharField(max_length=100, blank=True)
    
    # Step Siblings (NEW FIELDS)
    step_sibling_1 = models.CharField(max_length=100, blank=True)
    step_sibling_2 = models.CharField(max_length=100, blank=True)
    step_sibling_3 = models.CharField(max_length=100, blank=True)
    
    # Documents and Status
    id_document = models.FileField(upload_to='applications/double/')
    constitution_agreed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='pending')
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - Double Application"

class SharePurchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Admin Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    # Updated Payment Method Choices
    PAYMENT_METHOD_CHOICES = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='share_purchases')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    shares_purchased = models.IntegerField()  # Changed from shares_requested
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - ${self.amount} - {self.status}"

class ActivationFeePayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    # Updated Payment Method Choices
    PAYMENT_METHOD_CHOICES = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activation_payments')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    notes = models.TextField(blank=True)
    evidence_file = models.FileField(upload_to='activation_payments/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - Activation Fee - {self.status}"
'''

# ===== UPDATED URLS =====

URLS_CODE = '''
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'single-applications', views.SingleApplicationViewSet)
router.register(r'double-applications', views.DoubleApplicationViewSet)
router.register(r'shares', views.SharePurchaseViewSet, basename='shares')
router.register(r'activation-payments', views.ActivationFeePaymentViewSet, basename='activation-payments')

urlpatterns = [
    # API Router URLs
    path('api/', include(router.urls)),
    
    # Custom API endpoints matching frontend expectations
    path('api/applications/single/submit/', views.submit_single_application, name='submit-single-application'),
    path('api/applications/double/submit/', views.submit_double_application, name='submit-double-application'),
    path('api/payments/activation/submit/', views.submit_activation_fee, name='submit-activation-fee'),
    path('api/shares/buy/', views.buy_shares, name='buy-shares'),
    
    # Authentication URLs
    path('api/auth/', include('rest_framework.urls')),
    
    # Media files serving (for development)
    path('media/<path:path>', views.serve_media, name='serve_media'),
]

# For production, add to main urls.py:
# from django.conf import settings
# from django.conf.urls.static import static
# 
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
'''

# ===== DEPLOYMENT COMMANDS =====

DEPLOYMENT_COMMANDS = """
# Local Development Setup
1. Install dependencies:
   pip install django djangorestframework django-cors-headers pillow

2. Create migrations:
   python manage.py makemigrations
   python manage.py migrate

3. Create superuser:
   python manage.py createsuperuser

4. Run development server:
   python manage.py runserver

# PythonAnywhere Deployment
1. Upload files to PythonAnywhere
2. Install packages in virtual environment:
   pip3.10 install --user django djangorestframework django-cors-headers pillow

3. Configure WSGI file:
   # Add to /var/www/okemwabrianny_pythonanywhere_com_wsgi.py
   import os
   import sys
   
   path = '/home/okemwabrianny/pamoja-backend'
   if path not in sys.path:
       sys.path.append(path)
   
   os.environ['DJANGO_SETTINGS_MODULE'] = 'pamoja.settings'
   
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()

4. Run migrations on PythonAnywhere console:
   cd pamoja-backend
   python manage.py migrate
   python manage.py collectstatic

5. Configure static files in Web tab:
   URL: /static/
   Directory: /home/okemwabrianny/pamoja-backend/staticfiles/
   
   URL: /media/
   Directory: /home/okemwabrianny/pamoja-backend/media/

# Frontend Environment Setup
1. Local development:
   Create .env.local with: REACT_APP_API_URL=http://localhost:8000/api

2. Production build:
   Create .env.production with: REACT_APP_API_URL=https://okemwabrianny.pythonanywhere.com/api

3. Build and deploy:
   npm run build
   # Upload build folder to your hosting service
"""

print("Backend integration files created successfully!")
print("Follow the deployment commands to set up both local and production environments.")