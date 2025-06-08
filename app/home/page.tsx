"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CustomGPT, StudyGroup } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customGPTs, setCustomGPTs] = useState<CustomGPT[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [showCreateGPT, setShowCreateGPT] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [joinPasscode, setJoinPasscode] = useState('');

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));

    // Load custom GPTs and groups
    loadCustomGPTs();
    loadStudyGroups();
  }, [router]);

  const loadCustomGPTs = () => {
    // Load from localStorage (in production, this would be an API call)
    const storedGPTs = localStorage.getItem('customGPTs');
    if (storedGPTs) {
      setCustomGPTs(JSON.parse(storedGPTs));
    } else {
      // Demo GPTs
      const demoGPTs: CustomGPT[] = [
        {
          id: '1',
          name: 'B.Ed Curriculum Helper',
          description: 'Specialized in Ghana B.Ed curriculum guidance',
          instructions: 'Help students understand the B.Ed curriculum structure',
          createdBy: 'system',
          creatorName: 'GenAITEd Ghana',
          institution: 'All Institutions',
          isPublic: true,
          category: 'curriculum',
          icon: '📚',
          sharedWith: [],
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Lesson Plan Assistant',
          description: 'Creates lesson plans for Ghanaian classrooms',
          instructions: 'Generate lesson plans following Ghana Education Service standards',
          createdBy: 'system',
          creatorName: 'GenAITEd Ghana',
          institution: 'All Institutions',
          isPublic: true,
          category: 'teaching',
          icon: '📝',
          sharedWith: [],
          createdAt: new Date(),
        },
      ];
      localStorage.setItem('customGPTs', JSON.stringify(demoGPTs));
      setCustomGPTs(demoGPTs);
    }
  };

  const loadStudyGroups = () => {
    const storedGroups = localStorage.getItem('studyGroups');
    if (storedGroups) {
      setStudyGroups(JSON.parse(storedGroups));
    }
  };

  const createCustomGPT = (gptData: Partial<CustomGPT>) => {
    const newGPT: CustomGPT = {
      id: Date.now().toString(),
      name: gptData.name || '',
      description: gptData.description || '',
      instructions: gptData.instructions || '',
      createdBy: user?.id || '',
      creatorName: user?.name || '',
      institution: user?.institution || '',
      passcode: gptData.passcode,
      isPublic: gptData.isPublic || false,
      category: gptData.category || 'general',
      icon: gptData.icon || '🤖',
      sharedWith: [],
      createdAt: new Date(),
    };

    const updatedGPTs = [...customGPTs, newGPT];
    localStorage.setItem('customGPTs', JSON.stringify(updatedGPTs));
    setCustomGPTs(updatedGPTs);
    setShowCreateGPT(false);
  };

  const joinWithPasscode = () => {
    // Check study groups
    const group = studyGroups.find(g => g.passcode === joinPasscode);
    if (group) {
      // Add user to group
      group.members.push(user?.id || '');
      localStorage.setItem('studyGroups', JSON.stringify(studyGroups));
      alert(`Joined group: ${group.name}`);
      setJoinPasscode('');
      setShowJoinGroup(false);
      return;
    }

    // Check custom GPTs
    const gpt = customGPTs.find(g => g.passcode === joinPasscode);
    if (gpt) {
      // Add user to GPT's shared list
      gpt.sharedWith.push(user?.id || '');
      localStorage.setItem('customGPTs', JSON.stringify(customGPTs));
      alert(`Access granted to: ${gpt.name}`);
      setJoinPasscode('');
      setShowJoinGroup(false);
      return;
    }

    alert('Invalid passcode!');
  };

  const startChat = (gptId?: string) => {
    if (gptId) {
      router.push(`/chat?gpt=${gptId}`);
    } else {
      router.push('/chat');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <GhanaFlag />
              <h1 className="text-2xl font-bold text-gray-800">GenAITEd Ghana</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.institution}</span>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/');
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600 mb-4">
            Ready to continue your learning journey? Choose an AI tutor or create your own.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => startChat()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Learning
            </button>
            <button
              onClick={() => setShowJoinGroup(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Join with Passcode
            </button>
          </div>
        </div>

        {/* Custom GPTs Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">AI Tutors</h3>
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
                gpt.sharedWith.includes(user.id) ||
                gpt.institution === user.institution
              )
              .map(gpt => (
                <div key={gpt.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{gpt.icon}</span>
                    {gpt.passcode && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        🔒 Protected
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{gpt.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{gpt.description}</p>
                  <p className="text-xs text-gray-500 mb-4">
                    By {gpt.creatorName} • {gpt.institution}
                  </p>
                  <button
                    onClick={() => startChat(gpt.id)}
                    className="w-full py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Start Chat
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Study Groups Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Study Groups</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {studyGroups
              .filter(group => group.members.includes(user.id))
              .map(group => (
                <div key={group.id} className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-bold text-lg mb-2">{group.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {group.members.length} members
                    </span>
                    <button
                      onClick={() => router.push(`/groups/${group.id}`)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Open Group
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      {/* Create Custom GPT Modal */}
      {showCreateGPT && (
        <CreateGPTModal
          onClose={() => setShowCreateGPT(false)}
          onCreate={createCustomGPT}
        />
      )}

      {/* Join with Passcode Modal */}
      {showJoinGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Join with Passcode</h3>
            <input
              type="text"
              value={joinPasscode}
              onChange={(e) => setJoinPasscode(e.target.value)}
              placeholder="Enter passcode"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={joinWithPasscode}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Join
              </button>
              <button
                onClick={() => {
                  setShowJoinGroup(false);
                  setJoinPasscode('');
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create GPT Modal Component
function CreateGPTModal({ onClose, onCreate }: { 
  onClose: () => void; 
  onCreate: (data: Partial<CustomGPT>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    category: 'general' as const,
    icon: '🤖',
    isPublic: false,
    passcode: '',
  });

  const icons = ['🤖', '📚', '🎓', '👩‍🏫', '🔬', '📝', '💡', '🌟'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Create Custom GPT</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Early Grade Mathematics Tutor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              rows={2}
              placeholder="Brief description of what this GPT does"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
              placeholder="Detailed instructions for the AI (e.g., You are a mathematics tutor specializing in early grade content...)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Icon</label>
            <div className="flex gap-2">
              {icons.map(icon => (
                <button
                  key={icon}
                  onClick={() => setFormData({...formData, icon})}
                  className={`text-2xl p-2 rounded ${
                    formData.icon === icon ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="general">General</option>
              <option value="curriculum">Curriculum</option>
              <option value="teaching">Teaching Methods</option>
              <option value="research">Research</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Passcode (optional - for private sharing)
            </label>
            <input
              type="text"
              value={formData.passcode}
              onChange={(e) => setFormData({...formData, passcode: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Leave empty for no passcode"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
            />
            <label htmlFor="isPublic" className="text-sm">
              Make this GPT public to all users in my institution
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onCreate(formData)}
            disabled={!formData.name || !formData.instructions}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create GPT
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function GhanaFlag() {
  return (
    <div className="w-12 h-9 flex flex-col rounded-sm overflow-hidden shadow-md">
      <div className="bg-red-600 flex-1"></div>
      <div className="bg-yellow-400 flex-1 relative">
        <span className="absolute inset-0 flex items-center justify-center text-black text-xs">★</span>
      </div>
      <div className="bg-green-700 flex-1"></div>
    </div>
  );
}
