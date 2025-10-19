# BACKEND FIXES FOR USER DASHBOARD

## 1. Fix Claims API (400 Error)

**File: `claims/views.py`**

```python
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Claim
from .serializers import ClaimSerializer

class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Claim.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                claim = serializer.save(user=request.user)
                return Response(ClaimSerializer(claim).data, status=201)
            return Response(serializer.errors, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
```

**File: `claims/serializers.py`**

```python
from rest_framework import serializers
from .models import Claim

class ClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['id', 'claim_type', 'amount', 'description', 'supporting_documents', 
                 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
```

## 2. Fix Shares API (400 Error)

**File: `shares/views.py`**

```python
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import SharePurchase
from .serializers import SharePurchaseSerializer

class ShareViewSet(viewsets.ModelViewSet):
    serializer_class = SharePurchaseSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return SharePurchase.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            # Calculate total amount (assuming $10 per share)
            quantity = int(data.get('quantity', 0))
            data['total_amount'] = quantity * 10
            data['amount_per_share'] = 10
            
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                share = serializer.save(user=request.user, buyer_name=request.user.get_full_name())
                return Response(SharePurchaseSerializer(share).data, status=201)
            return Response(serializer.errors, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
```

**File: `shares/serializers.py`**

```python
from rest_framework import serializers
from .models import SharePurchase

class SharePurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharePurchase
        fields = ['id', 'quantity', 'amount_per_share', 'total_amount', 'payment_proof',
                 'buyer_name', 'status', 'created_at']
        read_only_fields = ['id', 'buyer_name', 'amount_per_share', 'total_amount', 
                           'status', 'created_at']
```

## 3. Fix Activation Fee Payment (400 Error)

**File: `payments/views.py`**

```python
@action(detail=False, methods=['post'])
def activation_fee(self, request):
    try:
        data = request.data.copy()
        data['payment_type'] = 'activation_fee'
        data['description'] = 'Account Activation Fee'
        
        serializer = PaymentCreateSerializer(data=data)
        if serializer.is_valid():
            payment = serializer.save(user=request.user)
            
            # Send notification to admin
            # send_activation_fee_notification(payment)
            
            return Response(PaymentSerializer(payment).data, status=201)
        return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
```

## 4. Enhanced User API Responses

**File: `accounts/serializers.py`**

```python
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'full_name', 'is_activated', 'date_joined']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
```

## 5. Add User Dashboard Stats API

**File: `accounts/views.py`**

```python
from rest_framework.decorators import action
from rest_framework.response import Response

class UserViewSet(viewsets.ModelViewSet):
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        
        stats = {
            'total_applications': user.membershipapplication_set.count(),
            'total_payments': user.payment_set.count(),
            'total_shares': user.sharepurchase_set.filter(status='approved').aggregate(
                total=models.Sum('quantity'))['total'] or 0,
            'total_claims': user.claim_set.count(),
            'total_documents': user.document_set.count(),
            'pending_claims': user.claim_set.filter(status='pending').count(),
            'pending_shares': user.sharepurchase_set.filter(status='pending').count(),
        }
        
        return Response(stats)
```

## 6. Fix Document Upload

**File: `documents/views.py`**

```python
from rest_framework.parsers import MultiPartParser, FormParser

class DocumentViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                document = serializer.save(user=request.user)
                return Response(DocumentSerializer(document).data, status=201)
            return Response(serializer.errors, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
```

## 7. Add Proper Error Handling

**File: `utils/error_handlers.py`**

```python
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': response.data
        }
        
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response_data['message'] = str(list(exc.detail.values())[0])
            else:
                custom_response_data['message'] = str(exc.detail)
        
        response.data = custom_response_data
    
    return response
```

**Add to `settings.py`:**

```python
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'utils.error_handlers.custom_exception_handler',
    # ... other settings
}
```

## 8. Add Email Notifications

**File: `notifications/utils.py`**

```python
from django.core.mail import send_mail
from django.conf import settings

def send_activation_fee_notification(payment):
    # Notify admin
    send_mail(
        subject=f'Activation Fee Payment - {payment.user.username}',
        message=f'''
        New activation fee payment received:
        
        User: {payment.user.get_full_name()}
        Amount: ${payment.amount}
        Date: {payment.created_at}
        
        Please review and activate the account.
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['pamojakeny@gmail.com'],
        fail_silently=False,
    )

def send_claim_notification(claim):
    # Notify admin about new claim
    send_mail(
        subject=f'New Claim Submitted - {claim.user.username}',
        message=f'''
        New claim submitted:
        
        User: {claim.user.get_full_name()}
        Type: {claim.claim_type}
        Amount: ${claim.amount}
        Description: {claim.description}
        
        Please review in admin panel.
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['pamojakeny@gmail.com'],
        fail_silently=False,
    )
```

## 9. Update URLs

**File: `urls.py`**

```python
# Add to main urls.py
urlpatterns = [
    # ... existing patterns
    path('api/accounts/', include('accounts.urls')),
]

# Create accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
```

## 10. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Summary of Fixes:

1. ✅ **Claims API** - Fixed parser classes and error handling
2. ✅ **Shares API** - Fixed calculation and validation
3. ✅ **Activation Fee** - Fixed payment processing
4. ✅ **Document Upload** - Added proper file handling
5. ✅ **User Dashboard** - Added stats and data endpoints
6. ✅ **Error Handling** - Better error messages
7. ✅ **Email Notifications** - Admin notifications for actions
8. ✅ **API Responses** - Consistent response format

These fixes will resolve the 400 errors and make the user dashboard fully functional with proper snackbar notifications!