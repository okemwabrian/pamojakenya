# Updated Django Models for Pamoja Application System
# Add these to your Django backend models.py

from django.db import models
from django.contrib.auth.models import User

class SingleApplication(models.Model):
    # Personal Information
    firstName = models.CharField(max_length=100)
    middleName = models.CharField(max_length=100, blank=True)
    lastName = models.CharField(max_length=100)
    email = models.EmailField()
    phoneMain = models.CharField(max_length=20)
    
    # Address Information
    address1 = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    stateProvince = models.CharField(max_length=100)
    zip = models.CharField(max_length=20)
    
    # Family Information
    spouse = models.CharField(max_length=100, blank=True)
    spousePhone = models.CharField(max_length=20, blank=True)
    spouseCellPhone = models.CharField(max_length=20, blank=True)  # NEW FIELD
    authorizedRep = models.CharField(max_length=100, blank=True)
    
    # Children
    child1 = models.CharField(max_length=100, blank=True)
    child2 = models.CharField(max_length=100, blank=True)
    child3 = models.CharField(max_length=100, blank=True)
    child4 = models.CharField(max_length=100, blank=True)
    child5 = models.CharField(max_length=100, blank=True)
    
    # Parents
    parent1 = models.CharField(max_length=100, blank=True)
    parent2 = models.CharField(max_length=100, blank=True)
    spouseParent1 = models.CharField(max_length=100, blank=True)
    spouseParent2 = models.CharField(max_length=100, blank=True)
    
    # Siblings
    sibling1 = models.CharField(max_length=100, blank=True)
    sibling2 = models.CharField(max_length=100, blank=True)
    
    # Documents
    id_document = models.FileField(upload_to='applications/single/')
    declarationAccepted = models.BooleanField(default=False)
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.firstName} {self.lastName} - Single Application"

class DoubleApplication(models.Model):
    # Personal Information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    confirm_email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Address Information
    address_1 = models.CharField(max_length=200)
    address_2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    zip_postal = models.CharField(max_length=20)
    
    # Family Information
    spouse_name = models.CharField(max_length=100, blank=True)
    spouse_phone = models.CharField(max_length=20, blank=True)
    authorized_rep = models.CharField(max_length=100, blank=True)
    
    # Children
    child_1 = models.CharField(max_length=100, blank=True)
    child_2 = models.CharField(max_length=100, blank=True)
    child_3 = models.CharField(max_length=100, blank=True)
    child_4 = models.CharField(max_length=100, blank=True)
    child_5 = models.CharField(max_length=100, blank=True)
    
    # Parents
    parent_1 = models.CharField(max_length=100, blank=True)
    parent_2 = models.CharField(max_length=100, blank=True)
    spouse_parent_1 = models.CharField(max_length=100, blank=True)
    spouse_parent_2 = models.CharField(max_length=100, blank=True)
    
    # Step Parents (NEW FIELDS)
    step_parent_1 = models.CharField(max_length=100, blank=True)
    step_parent_2 = models.CharField(max_length=100, blank=True)
    
    # Siblings
    sibling_1 = models.CharField(max_length=100, blank=True)
    sibling_2 = models.CharField(max_length=100, blank=True)
    sibling_3 = models.CharField(max_length=100, blank=True)
    
    # Step Siblings (NEW FIELDS)
    step_sibling_1 = models.CharField(max_length=100, blank=True)
    step_sibling_2 = models.CharField(max_length=100, blank=True)
    step_sibling_3 = models.CharField(max_length=100, blank=True)
    
    # Documents
    id_document = models.FileField(upload_to='applications/double/')
    constitution_agreed = models.BooleanField(default=False)
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - Double Application"

class SharePurchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Admin Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    # Updated Payment Method Choices
    PAYMENT_METHOD_CHOICES = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='share_purchases')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    shares_requested = models.IntegerField()
    shares_assigned = models.IntegerField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_shares')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - ${self.amount} - {self.status}"

class ActivationFeePayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    # Updated Payment Method Choices
    PAYMENT_METHOD_CHOICES = [
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
        ('zelle', 'Zelle'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activation_payments')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    notes = models.TextField(blank=True)
    evidence_file = models.FileField(upload_to='activation_payments/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_activations')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - Activation Fee - {self.status}"