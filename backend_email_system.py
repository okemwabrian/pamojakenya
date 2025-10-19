# Django Email System Configuration

# settings.py additions
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your email provider
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'Pamoja Kenya MN <noreply@pamojakenyamn.org>'

# Enhanced Views with Email Notifications
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class PaymentViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve_payment(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'approved'
        payment.processed_by = request.user
        payment.admin_notes = request.data.get('notes', '')
        payment.save()
        
        # Handle specific payment types
        if payment.payment_type == 'activation_fee':
            # Find and activate application
            application = Application.objects.filter(
                user=payment.user, 
                status__in=['pending', 'payment_submitted']
            ).first()
            
            if application:
                application.activate_membership()
                
        elif payment.payment_type == 'share_purchase':
            # Handle share purchase approval
            shares_assigned = int(request.data.get('shares_assigned', payment.amount // 100))
            
            # Update user shares
            profile = payment.user.profile
            profile.shares_owned += shares_assigned
            profile.save()
            
            # Create share transaction record
            ShareTransaction.objects.create(
                user=payment.user,
                amount=shares_assigned,
                transaction_type='purchase',
                description=f'Share purchase approved - {shares_assigned} shares',
                admin_user=request.user,
                payment=payment
            )
        
        # Send approval email
        send_payment_approval_email(payment)
        
        return Response({'message': 'Payment approved and user notified'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject_payment(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'rejected'
        payment.processed_by = request.user
        payment.admin_notes = request.data.get('notes', 'Payment rejected by admin')
        payment.save()
        
        # Send rejection email
        send_payment_rejection_email(payment)
        
        return Response({'message': 'Payment rejected and user notified'})

# Email Templates
def send_payment_approval_email(payment):
    subject = f"Payment Approved - {payment.get_payment_type_display()}"
    
    context = {
        'user': payment.user,
        'payment': payment,
        'amount': payment.amount,
        'payment_type': payment.get_payment_type_display(),
        'reference_id': payment.reference_id,
        'date': payment.updated_at.strftime('%B %d, %Y'),
    }
    
    if payment.payment_type == 'activation_fee':
        context['message'] = "Congratulations! Your membership has been activated."
        context['next_steps'] = "You can now access all member benefits and services."
    elif payment.payment_type == 'share_purchase':
        shares_assigned = payment.user.profile.shares_owned
        context['message'] = f"Your share purchase has been approved. You now own {shares_assigned} shares."
        context['share_value'] = shares_assigned * 100
    
    html_message = render_to_string('emails/payment_approved.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [payment.user.email],
        html_message=html_message,
        fail_silently=False,
    )

def send_payment_rejection_email(payment):
    subject = f"Payment Update - {payment.get_payment_type_display()}"
    
    context = {
        'user': payment.user,
        'payment': payment,
        'amount': payment.amount,
        'payment_type': payment.get_payment_type_display(),
        'reason': payment.admin_notes,
        'date': payment.updated_at.strftime('%B %d, %Y'),
    }
    
    html_message = render_to_string('emails/payment_rejected.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [payment.user.email],
        html_message=html_message,
        fail_silently=False,
    )

def send_share_deduction_email(user, shares_deducted, remaining_shares, reason):
    subject = "Share Deduction Notification"
    
    context = {
        'user': user,
        'shares_deducted': shares_deducted,
        'remaining_shares': remaining_shares,
        'current_value': remaining_shares * 100,
        'reason': reason,
        'date': timezone.now().strftime('%B %d, %Y'),
    }
    
    html_message = render_to_string('emails/share_deduction.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )

# Enhanced Share Deduction with Email
@action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
def deduct_shares_all(self, request):
    try:
        amount = float(request.data.get('amount', 0))
        reason = request.data.get('reason', 'Admin deduction')
        
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
        
        users_updated = 0
        for user in User.objects.filter(profile__shares_owned__gte=amount):
            old_shares = user.profile.shares_owned
            user.profile.shares_owned -= amount
            user.profile.save()
            
            # Create deduction record
            Payment.objects.create(
                user=user,
                payment_type='share_deduction',
                amount=-amount,
                payment_method='system',
                status='completed',
                description=f'Share deduction: {reason}',
                admin_notes=reason,
                processed_by=request.user
            )
            
            # Send email notification
            send_share_deduction_email(
                user, 
                amount, 
                user.profile.shares_owned, 
                reason
            )
            
            users_updated += 1
        
        return Response({
            'message': f'Deducted {amount} shares from {users_updated} users. Email notifications sent.',
            'users_updated': users_updated
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)