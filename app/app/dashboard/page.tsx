"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CustomGPT, StudyGroup } from '@/lib/constants';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customGPTs, setCustomGPTs] = useState<CustomGPT[]>([]);
  const [showCreateGPT, setShowCreateGPT] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    loadCustomGPTs();
  }, [router]);

  const loadCustomGPTs = () => {
    const storedGPTs = localStorage.getItem('customGPTs');
    if (storedGPTs) {
      setCustomGPTs(JSON.parse(storedGPTs));
    }
  };

  const quickLinks = [
    { icon: '💬', label: 'Start AI Chat', href: '/chat', color: 'bg-blue-500' },
    { icon: '👥', label: 'Study Groups', href: '/groups', color: 'bg-green-500' },
    { icon: '📚', label: 'Resources', href: '/resources', color: 'bg-purple-500' },
    { icon: '📊', label: 'My Progress', href: '/progress', color: 'bg-orange-500' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-blue-100 mb-4">{user.institution} • {user.role}</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Start Learning Session
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Join with Passcode
            </button>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {quickLinks.map(link => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow text-center"
            >
              <div className={`w-16 h-16 ${link.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3`}>
                {link.icon}
              </div>
              <span className="font-medium text-gray-800">{link.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your AI Tutors</h2>
            {(user.role === 'teacher' || user.role === 'admin') && (
              <button
                onClick={() => setShowCreateGPT(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Create Custom GPT
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {customGPTs
              .filter(gpt => 
                gpt.isPublic || 
                gpt.createdBy === user.id || 
                gpt.institution === user.institution
              )
              .slice(0, 6)
              .map(gpt => (
                <GPTCard key={gpt.id} gpt={gpt} onStart={() => router.push(`/chat?gpt=${gpt.id}`)} />
              ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateGPT && (
        <CreateGPTModal onClose={() => setShowCreateGPT(false)} onCreate={() => {}} />
      )}
      {showJoinModal && (
        <JoinModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
}

function GPTCard({ gpt, onStart }: { gpt: CustomGPT; onStart: () => void }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{gpt.icon}</span>
        {gpt.passcode && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Protected
          </span>
        )}
      </div>
      <h3 className="font-medium text-gray-800 mb-1">{gpt.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{gpt.description}</p>
      <button
        onClick={onStart}
        className="w-full py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
      >
        Start Chat
      </button>
    </div>
  );
}

// Include CreateGPTModal and JoinModal components here...
