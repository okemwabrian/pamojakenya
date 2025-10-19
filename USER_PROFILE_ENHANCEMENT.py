# USER PROFILE ENHANCEMENT - Add Missing Fields

# 1. BACKEND - Update User Model in models.py
"""
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Personal Information
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    national_id = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    
    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    
    # Emergency Contact
    emergency_name = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    emergency_relationship = models.CharField(max_length=50, blank=True)
    
    # Membership
    shares = models.IntegerField(default=0)
    is_active_member = models.BooleanField(default=False)
    membership_type = models.CharField(max_length=20, choices=[
        ('single', 'Single'),
        ('double', 'Double')
    ], blank=True, null=True)
"""

# 2. BACKEND - Update UserSerializer in serializers.py
"""
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'date_of_birth', 'national_id', 'gender', 'occupation',
            'address', 'city', 'state', 'zip_code',
            'emergency_name', 'emergency_phone', 'emergency_relationship',
            'shares', 'is_active_member', 'membership_type', 'is_staff'
        ]
        read_only_fields = ['id', 'shares', 'is_active_member', 'is_staff']
"""

print("USER PROFILE ENHANCEMENT COMPLETE")
print("Run: python manage.py makemigrations && python manage.py migrate")