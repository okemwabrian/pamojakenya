# Database Migration Commands for Updated Pamoja Backend

## Step 1: Create Migration Files
Run these commands in your Django backend directory:

```bash
# Create migrations for the new fields
python manage.py makemigrations

# If you need to create migrations for specific models:
python manage.py makemigrations --name add_spouse_cell_phone
python manage.py makemigrations --name add_step_family_fields
python manage.py makemigrations --name update_payment_methods
```

## Step 2: Apply Migrations
```bash
# Apply all pending migrations
python manage.py migrate
```

## Step 3: Create Superuser (if needed)
```bash
python manage.py createsuperuser
```

## Step 4: Collect Static Files (for production)
```bash
python manage.py collectstatic
```

## Manual SQL Commands (if needed)

If you need to manually add the new fields to existing tables:

### For SingleApplication table:
```sql
ALTER TABLE your_app_singleapplication 
ADD COLUMN spouseCellPhone VARCHAR(20) DEFAULT '';
```

### For DoubleApplication table:
```sql
ALTER TABLE your_app_doubleapplication 
ADD COLUMN step_parent_1 VARCHAR(100) DEFAULT '';

ALTER TABLE your_app_doubleapplication 
ADD COLUMN step_parent_2 VARCHAR(100) DEFAULT '';

ALTER TABLE your_app_doubleapplication 
ADD COLUMN step_sibling_1 VARCHAR(100) DEFAULT '';

ALTER TABLE your_app_doubleapplication 
ADD COLUMN step_sibling_2 VARCHAR(100) DEFAULT '';

ALTER TABLE your_app_doubleapplication 
ADD COLUMN step_sibling_3 VARCHAR(100) DEFAULT '';
```

### Update Payment Method Choices:
The payment method choices are handled in the model definition, so no SQL changes needed.
Just update your models.py with the new PAYMENT_METHOD_CHOICES.

## Verification Commands

After migration, verify the changes:

```bash
# Check if migrations were applied
python manage.py showmigrations

# Inspect the database schema
python manage.py dbshell
# Then run: \d your_app_singleapplication (PostgreSQL) or DESCRIBE your_app_singleapplication; (MySQL)
```

## Testing the New Fields

Test the new fields by creating test data:

```python
# In Django shell (python manage.py shell)
from your_app.models import SingleApplication, DoubleApplication

# Test SingleApplication with new spouseCellPhone field
single_app = SingleApplication.objects.create(
    firstName="Test",
    lastName="User",
    email="test@example.com",
    phoneMain="123-456-7890",
    spouseCellPhone="098-765-4321",  # New field
    address1="123 Test St",
    city="Test City",
    stateProvince="Test State",
    zip="12345",
    declarationAccepted=True
)

# Test DoubleApplication with new step family fields
double_app = DoubleApplication.objects.create(
    first_name="Test",
    last_name="User",
    email="test@example.com",
    confirm_email="test@example.com",
    phone="123-456-7890",
    step_parent_1="Step Parent 1",  # New field
    step_sibling_1="Step Sibling 1",  # New field
    address_1="123 Test St",
    city="Test City",
    state_province="Test State",
    zip_postal="12345",
    constitution_agreed=True
)
```