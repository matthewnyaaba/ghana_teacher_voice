"use client";

import { useState, useEffect, useRef } from 'react';
import { User } from '@/lib/constants';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState('general');
  const [language, setLanguage] = useState('English');
  const [showCustomTutorModal, setShowCustomTutorModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Tutors
  const tutors = [
    { id: 'curriculum', name: 'Curriculum Explorer', icon: '🎓', description: 'Ghana B.Ed curriculum guide' },
    { id: 'methods', name: 'Teaching Methods', icon: '👩‍🏫', description: 'Best practices for classroom' },
    { id: 'subject', name: 'Subject Specialist', icon: '📚', description: 'Deep dive into subjects' },
    { id: 'research', name: 'Research Assistant', icon: '🔬', description: 'Latest educational research' },
  ];

  // Quick Actions
  const quickActions = [
    { id: 'curriculum', icon: '📖', label: 'View Curriculum', action: () => handleQuickAction('curriculum') },
    { id: 'progress', icon: '📊', label: 'My Progress', action: () => handleQuickAction('progress') },
    { id: 'groups', icon: '👥', label: 'Study Groups', action: () => handleQuickAction('groups') },
    { id: 'notes', icon: '📝', label: 'Take Notes', action: () => handleQuickAction('notes') },
    { id: 'help', icon: '❓', label: 'Help & Support', action: () => handleQuickAction('help') },
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Welcome ${user.name}! I'm your AI learning assistant. How can I help you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user.name]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputMessage, selectedTutor),
        timestamp: new Date(),
        metadata: {
          webSearch: inputMessage.toLowerCase().includes('search'),
          curriculum: selectedTutor === 'curriculum',
          model: 'GPT-4',
        },
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (message: string, tutor: string): string => {
    // Simulate different responses based on tutor
    const responses: Record<string, string> = {
      curriculum: "Based on the Ghana B.Ed curriculum, here's what you need to know...",
      methods: "For effective teaching methods in Ghanaian classrooms, consider...",
      subject: "Let me help you understand this subject better...",
      research: "According to recent educational research in Ghana...",
      general: "I'd be happy to help you with that. Let me explain...",
    };
    return responses[tutor] || responses.general;
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      curriculum: "Here's your B.Ed curriculum overview...",
      progress: "Your learning progress: 65% complete this semester...",
      groups: "Available study groups in your institution...",
      notes: "Opening note-taking interface...",
      help: "How can I assist you today?",
    };
    
    const actionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: actionMessages[action] || "Feature coming soon!",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, actionMessage]);
  };

  const connectToVoice = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: `ghana-edu-${user.id}`,
          participant_name: user.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnected(true);
        // Here you would initialize LiveKit with the token
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - AI Tutors */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <h3 className="font-bold text-gray-800 mb-4">AI Tutors</h3>
        <div className="space-y-2">
          {tutors.map(tutor => (
            <button
              key={tutor.id}
              onClick={() => setSelectedTutor(tutor.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedTutor === tutor.id 
                  ? 'bg-blue-50 border-blue-300 border' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tutor.icon}</span>
                <div>
                  <div className="font-medium">{tutor.name}</div>
                  <div className="text-xs text-gray-600">{tutor.description}</div>
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowCustomTutorModal(true)}
            className="w-full p-3 rounded-lg text-left hover:bg-gray-50 border-2 border-dashed border-gray-300"
          >
            <div className="text-center text-gray-600">
              + Create Custom Tutor
            </div>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">AI Learning Assistant</h2>
              <p className="text-sm text-gray-600">
                Voice-enabled • Web search active • {user.institution}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm"
              >
                <option>English</option>
                <option>Twi</option>
                <option>Ga</option>
                <option>Ewe</option>
                <option>Dagbani</option>
              </select>
              <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                Connected
              </span>
            </div>
          </div>
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
                    : 'bg-white border'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      AI
                    </div>
                    <span className="font-medium">AI Assistant</span>
                    {message.metadata?.webSearch && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">🔍 Web Search</span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-2 opacity-70">
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
              placeholder="Type a message or use voice..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={connectToVoice}
              disabled={isConnecting}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              title="Start voice conversation"
            >
              🎤
            </button>
            <button
              onClick={handleSendMessage}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: Say "search for latest..." to trigger web search, or ask about specific curriculum topics
          </p>
        </div>
      </div>

      {/* Right Sidebar - Session Info & Quick Actions */}
      <div className="w-80 bg-white border-l p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Session Info</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Institution:</span>
              <p className="font-medium">{user.institution}</p>
            </div>
            <div>
              <span className="text-gray-600">Role:</span>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <span className="text-gray-600">Messages:</span>
              <p className="font-medium">{messages.length}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={action.action}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3"
              >
                <span className="text-xl">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Tutor Modal */}
      {showCustomTutorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create Custom Tutor</h3>
            <p className="text-gray-600 mb-4">Feature coming soon!</p>
            <button
              onClick={() => setShowCustomTutorModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
