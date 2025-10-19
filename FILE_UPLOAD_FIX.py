# FILE UPLOAD FIX - Django Backend

# 1. ADD TO DJANGO SETTINGS.PY
"""
# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Media Files
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS Headers (if using django-cors-headers)
CORS_ALLOW_ALL_ORIGINS = True  # Only for development
CORS_ALLOW_CREDENTIALS = True
"""

# 2. ADD TO MAIN urls.py
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('your_app.urls')),  # Replace 'your_app' with your app name
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
"""

# 3. VIEWS.PY - Add debugging to MembershipApplicationViewSet
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging

logger = logging.getLogger(__name__)

class MembershipApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Debug logging
        logger.info(f"Request data keys: {list(request.data.keys())}")
        logger.info(f"Request files: {list(request.FILES.keys())}")
        
        # Print to console for immediate debugging
        print("=== APPLICATION SUBMISSION DEBUG ===")
        print(f"Data keys: {list(request.data.keys())}")
        print(f"Files: {list(request.FILES.keys())}")
        print(f"Content-Type: {request.content_type}")
        
        # Check for required files
        if 'id_document' not in request.FILES:
            print("ERROR: id_document file missing")
            return Response(
                {"id_document": ["ID document file is required"]}, 
                status=400
            )
        
        # Check membership type for spouse document
        membership_type = request.data.get('membership_type')
        if membership_type == 'double' and 'spouse_id_document' not in request.FILES:
            print("ERROR: spouse_id_document file missing for double membership")
            return Response(
                {"spouse_id_document": ["Spouse ID document is required for double membership"]}, 
                status=400
            )
        
        return super().create(request, *args, **kwargs)
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return MembershipApplication.objects.all().order_by('-created_at')
        return MembershipApplication.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Debug logging
        print("=== PAYMENT SUBMISSION DEBUG ===")
        print(f"Data keys: {list(request.data.keys())}")
        print(f"Files: {list(request.FILES.keys())}")
        print(f"Content-Type: {request.content_type}")
        
        # Check for required file
        if 'payment_proof' not in request.FILES:
            print("ERROR: payment_proof file missing")
            return Response(
                {"payment_proof": ["Payment proof file is required"]}, 
                status=400
            )
        
        return super().create(request, *args, **kwargs)
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
"""

# 4. FRONTEND FIX - Update axios configuration
"""
// In src/services/api.js - Update axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,  // Increased timeout for file uploads
});

// Remove Content-Type header completely for file uploads
// Axios will set it automatically with boundary for multipart/form-data
"""

print("FILE UPLOAD FIX COMPLETE")
print("1. Add settings to Django settings.py")
print("2. Update main urls.py to serve media files") 
print("3. Add debug views to see what's being received")
print("4. Make sure MEDIA_ROOT directory exists and is writable")