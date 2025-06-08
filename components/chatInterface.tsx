"use client";

import { useState, useEffect, useRef } from 'react';
import { User } from '@/app/page';

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

export function ChatInterface({ user }: { user: User }) {
  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'tw', name: 'Twi' },
    { code: 'ga', name: 'Ga' },
    { code: 'ee', name: 'Ewe' },
    { code: 'dag', name: 'Dagbani' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectToVoiceChat = async () => {
    setIsConnecting(true);
    try {
      // In production, get token from your Python backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          room_name: `ghana-edu-${user.id}`,
          participant_name: user.name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const data = await response.json();
      setToken(data.token);

      // Add welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Welcome ${user.name}! I'm your AI learning assistant. I can help you with Ghana's B.Ed curriculum, teaching methods, and answer any educational questions. You can speak to me using the microphone or type your questions below.`,
        timestamp: new Date(),
        metadata: { model: 'GPT-4' }
      }]);

    } catch (error) {
      console.error('Failed to connect:', error);
      // For demo, set a dummy token
      setToken('demo-token');
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Welcome ${user.name}! I'm your AI learning assistant. (Demo Mode - Voice features require connection to your Python backend)`,
        timestamp: new Date(),
        metadata: { model: 'Demo' }
      }]);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${inputText}". In a real implementation, I would process this through the AI model and provide a detailed response based on Ghana's educational curriculum and best practices.`,
        timestamp: new Date(),
        metadata: {
          model: 'GPT-4',
          curriculum: true,
          webSearch: inputText.toLowerCase().includes('latest') || inputText.toLowerCase().includes('current')
        }
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // In production, this would start/stop voice recording
  };

  if (!token) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎙️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to start your AI-powered learning session?
            </h2>
            <p className="text-gray-600 mb-2">
              Connect to your personal AI tutor with voice capabilities
            </p>
            <p className="text-sm text-gray-500">
              Aligned with Ghana's B.Ed curriculum • Multi-language support • Real-time web search
            </p>
          </div>

          <button
            onClick={connectToVoiceChat}
            disabled={isConnecting}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Voice Session
              </span>
            )}
          </button>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold">Curriculum Aligned</h3>
              <p className="text-sm text-gray-600">Ghana B.Ed standards</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-semibold">Web Search</h3>
              <p className="text-sm text-gray-600">Real-time information</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold">Progress Tracking</h3>
              <p className="text-sm text-gray-600">Monitor learning</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">AI Tutors</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <TutorCard
            name="Curriculum Explorer"
            description="Ghana B.Ed curriculum guide"
            icon="🎓"
            active={true}
          />
          <TutorCard
            name="Teaching Methods"
            description="Best practices for classroom"
            icon="👩‍🏫"
          />
          <TutorCard
            name="Subject Specialist"
            description="Deep dive into subjects"
            icon="📚"
          />
          <TutorCard
            name="Research Assistant"
            description="Latest educational research"
            icon="🔬"
          />
        </div>
        <div className="p-4 border-t">
          <button className="w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            + Create Custom Tutor
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">AI Learning Assistant</h2>
              <p className="text-sm text-gray-600">
                Voice-enabled • Web search active • {user.institution}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus connected={true} />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} user={user} />
            ))}

            {isListening && (
              <div className="flex items-center gap-3 text-blue-600">
                <VoiceVisualizer />
                <span>Listening...</span>
              </div>
            )}

            {isSpeaking && (
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
                <span>AI is speaking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type a message or use voice..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
              <button
                onClick={toggleVoice}
                className={`px-6 py-3 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isListening 
                      ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                      : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    }
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: Say "search for latest..." to trigger web search, or ask about specific curriculum topics
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Info */}
      <div className="w-80 bg-white border-l p-4">
        <h3 className="font-semibold mb-4">Session Info</h3>
        <div className="space-y-3">
          <InfoItem label="Institution" value={user.institution} />
          <InfoItem label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
          <InfoItem label="Program" value={user.program || 'N/A'} />
          <InfoItem label="Messages" value={messages.length.toString()} />
        </div>

        <h3 className="font-semibold mt-6 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <QuickAction icon="📖" label="View Curriculum" />
          <QuickAction icon="📊" label="My Progress" />
          <QuickAction icon="👥" label="Study Groups" />
          <QuickAction icon="📝" label="Take Notes" />
          <QuickAction icon="❓" label="Help & Support" />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">💡 Pro Tip</h4>
          <p className="text-xs text-gray-600">
            Ask me to explain concepts in your local language for better understanding!
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function TutorCard({ name, description, icon, active = false }: any) {
  return (
    <div className={`p-4 rounded-lg mb-3 cursor-pointer transition-all ${
      active ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}

function MessageBubble({ message, user }: { message: Message; user: User }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
          AI
        </div>
      )}
      <div className={`max-w-lg ${isUser ? 'order-1' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'
        }`}>
          <p>{message.content}</p>
        </div>
        {message.metadata && (
          <div className="mt-1 flex gap-2 flex-wrap">
            {message.metadata.webSearch && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                🔍 Web Search
              </span>
            )}
            {message.metadata.curriculum && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                📚 Curriculum
              </span>
            )}
            {message.metadata.model && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {message.metadata.model}
              </span>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold order-2">
          {user.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

function VoiceVisualizer() {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1 bg-blue-600 rounded-full voice-bar"
          style={{ height: `${10 + i * 5}px` }}
        />
      ))}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
      <span>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
