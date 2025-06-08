"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, CustomGPT } from '@/lib/constants';
import { ChatInterface } from '@/components/ChatInterface';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gptId = searchParams.get('gpt');
  
  const [user, setUser] = useState<User | null>(null);
  const [selectedGPT, setSelectedGPT] = useState<CustomGPT | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));

    // Load selected GPT if ID provided
    if (gptId) {
      const storedGPTs = localStorage.getItem('customGPTs');
      if (storedGPTs) {
        const gpts = JSON.parse(storedGPTs);
        const gpt = gpts.find((g: CustomGPT) => g.id === gptId);
        setSelectedGPT(gpt);
      }
    }
  }, [gptId, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/home')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </button>
              <h1 className="text-xl font-bold text-gray-800">
                {selectedGPT ? selectedGPT.name : 'AI Learning Assistant'}
              </h1>
            </div>
            <span className="text-sm text-gray-600">{user.institution}</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <ChatInterface 
          user={user} 
          customGPT={selectedGPT}
          systemInstructions={selectedGPT?.instructions}
        />
      </main>
    </div>
  );
}
