# Updated Django URLs for Pamoja Application System
# Add these to your Django backend urls.py

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
    
    # Custom API endpoints
    path('api/applications/single/submit/', views.submit_single_application, name='submit-single-application'),
    path('api/applications/double/submit/', views.submit_double_application, name='submit-double-application'),
    path('api/payments/activation/submit/', views.submit_activation_fee, name='submit-activation-fee'),
    path('api/shares/buy/', views.buy_shares, name='buy-shares'),
    
    # Admin endpoints (handled by viewsets)
    # GET /api/single-applications/ - List all single applications (admin only)
    # GET /api/double-applications/ - List all double applications (admin only)
    # GET /api/shares/ - List all share purchases (admin sees all, users see their own)
    # GET /api/activation-payments/ - List all activation payments (admin sees all, users see their own)
    
    # POST /api/shares/{id}/approve/ - Approve share purchase (admin only)
    # POST /api/shares/{id}/reject/ - Reject share purchase (admin only)
    # POST /api/activation-payments/{id}/approve/ - Approve activation payment (admin only)
    # POST /api/activation-payments/{id}/reject/ - Reject activation payment (admin only)
]

# CORS Settings (add to settings.py)
"""
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_ALL_ORIGINS = True  # Only for development

# File Upload Settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
    'rest_framework',
    # ... your app
]

# Add to MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]
"""