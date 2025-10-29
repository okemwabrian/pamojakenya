# FIX FOR PAYMENT METHOD VALIDATION ERROR

# ===== UPDATED PAYMENT MODEL =====
UPDATED_PAYMENT_MODEL = '''
class MembershipPayment(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('membership_single', 'Single Membership Fee'),
        ('membership_double', 'Double Membership Fee'),
        ('activation_fee', 'Activation Fee'),
        ('shares', 'Share Purchase'),
        ('other', 'Other'),
    ]
    
    # UPDATED PAYMENT METHOD CHOICES - ADD ALL FRONTEND OPTIONS
    PAYMENT_METHOD_CHOICES = [
        ('mobile_money', 'Mobile Money'),
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('check', 'Check'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_type = models.CharField(max_length=30, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)  # UPDATED
    payment_proof = models.FileField(upload_to='payments/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
'''

# ===== ALTERNATIVE: REMOVE CHOICES VALIDATION =====
ALTERNATIVE_PAYMENT_MODEL = '''
class MembershipPayment(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('membership_single', 'Single Membership Fee'),
        ('membership_double', 'Double Membership Fee'),
        ('activation_fee', 'Activation Fee'),
        ('shares', 'Share Purchase'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_type = models.CharField(max_length=30, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)  # NO CHOICES - ACCEPTS ANY VALUE
    payment_proof = models.FileField(upload_to='payments/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
'''

# ===== MIGRATION COMMAND =====
MIGRATION_COMMAND = '''
# After updating the model, run:
python manage.py makemigrations payments
python manage.py migrate
'''

print("PAYMENT METHOD FIX CREATED")
print("Choose one of two solutions:")
print("1. Add all payment method choices to model")
print("2. Remove choices validation (simpler)")