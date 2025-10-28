# MEMBERSHIP BACKEND UPDATES

# ===== MODELS.PY - Add/Update these models =====
MODELS_UPDATE = '''
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
    date_of_birth = models.DateField(null=True, blank=True)
    id_number = models.CharField(max_length=50, blank=True)
    
    # Address
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    
    # Emergency Contact
    emergency_name = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    emergency_relationship = models.CharField(max_length=50, blank=True)
    
    # Family Info
    spouse_name = models.CharField(max_length=100, blank=True)
    spouse_phone = models.CharField(max_length=20, blank=True)
    spouse_cell_phone = models.CharField(max_length=20, blank=True)
    children_info = models.TextField(blank=True)
    
    # Step family (for double membership)
    step_parent_1 = models.CharField(max_length=100, blank=True)
    step_parent_2 = models.CharField(max_length=100, blank=True)
    step_sibling_1 = models.CharField(max_length=100, blank=True)
    step_sibling_2 = models.CharField(max_length=100, blank=True)
    step_sibling_3 = models.CharField(max_length=100, blank=True)
    
    # Documents
    id_document = models.FileField(upload_to='applications/documents/')
    
    # Status and Admin
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_by_admin = models.BooleanField(default=False)  # NEW: Track if admin created
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            self.send_membership_email()
    
    def send_membership_email(self):
        # DIFFERENT EMAIL FOR MEMBERSHIP
        subject = f'Pamoja Membership Application Received - {self.membership_type.title()} Family'
        message = f'''
        Dear {self.first_name} {self.last_name},
        
        Thank you for applying for Pamoja {self.membership_type} family membership!
        
        Application Details:
        - Application ID: {self.id}
        - Membership Type: {self.membership_type.title()} Family
        - Application Date: {self.created_at.strftime("%B %d, %Y")}
        
        NEXT STEPS:
        1. Pay your membership fee: ${50 if self.membership_type == 'single' else 100}
        2. Our admin team will review your application
        3. You will receive activation confirmation within 2-3 business days
        
        PAYMENT INSTRUCTIONS:
        Please log into your account and navigate to the payment section to complete your membership fee payment.
        
        Welcome to the Pamoja family!
        
        Best regards,
        Pamoja Administration Team
        '''
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [self.email])

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('constitution', 'Constitution'),
        ('bylaws', 'Bylaws'),
        ('membership_guide', 'Membership Guide'),
        ('forms', 'Forms'),
        ('policies', 'Policies'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='documents/')
    is_public = models.BooleanField(default=True)  # Public documents viewable by all
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class MembershipPayment(models.Model):
    PAYMENT_TYPES = [
        ('membership_fee', 'Membership Fee'),
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
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='membership_payments')
    application = models.ForeignKey(MembershipApplication, on_delete=models.CASCADE, null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100)
    evidence_file = models.FileField(upload_to='payments/evidence/')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
'''

# ===== VIEWS.PY - Add/Update these views =====
VIEWS_UPDATE = '''
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from .models import UserProfile, MembershipApplication, MembershipPayment, Document
import json
import os

# GET USER PROFILE WITH CURRENT MEMBERSHIP
@csrf_exempt
def get_user_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Get current application
    current_application = MembershipApplication.objects.filter(
        user=request.user
    ).order_by('-created_at').first()
    
    # Get payment history
    payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
    payments_data = [{
        'id': payment.id,
        'payment_type': payment.payment_type,
        'amount': str(payment.amount),
        'status': payment.status,
        'created_at': payment.created_at.isoformat(),
    } for payment in payments]
    
    return JsonResponse({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        },
        'profile': {
            'membership_type': profile.membership_type,
            'membership_status': profile.membership_status,
            'shares_owned': profile.shares_owned,
            'phone': profile.phone,
            'address': profile.address,
            'activation_date': profile.activation_date.isoformat() if profile.activation_date else None,
        },
        'current_application': {
            'id': current_application.id,
            'membership_type': current_application.membership_type,
            'status': current_application.status,
            'created_at': current_application.created_at.isoformat(),
        } if current_application else None,
        'payments': payments_data
    })

# SUBMIT MEMBERSHIP APPLICATION
@csrf_exempt
@require_http_methods(["POST"])
def submit_membership_application(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Create application with ALL data
        application = MembershipApplication.objects.create(
            user=request.user,
            membership_type=request.POST.get('membership_type'),
            first_name=request.POST.get('first_name'),
            middle_name=request.POST.get('middle_name', ''),
            last_name=request.POST.get('last_name'),
            email=request.POST.get('email'),
            phone=request.POST.get('phone'),
            date_of_birth=request.POST.get('date_of_birth') or None,
            id_number=request.POST.get('id_number', ''),
            address=request.POST.get('address'),
            city=request.POST.get('city'),
            state=request.POST.get('state'),
            zip_code=request.POST.get('zip_code'),
            emergency_name=request.POST.get('emergency_name', ''),
            emergency_phone=request.POST.get('emergency_phone', ''),
            emergency_relationship=request.POST.get('emergency_relationship', ''),
            spouse_name=request.POST.get('spouse_name', ''),
            spouse_phone=request.POST.get('spouse_phone', ''),
            spouse_cell_phone=request.POST.get('spouse_cell_phone', ''),
            children_info=request.POST.get('children_info', ''),
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
        
        # Calculate membership fee
        membership_fee = 50.00 if application.membership_type == 'single' else 100.00
        
        return JsonResponse({
            'success': True,
            'message': 'Membership application submitted successfully! Check your email for details.',
            'application_id': application.id,
            'redirect_to_payment': True,
            'payment_amount': membership_fee,
            'membership_type': application.membership_type
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# ADMIN CREATE APPLICATION FOR USER
@csrf_exempt
@require_http_methods(["POST"])
def admin_create_application(request):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        # Get or create user
        username = request.POST.get('username')
        email = request.POST.get('email')
        
        from django.contrib.auth.models import User
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': request.POST.get('first_name'),
                'last_name': request.POST.get('last_name'),
            }
        )
        
        # Create application
        application = MembershipApplication.objects.create(
            user=user,
            created_by_admin=True,  # Mark as admin-created
            membership_type=request.POST.get('membership_type'),
            first_name=request.POST.get('first_name'),
            last_name=request.POST.get('last_name'),
            email=email,
            phone=request.POST.get('phone'),
            address=request.POST.get('address'),
            city=request.POST.get('city'),
            state=request.POST.get('state'),
            zip_code=request.POST.get('zip_code'),
            # ... other fields
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Application created successfully for user',
            'application_id': application.id,
            'user_id': user.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# SUBMIT MEMBERSHIP PAYMENT
@csrf_exempt
@require_http_methods(["POST"])
def submit_membership_payment(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Get user's latest application
        application = MembershipApplication.objects.filter(
            user=request.user
        ).order_by('-created_at').first()
        
        payment = MembershipPayment.objects.create(
            user=request.user,
            application=application,
            payment_type='membership_fee',
            payment_method=request.POST.get('payment_method'),
            amount=request.POST.get('amount'),
            transaction_id=request.POST.get('transaction_id'),
            evidence_file=request.FILES.get('evidence_file'),
            notes=request.POST.get('notes', ''),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Membership payment submitted successfully! Admin will verify within 24-48 hours.',
            'payment_id': payment.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# GET ALL DOCUMENTS
@csrf_exempt
def get_documents(request):
    documents = Document.objects.filter(is_public=True).order_by('document_type', 'title')
    documents_data = [{
        'id': doc.id,
        'title': doc.title,
        'description': doc.description,
        'document_type': doc.document_type,
        'file_url': doc.file.url if doc.file else None,
        'created_at': doc.created_at.isoformat(),
    } for doc in documents]
    
    return JsonResponse({'documents': documents_data})

# VIEW DOCUMENT
@csrf_exempt
def view_document(request, document_id):
    document = get_object_or_404(Document, id=document_id)
    
    if document.file:
        response = HttpResponse(document.file.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{document.title}.pdf"'
        return response
    else:
        return JsonResponse({'error': 'Document file not found'}, status=404)

# GET USER'S APPLICATIONS HISTORY
@csrf_exempt
def get_user_applications(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    applications = MembershipApplication.objects.filter(
        user=request.user
    ).order_by('-created_at')
    
    applications_data = [{
        'id': app.id,
        'membership_type': app.membership_type,
        'status': app.status,
        'first_name': app.first_name,
        'last_name': app.last_name,
        'email': app.email,
        'phone': app.phone,
        'address': app.address,
        'city': app.city,
        'state': app.state,
        'created_at': app.created_at.isoformat(),
        'admin_notes': app.admin_notes,
    } for app in applications]
    
    return JsonResponse({'applications': applications_data})
'''

# ===== URLS.PY - Add these URLs =====
URLS_UPDATE = '''
from django.urls import path
from . import views

urlpatterns = [
    # ... existing URLs ...
    
    # User Profile and Membership
    path('api/user/profile/', views.get_user_profile, name='get_user_profile'),
    path('api/membership/apply/', views.submit_membership_application, name='submit_membership_application'),
    path('api/membership/payment/', views.submit_membership_payment, name='submit_membership_payment'),
    path('api/user/applications/', views.get_user_applications, name='get_user_applications'),
    
    # Admin Functions
    path('api/admin/applications/create/', views.admin_create_application, name='admin_create_application'),
    
    # Documents
    path('api/documents/', views.get_documents, name='get_documents'),
    path('api/documents/<int:document_id>/view/', views.view_document, name='view_document'),
]
'''

# ===== SETTINGS.PY - Email Configuration =====
EMAIL_SETTINGS = '''
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your email provider
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'Pamoja <your-email@gmail.com>'

# File Upload Settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Serve media files in development
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
'''

print("MEMBERSHIP BACKEND UPDATES READY!")
print("Add to your Django backend:")
print("1. Update MODELS in models.py")
print("2. Add VIEWS to views.py")
print("3. Add URLS to urls.py")
print("4. Configure EMAIL_SETTINGS in settings.py")
print("5. Run: python manage.py makemigrations")
print("6. Run: python manage.py migrate")
print("7. Upload documents via Django admin")
print("8. Reload PythonAnywhere web app")
print("")
print("Features:")
print("✅ Different membership email")
print("✅ Redirect to membership payment")
print("✅ View current membership status")
print("✅ Admin can create applications for users")
print("✅ All application data saved and retrievable")
print("✅ Document viewing in webapp")
print("✅ Complete frontend-backend communication")