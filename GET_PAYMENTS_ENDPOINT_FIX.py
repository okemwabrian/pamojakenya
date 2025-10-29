# FIX FOR MISSING GET PAYMENTS ENDPOINT

# Your frontend calls: paymentsAPI.getPayments() -> GET /api/payments/
# You need this view in your Django backend

# ===== PAYMENTS VIEWS.PY =====
GET_PAYMENTS_VIEW = '''
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import MembershipPayment

@csrf_exempt
@require_http_methods(["GET"])
def get_user_payments(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
    payments_data = [{
        'id': payment.id,
        'payment_type': payment.payment_type,
        'amount': str(payment.amount),
        'payment_method': payment.payment_method,
        'status': payment.status,
        'admin_notes': payment.admin_notes,
        'created_at': payment.created_at.isoformat(),
        'updated_at': payment.updated_at.isoformat(),
    } for payment in payments]
    
    return JsonResponse({'payments': payments_data})

@csrf_exempt
@require_http_methods(["POST"])
def create_payment(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        payment = MembershipPayment.objects.create(
            user=request.user,
            payment_type=request.POST.get('payment_type'),
            amount=request.POST.get('amount'),
            payment_method=request.POST.get('payment_method'),
            payment_proof=request.FILES.get('payment_proof'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Payment submitted successfully!',
            'payment_id': payment.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
'''

# ===== PAYMENTS URLS.PY =====
PAYMENTS_URLS = '''
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_user_payments, name='get_user_payments'),  # GET /api/payments/
    path('create/', views.create_payment, name='create_payment'),  # POST /api/payments/create/
]
'''

# ===== MAIN URLS.PY UPDATE =====
MAIN_URLS_UPDATE = '''
# In your main urls.py, make sure you have:
from django.urls import path, include
from payments import views as payment_views

urlpatterns = [
    # ... other patterns ...
    path('api/payments/', payment_views.get_user_payments),  # GET
    path('api/payments/', payment_views.create_payment),     # POST  
    # OR better approach:
    path('api/payments/', include('payments.urls')),
]
'''

# ===== ALTERNATIVE: SINGLE VIEW FOR GET/POST =====
COMBINED_VIEW = '''
from django.views.decorators.http import require_http_methods

@csrf_exempt
def payments_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    if request.method == 'GET':
        # Get user payments
        payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
        payments_data = [{
            'id': payment.id,
            'payment_type': payment.payment_type,
            'amount': str(payment.amount),
            'payment_method': payment.payment_method,
            'status': payment.status,
            'admin_notes': payment.admin_notes,
            'created_at': payment.created_at.isoformat(),
        } for payment in payments]
        
        return JsonResponse({'payments': payments_data})
    
    elif request.method == 'POST':
        # Create new payment
        try:
            payment = MembershipPayment.objects.create(
                user=request.user,
                payment_type=request.POST.get('payment_type'),
                amount=request.POST.get('amount'),
                payment_method=request.POST.get('payment_method'),
                payment_proof=request.FILES.get('payment_proof'),
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Payment submitted successfully!',
                'payment_id': payment.id
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
'''

print("GET PAYMENTS ENDPOINT FIX CREATED")
print("Add the get_user_payments view to your Django backend")
print("Map it to: GET /api/payments/")