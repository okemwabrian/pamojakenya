# COMPLETE BACKEND ENDPOINTS FOR PAMOJA SYSTEM
# Both Local Development and PythonAnywhere Deployment

# ===== BASE URLS =====
# Local: http://127.0.0.1:8000/api
# PythonAnywhere: https://Okemwabrianny.pythonanywhere.com/api

# ===== AUTHENTICATION ENDPOINTS =====
AUTH_ENDPOINTS = {
    'POST /api/auth/login/': 'User login',
    'POST /api/auth/register/': 'User registration', 
    'POST /api/auth/logout/': 'User logout',
    'GET /api/auth/user/': 'Get current user profile',
    'PUT /api/auth/user/': 'Update user profile',
    'POST /api/auth/change-password/': 'Change user password',
    'GET /api/auth/dashboard/dashboard_stats/': 'Get dashboard statistics',
}

# ===== APPLICATIONS ENDPOINTS =====
APPLICATION_ENDPOINTS = {
    'GET /api/applications/': 'Get user applications',
    'POST /api/applications/': 'Create new application',
    'GET /api/applications/{id}/': 'Get specific application',
    'PUT /api/applications/{id}/': 'Update application',
    'DELETE /api/applications/{id}/': 'Delete application',
    'POST /api/applications/single/submit/': 'Submit single membership application',
    'POST /api/applications/double/submit/': 'Submit double membership application',
    'POST /api/applications/submit-payment/': 'Submit payment for application',
    'POST /api/applications/{id}/approve/': 'Approve application',
    'POST /api/applications/{id}/reject/': 'Reject application',
    'POST /api/applications/{id}/verify_payment/': 'Verify payment for application',
}

# ===== PAYMENTS ENDPOINTS =====
PAYMENT_ENDPOINTS = {
    'GET /api/payments/': 'Get user payments',
    'POST /api/payments/': 'Create new payment',
    'GET /api/payments/{id}/': 'Get specific payment',
    'PUT /api/payments/{id}/': 'Update payment',
    'POST /api/payments/activation/submit/': 'Submit activation fee payment',
    'GET /api/activation-payments/': 'Get activation payments',
}

# ===== SHARES ENDPOINTS =====
SHARES_ENDPOINTS = {
    'GET /api/shares/': 'Get user shares/share purchases',
    'POST /api/shares/': 'Create share purchase',
    'POST /api/shares/buy/': 'Buy shares',
    'GET /api/shares/{id}/': 'Get specific share purchase',
}

# ===== CLAIMS ENDPOINTS =====
CLAIMS_ENDPOINTS = {
    'GET /api/claims/': 'Get user claims',
    'POST /api/claims/': 'Create new claim',
    'GET /api/claims/{id}/': 'Get specific claim',
    'PUT /api/claims/{id}/': 'Update claim',
    'POST /api/claims/{id}/approve/': 'Approve claim',
    'POST /api/claims/{id}/reject/': 'Reject claim',
}

# ===== USER PROFILE ENDPOINTS =====
USER_ENDPOINTS = {
    'GET /api/users/me/': 'Get current user details',
    'PUT /api/users/me/': 'Update current user',
    'GET /api/user/dashboard/': 'Get user dashboard data (NEW - MISSING)',
}

# ===== DOCUMENTS ENDPOINTS =====
DOCUMENTS_ENDPOINTS = {
    'GET /api/documents/': 'Get user documents',
    'POST /api/documents/': 'Upload document',
    'GET /api/documents/{id}/': 'Get specific document',
    'DELETE /api/documents/{id}/': 'Delete document',
    'POST /api/documents/{id}/approve/': 'Approve document',
    'POST /api/documents/{id}/reject/': 'Reject document',
}

# ===== ANNOUNCEMENTS ENDPOINTS =====
ANNOUNCEMENTS_ENDPOINTS = {
    'GET /api/announcements/': 'Get announcements',
    'POST /api/announcements/': 'Create announcement',
    'GET /api/announcements/{id}/': 'Get specific announcement',
    'PUT /api/announcements/{id}/': 'Update announcement',
    'DELETE /api/announcements/{id}/': 'Delete announcement',
}

# ===== MEETINGS ENDPOINTS =====
MEETINGS_ENDPOINTS = {
    'GET /api/meetings/': 'Get meetings/events',
    'POST /api/meetings/': 'Create meeting',
    'GET /api/meetings/{id}/': 'Get specific meeting',
    'PUT /api/meetings/{id}/': 'Update meeting',
    'DELETE /api/meetings/{id}/': 'Delete meeting',
    'POST /api/meetings/{id}/register/': 'Register for meeting',
}

# ===== CONTACT ENDPOINTS =====
CONTACT_ENDPOINTS = {
    'GET /api/contact/': 'Get user messages',
    'POST /api/contact/': 'Send contact message',
    'GET /api/contact/{id}/': 'Get specific message',
}

# ===== BENEFICIARIES ENDPOINTS =====
BENEFICIARIES_ENDPOINTS = {
    'GET /api/beneficiaries/': 'Get user beneficiaries',
    'POST /api/beneficiaries/': 'Create beneficiary',
    'POST /api/beneficiaries/change-request/': 'Create beneficiary change request',
    'GET /api/beneficiaries/{id}/': 'Get specific beneficiary',
    'PUT /api/beneficiaries/{id}/': 'Update beneficiary',
    'DELETE /api/beneficiaries/{id}/': 'Delete beneficiary',
}

# ===== ADMIN ENDPOINTS =====
ADMIN_ENDPOINTS = {
    # Users Management
    'GET /api/admin/users/': 'Get all users',
    'GET /api/admin/users/{id}/': 'Get specific user',
    'PUT /api/admin/users/{id}/': 'Update user',
    'DELETE /api/admin/users/{id}/': 'Delete user',
    'POST /api/admin/users/{id}/toggle_membership/': 'Toggle user membership',
    'POST /api/admin/users/{id}/activate_user/': 'Activate user',
    'POST /api/admin/users/{id}/deactivate_user/': 'Deactivate user',
    'POST /api/admin/users/{id}/update_shares/': 'Update user shares',
    'POST /api/admin/users/{id}/reset_password/': 'Reset user password',
    'GET /api/admin/users/stats/': 'Get user statistics',
    'GET /api/admin/users/registered_users/': 'Get registered users',
    
    # Applications Management
    'GET /api/admin/applications/': 'Get all applications',
    'GET /api/admin/applications/{id}/': 'Get specific application',
    'GET /api/admin/applications/{id}/details/': 'Get application details',
    'PUT /api/admin/applications/{id}/': 'Update application',
    'GET /api/admin/applications/{id}/payment-proof/': 'View payment proof',
    
    # Claims Management
    'GET /api/admin/claims/': 'Get all claims',
    'GET /api/admin/claims/{id}/': 'Get specific claim',
    'PUT /api/admin/claims/{id}/': 'Update claim',
    'POST /api/admin/claims/{id}/approve/': 'Approve claim',
    'POST /api/admin/claims/{id}/reject/': 'Reject claim',
    
    # Payments Management
    'GET /api/admin/payments/': 'Get all payments',
    'GET /api/admin/payments/{id}/': 'Get specific payment',
    'PUT /api/admin/payments/{id}/': 'Update payment',
    'POST /api/admin/payments/{id}/mark_completed/': 'Mark payment completed',
    'POST /api/admin/payments/{id}/approve_payment/': 'Approve payment',
    'POST /api/admin/payments/{id}/reject_payment/': 'Reject payment',
    'GET /api/admin/payments/financial_report/': 'Get financial report',
    'GET /api/admin/payments/shares_report/': 'Get shares report',
    
    # Contact Management
    'GET /api/admin/contact/': 'Get all contact messages',
    'GET /api/admin/contact/{id}/': 'Get specific message',
    'POST /api/admin/contact/{id}/mark_read/': 'Mark message as read',
    'POST /api/admin/contact/{id}/reply/': 'Reply to message',
    'POST /api/admin/contact/{id}/mark_replied/': 'Mark message as replied',
    'POST /api/admin/contact/deduct_shares_all/': 'Deduct shares from all users',
    
    # Shares Management
    'GET /api/admin/shares/': 'Get all share purchases',
    'GET /api/admin/shares/{id}/': 'Get specific share purchase',
    'POST /api/admin/shares/{id}/approve/': 'Approve share purchase',
    'POST /api/admin/shares/{id}/reject/': 'Reject share purchase',
    
    # Documents Management
    'GET /api/admin/documents/': 'Get all documents',
    'GET /api/admin/documents/{id}/': 'Get specific document',
    
    # Meetings Management
    'GET /api/admin/meetings/': 'Get all meetings',
    'GET /api/admin/meetings/{id}/': 'Get specific meeting',
    'POST /api/admin/meetings/': 'Create meeting',
    'PUT /api/admin/meetings/{id}/': 'Update meeting',
    'DELETE /api/admin/meetings/{id}/': 'Delete meeting',
    'GET /api/admin/meetings/{id}/registrations/': 'Get meeting registrations',
}

# ===== MISSING ENDPOINTS (CAUSING FRONTEND ERRORS) =====
MISSING_ENDPOINTS = {
    'GET /api/user/dashboard/': 'User dashboard data - CRITICAL MISSING',
    'POST /api/claims/submit/': 'Submit claim - MISSING (frontend expects this)',
    'GET /api/claims/': 'Get user claims - MISSING (different from admin)',
}

# ===== DJANGO URLS.PY STRUCTURE =====
DJANGO_URLS_STRUCTURE = '''
# urls.py (main project)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/shares/', include('shares.urls')),
    path('api/claims/', include('claims.urls')),
    path('api/user/', include('users.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/announcements/', include('announcements.urls')),
    path('api/meetings/', include('meetings.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/beneficiaries/', include('beneficiaries.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/activation-payments/', include('activation_payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
'''

# ===== CRITICAL MISSING VIEWS =====
CRITICAL_MISSING_VIEWS = '''
# These views are MISSING and causing frontend errors:

# 1. User Dashboard View (users/views.py)
@csrf_exempt
def get_user_dashboard(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    # Get user profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Get all user data
    applications = MembershipApplication.objects.filter(user=request.user).order_by('-created_at')
    claims = Claim.objects.filter(user=request.user).order_by('-created_at')
    payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
    shares = SharePurchase.objects.filter(user=request.user).order_by('-created_at')
    
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
        },
        'applications': [serialize_application(app) for app in applications],
        'claims': [serialize_claim(claim) for claim in claims],
        'payments': [serialize_payment(payment) for payment in payments],
        'shares': [serialize_share(share) for share in shares],
    })

# 2. Claims Submit View (claims/views.py)
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

# 3. Get User Claims View (claims/views.py)
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
        'created_at': claim.created_at.isoformat(),
    } for claim in claims]
    
    return JsonResponse({'claims': claims_data})
'''

# ===== REQUIRED URL PATTERNS =====
REQUIRED_URL_PATTERNS = '''
# users/urls.py
urlpatterns = [
    path('dashboard/', views.get_user_dashboard, name='get_user_dashboard'),
    path('me/', views.get_current_user, name='get_current_user'),
]

# claims/urls.py  
urlpatterns = [
    path('', views.get_user_claims, name='get_user_claims'),
    path('submit/', views.submit_claim, name='submit_claim'),
    path('<int:claim_id>/', views.get_claim_detail, name='get_claim_detail'),
]

# payments/urls.py
urlpatterns = [
    path('', views.get_user_payments, name='get_user_payments'),
    path('activation/submit/', views.submit_activation_payment, name='submit_activation_payment'),
]
'''

print("COMPLETE BACKEND ENDPOINTS LIST CREATED")
print("=" * 50)
print("CRITICAL MISSING ENDPOINTS:")
for endpoint, description in MISSING_ENDPOINTS.items():
    print(f"  {endpoint} - {description}")
print("\nTotal Endpoints Required:", len(AUTH_ENDPOINTS) + len(APPLICATION_ENDPOINTS) + 
      len(PAYMENT_ENDPOINTS) + len(SHARES_ENDPOINTS) + len(CLAIMS_ENDPOINTS) + 
      len(USER_ENDPOINTS) + len(DOCUMENTS_ENDPOINTS) + len(ANNOUNCEMENTS_ENDPOINTS) + 
      len(MEETINGS_ENDPOINTS) + len(CONTACT_ENDPOINTS) + len(BENEFICIARIES_ENDPOINTS) + 
      len(ADMIN_ENDPOINTS))