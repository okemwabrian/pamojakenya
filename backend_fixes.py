# Backend Fixes - Django URLs and Views

# 1. Add to urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'shares', views.SharePurchaseViewSet, basename='shares')
router.register(r'payments', views.PaymentViewSet, basename='payments')

urlpatterns = [
    path('api/', include(router.urls)),
    # ... other URLs
]

# 2. Enhanced Payment ViewSet
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def activation_fee(self, request):
        """Submit activation fee payment"""
        try:
            payment = Payment.objects.create(
                user=request.user,
                payment_type='activation_fee',
                amount=request.data.get('amount', 50.00),
                payment_method=request.data.get('payment_method'),
                transaction_id=request.data.get('transaction_id'),
                description=request.data.get('notes', ''),
                status='pending'
            )
            return Response({
                'message': 'Activation fee payment submitted successfully',
                'payment_id': payment.id
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

# 3. SharePurchase ViewSet
class SharePurchaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return SharePurchase.objects.all()
        return SharePurchase.objects.filter(user=self.request.user)
    
    def create(self, request):
        """Create share purchase request"""
        try:
            share_purchase = SharePurchase.objects.create(
                user=request.user,
                amount=request.data.get('amount'),
                shares_requested=request.data.get('shares_requested'),
                payment_method=request.data.get('payment_method'),
                transaction_id=request.data.get('transaction_id'),
                notes=request.data.get('notes', ''),
                status='pending'
            )
            
            # Also create payment record
            Payment.objects.create(
                user=request.user,
                payment_type='share_purchase',
                amount=share_purchase.amount,
                payment_method=share_purchase.payment_method,
                transaction_id=share_purchase.transaction_id,
                description=f'Share purchase - {share_purchase.shares_requested} shares',
                share_purchase=share_purchase,
                status='pending'
            )
            
            return Response({
                'message': 'Share purchase request submitted successfully',
                'id': share_purchase.id
            }, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

# 4. Remove login restrictions - Update AuthViewSet
class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            # Remove is_active check - allow all registered users to login
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active,
                    'shares_owned': getattr(user.profile, 'shares_owned', 0) if hasattr(user, 'profile') else 0
                }
            })
        return Response({'error': 'Invalid credentials'}, status=400)

# 5. Enhanced Document Model with file viewing
class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def file_url(self):
        if self.file:
            return self.file.url
        return None
    
    @property
    def is_image(self):
        if self.file:
            return self.file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))
        return False

# 6. Payment Details Configuration
PAYMENT_DETAILS = {
    'paypal': {
        'label': 'PayPal',
        'details': 'pamojakeny@gmail.com',
        'instructions': 'Send payment to pamojakeny@gmail.com'
    },
    'mpesa': {
        'label': 'M-Pesa',
        'details': '+254700000000',
        'instructions': 'Send to +254700000000'
    },
    'bank': {
        'label': 'Bank Transfer',
        'details': 'Account: 1234567890, Bank: ABC Bank',
        'instructions': 'Contact admin for bank details'
    }
}

# 7. Enhanced Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    payment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_name', 'user_email', 'payment_type', 
            'amount', 'payment_method', 'transaction_id', 'status',
            'description', 'admin_notes', 'created_at', 'payment_details'
        ]
    
    def get_payment_details(self, obj):
        return PAYMENT_DETAILS.get(obj.payment_method, {})

# 8. Document Serializer with file URL
class DocumentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    file_url = serializers.CharField(read_only=True)
    is_image = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'user', 'user_name', 'user_email', 'name', 'file', 
            'file_url', 'is_image', 'document_type', 'description', 
            'status', 'admin_notes', 'created_at'
        ]

# 9. Settings for file uploads
# Add to settings.py
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Add to main urls.py
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your URLs
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)