# CRITICAL BACKEND FIXES FOR PAMOJA

# 1. MODELS.PY - Add missing fields and fix relationships
"""
# Add to User model
class User(AbstractUser):
    # ... existing fields ...
    shares = models.IntegerField(default=0)
    is_active_member = models.BooleanField(default=False)
    deactivation_reason = models.TextField(blank=True, null=True)
    activation_date = models.DateTimeField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Auto-activate if shares >= 20
        if self.shares >= 20 and not self.is_active_member:
            self.is_active_member = True
            self.activation_date = timezone.now()
            self.deactivation_reason = None
        super().save(*args, **kwargs)

# Fix Claims model
class Claim(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    claim_type = models.CharField(max_length=50, choices=[
        ('death', 'Death Benefit'),
        ('medical', 'Medical Emergency'),
        ('education', 'Education Support'),
        ('emergency', 'Emergency Assistance')
    ])
    member_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    incident_date = models.DateField()
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    supporting_documents = models.FileField(upload_to='claims/', blank=True, null=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ])
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Fix Payment model
class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=50, choices=[
        ('activation_fee', 'Activation Fee'),
        ('membership_single', 'Single Membership'),
        ('membership_double', 'Double Membership'),
        ('shares', 'Share Purchase'),
        ('other', 'Other')
    ])
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_proof = models.FileField(upload_to='payments/', blank=True, null=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ])
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Auto-update shares if payment is for shares and approved
        if self.status == 'approved' and self.payment_type == 'shares':
            shares_to_add = int(self.amount // 25)  # $25 per share
            self.user.shares += shares_to_add
            self.user.save()

# Fix Share model
class Share(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='share_purchases')
    number_of_shares = models.IntegerField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_proof = models.FileField(upload_to='shares/')
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.status == 'approved':
            self.user.shares += self.number_of_shares
            self.user.save()

# Fix Contact model
class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    admin_reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Fix Document model
class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
"""

# 2. VIEWS.PY - Fix admin endpoints
"""
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone

class AdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def claims(self, request):
        claims = Claim.objects.all().order_by('-created_at')
        serializer = ClaimSerializer(claims, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def payments(self, request):
        payments = Payment.objects.all().order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def shares(self, request):
        shares = Share.objects.all().order_by('-created_at')
        serializer = ShareSerializer(shares, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def contacts(self, request):
        contacts = Contact.objects.all().order_by('-created_at')
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def documents(self, request):
        documents = Document.objects.all().order_by('-created_at')
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def financial_report(self, request):
        total_payments = Payment.objects.filter(status='approved').aggregate(
            total=Sum('amount'))['total'] or 0
        total_shares_sold = Share.objects.filter(status='approved').aggregate(
            total=Sum('amount_paid'))['total'] or 0
        pending_payments = Payment.objects.filter(status='pending').count()
        
        return Response({
            'total_payments': total_payments,
            'total_shares_sold': total_shares_sold,
            'pending_payments': pending_payments,
            'total_revenue': total_payments + total_shares_sold
        })
    
    @action(detail=False, methods=['get'])
    def shares_report(self, request):
        total_shares = User.objects.aggregate(total=Sum('shares'))['total'] or 0
        active_members = User.objects.filter(is_active_member=True).count()
        inactive_members = User.objects.filter(is_active_member=False, shares__lt=20).count()
        
        return Response({
            'total_shares': total_shares,
            'active_members': active_members,
            'inactive_members': inactive_members,
            'average_shares': total_shares / max(User.objects.count(), 1)
        })
    
    @action(detail=True, methods=['post'])
    def activate_user(self, request, pk=None):
        user = self.get_object()
        user.is_active_member = True
        user.activation_date = timezone.now()
        user.deactivation_reason = None
        user.save()
        return Response({'status': 'User activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate_user(self, request, pk=None):
        user = self.get_object()
        reason = request.data.get('reason', '')
        user.is_active_member = False
        user.deactivation_reason = reason
        user.save()
        return Response({'status': 'User deactivated'})
    
    @action(detail=True, methods=['post'])
    def update_shares(self, request, pk=None):
        user = self.get_object()
        shares = request.data.get('shares', 0)
        user.shares = shares
        user.save()
        return Response({'status': 'Shares updated'})

class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Claim.objects.all()
        return Claim.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        claim = self.get_object()
        claim.status = 'approved'
        claim.admin_notes = request.data.get('notes', '')
        claim.save()
        return Response({'status': 'Claim approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        claim = self.get_object()
        claim.status = 'rejected'
        claim.admin_notes = request.data.get('notes', '')
        claim.save()
        return Response({'status': 'Claim rejected'})

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'approved'
        payment.admin_notes = request.data.get('notes', '')
        payment.save()
        return Response({'status': 'Payment approved'})
"""

# 3. URLS.PY - Add missing routes
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'claims', ClaimViewSet, basename='claims')
router.register(r'payments', PaymentViewSet, basename='payments')
router.register(r'shares', ShareViewSet, basename='shares')
router.register(r'documents', DocumentViewSet, basename='documents')
router.register(r'contact', ContactViewSet, basename='contact')
router.register(r'admin', AdminViewSet, basename='admin')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
]
"""

# 4. SERIALIZERS.PY - Add missing serializers
"""
class ClaimSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Claim
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at', 'updated_at')

class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at')

class ShareSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Share
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')

class ContactSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('user', 'is_read', 'admin_reply', 'created_at')

class DocumentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')
"""

print("BACKEND FIXES COMPLETE - Apply these changes to your Django backend")