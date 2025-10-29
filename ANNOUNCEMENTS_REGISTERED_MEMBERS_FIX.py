# ANNOUNCEMENTS AND REGISTERED MEMBERS FIX

# ===== 1. ANNOUNCEMENTS FIX =====
# The 400 errors show announcements can't be posted/updated

ANNOUNCEMENTS_MODEL_FIX = '''
# Make sure your Announcement model has all required fields

class Announcement(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='announcements_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional fields
    expires_at = models.DateTimeField(null=True, blank=True)
    target_audience = models.CharField(max_length=50, default='all')  # all, members, admins
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
'''

ANNOUNCEMENTS_VIEWS_FIX = '''
# announcements/views.py - Fix the views

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def announcements_list(request):
    if request.method == 'GET':
        # Get all active announcements
        announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')
        
        data = [{
            'id': announcement.id,
            'title': announcement.title,
            'content': announcement.content,
            'priority': announcement.priority,
            'created_by': announcement.created_by.username,
            'created_at': announcement.created_at.isoformat(),
            'expires_at': announcement.expires_at.isoformat() if announcement.expires_at else None,
        } for announcement in announcements]
        
        return Response({'announcements': data})
    
    elif request.method == 'POST':
        # Only admins can create announcements
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Validate required fields
            title = request.data.get('title')
            content = request.data.get('content')
            
            if not title or not content:
                return Response({
                    'error': 'Title and content are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create announcement
            announcement = Announcement.objects.create(
                title=title,
                content=content,
                priority=request.data.get('priority', 'medium'),
                created_by=request.user,
                expires_at=request.data.get('expires_at'),
                target_audience=request.data.get('target_audience', 'all'),
            )
            
            return Response({
                'success': True,
                'message': 'Announcement created successfully',
                'announcement': {
                    'id': announcement.id,
                    'title': announcement.title,
                    'content': announcement.content,
                    'priority': announcement.priority,
                    'created_at': announcement.created_at.isoformat(),
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create announcement: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def announcement_detail(request, announcement_id):
    try:
        announcement = Announcement.objects.get(id=announcement_id)
    except Announcement.DoesNotExist:
        return Response({'error': 'Announcement not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'announcement': {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'priority': announcement.priority,
                'is_active': announcement.is_active,
                'created_by': announcement.created_by.username,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'expires_at': announcement.expires_at.isoformat() if announcement.expires_at else None,
            }
        })
    
    elif request.method == 'PUT':
        # Only admins can update announcements
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Update fields
            if 'title' in request.data:
                announcement.title = request.data['title']
            if 'content' in request.data:
                announcement.content = request.data['content']
            if 'priority' in request.data:
                announcement.priority = request.data['priority']
            if 'is_active' in request.data:
                announcement.is_active = request.data['is_active']
            if 'expires_at' in request.data:
                announcement.expires_at = request.data['expires_at']
            
            announcement.save()
            
            return Response({
                'success': True,
                'message': 'Announcement updated successfully'
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to update announcement: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only admins can delete announcements
        if not request.user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        announcement.delete()
        return Response({
            'success': True,
            'message': 'Announcement deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
'''

# ===== 2. REGISTERED MEMBERS IMPLEMENTATION =====
REGISTERED_MEMBERS_VIEW = '''
# admin_panel/views.py - Add registered members endpoint

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_registered_members(request):
    """Get all registered members with their details"""
    
    # Get users with approved applications (registered members)
    approved_applications = MembershipApplication.objects.filter(
        status='approved'
    ).select_related('user')
    
    # Get all users with their profiles
    users_with_profiles = User.objects.select_related('userprofile').all()
    
    members_data = []
    
    for user in users_with_profiles:
        # Get user's approved application
        approved_app = approved_applications.filter(user=user).first()
        
        # Get user profile
        try:
            profile = user.userprofile
        except:
            profile = None
        
        member_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'date_joined': user.date_joined.isoformat(),
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            
            # Profile information
            'membership_type': profile.membership_type if profile else 'none',
            'membership_status': profile.membership_status if profile else 'inactive',
            'shares_owned': profile.shares_owned if profile else 0,
            'phone': profile.phone if profile else '',
            
            # Application information
            'has_approved_application': bool(approved_app),
            'application_date': approved_app.created_at.isoformat() if approved_app else None,
            'application_type': approved_app.membership_type if approved_app else None,
            
            # Statistics
            'total_payments': MembershipPayment.objects.filter(user=user).count(),
            'total_claims': Claim.objects.filter(user=user).count(),
            'total_shares_purchased': SharePurchase.objects.filter(user=user).count(),
            
            # Financial info
            'total_paid': float(MembershipPayment.objects.filter(
                user=user, status='approved'
            ).aggregate(total=models.Sum('amount'))['total'] or 0),
        }
        
        members_data.append(member_data)
    
    # Sort by membership status and date joined
    members_data.sort(key=lambda x: (
        x['membership_status'] != 'active',  # Active members first
        -x['shares_owned'],  # Then by shares owned (desc)
        x['date_joined']  # Then by join date
    ))
    
    return Response({
        'members': members_data,
        'total_count': len(members_data),
        'active_members': len([m for m in members_data if m['membership_status'] == 'active']),
        'pending_members': len([m for m in members_data if m['membership_status'] == 'pending']),
        'inactive_members': len([m for m in members_data if m['membership_status'] == 'inactive']),
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_member_details(request, user_id):
    """Get detailed information about a specific member"""
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Member not found'}, status=404)
    
    # Get all related data
    applications = MembershipApplication.objects.filter(user=user).order_by('-created_at')
    payments = MembershipPayment.objects.filter(user=user).order_by('-created_at')
    claims = Claim.objects.filter(user=user).order_by('-created_at')
    shares = SharePurchase.objects.filter(user=user).order_by('-created_at')
    
    try:
        profile = user.userprofile
    except:
        profile = None
    
    return Response({
        'member': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.isoformat(),
            'is_active': user.is_active,
            'last_login': user.last_login.isoformat() if user.last_login else None,
        },
        'profile': {
            'membership_type': profile.membership_type if profile else 'none',
            'membership_status': profile.membership_status if profile else 'inactive',
            'shares_owned': profile.shares_owned if profile else 0,
            'phone': profile.phone if profile else '',
        },
        'applications': [{
            'id': app.id,
            'membership_type': app.membership_type,
            'status': app.status,
            'created_at': app.created_at.isoformat(),
            'admin_notes': app.admin_notes,
        } for app in applications],
        'payments': [{
            'id': payment.id,
            'payment_type': payment.payment_type,
            'amount': str(payment.amount),
            'status': payment.status,
            'created_at': payment.created_at.isoformat(),
        } for payment in payments],
        'claims': [{
            'id': claim.id,
            'title': claim.title,
            'amount_requested': str(claim.amount_requested),
            'status': claim.status,
            'created_at': claim.created_at.isoformat(),
        } for claim in claims],
        'shares': [{
            'id': share.id,
            'shares_requested': share.shares_requested,
            'amount': str(share.amount),
            'status': share.status,
            'created_at': share.created_at.isoformat(),
        } for share in shares],
        'statistics': {
            'total_applications': applications.count(),
            'total_payments': payments.count(),
            'total_claims': claims.count(),
            'total_shares_purchased': shares.count(),
            'total_paid': float(payments.filter(status='approved').aggregate(
                total=models.Sum('amount'))['total'] or 0),
        }
    })
'''

# ===== 3. URL PATTERNS =====
URL_PATTERNS_UPDATE = '''
# announcements/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.announcements_list, name='announcements_list'),
    path('<int:announcement_id>/', views.announcement_detail, name='announcement_detail'),
]

# admin_panel/urls.py - Add these to existing patterns
urlpatterns = [
    # ... existing patterns ...
    path('members/', views.get_registered_members, name='get_registered_members'),
    path('members/<int:user_id>/', views.get_member_details, name='get_member_details'),
]
'''

# ===== 4. MIGRATION COMMANDS =====
MIGRATION_COMMANDS = '''
# Run these commands after updating models:

python manage.py makemigrations announcements
python manage.py migrate

# If Announcement model doesn't exist, create the app first:
python manage.py startapp announcements
# Then add to INSTALLED_APPS in settings.py
'''

print("ANNOUNCEMENTS AND REGISTERED MEMBERS FIX CREATED")
print("=" * 50)
print("FIXES NEEDED:")
print("1. Update Announcement model with all required fields")
print("2. Fix announcement views to handle validation properly")
print("3. Add registered members endpoint")
print("4. Update URL patterns")
print("5. Run migrations")
print("\nThis will fix the 400 errors and add member management")