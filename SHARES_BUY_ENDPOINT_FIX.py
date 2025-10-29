# SHARES BUY ENDPOINT FIX

# Your frontend is calling: POST /api/shares/buy/
# But your backend doesn't have this endpoint or it's rejecting the data

# ===== FRONTEND DATA BEING SENT =====
FRONTEND_DATA = '''
// From Shares.js, this is what's being sent:
await sharesAPI.buyShares({
  amount: parseFloat(totalAmount),           // e.g. 100.00
  payment_method: formData.paymentMethod,   // e.g. "paypal"
  shares_purchased: parseInt(formData.shares), // e.g. 1
  notes: formData.comments                  // e.g. "test purchase"
});
'''

# ===== REQUIRED BACKEND ENDPOINT =====
BACKEND_BUY_SHARES_VIEW = '''
# shares/views.py - Add this view

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_shares(request):
    """Buy shares endpoint"""
    
    try:
        # Get data from request
        shares_requested = request.data.get('shares_purchased')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        notes = request.data.get('notes', '')
        
        # Validate required fields
        if not shares_requested or not amount or not payment_method:
            return Response({
                'error': 'Missing required fields: shares_purchased, amount, payment_method'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create share purchase record
        share_purchase = SharePurchase.objects.create(
            user=request.user,
            shares_requested=int(shares_requested),
            amount=float(amount),
            payment_method=payment_method,
            notes=notes,
            status='pending'  # Default status
        )
        
        return Response({
            'success': True,
            'message': 'Share purchase request submitted successfully!',
            'share_purchase_id': share_purchase.id,
            'shares_requested': share_purchase.shares_requested,
            'amount': str(share_purchase.amount),
            'status': share_purchase.status
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response({
            'error': f'Invalid data format: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
'''

# ===== REQUIRED MODEL =====
SHARE_PURCHASE_MODEL = '''
# Add to models.py if not exists

class SharePurchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('cash', 'Cash'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    shares_requested = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.shares_requested} shares - {self.status}"
'''

# ===== URL PATTERN =====
SHARES_URLS = '''
# shares/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_user_shares, name='get_user_shares'),        # GET /api/shares/
    path('buy/', views.buy_shares, name='buy_shares'),              # POST /api/shares/buy/
]
'''

# ===== GET SHARES VIEW =====
GET_SHARES_VIEW = '''
# shares/views.py - Also add this view for GET /api/shares/

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_shares(request):
    """Get user's share purchases"""
    
    shares = SharePurchase.objects.filter(user=request.user).order_by('-created_at')
    
    shares_data = [{
        'id': share.id,
        'shares_purchased': share.shares_requested,  # Frontend expects this field name
        'amount': str(share.amount),
        'payment_method': share.payment_method,
        'status': share.status,
        'notes': share.notes,
        'created_at': share.created_at.isoformat(),
    } for share in shares]
    
    # Return in standardized format
    return Response({'shares': shares_data})
'''

# ===== MIGRATION COMMAND =====
MIGRATION_COMMAND = '''
# After adding the model, run:
python manage.py makemigrations shares
python manage.py migrate
'''

print("SHARES BUY ENDPOINT FIX CREATED")
print("Backend team needs to:")
print("1. Add SharePurchase model")
print("2. Add buy_shares view")
print("3. Add get_user_shares view") 
print("4. Configure URLs")
print("5. Run migrations")