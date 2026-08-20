import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PermissionsPage from './pages/PermissionsPage';
import AIOnboardingPage from './pages/AIOnboardingPage';
import DashboardPage from './pages/DashboardPage';
import NearbyHealthcarePage from './pages/NearbyHealthcarePage';
import AINavigatorPage from './pages/AINavigatorPage';
import HealthTimelinePage from './pages/HealthTimelinePage';
import RemindersPage from './pages/RemindersPage';
import MenstrualCarePage from './pages/MenstrualCarePage';
import PregnancyCompanionPage from './pages/PregnancyCompanionPage';
import HealthEducationPage from './pages/HealthEducationPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// Scroll to top helper component on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Guard for Onboarding / Dashboard auto flow
const AuthRouteGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/permissions" element={<PermissionsPage />} />
      <Route path="/onboarding" element={<AIOnboardingPage />} />

      {/* Authenticated Dashboard Routes */}
      <Route path="/dashboard" element={<AuthRouteGuard><DashboardPage /></AuthRouteGuard>} />
      <Route path="/nearby" element={<AuthRouteGuard><NearbyHealthcarePage /></AuthRouteGuard>} />
      <Route path="/ai-navigator" element={<AuthRouteGuard><AINavigatorPage /></AuthRouteGuard>} />
      <Route path="/timeline" element={<AuthRouteGuard><HealthTimelinePage /></AuthRouteGuard>} />
      <Route path="/reminders" element={<AuthRouteGuard><RemindersPage /></AuthRouteGuard>} />
      <Route path="/menstrual" element={<AuthRouteGuard><MenstrualCarePage /></AuthRouteGuard>} />
      <Route path="/pregnancy" element={<AuthRouteGuard><PregnancyCompanionPage /></AuthRouteGuard>} />
      <Route path="/education" element={<AuthRouteGuard><HealthEducationPage /></AuthRouteGuard>} />
      <Route path="/profile" element={<AuthRouteGuard><ProfileSettingsPage /></AuthRouteGuard>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HealthDataProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </HealthDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
