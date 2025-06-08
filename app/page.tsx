"use client";

import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { ChatInterface } from '@/components/ChatInterface';
import { GHANA_COLLEGES, GHANA_UNIVERSITIES, User } from '@/lib/constants';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <GhanaFlag />
              <h1 className="text-5xl font-bold text-white">GenAITEd Ghana</h1>
              <GhanaFlag />
            </div>
            <p className="text-xl text-blue-100">
              AI-Powered Voice Learning for Teacher Education
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Welcome to Ghana's Educational Voice Platform
                </h2>
                <p className="text-gray-600">
                  Join {GHANA_COLLEGES.length} Colleges of Education and {GHANA_UNIVERSITIES.length} Universities
                  in revolutionizing teacher education with AI
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <FeatureCard
                  icon="🎙️"
                  title="Voice Conversations"
                  description="Learn through natural voice interactions with AI tutors"
                />
                <FeatureCard
                  icon="📚"
                  title="Curriculum Aligned"
                  description="Content tailored to Ghana's B.Ed curriculum"
                />
                <FeatureCard
                  icon="🌐"
                  title="Multi-Language"
                  description="Support for English, Twi, Ga, Ewe, and more"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Get Started →
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onLogin={handleLogin}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <GhanaFlag small />
              <h1 className="text-2xl font-bold text-gray-800">GenAITEd Ghana</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <InstitutionBadge user={user} />
              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface - LiveKit Playground Style */}
      <main className="flex-1">
        <ChatInterface user={user} />
      </main>
    </div>
  );
}

// Components
function GhanaFlag({ small = false }: { small?: boolean }) {
  const size = small ? 'w-8 h-6' : 'w-12 h-9';
  return (
    <div className={`${size} flex flex-col rounded-sm overflow-hidden shadow-md`}>
      <div className="bg-red-600 flex-1"></div>
      <div className="bg-yellow-400 flex-1 relative">
        <span className="absolute inset-0 flex items-center justify-center text-black text-xs">★</span>
      </div>
      <div className="bg-green-700 flex-1"></div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-blue-50 p-6 rounded-xl text-center hover:bg-blue-100 transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function InstitutionBadge({ user }: { user: User }) {
  return (
    <div className="px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-blue-800">
      {user.institution} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
    </div>
  );
}

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
          {user.name.charAt(0)}
        </div>
        <span className="text-sm font-medium">{user.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          <button
            onClick={() => {
              setShowMenu(false);
              // Add settings modal
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Settings
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              onLogout();
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
