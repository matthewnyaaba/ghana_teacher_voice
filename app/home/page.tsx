"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/constants';

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(true); // Assuming you want to show auth initially

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuth(false);
    // Navigate to home page after login
    router.push('/home');
  };

  // If authenticated, you might want to redirect or show different content
  if (isAuthenticated) {
    return null; // Router will handle navigation
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Your authentication component would go here */}
      {showAuth && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-center mb-6">GenAITEd Ghana</h1>
            {/* 
              Here you would have your login form that calls handleLogin
              Example:
              <LoginForm onLogin={handleLogin} />
            */}
            <p className="text-center text-gray-600">
              Please implement your login form here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
