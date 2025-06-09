"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { GHANA_COLLEGES, GHANA_UNIVERSITIES, User } from '@/lib/constants';

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      router.push('/dashboard');
    }

    // Check if login parameter is present
    if (searchParams.get('login') === 'true') {
      setShowAuth(true);
    }
  }, [router, searchParams]);

  const handleLogin = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuth(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to GenAITEd Ghana
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Revolutionizing teacher education across Ghana with AI-powered voice learning
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Empowering Ghana's Future Educators
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                Join {GHANA_COLLEGES.length} Colleges of Education and {GHANA_UNIVERSITIES.length} Universities
              </p>
              <p className="text-gray-600">
                Experience personalized AI tutoring aligned with Ghana's B.Ed curriculum
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <FeatureCard
                icon="🎙️"
                title="Voice-Powered Learning"
                description="Natural conversations with AI tutors in English and local languages"
              />
              <FeatureCard
                icon="📚"
                title="Curriculum Aligned"
                description="Content tailored to Ghana Education Service standards"
              />
              <FeatureCard
                icon="👥"
                title="Collaborative Learning"
                description="Join study groups and share custom AI tutors"
              />
              <FeatureCard
                icon="🔬"
                title="Research Support"
                description="Access latest educational research and teaching methods"
              />
              <FeatureCard
                icon="📊"
                title="Track Progress"
                description="Monitor your learning journey with detailed analytics"
              />
              <FeatureCard
                icon="🌍"
                title="Inclusive Education"
                description="Support for diverse learners and teaching contexts"
              />
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
              >
                Start Your Journey →
              </button>
              <p className="mt-4 text-sm text-gray-600">
                Free for all students and teachers in Ghana's educational institutions
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <StatCard number="47" label="Colleges of Education" />
            <StatCard number="7" label="Universities" />
            <StatCard number="15K+" label="Active Learners" />
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      )}
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

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center text-white">
      <div className="text-3xl font-bold">{number}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
}
