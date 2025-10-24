# Updated Django Views for Pamoja Application System
# Add these to your Django backend views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from .models import SingleApplication, DoubleApplication, SharePurchase, ActivationFeePayment
from .serializers import (
    SingleApplicationSerializer, DoubleApplicationSerializer, 
    SharePurchaseSerializer, ActivationFeePaymentSerializer
)

class SingleApplicationViewSet(viewsets.ModelViewSet):
    queryset = SingleApplication.objects.all()
    serializer_class = SingleApplicationSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []  # Allow creation without authentication
        return [permission() for permission in permission_classes]

class DoubleApplicationViewSet(viewsets.ModelViewSet):
    queryset = DoubleApplication.objects.all()
    serializer_class = DoubleApplicationSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = []  # Allow creation without authentication
        return [permission() for permission in permission_classes]

class SharePurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = SharePurchaseSerializer
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
        
        # Update user's total shares (assuming you have a UserProfile model)
        try:
            user_profile = share_purchase.user.profile
            user_profile.shares_owned += int(shares_assigned)
            user_profile.save()
        except AttributeError:
            # Handle case where UserProfile doesn't exist
            pass
        
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

class ActivationFeePaymentViewSet(viewsets.ModelViewSet):
    serializer_class = ActivationFeePaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return ActivationFeePayment.objects.all()
        return ActivationFeePayment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        activation_payment = self.get_object()
        admin_notes = request.data.get('admin_notes', '')
        
        # Update activation payment
        activation_payment.status = 'approved'
        activation_payment.admin_notes = admin_notes
        activation_payment.reviewed_by = request.user
        activation_payment.reviewed_at = timezone.now()
        activation_payment.save()
        
        # Activate user membership (assuming you have a UserProfile model)
        try:
            user_profile = activation_payment.user.profile
            user_profile.is_active_member = True
            user_profile.activation_date = timezone.now()
            user_profile.save()
        except AttributeError:
            # Handle case where UserProfile doesn't exist
            pass
        
        return Response({'message': 'Activation fee approved and membership activated'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        activation_payment = self.get_object()
        admin_notes = request.data.get('admin_notes', '')
        
        activation_payment.status = 'rejected'
        activation_payment.admin_notes = admin_notes
        activation_payment.reviewed_by = request.user
        activation_payment.reviewed_at = timezone.now()
        activation_payment.save()
        
        return Response({'message': 'Activation fee payment rejected'})

# Additional API Views for specific endpoints
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_single_application(request):
    """Endpoint for submitting single family applications"""
    serializer = SingleApplicationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Single family application submitted successfully!',
            'application_id': serializer.data['id']
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_double_application(request):
    """Endpoint for submitting double family applications"""
    serializer = DoubleApplicationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Double family application submitted successfully!',
            'application_id': serializer.data['id']
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_activation_fee(request):
    """Endpoint for submitting activation fee payments"""
    serializer = ActivationFeePaymentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({
            'message': 'Activation fee payment submitted successfully!',
            'payment_id': serializer.data['id']
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_shares(request):
    """Endpoint for purchasing shares"""
    serializer = SharePurchaseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({
            'message': 'Share purchase request submitted successfully!',
            'purchase_id': serializer.data['id']
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)