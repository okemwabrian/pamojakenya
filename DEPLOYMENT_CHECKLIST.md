# DEPLOYMENT CHECKLIST - Make Everything Work

## 🚨 CRITICAL FIX NEEDED

### URL Case Issue
- **Wrong:** `https://okemwabrianny.pythonanywhere.com/api` (lowercase)
- **Correct:** `https://Okemwabrianny.pythonanywhere.com/api` (capital O)

### Fix Netlify Environment Variable
1. Go to https://app.netlify.com → pamojake → Environment Variables
2. Update: `REACT_APP_API_URL = https://Okemwabrianny.pythonanywhere.com/api`
3. Redeploy site

## ✅ BACKEND SETUP (Both Local & PythonAnywhere)

### 1. Install Dependencies
```bash
pip install django-cors-headers
```

### 2. Copy Code from `COMPLETE_BACKEND_SETUP.py`
- ✅ Models → `models.py`
- ✅ Views → `views.py`
- ✅ URLs → `urls.py`
- ✅ Settings → `settings.py`

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Restart Servers
- **Local:** `python manage.py runserver`
- **PythonAnywhere:** Reload web app

## ✅ FRONTEND SETUP

### 1. Environment Variables - FIXED ✅
- **Netlify:** Must set `REACT_APP_API_URL = https://Okemwabrianny.pythonanywhere.com/api`
- **Local:** Now uses correct URL by default

### 2. Deploy to Netlify
```bash
npm run build
# Upload to Netlify or auto-deploy from Git
```

## ✅ TEST CONNECTIONS

### 1. Test Backend Directly
- **Local:** http://localhost:8000/api/
- **PythonAnywhere:** https://Okemwabrianny.pythonanywhere.com/api/

### 2. Test Frontend Connections
- **Local:** http://localhost:3000/test-connection
- **Netlify:** https://pamojake.netlify.app/test-connection

### 3. Test Form Submissions
- Single Application Form
- Double Application Form
- Activation Fee Payment
- Share Purchase

## ✅ EXPECTED RESULTS

All API calls should return:
```json
{
  "success": true,
  "message": "Submitted successfully",
  "id": 123
}
```

## 🚨 TROUBLESHOOTING

- **404 Error:** Backend endpoint missing - Add code from `COMPLETE_BACKEND_SETUP.py`
- **CORS Error:** Update CORS settings in Django
- **500 Error:** Check Django logs
- **Network Error:** Check URL spelling (capital O in Okemwabrianny)
- **Current Issue:** URL case mismatch - Fix Netlify environment variable

## 🎯 FINAL TEST

Submit a real form on https://pamojake.netlify.app and verify data appears in Django admin!