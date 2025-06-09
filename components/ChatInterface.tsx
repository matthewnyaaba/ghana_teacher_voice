"use client";

import { useState, useEffect, useRef } from 'react';
import { User, CustomGPT } from '@/lib/constants';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with custom GPT greeting
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: customGPT 
        ? `Hello ${user.name}! I'm ${customGPT.name}, created by ${customGPT.teacherProfile?.name || customGPT.creatorName}. ${customGPT.description} How can I help you today?`
        : `Welcome ${user.name}! I'm your AI learning assistant. How can I help you with your studies today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user.name, customGPT]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectToVoice = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
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
        // Here you would initialize LiveKit with the token
        // Example: initializeLiveKit(data.token, data.url, data.room);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect to voice. Please check your connection.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response (in production, this would call your API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputMessage),
        timestamp: new Date(),
        metadata: {
          webSearch: inputMessage.toLowerCase().includes('search'),
          curriculum: true,
          model: 'GPT-4',
        },
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (message: string): string => {
    if (customGPT) {
      return `[As ${customGPT.teacherProfile?.name || customGPT.name}] Based on our ${customGPT.category} focus, here's my guidance on that...`;
    }
    return "Let me help you understand that better. Based on Ghana's B.Ed curriculum...";
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
                  {customGPT?.icon || '🤖'}
                </div>
              )}
              
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {customGPT?.name || 'AI Learning Assistant'}
                </h2>
                <p className="text-sm text-gray-600">
                  {customGPT?.teacherProfile 
                    ? `${customGPT.teacherProfile.name} • ${customGPT.teacherProfile.title}`
                    : 'General Curriculum Guide'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {connected && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Voice Active</span>
                </div>
              )}
              
              {!connected && (
                <button
                  onClick={connectToVoice}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      🎤 Start Voice Chat
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Supporting Documents */}
          {customGPT?.supportingDocuments && customGPT.supportingDocuments.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  📚 Course Materials ({customGPT.supportingDocuments.length} files)
                </summary>
                <div className="mt-2 space-y-1">
                  {customGPT.supportingDocuments.map((doc, idx) => (
                    
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:underline"
                    >
                      📄 {doc.name}
                    </a>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    {customGPT?.teacherProfile?.avatarUrl ? (
                      <img 
                        src={customGPT.teacherProfile.avatarUrl} 
                        alt="Teacher"
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                        {customGPT?.icon || 'AI'}
                      </div>
                    )}
                    <span className="font-medium text-gray-800">
                      {customGPT?.teacherProfile?.name || 'AI Assistant'}
                    </span>
                    {message.metadata?.curriculum && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        📚 Curriculum
                      </span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                connected 
                  ? "Speak or type your message..." 
                  : "Type a message or start voice chat..."
              }
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {isVoiceActive && (
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`px-4 py-2 rounded-lg ${
                  isVoiceActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {isVoiceActive ? '⏹' : '🎤'}
              </button>
            )}
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {customGPT 
              ? `Specialized in ${customGPT.category}. Ask questions related to the course materials.`
              : 'Ask about any topic in the Ghana B.Ed curriculum'
            }
          </p>
        </div>
      </div>

      {/* Right Sidebar - Session Info */}
      <div className="w-80 bg-white border-l p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Session Info */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Session Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Student:</span>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Institution:</span>
                <p className="font-medium">{user.institution}</p>
              </div>
              {user.program && (
                <div>
                  <span className="text-gray-600">Program:</span>
                  <p className="font-medium">{user.program} • Year {user.year}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Messages:</span>
                <p className="font-medium">{messages.length}</p>
              </div>
            </div>
          </div>

          {/* AI Assistant Info */}
          {customGPT && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">About This Assistant</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{customGPT.description}</p>
                
                {customGPT.teacherProfile && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Created by:</p>
                    <p className="text-sm">{customGPT.teacherProfile.name}</p>
                    <p className="text-xs text-gray-600">{customGPT.teacherProfile.title}</p>
                  </div>
                )}
                
                {customGPT.passcode && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">Share Code:</p>
                    <p className="text-lg font-mono font-bold text-blue-900">{customGPT.passcode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Click "Start Voice Chat" to speak naturally</li>
              <li>• Reference course materials in your questions</li>
              <li>• Ask for examples from Ghanaian context</li>
              {customGPT && <li>• This AI uses {customGPT.teacherProfile?.name || 'the teacher'}'s teaching style</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
