import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import Membership from './components/Membership';
import SingleApplication from './components/SingleApplication';
import DoubleApplication from './components/DoubleApplication';
import MembershipApplication from './components/MembershipApplication';
import MyApplications from './components/MyApplications';
import AdminApplications from './components/AdminApplications';
import Shares from './components/Shares';
import Payments from './components/Payments';
import Claims from './components/Claims';
import Announcements from './components/Announcements';
import Meetings from './components/Meetings';
import Profile from './components/Profile';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Beneficiaries from './components/Beneficiaries';
import Upgrade from './components/Upgrade';
import ResetPassword from './components/ResetPassword';
import Documents from './components/Documents';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileCompletion from './components/ProfileCompletion';
import ChangePassword from './components/ChangePassword';
import ActivationFeePayment from './components/ActivationFeePayment';
import ConnectionTest from './components/ConnectionTest';

import ActivationWarning from './components/ActivationWarning';
import BackgroundEffects from './components/BackgroundEffects';
import Snackbar from './components/Snackbar';
import { useSnackbar } from './hooks/useSnackbar';

function App() {
  const { snackbar, hideSnackbar } = useSnackbar();

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <BackgroundEffects />
          <Navbar />
          <ActivationWarning />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile-completion" element={<ProtectedRoute><ProfileCompletion /></ProtectedRoute>} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/membership-application" element={<ProtectedRoute><MembershipApplication /></ProtectedRoute>} />
            <Route path="/my-applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
            <Route path="/single-application" element={<SingleApplication />} />
            <Route path="/double-application" element={<DoubleApplication />} />
            <Route path="/admin/applications" element={<ProtectedRoute><AdminApplications /></ProtectedRoute>} />
            <Route path="/shares" element={<ProtectedRoute><Shares /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/user-dashboard/*" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/activation-fee" element={<ProtectedRoute><ActivationFeePayment /></ProtectedRoute>} />
            <Route path="/test-connection" element={<ConnectionTest />} />
          </Routes>
          <Snackbar 
            message={snackbar.message}
            type={snackbar.type}
            isVisible={snackbar.isVisible}
            onClose={hideSnackbar}
            duration={snackbar.duration}
          />
        </div>
        </Router>
      </AuthProvider>
  );
}

export default App;
