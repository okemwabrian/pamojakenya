# Add these views to your existing Django backend views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def submit_activation_fee(request):
    try:
        payment_method = request.POST.get('payment_method')
        transaction_id = request.POST.get('transaction_id')
        amount = request.POST.get('amount')
        notes = request.POST.get('notes')
        evidence_file = request.FILES.get('evidence_file')
        
        # Save to your existing model
        # ActivationFeePayment.objects.create(...)
        
        return JsonResponse({
            'success': True,
            'message': 'Payment submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_single_application(request):
    try:
        # Handle all the form fields
        data = {
            'firstName': request.POST.get('firstName'),
            'lastName': request.POST.get('lastName'),
            'email': request.POST.get('email'),
            'phoneMain': request.POST.get('phoneMain'),
            'address1': request.POST.get('address1'),
            'city': request.POST.get('city'),
            'stateProvince': request.POST.get('stateProvince'),
            'zip': request.POST.get('zip'),
            'spouseCellPhone': request.POST.get('spouseCellPhone'),
        }
        id_document = request.FILES.get('id_document')
        
        # Save to your existing model
        # SingleApplication.objects.create(**data, id_document=id_document)
        
        return JsonResponse({
            'success': True,
            'message': 'Application submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def submit_double_application(request):
    try:
        # Handle double application fields including step parents/siblings
        data = {
            'first_name': request.POST.get('first_name'),
            'last_name': request.POST.get('last_name'),
            'email': request.POST.get('email'),
            'step_parent_1': request.POST.get('step_parent_1'),
            'step_sibling_1': request.POST.get('step_sibling_1'),
        }
        
        return JsonResponse({
            'success': True,
            'message': 'Application submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def buy_shares(request):
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        payment_method = data.get('payment_method')
        shares_purchased = data.get('shares_purchased')
        
        return JsonResponse({
            'success': True,
            'message': 'Share purchase submitted successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)