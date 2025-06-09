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
    // Voice recording logic will be added later
    console.log('Voice recording:', !isRecording);
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
      console.log('Sending to backend:', {
        message: inputMessage,
        user_id: user.id,
        user_role: user.role,
        api_url: process.env.NEXT_PUBLIC_API_URL
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          user_id: user.id, // IMPORTANT: Include user.id
          user_role: user.role,
          user_program: user.program,
          user_year: user.year,
          custom_gpt_id: customGPT?.id,
          custom_instructions: customGPT?.enhancedInstructions || systemInstructions,
          conversation_history: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response:', data);
      
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
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-bounce">●</div>
                  <div className="animate-bounce delay-100">●</div>
                  <div className="animate-bounce delay-200">●</div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex gap-2">
            <button
              onClick={toggleVoiceRecording}
              className={`px-4 py-2 rounded-lg ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isRecording ? '🔴'}
            </button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={
                connected 
                  ? "Speak or type your message..." 
                  : "Ask about curriculum, courses, teaching methods..."
              }
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || isRecording}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {customGPT 
              ? `Specialized in ${customGPT.category}. Ask questions related to the course materials.`
              : 'Ask about B.Ed curriculum, course codes (e.g., EPS 111), teaching practice, or assessment methods'
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

          {/* Curriculum Quick Reference */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">📚 Quick Reference</h3>
            <div className="space-y-2 text-sm">
              <details className="group">
                <summary className="cursor-pointer hover:text-blue-600">Year 1 Courses</summary>
                <div className="ml-4 mt-2 text-gray-600">
                  <p className="font-medium">Semester 1:</p>
                  <ul className="ml-2">
                    <li>• EPS 111: Educational Psychology</li>
                    <li>• PFC 111: Professional Practice</li>
                    <li>• LIT 111: Literacy Studies I</li>
                    <li>• NUM 111: Numeracy & Problem Solving</li>
                  </ul>
                  <p className="font-medium mt-2">Semester 2:</p>
                  <ul className="ml-2">
                    <li>• EPS 121: Child Development</li>
                    <li>• CUR 121: Curriculum Studies</li>
                    <li>• ICT 121: Educational Technology</li>
                    <li>• STS 121: School Experience I</li>
                  </ul>
                </div>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer hover:text-blue-600">Teaching Practice</summary>
                <div className="ml-4 mt-2 text-gray-600">
                  <ul>
                    <li>• Year 1: 1 week observation</li>
                    <li>• Year 2: 4 weeks assisted</li>
                    <li>• Year 3: 12 weeks off-campus</li>
                    <li>• Year 4: 6 weeks independent</li>
                  </ul>
                </div>
              </details>
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
              <li>• Ask about specific course codes</li>
              <li>• Request lesson plan templates</li>
              <li>• Get help with assignments</li>
              <li>• Learn about assessment methods</li>
              {customGPT && <li>• This AI uses {customGPT.teacherProfile?.name || 'the teacher'}'s teaching style</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
