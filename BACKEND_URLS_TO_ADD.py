# Add these URLs to your existing Django backend urls.py

from django.urls import path
from . import views

# Add these to your existing urlpatterns list:
urlpatterns = [
    # ... your existing URLs ...
    
    # NEW ENDPOINTS FOR FRONTEND CONNECTION:
    path('api/payments/activation/submit/', views.submit_activation_fee, name='submit_activation_fee'),
    path('api/applications/single/submit/', views.submit_single_application, name='submit_single_application'),
    path('api/applications/double/submit/', views.submit_double_application, name='submit_double_application'),
    path('api/shares/buy/', views.buy_shares, name='buy_shares'),
]