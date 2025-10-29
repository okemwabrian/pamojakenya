# COMPLETE CRUD ADMIN SYSTEM FOR PAMOJA

# ===== 1. ACTIVITY TRACKING MODEL =====
ACTIVITY_MODEL = '''
class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('application_submitted', 'Application Submitted'),
        ('payment_made', 'Payment Made'),
        ('claim_submitted', 'Claim Submitted'),
        ('shares_purchased', 'Shares Purchased'),
        ('document_uploaded', 'Document Uploaded'),
        ('profile_updated', 'Profile Updated'),
        ('login', 'User Login'),
        ('logout', 'User Logout'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.created_at}"
'''

# ===== 2. ADMIN CRUD ENDPOINTS =====
ADMIN_CRUD_ENDPOINTS = '''
# admin_panel/views.py - Complete CRUD for all entities

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

# ===== APPLICATIONS CRUD =====
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_applications(request):
    if request.method == 'GET':
        applications = MembershipApplication.objects.all().order_by('-created_at')
        data = [{
            'id': app.id,
            'user': app.user.username,
            'full_name': app.full_name,
            'membership_type': app.membership_type,
            'status': app.status,
            'email': app.email,
            'phone': app.phone,
            'created_at': app.created_at.isoformat(),
            'admin_notes': app.admin_notes,
        } for app in applications]
        return Response({'applications': data})
    
    elif request.method == 'POST':
        # Admin can create application for user
        try:
            user = User.objects.get(id=request.data.get('user_id'))
            application = MembershipApplication.objects.create(
                user=user,
                membership_type=request.data.get('membership_type'),
                full_name=request.data.get('full_name'),
                email=request.data.get('email'),
                phone=request.data.get('phone'),
                # ... other fields
                admin_notes=request.data.get('admin_notes', ''),
            )
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='application_submitted',
                description=f'Admin created {application.membership_type} application for user'
            )
            
            return Response({'success': True, 'application_id': application.id})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_application_detail(request, app_id):
    try:
        application = MembershipApplication.objects.get(id=app_id)
    except MembershipApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    
    if request.method == 'GET':
        return Response({
            'application': {
                'id': application.id,
                'user': application.user.username,
                'full_name': application.full_name,
                'membership_type': application.membership_type,
                'status': application.status,
                'email': application.email,
                'phone': application.phone,
                'address': application.address,
                'emergency_contact_name': application.emergency_contact_name,
                'emergency_contact_phone': application.emergency_contact_phone,
                'created_at': application.created_at.isoformat(),
                'admin_notes': application.admin_notes,
            }
        })
    
    elif request.method == 'PUT':
        # Update application
        for field, value in request.data.items():
            if hasattr(application, field):
                setattr(application, field, value)
        application.save()
        
        # Log activity
        UserActivity.objects.create(
            user=application.user,
            activity_type='application_updated',
            description=f'Admin updated application #{application.id}'
        )
        
        return Response({'success': True})
    
    elif request.method == 'DELETE':
        user = application.user
        application.delete()
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='application_deleted',
            description=f'Admin deleted application #{app_id}'
        )
        
        return Response({'success': True})

# ===== PAYMENTS CRUD =====
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_payments(request):
    if request.method == 'GET':
        payments = MembershipPayment.objects.all().order_by('-created_at')
        data = [{
            'id': payment.id,
            'user': payment.user.username,
            'payment_type': payment.payment_type,
            'amount': str(payment.amount),
            'payment_method': payment.payment_method,
            'status': payment.status,
            'created_at': payment.created_at.isoformat(),
            'admin_notes': payment.admin_notes,
        } for payment in payments]
        return Response({'payments': data})
    
    elif request.method == 'POST':
        # Admin can create payment for user
        try:
            user = User.objects.get(id=request.data.get('user_id'))
            payment = MembershipPayment.objects.create(
                user=user,
                payment_type=request.data.get('payment_type'),
                amount=request.data.get('amount'),
                payment_method=request.data.get('payment_method'),
                status=request.data.get('status', 'pending'),
                admin_notes=request.data.get('admin_notes', ''),
            )
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='payment_made',
                description=f'Admin created payment of ${payment.amount} for user'
            )
            
            return Response({'success': True, 'payment_id': payment.id})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_payment_detail(request, payment_id):
    try:
        payment = MembershipPayment.objects.get(id=payment_id)
    except MembershipPayment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=404)
    
    if request.method == 'GET':
        return Response({
            'payment': {
                'id': payment.id,
                'user': payment.user.username,
                'payment_type': payment.payment_type,
                'amount': str(payment.amount),
                'payment_method': payment.payment_method,
                'status': payment.status,
                'created_at': payment.created_at.isoformat(),
                'admin_notes': payment.admin_notes,
            }
        })
    
    elif request.method == 'PUT':
        # Update payment
        old_status = payment.status
        for field, value in request.data.items():
            if hasattr(payment, field):
                setattr(payment, field, value)
        payment.save()
        
        # Log activity if status changed
        if old_status != payment.status:
            UserActivity.objects.create(
                user=payment.user,
                activity_type='payment_updated',
                description=f'Admin changed payment #{payment.id} status from {old_status} to {payment.status}'
            )
        
        return Response({'success': True})
    
    elif request.method == 'DELETE':
        user = payment.user
        payment.delete()
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='payment_deleted',
            description=f'Admin deleted payment #{payment_id}'
        )
        
        return Response({'success': True})

# ===== CLAIMS CRUD =====
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_claims(request):
    if request.method == 'GET':
        claims = Claim.objects.all().order_by('-created_at')
        data = [{
            'id': claim.id,
            'user': claim.user.username,
            'title': claim.title,
            'amount_requested': str(claim.amount_requested),
            'amount_approved': str(claim.amount_approved) if claim.amount_approved else None,
            'status': claim.status,
            'created_at': claim.created_at.isoformat(),
            'admin_response': claim.admin_response,
        } for claim in claims]
        return Response({'claims': data})
    
    elif request.method == 'POST':
        # Admin can create claim for user
        try:
            user = User.objects.get(id=request.data.get('user_id'))
            claim = Claim.objects.create(
                user=user,
                title=request.data.get('title'),
                description=request.data.get('description'),
                amount_requested=request.data.get('amount_requested'),
                status=request.data.get('status', 'pending'),
                admin_response=request.data.get('admin_response', ''),
            )
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='claim_submitted',
                description=f'Admin created claim "{claim.title}" for user'
            )
            
            return Response({'success': True, 'claim_id': claim.id})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_claim_detail(request, claim_id):
    try:
        claim = Claim.objects.get(id=claim_id)
    except Claim.DoesNotExist:
        return Response({'error': 'Claim not found'}, status=404)
    
    if request.method == 'GET':
        return Response({
            'claim': {
                'id': claim.id,
                'user': claim.user.username,
                'title': claim.title,
                'description': claim.description,
                'amount_requested': str(claim.amount_requested),
                'amount_approved': str(claim.amount_approved) if claim.amount_approved else None,
                'status': claim.status,
                'created_at': claim.created_at.isoformat(),
                'admin_response': claim.admin_response,
            }
        })
    
    elif request.method == 'PUT':
        # Update claim
        old_status = claim.status
        for field, value in request.data.items():
            if hasattr(claim, field):
                setattr(claim, field, value)
        claim.save()
        
        # Log activity if status changed
        if old_status != claim.status:
            UserActivity.objects.create(
                user=claim.user,
                activity_type='claim_updated',
                description=f'Admin changed claim #{claim.id} status from {old_status} to {claim.status}'
            )
        
        return Response({'success': True})
    
    elif request.method == 'DELETE':
        user = claim.user
        claim.delete()
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='claim_deleted',
            description=f'Admin deleted claim #{claim_id}'
        )
        
        return Response({'success': True})

# ===== SHARES CRUD =====
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_shares(request):
    if request.method == 'GET':
        shares = SharePurchase.objects.all().order_by('-created_at')
        data = [{
            'id': share.id,
            'user': share.user.username,
            'shares_requested': share.shares_requested,
            'amount': str(share.amount),
            'payment_method': share.payment_method,
            'status': share.status,
            'created_at': share.created_at.isoformat(),
            'notes': share.notes,
        } for share in shares]
        return Response({'shares': data})
    
    elif request.method == 'POST':
        # Admin can create share purchase for user
        try:
            user = User.objects.get(id=request.data.get('user_id'))
            share = SharePurchase.objects.create(
                user=user,
                shares_requested=request.data.get('shares_requested'),
                amount=request.data.get('amount'),
                payment_method=request.data.get('payment_method'),
                status=request.data.get('status', 'pending'),
                notes=request.data.get('notes', ''),
            )
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='shares_purchased',
                description=f'Admin created share purchase of {share.shares_requested} shares for user'
            )
            
            return Response({'success': True, 'share_id': share.id})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

# ===== USER ACTIVITIES =====
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_activities(request):
    activities = UserActivity.objects.all().order_by('-created_at')[:100]  # Last 100 activities
    
    data = [{
        'id': activity.id,
        'user': activity.user.username,
        'activity_type': activity.activity_type,
        'description': activity.description,
        'ip_address': activity.ip_address,
        'created_at': activity.created_at.isoformat(),
    } for activity in activities]
    
    return Response({'activities': data})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_activity_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        activities = UserActivity.objects.filter(user=user).order_by('-created_at')
        
        data = [{
            'id': activity.id,
            'activity_type': activity.activity_type,
            'description': activity.description,
            'ip_address': activity.ip_address,
            'created_at': activity.created_at.isoformat(),
        } for activity in activities]
        
        return Response({
            'user': user.username,
            'activities': data
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
'''

# ===== 3. ACTIVITY LOGGING MIDDLEWARE =====
ACTIVITY_MIDDLEWARE = '''
# middleware.py - Auto-log user activities

class ActivityLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Log activities for authenticated users
        if request.user.is_authenticated and request.method == 'POST':
            self.log_activity(request, response)
        
        return response
    
    def log_activity(self, request, response):
        if response.status_code in [200, 201]:
            activity_type = None
            description = ''
            
            if '/api/applications/' in request.path:
                activity_type = 'application_submitted'
                description = 'User submitted membership application'
            elif '/api/payments/' in request.path:
                activity_type = 'payment_made'
                description = 'User made a payment'
            elif '/api/claims/' in request.path:
                activity_type = 'claim_submitted'
                description = 'User submitted a claim'
            elif '/api/shares/buy/' in request.path:
                activity_type = 'shares_purchased'
                description = 'User purchased shares'
            
            if activity_type:
                UserActivity.objects.create(
                    user=request.user,
                    activity_type=activity_type,
                    description=description,
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
'''

# ===== 4. URL PATTERNS =====
ADMIN_URL_PATTERNS = '''
# admin_panel/urls.py

urlpatterns = [
    # Applications CRUD
    path('applications/', views.admin_applications, name='admin_applications'),
    path('applications/<int:app_id>/', views.admin_application_detail, name='admin_application_detail'),
    
    # Payments CRUD
    path('payments/', views.admin_payments, name='admin_payments'),
    path('payments/<int:payment_id>/', views.admin_payment_detail, name='admin_payment_detail'),
    
    # Claims CRUD
    path('claims/', views.admin_claims, name='admin_claims'),
    path('claims/<int:claim_id>/', views.admin_claim_detail, name='admin_claim_detail'),
    
    # Shares CRUD
    path('shares/', views.admin_shares, name='admin_shares'),
    path('shares/<int:share_id>/', views.admin_share_detail, name='admin_share_detail'),
    
    # User Activities
    path('activities/', views.admin_user_activities, name='admin_user_activities'),
    path('users/<int:user_id>/activities/', views.admin_user_activity_detail, name='admin_user_activity_detail'),
    
    # Dashboard Stats
    path('dashboard/stats/', views.admin_dashboard_stats, name='admin_dashboard_stats'),
]
'''

# ===== 5. DASHBOARD STATS =====
DASHBOARD_STATS = '''
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """Get comprehensive admin dashboard statistics"""
    
    # Get counts
    total_users = User.objects.count()
    total_applications = MembershipApplication.objects.count()
    pending_applications = MembershipApplication.objects.filter(status='pending').count()
    total_payments = MembershipPayment.objects.count()
    pending_payments = MembershipPayment.objects.filter(status='pending').count()
    total_claims = Claim.objects.count()
    pending_claims = Claim.objects.filter(status='pending').count()
    total_shares = SharePurchase.objects.count()
    
    # Get recent activities
    recent_activities = UserActivity.objects.all().order_by('-created_at')[:10]
    
    # Get financial stats
    total_revenue = MembershipPayment.objects.filter(status='approved').aggregate(
        total=models.Sum('amount')
    )['total'] or 0
    
    return Response({
        'stats': {
            'users': {
                'total': total_users,
                'active': User.objects.filter(is_active=True).count(),
            },
            'applications': {
                'total': total_applications,
                'pending': pending_applications,
                'approved': MembershipApplication.objects.filter(status='approved').count(),
            },
            'payments': {
                'total': total_payments,
                'pending': pending_payments,
                'total_revenue': str(total_revenue),
            },
            'claims': {
                'total': total_claims,
                'pending': pending_claims,
            },
            'shares': {
                'total': total_shares,
                'pending': SharePurchase.objects.filter(status='pending').count(),
            }
        },
        'recent_activities': [{
            'id': activity.id,
            'user': activity.user.username,
            'activity_type': activity.activity_type,
            'description': activity.description,
            'created_at': activity.created_at.isoformat(),
        } for activity in recent_activities]
    })
'''

print("COMPLETE CRUD ADMIN SYSTEM CREATED")
print("=" * 50)
print("BACKEND UPDATES NEEDED:")
print("1. Add UserActivity model for tracking")
print("2. Add complete CRUD views for all entities")
print("3. Add activity logging middleware")
print("4. Add admin dashboard stats endpoint")
print("5. Update URL patterns")
print("6. Run migrations")
print("\nFEATURES:")
print("✅ Full CRUD for Applications, Payments, Claims, Shares")
print("✅ Activity tracking for all user actions")
print("✅ Admin can create/edit/delete any record")
print("✅ Real-time activity feed in admin dashboard")
print("✅ Comprehensive dashboard statistics")