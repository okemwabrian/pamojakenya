# COMPLETE BACKEND SYSTEM FOR PAMOJA

# Tell your backend developer to implement ALL of this:

# ===== MODELS.PY - Complete database models =====
MODELS = '''
from django.db import models
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings

class UserProfile(models.Model):
    MEMBERSHIP_TYPES = [
        ('none', 'No Membership'),
        ('single', 'Single Family'),
        ('double', 'Double Family'),
    ]
    
    STATUS_CHOICES = [
        ('inactive', 'Inactive'),
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_TYPES, default='none')
    membership_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    shares_owned = models.IntegerField(default=0)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    activation_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.membership_status}"

class MembershipApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    MEMBERSHIP_TYPES = [
        ('single', 'Single Family'),
        ('double', 'Double Family'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_TYPES)
    
    # Personal Info
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Address
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    
    # Family Info (for double membership)
    spouse_name = models.CharField(max_length=100, blank=True)
    spouse_phone = models.CharField(max_length=20, blank=True)
    spouse_cell_phone = models.CharField(max_length=20, blank=True)  # NEW FIELD
    
    # Step family (for double membership)
    step_parent_1 = models.CharField(max_length=100, blank=True)
    step_parent_2 = models.CharField(max_length=100, blank=True)
    step_sibling_1 = models.CharField(max_length=100, blank=True)
    step_sibling_2 = models.CharField(max_length=100, blank=True)
    step_sibling_3 = models.CharField(max_length=100, blank=True)
    
    # Documents
    id_document = models.FileField(upload_to='applications/')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Send email notification
            self.send_application_email()
    
    def send_application_email(self):
        subject = f'Membership Application Received - {self.membership_type.title()}'
        message = f'''
        Dear {self.first_name},
        
        Your {self.membership_type} family membership application has been received.
        Application ID: {self.id}
        
        Next steps:
        1. Pay application fee
        2. Wait for admin approval
        3. Receive activation confirmation
        
        Thank you for applying to Pamoja!
        '''
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [self.email])

class MembershipPayment(models.Model):
    PAYMENT_TYPES = [
        ('application_fee', 'Application Fee'),
        ('activation_fee', 'Activation Fee'),
        ('annual_fee', 'Annual Fee'),
    ]
    
    PAYMENT_METHODS = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    application = models.ForeignKey(MembershipApplication, on_delete=models.CASCADE, null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100)
    evidence_file = models.FileField(upload_to='payments/')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Claim(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processing', 'Processing'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)
    supporting_documents = models.FileField(upload_to='claims/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True)
    amount_approved = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SharePurchase(models.Model):
    PAYMENT_METHODS = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='share_purchases')
    shares_requested = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
'''

# ===== VIEWS.PY - Complete API views =====
VIEWS = '''
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import UserProfile, MembershipApplication, MembershipPayment, Claim, SharePurchase
import json

# USER PROFILE WITH MEMBERSHIP STATUS
@csrf_exempt
def auth_user(request):
    if request.user.is_authenticated:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'membership_type': profile.membership_type,
            'membership_status': profile.membership_status,  # Shows active/inactive
            'shares_owned': profile.shares_owned,
            'phone': profile.phone,
        })
    else:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

# MEMBERSHIP APPLICATION SUBMISSION
@csrf_exempt
@require_http_methods(["POST"])
def submit_membership_application(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Create application
        application = MembershipApplication.objects.create(
            user=request.user,
            membership_type=request.POST.get('membership_type'),
            first_name=request.POST.get('first_name'),
            last_name=request.POST.get('last_name'),
            email=request.POST.get('email'),
            phone=request.POST.get('phone'),
            address=request.POST.get('address'),
            city=request.POST.get('city'),
            state=request.POST.get('state'),
            zip_code=request.POST.get('zip_code'),
            spouse_name=request.POST.get('spouse_name', ''),
            spouse_phone=request.POST.get('spouse_phone', ''),
            spouse_cell_phone=request.POST.get('spouse_cell_phone', ''),
            step_parent_1=request.POST.get('step_parent_1', ''),
            step_parent_2=request.POST.get('step_parent_2', ''),
            step_sibling_1=request.POST.get('step_sibling_1', ''),
            step_sibling_2=request.POST.get('step_sibling_2', ''),
            step_sibling_3=request.POST.get('step_sibling_3', ''),
            id_document=request.FILES.get('id_document'),
        )
        
        # Update user profile
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.membership_type = application.membership_type
        profile.membership_status = 'pending'
        profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Application submitted successfully! Check your email for next steps.',
            'application_id': application.id,
            'redirect_to_payment': True,
            'payment_amount': 50.00 if application.membership_type == 'single' else 100.00
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# PAYMENT SUBMISSION
@csrf_exempt
@require_http_methods(["POST"])
def submit_payment(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        payment = MembershipPayment.objects.create(
            user=request.user,
            payment_type=request.POST.get('payment_type'),
            payment_method=request.POST.get('payment_method'),
            amount=request.POST.get('amount'),
            transaction_id=request.POST.get('transaction_id'),
            evidence_file=request.FILES.get('evidence_file'),
            notes=request.POST.get('notes', ''),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Payment submitted successfully! Admin will verify within 24-48 hours.',
            'payment_id': payment.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# CLAIMS SUBMISSION
@csrf_exempt
@require_http_methods(["POST"])
def submit_claim(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        claim = Claim.objects.create(
            user=request.user,
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            amount_requested=request.POST.get('amount_requested'),
            supporting_documents=request.FILES.get('supporting_documents'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Claim submitted successfully!',
            'claim_id': claim.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# GET USER'S CLAIMS
@csrf_exempt
def get_user_claims(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    claims = Claim.objects.filter(user=request.user).order_by('-created_at')
    claims_data = [{
        'id': claim.id,
        'title': claim.title,
        'description': claim.description,
        'amount_requested': str(claim.amount_requested),
        'status': claim.status,
        'admin_response': claim.admin_response,
        'amount_approved': str(claim.amount_approved) if claim.amount_approved else None,
        'created_at': claim.created_at.isoformat(),
    } for claim in claims]
    
    return JsonResponse({'claims': claims_data})

# SHARES PURCHASE
@csrf_exempt
@require_http_methods(["POST"])
def buy_shares(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        data = json.loads(request.body)
        
        share_purchase = SharePurchase.objects.create(
            user=request.user,
            shares_requested=data.get('shares_requested'),
            amount=data.get('amount'),
            payment_method=data.get('payment_method'),
            notes=data.get('notes', ''),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Share purchase request submitted successfully!',
            'purchase_id': share_purchase.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# GET USER'S SHARE PURCHASES
@csrf_exempt
def get_user_shares(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    purchases = SharePurchase.objects.filter(user=request.user).order_by('-created_at')
    purchases_data = [{
        'id': purchase.id,
        'shares_requested': purchase.shares_requested,
        'amount': str(purchase.amount),
        'payment_method': purchase.payment_method,
        'status': purchase.status,
        'admin_notes': purchase.admin_notes,
        'created_at': purchase.created_at.isoformat(),
    } for purchase in purchases]
    
    return JsonResponse({'purchases': purchases_data})
'''

# ===== URLS.PY - Complete URL patterns =====
URLS = '''
from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('api/auth/user/', views.auth_user, name='auth_user'),
    
    # Membership Applications
    path('api/applications/submit/', views.submit_membership_application, name='submit_application'),
    
    # Payments
    path('api/payments/submit/', views.submit_payment, name='submit_payment'),
    
    # Claims
    path('api/claims/submit/', views.submit_claim, name='submit_claim'),
    path('api/claims/', views.get_user_claims, name='get_user_claims'),
    
    # Shares
    path('api/shares/buy/', views.buy_shares, name='buy_shares'),
    path('api/shares/', views.get_user_shares, name='get_user_shares'),
]
'''

print("COMPLETE BACKEND SYSTEM READY!")
print("Tell your backend developer to:")
print("1. Add MODELS to models.py")
print("2. Add VIEWS to views.py")
print("3. Add URLS to urls.py")
print("4. Run: python manage.py makemigrations")
print("5. Run: python manage.py migrate")
print("6. Configure email settings in settings.py")
print("7. Reload PythonAnywhere web app")
print("")
print("This will provide:")
print("✅ Active/Inactive membership status")
print("✅ Complete membership application flow")
print("✅ Email notifications")
print("✅ Payment tracking")
print("✅ Claims system with admin responses")
print("✅ Shares purchase system")
print("✅ Full frontend-backend communication")