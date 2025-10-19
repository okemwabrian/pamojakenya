# COMPLETE BACKEND FIX - URLs AND VIEWS

# 1. URLS.PY - Complete URL configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'applications', views.MembershipApplicationViewSet, basename='applications')
router.register(r'payments', views.PaymentViewSet, basename='payments')
router.register(r'claims', views.ClaimViewSet, basename='claims')
router.register(r'documents', views.DocumentViewSet, basename='documents')
router.register(r'shares', views.ShareViewSet, basename='shares')

urlpatterns = [
    # API routes
    path('', include(router.urls)),
    
    # Auth routes
    path('auth/user/', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    
    # Admin routes
    path('admin/applications/', views.AdminApplicationsView.as_view(), name='admin-applications'),
    path('admin/payments/', views.AdminPaymentsView.as_view(), name='admin-payments'),
    path('admin/claims/', views.AdminClaimsView.as_view(), name='admin-claims'),
    path('admin/documents/', views.AdminDocumentsView.as_view(), name='admin-documents'),
    path('admin/users/', views.AdminUsersView.as_view(), name='admin-users'),
]
"""

# 2. VIEWS.PY - Complete views with all functionality
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User, MembershipApplication, Payment, Claim, Document, Share
from .serializers import (UserSerializer, MembershipApplicationSerializer, 
                         PaymentSerializer, ClaimSerializer, DocumentSerializer, ShareSerializer)

# Auth Views
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=400)

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(request.data.get('password'))
            user.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=400)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# Main ViewSets
class MembershipApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return MembershipApplication.objects.all().order_by('-created_at')
        return MembershipApplication.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        application = self.get_object()
        application.status = 'approved'
        application.admin_notes = request.data.get('notes', '')
        application.user.membership_type = application.membership_type
        application.user.save()
        application.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = 'rejected'
        application.admin_notes = request.data.get('notes', '')
        application.save()
        return Response({'status': 'rejected'})

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'approved'
        payment.admin_notes = request.data.get('notes', '')
        
        # Update shares if share purchase
        if payment.payment_type == 'shares':
            shares_to_add = int(payment.amount // 25)
            payment.user.shares += shares_to_add
            payment.user.save()
        
        payment.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'rejected'
        payment.admin_notes = request.data.get('notes', '')
        payment.save()
        return Response({'status': 'rejected'})

class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Claim.objects.all().order_by('-created_at')
        return Claim.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        claim = self.get_object()
        claim.status = 'approved'
        claim.admin_notes = request.data.get('notes', '')
        claim.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        claim = self.get_object()
        claim.status = 'rejected'
        claim.admin_notes = request.data.get('notes', '')
        claim.save()
        return Response({'status': 'rejected'})

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Document.objects.all().order_by('-created_at')
        return Document.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        document = self.get_object()
        document.status = 'approved'
        document.save()
        return Response({'status': 'approved'})

class ShareViewSet(viewsets.ModelViewSet):
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Share.objects.all().order_by('-created_at')
        return Share.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Admin Views
class AdminApplicationsView(generics.ListAPIView):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return MembershipApplication.objects.all().order_by('-created_at')

class AdminPaymentsView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return Payment.objects.all().order_by('-created_at')

class AdminClaimsView(generics.ListAPIView):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return Claim.objects.all().order_by('-created_at')

class AdminDocumentsView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return Document.objects.all().order_by('-created_at')

class AdminUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')
"""

# 3. SETTINGS.PY - Add authentication
"""
INSTALLED_APPS = [
    # ... your existing apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',  # if using CORS
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Media files
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB

# CORS (if using)
CORS_ALLOW_ALL_ORIGINS = True  # Only for development
CORS_ALLOW_CREDENTIALS = True
"""

# 4. MAIN URLS.PY
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('your_app.urls')),  # Replace with your app name
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
"""

print("COMPLETE BACKEND SETUP")
print("1. Copy URLs and Views to your Django app")
print("2. Update settings.py with authentication and media settings")
print("3. Run: python manage.py migrate")
print("4. Create superuser: python manage.py createsuperuser")
print("This fixes all API endpoints and admin functionality")