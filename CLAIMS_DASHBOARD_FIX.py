# CLAIMS AND MEMBERSHIP DASHBOARD FIX

# ===== BACKEND - Add these models to models.py =====
CLAIMS_MODEL = '''
class Claim(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processing', 'Processing'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)
    supporting_documents = models.FileField(upload_to='claims/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True)
    amount_approved = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
'''

# ===== BACKEND - Add these views to views.py =====
CLAIMS_VIEWS = '''
# SUBMIT CLAIM
@csrf_exempt
@require_http_methods(["POST"])
def submit_claim(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        claim = Claim.objects.create(
            user=request.user,
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            amount_requested=request.POST.get('amount_requested'),
            supporting_documents=request.FILES.get('supporting_documents'),
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Claim submitted successfully!',
            'claim_id': claim.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# GET USER'S CLAIMS
@csrf_exempt
def get_user_claims(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    claims = Claim.objects.filter(user=request.user).order_by('-created_at')
    claims_data = [{
        'id': claim.id,
        'title': claim.title,
        'description': claim.description,
        'amount_requested': str(claim.amount_requested),
        'status': claim.status,
        'admin_response': claim.admin_response,
        'amount_approved': str(claim.amount_approved) if claim.amount_approved else None,
        'created_at': claim.created_at.isoformat(),
        'updated_at': claim.updated_at.isoformat(),
    } for claim in claims]
    
    return JsonResponse({'claims': claims_data})

# GET USER DASHBOARD DATA
@csrf_exempt
def get_user_dashboard(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    # Get user profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Get membership applications
    applications = MembershipApplication.objects.filter(user=request.user).order_by('-created_at')
    applications_data = [{
        'id': app.id,
        'membership_type': app.membership_type,
        'status': app.status,
        'created_at': app.created_at.isoformat(),
        'admin_notes': app.admin_notes,
    } for app in applications]
    
    # Get claims
    claims = Claim.objects.filter(user=request.user).order_by('-created_at')
    claims_data = [{
        'id': claim.id,
        'title': claim.title,
        'status': claim.status,
        'amount_requested': str(claim.amount_requested),
        'created_at': claim.created_at.isoformat(),
    } for claim in claims]
    
    # Get payments
    payments = MembershipPayment.objects.filter(user=request.user).order_by('-created_at')
    payments_data = [{
        'id': payment.id,
        'payment_type': payment.payment_type,
        'amount': str(payment.amount),
        'status': payment.status,
        'created_at': payment.created_at.isoformat(),
    } for payment in payments]
    
    # Get shares
    shares = SharePurchase.objects.filter(user=request.user).order_by('-created_at')
    shares_data = [{
        'id': share.id,
        'shares_requested': share.shares_requested,
        'amount': str(share.amount),
        'status': share.status,
        'created_at': share.created_at.isoformat(),
    } for share in shares]
    
    return JsonResponse({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        },
        'profile': {
            'membership_type': profile.membership_type,
            'membership_status': profile.membership_status,
            'shares_owned': profile.shares_owned,
            'phone': profile.phone,
        },
        'applications': applications_data,
        'claims': claims_data,
        'payments': payments_data,
        'shares': shares_data,
        'stats': {
            'total_applications': len(applications_data),
            'total_claims': len(claims_data),
            'total_payments': len(payments_data),
            'total_shares': len(shares_data),
        }
    })
'''

# ===== BACKEND - Add these URLs to urls.py =====
CLAIMS_URLS = '''
# Add to urlpatterns:
path('api/claims/submit/', views.submit_claim, name='submit_claim'),
path('api/claims/', views.get_user_claims, name='get_user_claims'),
path('api/user/dashboard/', views.get_user_dashboard, name='get_user_dashboard'),
'''

# ===== FRONTEND - Update UserDashboard.js =====
FRONTEND_DASHBOARD_UPDATE = '''
import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await userAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center py-5">Error loading dashboard</div>;
  }

  const { user, profile, applications, claims, payments, shares, stats } = dashboardData;

  return (
    <div className="container py-4">
      <h2>Welcome, {user.first_name || user.username}!</h2>
      
      {/* Membership Status */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Membership Status</h5>
              <p><strong>Type:</strong> {profile.membership_type}</p>
              <p><strong>Status:</strong> 
                <span className={`badge ${profile.membership_status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                  {profile.membership_status}
                </span>
              </p>
              <p><strong>Shares Owned:</strong> {profile.shares_owned}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Quick Stats</h5>
              <p>Applications: {stats.total_applications}</p>
              <p>Claims: {stats.total_claims}</p>
              <p>Payments: {stats.total_payments}</p>
              <p>Share Purchases: {stats.total_shares}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>My Applications</h5>
            </div>
            <div className="card-body">
              {applications.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id}>
                          <td>{app.membership_type}</td>
                          <td>
                            <span className={`badge ${app.status === 'approved' ? 'bg-success' : app.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>{new Date(app.created_at).toLocaleDateString()}</td>
                          <td>{app.admin_notes || 'No notes'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No applications found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>My Claims</h5>
            </div>
            <div className="card-body">
              {claims.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map(claim => (
                        <tr key={claim.id}>
                          <td>{claim.title}</td>
                          <td>${claim.amount_requested}</td>
                          <td>
                            <span className={`badge ${claim.status === 'approved' ? 'bg-success' : claim.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                              {claim.status}
                            </span>
                          </td>
                          <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No claims found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
'''

# ===== FRONTEND - Update api.js =====
API_UPDATE = '''
// Add to userAPI in api.js:
export const userAPI = {
  // ... existing methods
  getDashboard: () => api.get('/user/dashboard/'),
  getClaims: () => api.get('/claims/'),
  submitClaim: (data) => api.post('/claims/submit/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
'''

print("CLAIMS AND DASHBOARD FIX READY!")
print("Tell your backend team to:")
print("1. Add CLAIMS_MODEL to models.py")
print("2. Add CLAIMS_VIEWS to views.py") 
print("3. Add CLAIMS_URLS to urls.py")
print("4. Run: python manage.py makemigrations")
print("5. Run: python manage.py migrate")
print("6. Reload PythonAnywhere web app")
print("")
print("Frontend updates:")
print("1. Update UserDashboard.js with FRONTEND_DASHBOARD_UPDATE")
print("2. Update api.js with API_UPDATE")
print("")
print("This will fix:")
print("✅ Claims visibility in dashboard")
print("✅ Membership status display")
print("✅ Complete user dashboard with all data")
print("✅ Claims submission and viewing")