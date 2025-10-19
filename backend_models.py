# Django Models for Enhanced Shares System
# Add these to your Django backend models.py

from django.db import models
from django.contrib.auth.models import User

class SharePurchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Admin Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('paypal', 'PayPal'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='share_purchases')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    shares_requested = models.IntegerField()
    shares_assigned = models.IntegerField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_shares')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - ${self.amount} - {self.status}"

# Django Views for Enhanced Shares System
# Add these to your Django backend views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone

class SharePurchaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return SharePurchase.objects.all()
        return SharePurchase.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        share_purchase = self.get_object()
        shares_assigned = request.data.get('shares_assigned', share_purchase.shares_requested)
        admin_notes = request.data.get('admin_notes', '')
        
        # Update share purchase
        share_purchase.status = 'approved'
        share_purchase.shares_assigned = shares_assigned
        share_purchase.admin_notes = admin_notes
        share_purchase.reviewed_by = request.user
        share_purchase.reviewed_at = timezone.now()
        share_purchase.save()
        
        # Update user's total shares
        user_profile = share_purchase.user.profile  # Assuming you have a UserProfile model
        user_profile.shares_owned += int(shares_assigned)
        user_profile.save()
        
        return Response({'message': 'Share purchase approved successfully'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        share_purchase = self.get_object()
        admin_notes = request.data.get('admin_notes', '')
        
        share_purchase.status = 'rejected'
        share_purchase.admin_notes = admin_notes
        share_purchase.reviewed_by = request.user
        share_purchase.reviewed_at = timezone.now()
        share_purchase.save()
        
        return Response({'message': 'Share purchase rejected'})

# Django Serializers
# Add these to your Django backend serializers.py

from rest_framework import serializers

class SharePurchaseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = SharePurchase
        fields = [
            'id', 'user', 'user_name', 'user_email', 'amount', 'shares_requested', 
            'shares_assigned', 'payment_method', 'transaction_id', 'notes', 
            'admin_notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'shares_assigned', 'admin_notes', 'status']

# Django URLs
# Add these to your Django backend urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'shares', SharePurchaseViewSet, basename='shares')

urlpatterns = [
    path('api/', include(router.urls)),
    # ... other URLs
]

# Migration Command
# Run this command in your Django backend:
# python manage.py makemigrations
# python manage.py migrate