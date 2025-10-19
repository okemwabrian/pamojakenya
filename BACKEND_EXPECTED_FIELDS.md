# 🔧 BACKEND EXPECTED FIELDS

## 💳 PAYMENT SUBMISSION FIELDS

### **Required Payment Fields:**
```javascript
{
  payment_type: 'activation_fee', // Required: activation_fee|membership_single|membership_double|shares|other
  amount: '150.00', // Required: Decimal number
  description: 'Payment description', // Optional: Text
  payment_method: 'bank_transfer', // Required: bank_transfer|mobile_money|cash|check
  transaction_id: 'TXN123456', // Optional: Reference number
  payment_proof: File // Required: PDF, JPG, PNG file
}
```

### **Django Payment Model Expected:**
```python
class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # Auto-set
    payment_type = models.CharField(max_length=50) # Required
    amount = models.DecimalField(max_digits=10, decimal_places=2) # Required
    description = models.TextField(blank=True) # Optional
    payment_method = models.CharField(max_length=50) # Required
    transaction_id = models.CharField(max_length=100, blank=True) # Optional
    payment_proof = models.FileField(upload_to='payments/') # Required
    status = models.CharField(max_length=20, default='pending') # Auto-set
    created_at = models.DateTimeField(auto_now_add=True) # Auto-set
```

## 📋 APPLICATION SUBMISSION FIELDS

### **Single Membership Required Fields:**
```javascript
{
  membership_type: 'single', // Required
  
  // Primary Applicant - All Required
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@email.com',
  phone: '+1234567890',
  date_of_birth: '1990-01-01', // YYYY-MM-DD format
  id_number: 'ID123456789',
  
  // Address - All Required
  address: '123 Main Street',
  city: 'Minneapolis',
  state: 'Minnesota',
  zip_code: '55401',
  
  // Emergency Contact - All Required
  emergency_name: 'Jane Doe',
  emergency_phone: '+1987654321',
  emergency_relationship: 'spouse', // spouse|parent|sibling|child|friend
  
  // Files - Required
  id_document: File, // PDF, JPG, PNG
  
  // Optional Fields
  children_info: JSON.stringify([]), // JSON string of children array
}
```

### **Double Membership Additional Required Fields:**
```javascript
{
  // All single fields PLUS:
  spouse_first_name: 'Jane', // Required for double
  spouse_last_name: 'Doe', // Required for double
  spouse_date_of_birth: '1992-01-01', // Required for double
  spouse_id_number: 'ID987654321', // Required for double
  spouse_id_document: File, // Required for double
  
  // Optional spouse fields
  spouse_email: 'jane@email.com',
  spouse_phone: '+1987654321',
}
```

## 🎯 CLAIMS SUBMISSION FIELDS

### **Required Claim Fields:**
```javascript
{
  claim_type: 'death', // Required: death|medical|education|emergency
  member_name: 'John Doe', // Required
  relationship: 'self', // Required: self|spouse|child|parent|sibling
  incident_date: '2024-01-01', // Required: YYYY-MM-DD
  amount_requested: '1000.00', // Required: Decimal
  description: 'Detailed description', // Required
  supporting_documents: File // Optional: PDF, JPG, PNG
}
```

## 📄 DOCUMENT SUBMISSION FIELDS

### **Required Document Fields:**
```javascript
{
  title: 'Document Title', // Required
  document_type: 'id_card', // Required
  file: File // Required: PDF, JPG, PNG
}
```

## 📈 SHARE PURCHASE FIELDS

### **Required Share Fields:**
```javascript
{
  number_of_shares: 10, // Required: Integer
  amount_paid: '250.00', // Required: Decimal (number_of_shares * 25)
  payment_proof: File // Required: PDF, JPG, PNG
}
```

## 🔧 BACKEND VALIDATION RULES

### **File Upload Rules:**
- **Allowed formats:** PDF, JPG, JPEG, PNG
- **Max file size:** 5MB per file
- **Required files must be present**

### **Date Format:**
- **All dates:** YYYY-MM-DD format (e.g., '1990-01-01')

### **Decimal Fields:**
- **Amount fields:** Must be valid decimal numbers
- **Example:** '150.00' not '150' or 'abc'

### **Choice Fields:**
- **payment_type:** activation_fee, membership_single, membership_double, shares, other
- **payment_method:** bank_transfer, mobile_money, cash, check
- **claim_type:** death, medical, education, emergency
- **relationship:** self, spouse, child, parent, sibling
- **emergency_relationship:** spouse, parent, sibling, child, friend

## 🚨 COMMON VALIDATION ERRORS

### **Payment Errors:**
1. **Missing payment_proof file**
2. **Invalid amount format** (must be decimal)
3. **Missing payment_type or payment_method**
4. **File too large or wrong format**

### **Application Errors:**
1. **Missing required fields** (any of the 13+ required fields)
2. **Invalid date format** (must be YYYY-MM-DD)
3. **Missing ID document file**
4. **For double: Missing spouse required fields**
5. **For double: Missing spouse_id_document file**

### **Claims Errors:**
1. **Missing required fields** (claim_type, member_name, etc.)
2. **Invalid date format**
3. **Invalid amount_requested format**

## 🔍 DEBUG BACKEND RESPONSE

### **Add to Django Views for Debugging:**
```python
def create(self, request, *args, **kwargs):
    print("=== DEBUG INFO ===")
    print("Request data keys:", list(request.data.keys()))
    print("Request files:", list(request.FILES.keys()))
    print("Request data:", dict(request.data))
    
    # Validate and return detailed errors
    serializer = self.get_serializer(data=request.data)
    if not serializer.is_valid():
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=400)
    
    return super().create(request, *args, **kwargs)
```

This will show exactly what fields are missing or invalid in your Django console.