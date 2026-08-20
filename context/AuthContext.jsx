import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('naricare_auth') === 'true';
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('naricare_onboarded') === 'true';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('naricare_user');
    return saved ? JSON.parse(saved) : {
      name: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      phone: '+91 98765 43210',
      age: 28,
      preferredLanguage: 'en',
      femaleDoctorsOnly: true,
      homeDiagnostics: true,
      transportAssistance: true,
      existingConditions: ['Mild Anemia'],
      radius: '10 km'
    };
  });

  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('naricare_permissions');
    return saved ? JSON.parse(saved) : {
      location: true,
      notifications: true,
      microphone: true
    };
  });

  useEffect(() => {
    localStorage.setItem('naricare_auth', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('naricare_onboarded', hasCompletedOnboarding);
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    localStorage.setItem('naricare_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('naricare_permissions', JSON.stringify(permissions));
  }, [permissions]);

  const login = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    setIsAuthenticated(true);
  };

  const signup = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    setIsAuthenticated(true);
    setHasCompletedOnboarding(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('naricare_auth');
  };

  const completeOnboarding = (preferences) => {
    setUser((prev) => ({ ...prev, ...preferences }));
    setHasCompletedOnboarding(true);
  };

  const updatePermissions = (newPermissions) => {
    setPermissions((prev) => ({ ...prev, ...newPermissions }));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      hasCompletedOnboarding,
      user,
      permissions,
      login,
      signup,
      logout,
      completeOnboarding,
      updatePermissions,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
