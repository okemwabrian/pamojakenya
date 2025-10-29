# ADMIN APPLICATION DETAILS FIX

# Your admin dashboard is showing generic fields instead of actual application data
# Update the admin application detail endpoint to return complete form data

# ===== UPDATED ADMIN APPLICATION DETAIL VIEW =====
ADMIN_APPLICATION_DETAIL_FIX = '''
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_application_detail(request, app_id):
    try:
        application = MembershipApplication.objects.get(id=app_id)
    except MembershipApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    
    if request.method == 'GET':
        # Return COMPLETE application data as submitted by user
        application_data = {
            # Application Info
            'id': application.id,
            'user': application.user.username,
            'user_id': application.user.id,
            'membership_type': application.membership_type,
            'status': application.status,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat(),
            'admin_notes': application.admin_notes,
            
            # Primary Applicant (from form fields)
            'first_name': application.first_name,
            'last_name': application.last_name,
            'full_name': application.full_name or f"{application.first_name} {application.last_name}",
            'email': application.email,
            'phone': application.phone,
            'date_of_birth': application.date_of_birth.isoformat() if application.date_of_birth else None,
            'id_number': application.national_id,  # ID Number from form
            'gender': application.gender,
            'occupation': application.occupation,
            
            # Address (from form fields)
            'address': application.address,
            'city': application.city,
            'state': application.state,
            'zip_code': application.zip_code,
            
            # Emergency Contact (from form fields)
            'emergency_name': application.emergency_contact_name,
            'emergency_phone': application.emergency_contact_phone,
            'emergency_relationship': application.emergency_contact_relationship,
            
            # Spouse Information (for double membership)
            'spouse_first_name': application.spouse_first_name,
            'spouse_last_name': application.spouse_last_name,
            'spouse_full_name': application.spouse_full_name,
            'spouse_email': application.spouse_email,
            'spouse_phone': application.spouse_phone,
            'spouse_date_of_birth': application.spouse_date_of_birth.isoformat() if application.spouse_date_of_birth else None,
            'spouse_id_number': application.spouse_national_id,
            'spouse_gender': application.spouse_gender,
            'spouse_occupation': application.spouse_occupation,
            
            # Children Information (JSON field)
            'children_info': application.children_info if application.children_info else [],
            
            # Step Family Information (for double membership)
            'step_parents_info': application.step_parents_info if application.step_parents_info else [],
            'step_siblings_info': application.step_siblings_info if application.step_siblings_info else [],
            
            # Documents
            'id_document': application.id_document.url if application.id_document else None,
            'spouse_id_document': application.spouse_id_document.url if application.spouse_id_document else None,
        }
        
        return Response({'application': application_data})
    
    elif request.method == 'PUT':
        # Update application
        for field, value in request.data.items():
            if hasattr(application, field):
                setattr(application, field, value)
        application.save()
        
        return Response({'success': True, 'message': 'Application updated successfully'})
    
    elif request.method == 'DELETE':
        application.delete()
        return Response({'success': True, 'message': 'Application deleted successfully'})
'''

# ===== REQUIRED MODEL FIELDS =====
MODEL_FIELDS_NEEDED = '''
# Make sure your MembershipApplication model has ALL these fields:

class MembershipApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    membership_type = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default='pending')
    
    # Primary Applicant Fields (from form)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=200, blank=True)  # Computed field
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    national_id = models.CharField(max_length=50)  # ID Number
    gender = models.CharField(max_length=10)
    occupation = models.CharField(max_length=100)
    
    # Address Fields (from form)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    
    # Emergency Contact Fields (from form)
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    emergency_contact_relationship = models.CharField(max_length=50)
    
    # Spouse Fields (for double membership)
    spouse_first_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_last_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_full_name = models.CharField(max_length=200, blank=True, null=True)
    spouse_email = models.EmailField(blank=True, null=True)
    spouse_phone = models.CharField(max_length=20, blank=True, null=True)
    spouse_date_of_birth = models.DateField(blank=True, null=True)
    spouse_national_id = models.CharField(max_length=50, blank=True, null=True)
    spouse_gender = models.CharField(max_length=10, blank=True, null=True)
    spouse_occupation = models.CharField(max_length=100, blank=True, null=True)
    
    # JSON Fields for complex data
    children_info = models.JSONField(default=list, blank=True)
    step_parents_info = models.JSONField(default=list, blank=True)
    step_siblings_info = models.JSONField(default=list, blank=True)
    
    # Documents
    id_document = models.FileField(upload_to='applications/documents/', blank=True, null=True)
    spouse_id_document = models.FileField(upload_to='applications/documents/', blank=True, null=True)
    
    # Admin fields
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
'''

# ===== APPLICATION SUBMISSION UPDATE =====
APPLICATION_SUBMISSION_UPDATE = '''
# Also update your application submission view to save ALL form data:

@api_view(['POST'])
def submit_application(request):
    try:
        application = MembershipApplication.objects.create(
            user=request.user,
            membership_type=request.data.get('membership_type'),
            
            # Primary Applicant
            first_name=request.data.get('first_name'),
            last_name=request.data.get('last_name'),
            email=request.data.get('email'),
            phone=request.data.get('phone'),
            date_of_birth=request.data.get('date_of_birth'),
            national_id=request.data.get('id_number'),  # Form field name
            gender=request.data.get('gender'),
            occupation=request.data.get('occupation'),
            
            # Address
            address=request.data.get('address'),
            city=request.data.get('city'),
            state=request.data.get('state'),
            zip_code=request.data.get('zip_code'),
            
            # Emergency Contact
            emergency_contact_name=request.data.get('emergency_name'),
            emergency_contact_phone=request.data.get('emergency_phone'),
            emergency_contact_relationship=request.data.get('emergency_relationship'),
            
            # Spouse (for double membership)
            spouse_first_name=request.data.get('spouse_first_name'),
            spouse_last_name=request.data.get('spouse_last_name'),
            spouse_email=request.data.get('spouse_email'),
            spouse_phone=request.data.get('spouse_phone'),
            spouse_date_of_birth=request.data.get('spouse_date_of_birth'),
            spouse_national_id=request.data.get('spouse_id_number'),
            spouse_gender=request.data.get('spouse_gender'),
            spouse_occupation=request.data.get('spouse_occupation'),
            
            # JSON fields
            children_info=request.data.get('children_info', []),
            step_parents_info=request.data.get('step_parents_info', []),
            step_siblings_info=request.data.get('step_siblings_info', []),
            
            # Documents
            id_document=request.FILES.get('id_document'),
            spouse_id_document=request.FILES.get('spouse_id_document'),
        )
        
        return Response({
            'success': True,
            'application_id': application.id,
            'message': 'Application submitted successfully!'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)
'''

# ===== URL PATTERN =====
URL_PATTERN = '''
# admin_panel/urls.py
urlpatterns = [
    path('applications/<int:app_id>/', views.admin_application_detail, name='admin_application_detail'),
    path('applications/<int:app_id>/details/', views.admin_application_detail, name='admin_application_details'),  # Alternative URL
]
'''

print("ADMIN APPLICATION DETAILS FIX CREATED")
print("=" * 50)
print("BACKEND UPDATES NEEDED:")
print("1. Update admin_application_detail view to return ALL form fields")
print("2. Ensure MembershipApplication model has all required fields")
print("3. Update application submission to save all form data")
print("4. Run migrations if new fields added")
print("\nThis will show the actual application data instead of generic fields")