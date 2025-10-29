# COMPLETE BACKEND ENHANCEMENTS FOR PAMOJA SYSTEM

# ===== 1. APPLICATION SUBMISSION ENHANCEMENTS =====
APPLICATION_ENHANCEMENTS = '''
# applications/views.py - Enhanced application submission

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import json

@csrf_exempt
@require_http_methods(["POST"])
def submit_application(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Create application with ALL form data
        application = MembershipApplication.objects.create(
            user=request.user,
            membership_type=request.POST.get('membership_type'),
            
            # Personal Information
            full_name=request.POST.get('first_name', '') + ' ' + request.POST.get('last_name', ''),
            national_id=request.POST.get('id_number'),
            date_of_birth=request.POST.get('date_of_birth'),
            gender=request.POST.get('gender'),
            occupation=request.POST.get('occupation'),
            
            # Contact Information
            email=request.POST.get('email'),
            phone=request.POST.get('phone'),
            address=f"{request.POST.get('address', '')}, {request.POST.get('city', '')}, {request.POST.get('state', '')} {request.POST.get('zip_code', '')}",
            
            # Emergency Contact
            emergency_contact_name=request.POST.get('emergency_name'),
            emergency_contact_phone=request.POST.get('emergency_phone'),
            emergency_contact_relationship=request.POST.get('emergency_relationship'),
            
            # For Double Membership
            spouse_full_name=request.POST.get('spouse_first_name', '') + ' ' + request.POST.get('spouse_last_name', ''),
            spouse_national_id=request.POST.get('spouse_id_number'),
            spouse_date_of_birth=request.POST.get('spouse_date_of_birth'),
            spouse_gender=request.POST.get('spouse_gender'),
            spouse_occupation=request.POST.get('spouse_occupation'),
            spouse_phone=request.POST.get('spouse_phone'),
            
            # JSON fields for children and step family
            children_info=json.loads(request.POST.get('children_info', '[]')),
            step_parents_info=json.loads(request.POST.get('step_parents_info', '[]')),
            step_siblings_info=json.loads(request.POST.get('step_siblings_info', '[]')),
            
            # Documents
            id_document=request.FILES.get('id_document'),
            spouse_id_document=request.FILES.get('spouse_id_document'),
        )
        
        # Send application confirmation email
        send_application_email(application)
        
        return JsonResponse({
            'success': True,
            'message': 'Application submitted successfully! Check your email for confirmation.',
            'application_id': application.id,
            'redirect_to': '/dashboard'  # Frontend should redirect to dashboard
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def send_application_email(application):
    """Send application confirmation email"""
    try:
        subject = f'Pamoja Membership Application Received - {application.membership_type.title()}'
        
        context = {
            'user_name': application.full_name,
            'application_type': application.membership_type.title(),
            'application_id': application.id,
            'submission_date': application.created_at.strftime('%B %d, %Y'),
        }
        
        # HTML email template
        html_message = f"""
        <h2>Application Received Successfully!</h2>
        <p>Dear {context['user_name']},</p>
        
        <p>Thank you for submitting your <strong>{context['application_type']} Membership</strong> application to Pamoja.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Application Details:</h3>
            <ul>
                <li><strong>Application ID:</strong> #{context['application_id']}</li>
                <li><strong>Type:</strong> {context['application_type']}</li>
                <li><strong>Submitted:</strong> {context['submission_date']}</li>
                <li><strong>Status:</strong> Pending Review</li>
            </ul>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Our admin team will review your application</li>
            <li>You will receive an email notification once reviewed</li>
            <li>If approved, you can proceed with membership payments</li>
        </ol>
        
        <p>You can track your application status in your dashboard.</p>
        
        <p>Best regards,<br>Pamoja Team</p>
        """
        
        send_mail(
            subject=subject,
            message=f"Application received for {context['application_type']} membership. Application ID: #{context['application_id']}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            html_message=html_message,
            fail_silently=False,
        )
        
    except Exception as e:
        print(f"Email sending failed: {e}")
'''

# ===== 2. USER DASHBOARD ENHANCEMENTS =====
DASHBOARD_ENHANCEMENTS = '''
# users/views.py - Enhanced dashboard with complete user data

@csrf_exempt
def get_user_dashboard(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    # Get or create user profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Get all user data with detailed information
    applications = MembershipApplication.objects.filter(user=request.user).order_by('-created_at')
    claims = Claim.objects.filter(user=request.user).order_by('-created_at')
    payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
    shares = SharePurchase.objects.filter(user=request.user).order_by('-created_at')
    
    # Calculate current shares (purchases - deductions)
    total_shares_purchased = sum(share.shares_requested for share in shares if share.status == 'approved')
    share_deductions = ShareDeduction.objects.filter(user=request.user).aggregate(
        total_deducted=models.Sum('shares_deducted')
    )['total_deducted'] or 0
    current_shares = total_shares_purchased - share_deductions
    
    return JsonResponse({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'date_joined': request.user.date_joined.isoformat(),
        },
        'profile': {
            'membership_type': profile.membership_type,
            'membership_status': profile.membership_status,
            'shares_owned': current_shares,
            'phone': profile.phone,
        },
        'applications': [{
            'id': app.id,
            'membership_type': app.membership_type,
            'status': app.status,
            'full_name': app.full_name,
            'email': app.email,
            'phone': app.phone,
            'created_at': app.created_at.isoformat(),
            'admin_notes': app.admin_notes,
            'can_edit': app.status == 'pending',  # Only pending applications can be edited
        } for app in applications],
        'claims': [{
            'id': claim.id,
            'title': claim.title,
            'status': claim.status,
            'amount_requested': str(claim.amount_requested),
            'amount_approved': str(claim.amount_approved) if claim.amount_approved else None,
            'created_at': claim.created_at.isoformat(),
            'admin_response': claim.admin_response,
        } for claim in claims],
        'payments': [{
            'id': payment.id,
            'payment_type': payment.payment_type,
            'amount': str(payment.amount),
            'payment_method': payment.payment_method,
            'status': payment.status,
            'created_at': payment.created_at.isoformat(),
            'admin_notes': payment.admin_notes,
            'can_print_receipt': payment.status == 'approved',
        } for payment in payments],
        'shares': [{
            'id': share.id,
            'shares_requested': share.shares_requested,
            'amount': str(share.amount),
            'status': share.status,
            'created_at': share.created_at.isoformat(),
        } for share in shares],
        'share_deductions': [{
            'id': deduction.id,
            'shares_deducted': deduction.shares_deducted,
            'reason': deduction.reason,
            'deducted_by': deduction.deducted_by.username,
            'created_at': deduction.created_at.isoformat(),
        } for deduction in ShareDeduction.objects.filter(user=request.user)],
        'stats': {
            'total_applications': applications.count(),
            'approved_applications': applications.filter(status='approved').count(),
            'total_claims': claims.count(),
            'approved_claims': claims.filter(status='approved').count(),
            'total_payments': payments.count(),
            'total_paid': sum(float(p.amount) for p in payments if p.status == 'approved'),
            'current_shares': current_shares,
            'total_shares_purchased': total_shares_purchased,
            'total_shares_deducted': share_deductions,
        }
    })
'''

# ===== 3. APPLICATION EDITING FUNCTIONALITY =====
APPLICATION_EDIT = '''
# applications/views.py - Application editing

@csrf_exempt
@require_http_methods(["PUT"])
def update_application(request, application_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        application = MembershipApplication.objects.get(id=application_id, user=request.user)
        
        # Only allow editing if status is pending
        if application.status != 'pending':
            return JsonResponse({'error': 'Cannot edit approved/rejected applications'}, status=400)
        
        # Update application fields
        data = json.loads(request.body)
        
        for field, value in data.items():
            if hasattr(application, field):
                setattr(application, field, value)
        
        application.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Application updated successfully!'
        })
        
    except MembershipApplication.DoesNotExist:
        return JsonResponse({'error': 'Application not found'}, status=404)
'''

# ===== 4. SHARE DEDUCTION MODEL =====
SHARE_DEDUCTION_MODEL = '''
# Add to models.py

class ShareDeduction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='share_deductions')
    shares_deducted = models.IntegerField()
    reason = models.TextField()
    deducted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deductions_made')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.shares_deducted} shares deducted"
'''

# ===== 5. RECEIPT PRINTING FUNCTIONALITY =====
RECEIPT_PRINTING = '''
# payments/views.py - Receipt generation

from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

@csrf_exempt
def print_payment_receipt(request, payment_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        payment = MembershipPayment.objects.get(id=payment_id, user=request.user)
        
        if payment.status != 'approved':
            return JsonResponse({'error': 'Receipt only available for approved payments'}, status=400)
        
        # Create PDF receipt
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        # Receipt content
        p.drawString(100, 750, "PAMOJA MEMBERSHIP RECEIPT")
        p.drawString(100, 720, f"Receipt #: {payment.id}")
        p.drawString(100, 700, f"Date: {payment.created_at.strftime('%B %d, %Y')}")
        p.drawString(100, 680, f"Member: {request.user.get_full_name() or request.user.username}")
        p.drawString(100, 660, f"Payment Type: {payment.get_payment_type_display()}")
        p.drawString(100, 640, f"Amount: ${payment.amount}")
        p.drawString(100, 620, f"Method: {payment.payment_method}")
        p.drawString(100, 600, f"Status: {payment.status.upper()}")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{payment.id}.pdf"'
        
        return response
        
    except MembershipPayment.DoesNotExist:
        return JsonResponse({'error': 'Payment not found'}, status=404)
'''

# ===== 6. ADMIN PRINTING FUNCTIONALITY =====
ADMIN_PRINTING = '''
# admin_panel/views.py - Admin printing capabilities

@csrf_exempt
def print_all_applications(request):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    applications = MembershipApplication.objects.all().order_by('-created_at')
    
    # Generate PDF report
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    y_position = 750
    p.drawString(100, y_position, "PAMOJA MEMBERSHIP APPLICATIONS REPORT")
    y_position -= 30
    
    for app in applications:
        if y_position < 100:  # New page if needed
            p.showPage()
            y_position = 750
        
        p.drawString(100, y_position, f"ID: {app.id} | {app.full_name} | {app.membership_type} | {app.status}")
        y_position -= 20
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="all_applications.pdf"'
    
    return response

@csrf_exempt
def print_financial_report(request):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    payments = MembershipPayment.objects.filter(status='approved').order_by('-created_at')
    total_revenue = sum(float(p.amount) for p in payments)
    
    # Generate financial PDF report
    # ... similar PDF generation logic
    
    return response
'''

# ===== 7. URL PATTERNS UPDATES =====
URL_UPDATES = '''
# applications/urls.py
urlpatterns = [
    path('', views.get_applications, name='get_applications'),
    path('submit/', views.submit_application, name='submit_application'),
    path('<int:application_id>/', views.get_application_details, name='get_application_details'),
    path('<int:application_id>/edit/', views.update_application, name='update_application'),
]

# payments/urls.py
urlpatterns = [
    path('', views.get_user_payments, name='get_user_payments'),
    path('create/', views.create_payment, name='create_payment'),
    path('<int:payment_id>/receipt/', views.print_payment_receipt, name='print_receipt'),
]

# admin_panel/urls.py
urlpatterns = [
    # ... existing admin URLs ...
    path('reports/applications/', views.print_all_applications, name='print_all_applications'),
    path('reports/financial/', views.print_financial_report, name='print_financial_report'),
]
'''

# ===== 8. EMAIL SETTINGS =====
EMAIL_SETTINGS = '''
# settings.py - Add email configuration

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your email provider
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'Pamoja Team <your-email@gmail.com>'
'''

print("COMPLETE BACKEND ENHANCEMENTS CREATED")
print("=" * 50)
print("KEY FEATURES ADDED:")
print("1. Application submission with email confirmation")
print("2. Dashboard redirect after application")
print("3. Complete application details storage")
print("4. Application editing (pending only)")
print("5. Share deduction tracking")
print("6. Receipt printing (PDF)")
print("7. Admin reporting and printing")
print("8. Email notifications")
print("9. Current shares calculation")
print("10. Enhanced dashboard with all user data")