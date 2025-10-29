# BACKEND UPDATES FOR DETAILED APPLICATION AND CLAIMS

# ===== UPDATED MODELS.PY =====
UPDATED_MODELS = '''
class MembershipApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    MEMBERSHIP_TYPE_CHOICES = [
        ('single', 'Single Membership'),
        ('double', 'Double Membership'),
    ]
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Personal Information
    full_name = models.CharField(max_length=200)
    national_id = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    occupation = models.CharField(max_length=100)
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    emergency_contact_relationship = models.CharField(max_length=50)
    
    # For Double Membership - Spouse Information
    spouse_full_name = models.CharField(max_length=200, blank=True, null=True)
    spouse_national_id = models.CharField(max_length=50, blank=True, null=True)
    spouse_date_of_birth = models.DateField(blank=True, null=True)
    spouse_gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    spouse_occupation = models.CharField(max_length=100, blank=True, null=True)
    spouse_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # For Double Membership - Children Information (JSON field for multiple children)
    children_info = models.JSONField(default=list, blank=True)
    
    # For Double Membership - Step Parents/Siblings
    step_parents_info = models.JSONField(default=list, blank=True)
    step_siblings_info = models.JSONField(default=list, blank=True)
    
    # Documents
    id_document = models.FileField(upload_to='applications/documents/', blank=True, null=True)
    spouse_id_document = models.FileField(upload_to='applications/documents/', blank=True, null=True)
    
    # Admin fields
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.membership_type} - {self.status}"

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
    
    # Status and approval fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True)
    amount_approved = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Admin tracking
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_claims')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title} - {self.status}"
'''

# ===== UPDATED VIEWS FOR APPLICATION DETAILS =====
APPLICATION_DETAIL_VIEWS = '''
@csrf_exempt
def get_application_details(request, application_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Admin can view any application, users can only view their own
        if request.user.is_staff:
            application = MembershipApplication.objects.get(id=application_id)
        else:
            application = MembershipApplication.objects.get(id=application_id, user=request.user)
        
        application_data = {
            'id': application.id,
            'membership_type': application.membership_type,
            'status': application.status,
            
            # Personal Information
            'personal_info': {
                'full_name': application.full_name,
                'national_id': application.national_id,
                'date_of_birth': application.date_of_birth.isoformat() if application.date_of_birth else None,
                'gender': application.gender,
                'occupation': application.occupation,
            },
            
            # Contact Information
            'contact_info': {
                'email': application.email,
                'phone': application.phone,
                'address': application.address,
            },
            
            # Emergency Contact
            'emergency_contact': {
                'name': application.emergency_contact_name,
                'phone': application.emergency_contact_phone,
                'relationship': application.emergency_contact_relationship,
            },
            
            # Spouse Information (for double membership)
            'spouse_info': {
                'full_name': application.spouse_full_name,
                'national_id': application.spouse_national_id,
                'date_of_birth': application.spouse_date_of_birth.isoformat() if application.spouse_date_of_birth else None,
                'gender': application.spouse_gender,
                'occupation': application.spouse_occupation,
                'phone': application.spouse_phone,
            } if application.membership_type == 'double' else None,
            
            # Children Information
            'children_info': application.children_info if application.membership_type == 'double' else [],
            
            # Step Parents/Siblings Information
            'step_parents_info': application.step_parents_info if application.membership_type == 'double' else [],
            'step_siblings_info': application.step_siblings_info if application.membership_type == 'double' else [],
            
            # Documents
            'documents': {
                'id_document': application.id_document.url if application.id_document else None,
                'spouse_id_document': application.spouse_id_document.url if application.spouse_id_document else None,
            },
            
            # Admin fields
            'admin_notes': application.admin_notes,
            'reviewed_by': application.reviewed_by.username if application.reviewed_by else None,
            'reviewed_at': application.reviewed_at.isoformat() if application.reviewed_at else None,
            
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat(),
        }
        
        return JsonResponse({'application': application_data})
        
    except MembershipApplication.DoesNotExist:
        return JsonResponse({'error': 'Application not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
'''

# ===== UPDATED VIEWS FOR CLAIMS APPROVAL WITH AMOUNT =====
CLAIMS_APPROVAL_VIEWS = '''
@csrf_exempt
@require_http_methods(["POST"])
def approve_claim(request, claim_id):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        claim = Claim.objects.get(id=claim_id)
        
        # Get approval data from request
        data = json.loads(request.body)
        amount_approved = data.get('amount_approved')
        admin_response = data.get('admin_response', '')
        
        if not amount_approved:
            return JsonResponse({'error': 'Amount approved is required'}, status=400)
        
        # Update claim
        claim.status = 'approved'
        claim.amount_approved = amount_approved
        claim.admin_response = admin_response
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Claim approved with amount ${amount_approved}',
            'claim': {
                'id': claim.id,
                'status': claim.status,
                'amount_approved': str(claim.amount_approved),
                'admin_response': claim.admin_response,
                'reviewed_by': claim.reviewed_by.username,
                'reviewed_at': claim.reviewed_at.isoformat(),
            }
        })
        
    except Claim.DoesNotExist:
        return JsonResponse({'error': 'Claim not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def reject_claim(request, claim_id):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        claim = Claim.objects.get(id=claim_id)
        
        # Get rejection data from request
        data = json.loads(request.body)
        admin_response = data.get('admin_response', 'Claim rejected')
        
        # Update claim
        claim.status = 'rejected'
        claim.admin_response = admin_response
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Claim rejected',
            'claim': {
                'id': claim.id,
                'status': claim.status,
                'admin_response': claim.admin_response,
                'reviewed_by': claim.reviewed_by.username,
                'reviewed_at': claim.reviewed_at.isoformat(),
            }
        })
        
    except Claim.DoesNotExist:
        return JsonResponse({'error': 'Claim not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
'''

# ===== UPDATED URL PATTERNS =====
UPDATED_URL_PATTERNS = '''
# applications/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_applications, name='get_applications'),
    path('<int:application_id>/', views.get_application_details, name='get_application_details'),
    path('<int:application_id>/details/', views.get_application_details, name='get_application_details_alt'),
    path('single/submit/', views.submit_single_application, name='submit_single_application'),
    path('double/submit/', views.submit_double_application, name='submit_double_application'),
]

# claims/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_user_claims, name='get_user_claims'),
    path('submit/', views.submit_claim, name='submit_claim'),
    path('<int:claim_id>/', views.get_claim_details, name='get_claim_details'),
    path('<int:claim_id>/approve/', views.approve_claim, name='approve_claim'),
    path('<int:claim_id>/reject/', views.reject_claim, name='reject_claim'),
]

# admin_panel/urls.py (add these to existing admin URLs)
urlpatterns = [
    # ... existing admin URLs ...
    path('applications/<int:application_id>/details/', views.get_application_details, name='admin_application_details'),
    path('claims/<int:claim_id>/approve/', views.approve_claim, name='admin_approve_claim'),
    path('claims/<int:claim_id>/reject/', views.reject_claim, name='admin_reject_claim'),
]
'''

# ===== MIGRATION COMMANDS =====
MIGRATION_COMMANDS = '''
# Run these Django commands after updating models:

python manage.py makemigrations applications
python manage.py makemigrations claims
python manage.py migrate

# If you get migration conflicts, you might need to:
python manage.py makemigrations --empty applications
python manage.py makemigrations --empty claims
# Then manually edit the migration files
'''

print("DETAILED BACKEND UPDATES CREATED")
print("=" * 50)
print("KEY UPDATES:")
print("1. MembershipApplication model with ALL personal details")
print("2. Application details endpoint with complete information")
print("3. Claims approval with amount_approved field")
print("4. Admin tracking for reviews")
print("5. JSON fields for children/step-family info")