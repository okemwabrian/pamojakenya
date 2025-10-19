# COPY THIS EXACT CODE TO YOUR DJANGO PROJECT

# 1. payments/views.py - REPLACE ENTIRE FILE
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Payment
from .serializers import PaymentSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def activation_fee(self, request):
        amount = request.data.get('amount')
        payment_proof = request.FILES.get('payment_proof')
        
        if not amount or not payment_proof:
            return Response({'message': 'Amount and payment proof required'}, status=400)
        
        payment = Payment.objects.create(
            user=request.user,
            payment_type='activation_fee',
            amount=float(amount),
            description='Account Activation Fee',
            payment_proof=payment_proof,
            status='pending'
        )
        
        return Response({'message': 'Payment submitted successfully'}, status=201)

# 2. payments/models.py - ADD THESE FIELDS TO YOUR Payment MODEL
class Payment(models.Model):
    # ... your existing fields ...
    payment_type = models.CharField(max_length=50, default='other')
    payment_proof = models.FileField(upload_to='payments/', blank=True, null=True)

# 3. accounts/models.py - ADD THIS TO User MODEL OR CREATE UserProfile
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_activated = models.BooleanField(default=False)

# 4. accounts/views.py - ADD THIS VIEW
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def user_status(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        is_activated = profile.is_activated
    except:
        is_activated = False
    
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'is_activated': is_activated
    })

# 5. RUN THESE COMMANDS:
# python manage.py makemigrations
# python manage.py migrate

# 6. UPDATE urls.py - ADD THESE PATHS
from django.urls import path
from accounts.views import user_status

urlpatterns = [
    # ... existing patterns ...
    path('api/auth/user/', user_status, name='user-status'),
]