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
      <main className="h-screen">
        <ChatInterface 
          user={user} 
          customGPT={selectedGPT}
          systemInstructions={selectedGPT?.enhancedInstructions || selectedGPT?.instructions}
        />
      </main>
    </div>
  );
}
