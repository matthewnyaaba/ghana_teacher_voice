"use client";

import { useState, useEffect, useRef } from 'react';
import { User, CustomGPT } from '@/lib/constants';

// Base URL for backend API, injected via Vercel env var
const API = process.env.NEXT_PUBLIC_API_URL!;

interface ChatInterfaceProps {
  user: User;
  customGPT?: CustomGPT | null;
  systemInstructions?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    webSearch?: boolean;
    curriculum?: boolean;
    model?: string;
  };
}

export function ChatInterface({ user, customGPT, systemInstructions }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with custom GPT greeting
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: customGPT 
        ? `Hello ${user.name}! I'm ${customGPT.name}, created by ${customGPT.teacherProfile?.name || customGPT.creatorName}. ${customGPT.description} How can I help you today?`
        : `Welcome ${user.name}! I'm your AI learning assistant for Ghana's B.Ed curriculum. I have deep knowledge of all courses, teaching methods, and educational policies. How can I help you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user.name, customGPT]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    console.log('Voice recording:', !isRecording);
  };

  const connectToVoice = async () => {
    setIsConnecting(true);
    try {
      console.log('🎤 Token request to:', `${API}/token`);
      const response = await fetch(`${API}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: `ghana-edu-${user.id}-${customGPT?.id || 'general'}`,
          participant_name: user.name,
          role: user.role,
          institution: user.institution,
          custom_gpt_id: customGPT?.id,
          teacher_profile: customGPT?.teacherProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnected(true);
        setIsVoiceActive(true);
        console.log('LiveKit token received:', data.token);
        console.log('Connect to:', data.url);
      } else {
        const errorText = await response.text();
        console.error('Token API error:', errorText);
        throw new Error(`Token request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect to voice. Please check your connection.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('✉️ Chat request to:', `${API}/chat`, { message: inputMessage });
      const response = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          user_id: user.id,
          user_role: user.role,
          user_program: user.program,
          user_year: user.year,
          custom_gpt_id: customGPT?.id,
          custom_instructions: customGPT?.enhancedInstructions || systemInstructions,
          conversation_history: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const data = await response.json();
      console.log('🤖 AI replied:', data);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        metadata: {
          webSearch: data.used_web_search || false,
          curriculum: data.curriculum_context || true,
          model: data.model || 'gpt-4',
        },
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the server. Please check your internet connection and try again.',
        timestamp: new Date(),
        metadata: {
          model: 'Error',
        },
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Teacher Avatar */}
              {customGPT?.teacherProfile?.avatarUrl ? (
                <img 
                  src={customGPT.teacherProfile.avatarUrl} 
                  alt={customGPT.teacherProfile.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                  {customGPT?.icon || '🎓'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {customGPT?.name || 'Ghana B.Ed Curriculum Assistant'}
                </h2>
                <p className="text-sm text-gray-600">
                  {customGPT?.teacherProfile 
                    ? `${customGPT.teacherProfile.name} • ${customGPT.teacherProfile.title}`
                    : 'Powered by Ghana Education Service Standards'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {connected && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">
