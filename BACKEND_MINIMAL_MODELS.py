# MINIMAL BACKEND MODELS - ADD TO YOUR DJANGO PROJECT

# 1. ADD TO models.py
"""
from django.db import models
from django.contrib.auth.models import User

class MembershipApplication(models.Model):
    MEMBERSHIP_TYPES = [('single', 'Single'), ('double', 'Double')]
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Primary applicant - ALL REQUIRED
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    id_number = models.CharField(max_length=20)
    id_document = models.FileField(upload_to='applications/ids/')
    
    # Address - ALL REQUIRED
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    
    # Emergency contact - ALL REQUIRED
    emergency_name = models.CharField(max_length=100)
    emergency_phone = models.CharField(max_length=20)
    emergency_relationship = models.CharField(max_length=50)
    
    # Spouse (for double membership) - REQUIRED IF DOUBLE
    spouse_first_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_last_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_email = models.EmailField(blank=True, null=True)
    spouse_phone = models.CharField(max_length=20, blank=True, null=True)
    spouse_date_of_birth = models.DateField(blank=True, null=True)
    spouse_id_number = models.CharField(max_length=20, blank=True, null=True)
    spouse_id_document = models.FileField(upload_to='applications/spouse_ids/', blank=True, null=True)
    
    # Optional fields
    children_info = models.JSONField(default=list, blank=True)
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
    
    PAYMENT_METHODS = [
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('cash', 'Cash'),
        ('check', 'Check')
    ]
    
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=50, choices=PAYMENT_TYPES)  # REQUIRED
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # REQUIRED
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS)  # REQUIRED
    payment_proof = models.FileField(upload_to='payments/')  # REQUIRED
    
    description = models.TextField(blank=True)  # OPTIONAL
    transaction_id = models.CharField(max_length=100, blank=True)  # OPTIONAL
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
    
    RELATIONSHIPS = [
        ('self', 'Self'),
        ('spouse', 'Spouse'),
        ('child', 'Child'),
        ('parent', 'Parent'),
        ('sibling', 'Sibling')
    ]
    
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    claim_type = models.CharField(max_length=50, choices=CLAIM_TYPES)  # REQUIRED
    member_name = models.CharField(max_length=100)  # REQUIRED
    relationship = models.CharField(max_length=50, choices=RELATIONSHIPS)  # REQUIRED
    incident_date = models.DateField()  # REQUIRED
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)  # REQUIRED
    description = models.TextField()  # REQUIRED
    
    supporting_documents = models.FileField(upload_to='claims/', blank=True, null=True)  # OPTIONAL
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
"""

# 2. ADD TO serializers.py
"""
from rest_framework import serializers
from .models import MembershipApplication, Payment, Claim

class MembershipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipApplication
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at', 'updated_at')

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at')

class ClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at')
"""

# 3. ADD TO views.py
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MembershipApplication, Payment, Claim
from .serializers import MembershipApplicationSerializer, PaymentSerializer, ClaimSerializer

class MembershipApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return MembershipApplication.objects.all()
        return MembershipApplication.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Claim.objects.all()
        return Claim.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
"""

# 4. ADD TO urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'applications', views.MembershipApplicationViewSet, basename='applications')
router.register(r'payments', views.PaymentViewSet, basename='payments')
router.register(r'claims', views.ClaimViewSet, basename='claims')

urlpatterns = [
    path('api/', include(router.urls)),
]
"""

# 5. RUN THESE COMMANDS
"""
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
"""

print("MINIMAL BACKEND SETUP COMPLETE")
print("This creates the exact models the frontend expects")