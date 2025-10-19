# QUICK BACKEND SETUP - MINIMAL CHANGES NEEDED

# 1. ADD TO YOUR EXISTING URLS.PY
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Add these to your existing router
router.register(r'applications', views.MembershipApplicationViewSet, basename='applications')

urlpatterns = [
    # ... your existing URLs ...
    path('api/', include(router.urls)),
]
"""

# 2. ADD TO YOUR EXISTING VIEWS.PY
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class MembershipApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return MembershipApplication.objects.all()
        return MembershipApplication.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        application = self.get_object()
        application.status = 'approved'
        application.admin_notes = request.data.get('notes', '')
        application.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = 'rejected'
        application.admin_notes = request.data.get('notes', '')
        application.save()
        return Response({'status': 'rejected'})
"""

# 3. ADD TO YOUR EXISTING MODELS.PY
"""
class MembershipApplication(models.Model):
    MEMBERSHIP_TYPES = [('single', 'Single'), ('double', 'Double')]
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Primary applicant
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    id_number = models.CharField(max_length=20)
    id_document = models.FileField(upload_to='applications/ids/')
    
    # Address
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    
    # Emergency contact
    emergency_name = models.CharField(max_length=100)
    emergency_phone = models.CharField(max_length=20)
    emergency_relationship = models.CharField(max_length=50)
    
    # Spouse (for double membership)
    spouse_first_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_last_name = models.CharField(max_length=100, blank=True, null=True)
    spouse_email = models.EmailField(blank=True, null=True)
    spouse_phone = models.CharField(max_length=20, blank=True, null=True)
    spouse_date_of_birth = models.DateField(blank=True, null=True)
    spouse_id_number = models.CharField(max_length=20, blank=True, null=True)
    spouse_id_document = models.FileField(upload_to='applications/spouse_ids/', blank=True, null=True)
    
    # Children
    children_info = models.JSONField(default=list, blank=True)
    
    # Admin fields
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.membership_type}"
"""

# 4. ADD TO YOUR EXISTING SERIALIZERS.PY
"""
class MembershipApplicationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MembershipApplication
        fields = '__all__'
        read_only_fields = ('user', 'status', 'admin_notes', 'created_at', 'updated_at')
"""

# 5. UPDATE YOUR EXISTING ADMIN.PY
"""
from django.contrib import admin
from .models import MembershipApplication

@admin.register(MembershipApplication)
class MembershipApplicationAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'membership_type', 'status', 'created_at']
    list_filter = ['membership_type', 'status', 'created_at']
    search_fields = ['first_name', 'last_name', 'email']
    readonly_fields = ['created_at', 'updated_at']
"""

print("MINIMAL BACKEND SETUP COMPLETE")
print("Run: python manage.py makemigrations && python manage.py migrate")