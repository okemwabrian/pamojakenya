# Enhanced Payment System - Django Backend Models

from django.db import models
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from decimal import Decimal

class Payment(models.Model):
    PAYMENT_TYPES = [
        ('activation_fee', 'Activation Fee'),
        ('share_purchase', 'Share Purchase'),
        ('membership_fee', 'Membership Fee'),
        ('claim_payout', 'Claim Payout'),
        ('share_deduction', 'Share Deduction'),
        ('refund', 'Refund'),
    ]
    
    PAYMENT_METHODS = [
        ('paypal', 'PayPal'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('system', 'System Transaction'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, blank=True)
    reference_id = models.CharField(max_length=100, blank=True)  # Internal reference
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Related objects
    application = models.ForeignKey('Application', on_delete=models.SET_NULL, null=True, blank=True)
    share_purchase = models.ForeignKey('SharePurchase', on_delete=models.SET_NULL, null=True, blank=True)
    claim = models.ForeignKey('Claim', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = f"PAY{self.id or ''}{self.created_at.strftime('%Y%m%d')}"
        super().save(*args, **kwargs)
    
    def send_notification_email(self):
        """Send email notification based on payment status"""
        if self.status == 'approved':
            self.send_approval_email()
        elif self.status == 'rejected':
            self.send_rejection_email()
    
    def send_approval_email(self):
        subject = f"Payment Approved - {self.get_payment_type_display()}"
        message = f"""
        Dear {self.user.get_full_name() or self.user.username},
        
        Your payment has been approved!
        
        Payment Details:
        - Type: {self.get_payment_type_display()}
        - Amount: ${self.amount}
        - Reference: {self.reference_id}
        - Date: {self.created_at.strftime('%B %d, %Y')}
        
        Thank you for your payment.
        
        Best regards,
        Pamoja Kenya MN Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [self.user.email],
            fail_silently=False,
        )

# Enhanced Application Model
class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('payment_submitted', 'Payment Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('active', 'Active Member'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    application_type = models.CharField(max_length=20, choices=[('single', 'Single'), ('double', 'Double')])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    activation_fee_paid = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def activate_membership(self):
        """Activate membership and send notification"""
        self.status = 'active'
        self.activation_fee_paid = True
        self.save()
        
        # Update user profile
        profile = self.user.profile
        profile.is_active_member = True
        profile.membership_type = self.application_type
        profile.save()
        
        # Send activation email
        self.send_activation_email()
    
    def send_activation_email(self):
        subject = "Membership Activated - Welcome to Pamoja Kenya MN!"
        message = f"""
        Congratulations {self.user.get_full_name() or self.user.username}!
        
        Your membership application has been approved and your account is now active.
        
        Membership Details:
        - Type: {self.get_application_type_display()} Family Membership
        - Activation Date: {self.updated_at.strftime('%B %d, %Y')}
        - Member ID: {self.user.id}
        
        You can now access all member benefits and services.
        
        Welcome to the Pamoja Kenya MN family!
        
        Best regards,
        Pamoja Kenya MN Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [self.user.email],
            fail_silently=False,
        )

# Enhanced Views
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

class PaymentViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve_payment(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'approved'
        payment.processed_by = request.user
        payment.admin_notes = request.data.get('notes', '')
        payment.save()
        
        # Handle specific payment types
        if payment.payment_type == 'activation_fee' and payment.application:
            payment.application.activate_membership()
        elif payment.payment_type == 'share_purchase' and payment.share_purchase:
            shares_assigned = request.data.get('shares_assigned', payment.share_purchase.shares_requested)
            payment.share_purchase.approve_purchase(shares_assigned, request.user)
        
        # Send notification email
        payment.send_notification_email()
        
        return Response({'message': 'Payment approved successfully'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def financial_report(self, request):
        """Generate financial report"""
        from django.db.models import Sum, Count
        
        # Get date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = Payment.objects.filter(status='approved')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Calculate totals by payment type
        report = {
            'total_income': queryset.filter(
                payment_type__in=['activation_fee', 'share_purchase', 'membership_fee']
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
            
            'total_payouts': queryset.filter(
                payment_type__in=['claim_payout', 'refund']
            ).aggregate(Sum('amount'))['amount__sum'] or 0,
            
            'by_type': {},
            'monthly_summary': []
        }
        
        # Group by payment type
        for payment_type, _ in Payment.PAYMENT_TYPES:
            type_data = queryset.filter(payment_type=payment_type).aggregate(
                total=Sum('amount'),
                count=Count('id')
            )
            report['by_type'][payment_type] = {
                'total': type_data['total'] or 0,
                'count': type_data['count']
            }
        
        return Response(report)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def shares_report(self, request):
        """Generate shares report"""
        from django.db.models import Sum
        
        total_shares_sold = SharePurchase.objects.filter(
            status='approved'
        ).aggregate(Sum('shares_assigned'))['shares_assigned__sum'] or 0
        
        total_revenue = SharePurchase.objects.filter(
            status='approved'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Users with shares
        users_with_shares = User.objects.filter(
            profile__shares_owned__gt=0
        ).values('id', 'first_name', 'last_name', 'email', 'profile__shares_owned')
        
        report = {
            'total_shares_sold': total_shares_sold,
            'total_revenue': total_revenue,
            'average_price_per_share': total_revenue / total_shares_sold if total_shares_sold > 0 else 0,
            'users_with_shares': list(users_with_shares),
            'share_distribution': {
                'high_holders': users_with_shares.filter(profile__shares_owned__gte=50).count(),
                'medium_holders': users_with_shares.filter(
                    profile__shares_owned__gte=20, 
                    profile__shares_owned__lt=50
                ).count(),
                'low_holders': users_with_shares.filter(profile__shares_owned__lt=20).count(),
            }
        }
        
        return Response(report)

# Email notification for share deductions
def send_share_deduction_email(user, amount_deducted, remaining_shares, reason):
    subject = "Share Deduction Notification"
    message = f"""
    Dear {user.get_full_name() or user.username},
    
    This is to notify you that shares have been deducted from your account.
    
    Deduction Details:
    - Shares Deducted: {amount_deducted}
    - Remaining Shares: {remaining_shares}
    - Current Value: ${remaining_shares * 100}
    - Reason: {reason}
    - Date: {timezone.now().strftime('%B %d, %Y')}
    
    If you have any questions, please contact the admin.
    
    Best regards,
    Pamoja Kenya MN Team
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )