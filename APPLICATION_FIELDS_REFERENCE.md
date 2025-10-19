# 📋 APPLICATION FIELDS REFERENCE

## 🔧 BACKEND EXPECTED FIELDS

### **SINGLE MEMBERSHIP APPLICATION**
```javascript
const singleApplicationFields = {
  // Required Fields
  membership_type: 'single',
  
  // Primary Applicant - Required
  first_name: 'John',
  last_name: 'Doe', 
  email: 'john@email.com',
  phone: '+1234567890',
  date_of_birth: '1990-01-01',
  id_number: 'ID123456789',
  
  // Address - Required
  address: '123 Main Street',
  city: 'Minneapolis',
  state: 'Minnesota', 
  zip_code: '55401',
  
  // Emergency Contact - Required
  emergency_name: 'Jane Doe',
  emergency_phone: '+1987654321',
  emergency_relationship: 'spouse', // spouse|parent|sibling|child|friend
  
  // Children Info - Optional
  children_info: JSON.stringify([
    {
      name: 'Child Name',
      date_of_birth: '2010-01-01',
      relationship: 'child' // child|stepchild|adopted
    }
  ]),
  
  // Files - Required
  id_document: File, // PDF, JPG, PNG
  
  // Payment Info - Optional (added after payment)
  payment_proof: File,
  payment_amount: 150.00
}
```

### **DOUBLE MEMBERSHIP APPLICATION**
```javascript
const doubleApplicationFields = {
  // Required Fields
  membership_type: 'double',
  
  // Primary Applicant - Required
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@email.com', 
  phone: '+1234567890',
  date_of_birth: '1990-01-01',
  id_number: 'ID123456789',
  
  // Address - Required
  address: '123 Main Street',
  city: 'Minneapolis',
  state: 'Minnesota',
  zip_code: '55401',
  
  // Emergency Contact - Required
  emergency_name: 'Jane Doe',
  emergency_phone: '+1987654321', 
  emergency_relationship: 'spouse',
  
  // Spouse Info - Required for Double
  spouse_first_name: 'Jane',
  spouse_last_name: 'Doe',
  spouse_email: 'jane@email.com', // Optional
  spouse_phone: '+1987654321', // Optional
  spouse_date_of_birth: '1992-01-01',
  spouse_id_number: 'ID987654321',
  
  // Children Info - Optional
  children_info: JSON.stringify([
    {
      name: 'Child 1 Name',
      date_of_birth: '2010-01-01', 
      relationship: 'child'
    },
    {
      name: 'Child 2 Name',
      date_of_birth: '2012-01-01',
      relationship: 'child'
    }
  ]),
  
  // Files - Required
  id_document: File, // Primary applicant ID
  spouse_id_document: File, // Spouse ID - Required for double
  
  // Payment Info - Optional (added after payment)
  payment_proof: File,
  payment_amount: 250.00
}
```

## 📤 FORM DATA SUBMISSION FORMAT

### **Frontend FormData Creation**
```javascript
const createFormData = (formData, files, membershipType) => {
  const submitData = new FormData();
  
  // Add membership type
  submitData.append('membership_type', membershipType);
  
  // Add all text fields
  Object.keys(formData).forEach(key => {
    if (key === 'children_info') {
      // Convert children array to JSON string
      submitData.append(key, JSON.stringify(formData[key]));
    } else if (formData[key]) {
      submitData.append(key, formData[key]);
    }
  });
  
  // Add files
  if (files.id_document) {
    submitData.append('id_document', files.id_document);
  }
  
  if (membershipType === 'double' && files.spouse_id_document) {
    submitData.append('spouse_id_document', files.spouse_id_document);
  }
  
  return submitData;
};
```

## 🔍 FIELD VALIDATION RULES

### **Required Fields - Single**
- `membership_type` ✅
- `first_name` ✅
- `last_name` ✅ 
- `email` ✅
- `phone` ✅
- `date_of_birth` ✅
- `id_number` ✅
- `address` ✅
- `city` ✅
- `state` ✅
- `zip_code` ✅
- `emergency_name` ✅
- `emergency_phone` ✅
- `emergency_relationship` ✅
- `id_document` (File) ✅

### **Additional Required Fields - Double**
- `spouse_first_name` ✅
- `spouse_last_name` ✅
- `spouse_date_of_birth` ✅
- `spouse_id_number` ✅
- `spouse_id_document` (File) ✅

### **Optional Fields - Both Types**
- `spouse_email`
- `spouse_phone`
- `children_info` (JSON array)
- `payment_proof` (File)
- `payment_amount`

## 🎯 BACKEND MODEL FIELDS

### **Django Model Structure**
```python
class MembershipApplication(models.Model):
    # System fields
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    membership_type = models.CharField(max_length=20, choices=[('single', 'Single'), ('double', 'Double')])
    status = models.CharField(max_length=20, default='pending')
    
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
    
    # Payment
    payment_proof = models.FileField(upload_to='applications/payments/', blank=True, null=True)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Admin fields
    admin_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## 📋 COMPLETE FIELD LIST

### **All Possible Fields (32 total)**
1. `membership_type` - Required
2. `first_name` - Required
3. `last_name` - Required
4. `email` - Required
5. `phone` - Required
6. `date_of_birth` - Required
7. `id_number` - Required
8. `address` - Required
9. `city` - Required
10. `state` - Required
11. `zip_code` - Required
12. `emergency_name` - Required
13. `emergency_phone` - Required
14. `emergency_relationship` - Required
15. `spouse_first_name` - Required for double
16. `spouse_last_name` - Required for double
17. `spouse_email` - Optional
18. `spouse_phone` - Optional
19. `spouse_date_of_birth` - Required for double
20. `spouse_id_number` - Required for double
21. `children_info` - Optional JSON array
22. `payment_amount` - Optional
23. `id_document` - Required file
24. `spouse_id_document` - Required file for double
25. `payment_proof` - Optional file
26. `status` - Auto-set to 'pending'
27. `admin_notes` - Admin only
28. `reviewed_by` - Admin only
29. `user` - Auto-set from request.user
30. `created_at` - Auto-set
31. `updated_at` - Auto-set
32. `id` - Auto-generated primary key

## 🔄 API ENDPOINT

```javascript
// POST /api/applications/
const response = await fetch('/api/applications/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    // Don't set Content-Type for FormData
  },
  body: formData // FormData object with all fields
});
```