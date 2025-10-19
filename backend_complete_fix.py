# COMPLETE BACKEND FIX - COPY TO YOUR DJANGO PROJECT

# 1. MODELS.PY - Complete models with all fields
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    # Profile fields
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    
    # Membership fields
    shares = models.IntegerField(default=0)
    is_active_member = models.BooleanField(default=False)
    membership_type = models.CharField(max_length=20, choices=[
        ('single', 'Single'),
        ('double', 'Double')
    ], blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if self.shares >= 20 and not self.is_active_member:
            self.is_active_member = True
        super().save(*args, **kwargs)

class MembershipApplication(models.Model):
    MEMBERSHIP_TYPES = [('single', 'Single'), ('double', 'Double')]
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Primary applicant
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    id_number = models.CharField(max_length=20)
    id_document = models.FileField(upload_to='applications/ids/')
    
    # Address
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    
    # Emergency contact
    emergency_name = models.CharField(max_length=100)
    emergency_phone = models.CharField(max_length=20)
    emergency_relationship = models.CharField(max_length=50)
    
    # Spouse (for double)
    spouse_first_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_last_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_email = models.EmailField(blank=True, null=True)
    spouse_phone = models.CharField(max_length=20, blank=True, null=True)
    spouse_date_of_birth = models.DateField(blank=True, null=True)
    spouse_id_number = models.CharField(max_length=20, blank=True, null=True)
    spouse_id_document = models.FileField(upload_to='applications/spouse_ids/', blank=True, null=True)
    
    # Children
    children_info = models.JSONField(default=list, blank=True)
    
    # Admin
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Payment(models.Model):
    PAYMENT_TYPES = [
        ('activation_fee', 'Activation Fee'),
        ('membership_single', 'Single Membership'),
        ('membership_double', 'Double Membership'),
        ('shares', 'Share Purchase'),
        ('other', 'Other')
    ]
    
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=50, choices=PAYMENT_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_proof = models.FileField(upload_to='payments/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Claim(models.Model):
    CLAIM_TYPES = [
        ('death', 'Death Benefit'),
        ('medical', 'Medical Emergency'),
        ('education', 'Education Support'),
        ('emergency', 'Emergency Assistance')
    ]
    
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    claim_type = models.CharField(max_length=50, choices=CLAIM_TYPES)
    member_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    incident_date = models.DateField()
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    supporting_documents = models.FileField(upload_to='claims/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Share(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='share_purchases')
    number_of_shares = models.IntegerField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_proof = models.FileField(upload_to='shares/')
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
"""

# 2. SERIALIZERS.PY
"""
from rest_framework import serializers
from .models import User, MembershipApplication, Payment, Claim, Document, Share

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 
                 'date_of_birth', 'address', 'city', 'state', 'zip_code', 
                 'shares', 'is_active_member', 'membership_type', 'is_staff']
        read_only_fields = ['id', 'shares', 'is_active_member', 'is_staff']

class MembershipApplicationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MembershipApplication
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at', 'updated_at')

class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at')

class ClaimSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Claim
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at')

class DocumentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')

class ShareSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Share
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')
"""

# 3. VIEWS.PY
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import User, MembershipApplication, Payment, Claim, Document, Share
from .serializers import (UserSerializer, MembershipApplicationSerializer, 
                         PaymentSerializer, ClaimSerializer, DocumentSerializer, ShareSerializer)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

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

class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Claim.objects.all().order_by('-created_at')
        return Claim.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Document.objects.all().order_by('-created_at')
        return Document.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ShareViewSet(viewsets.ModelViewSet):
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Share.objects.all().order_by('-created_at')
        return Share.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
"""

# 4. URLS.PY
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='users')
router.register(r'applications', views.MembershipApplicationViewSet, basename='applications')
router.register(r'payments', views.PaymentViewSet, basename='payments')
router.register(r'claims', views.ClaimViewSet, basename='claims')
router.register(r'documents', views.DocumentViewSet, basename='documents')
router.register(r'shares', views.ShareViewSet, basename='shares')

urlpatterns = [
    path('api/', include(router.urls)),
]
"""

# 5. SETTINGS.PY - Add these
"""
import os

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# CORS settings (if using CORS)
CORS_ALLOW_ALL_ORIGINS = True  # Only for development
"""

# 6. MAIN URLS.PY - Add media serving
"""
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your existing URLs
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
"""

print("COMPLETE BACKEND SETUP")
print("Run: python manage.py makemigrations && python manage.py migrate")
print("This fixes all data retrieval and file upload issues")