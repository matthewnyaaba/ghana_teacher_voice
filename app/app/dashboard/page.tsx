"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CustomGPT, StudyGroup } from '@/lib/constants';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customGPTs, setCustomGPTs] = useState<CustomGPT[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [showCreateGPT, setShowCreateGPT] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    loadCustomGPTs();
    loadStudyGroups();
  }, [router]);

  const loadCustomGPTs = () => {
    const storedGPTs = localStorage.getItem('customGPTs');
    if (storedGPTs) {
      setCustomGPTs(JSON.parse(storedGPTs));
    } else {
      // Initialize with default curriculum GPTs
      const defaultGPTs: CustomGPT[] = [
        {
          id: 'curriculum-1',
          name: 'B.Ed General Curriculum Guide',
          description: 'Complete guide for all B.Ed programs',
          instructions: 'Help students navigate the B.Ed curriculum',
          createdBy: 'system',
          creatorName: 'GenAITEd Ghana',
          institution: 'All Institutions',
          isPublic: true,
          category: 'curriculum',
          icon: '📚',
          sharedWith: [],
          createdAt: new Date(),
        }
      ];
      localStorage.setItem('customGPTs', JSON.stringify(defaultGPTs));
      setCustomGPTs(defaultGPTs);
    }
  };

  const loadStudyGroups = () => {
    const storedGroups = localStorage.getItem('studyGroups');
    if (storedGroups) {
      setStudyGroups(JSON.parse(storedGroups));
    }
  };

  const joinWithCode = () => {
    // Try to join a Custom GPT (class)
    const gpt = customGPTs.find(g => g.passcode === joinCode);
    if (gpt) {
      if (!gpt.sharedWith.includes(user?.id || '')) {
        gpt.sharedWith.push(user?.id || '');
        localStorage.setItem('customGPTs', JSON.stringify(customGPTs));
        alert(`Successfully joined class: ${gpt.name}`);
      } else {
        alert('You are already in this class!');
      }
      setJoinCode('');
      setShowJoinModal(false);
      loadCustomGPTs();
      return;
    }

    // Try to join a Study Group
    const group = studyGroups.find(g => g.passcode === joinCode);
    if (group) {
      if (!group.members.includes(user?.id || '')) {
        group.members.push(user?.id || '');
        localStorage.setItem('studyGroups', JSON.stringify(studyGroups));
        alert(`Successfully joined group: ${group.name}`);
      } else {
        alert('You are already in this group!');
      }
      setJoinCode('');
      setShowJoinModal(false);
      loadStudyGroups();
      return;
    }

    alert('Invalid join code!');
  };

  const createStudyGroup = (groupData: Partial<StudyGroup>) => {
    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: groupData.name || '',
      description: groupData.description || '',
      institution: user?.institution || '',
      members: [user?.id || ''],
      admins: [user?.id || ''],
      customGPTs: [],
      passcode: generatePasscode(),
      createdAt: new Date(),
      program: user?.program,
      year: user?.year,
      semester: groupData.semester || 1,
    };

    const updatedGroups = [...studyGroups, newGroup];
    localStorage.setItem('studyGroups', JSON.stringify(updatedGroups));
    setStudyGroups(updatedGroups);
    setShowCreateGroup(false);
  };

  const generatePasscode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Filter GPTs and Groups based on user access
  const myGPTs = customGPTs.filter(gpt => 
    gpt.isPublic || 
    gpt.createdBy === user?.id || 
    gpt.sharedWith.includes(user?.id || '') ||
    (gpt.institution === user?.institution && gpt.category === 'curriculum')
  );

  const myGroups = studyGroups.filter(group => 
    group.members.includes(user?.id || '')
  );

  const availableGroups = studyGroups.filter(group => 
    group.institution === user?.institution &&
    group.program === user?.program &&
    group.year === user?.year &&
    !group.members.includes(user?.id || '')
  );

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-blue-100 mb-1">{user.institution}</p>
          <p className="text-blue-100 mb-4">
            {user.role === 'student' && user.program && `${user.program} • Year ${user.year}`}
            {user.role === 'teacher' && 'Teacher'}
            {user.role === 'admin' && 'Administrator'}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
            >
              📚 General Curriculum Chat
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800"
            >
              🔑 Join with Code
            </button>
            {user.role === 'student' && (
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                👥 Create Study Group
              </button>
            )}
            {(user.role === 'teacher' || user.role === 'admin') && (
              <button
                onClick={() => setShowCreateGPT(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                🤖 Create Custom GPT
              </button>
            )}
          </div>
        </div>

        {/* My Classes (Custom GPTs) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {user.role === 'student' ? 'My Classes' : 'My Custom GPTs'}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {myGPTs.map(gpt => (
              <div key={gpt.id} className="border rounded-lg p-4 hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{gpt.icon}</span>
                  <div className="flex gap-2">
                    {gpt.passcode && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Code: {gpt.passcode}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-medium text-gray-800 mb-1">{gpt.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{gpt.description}</p>
                <p className="text-xs text-gray-500 mb-3">By {gpt.creatorName}</p>
                <button
                  onClick={() => router.push(`/chat?gpt=${gpt.id}`)}
                  className="w-full py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  Enter Class
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Study Groups */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Study Groups</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {myGroups.map(group => (
              <div key={group.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{group.members.length} members</span>
                  <div className="flex gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Code: {group.passcode}
                    </span>
                    <button
                      onClick={() => router.push(`/groups/${group.id}`)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Groups in Same Program/Year */}
        {user.role === 'student' && availableGroups.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Available Groups in {user.program} - Year {user.year}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {availableGroups.map(group => (
                <div key={group.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <button
                    onClick={() => {
                      setJoinCode(group.passcode);
                      joinWithCode();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Join Group
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Join with Code</h3>
            <p className="text-gray-600 mb-4">
              Enter the code shared by your teacher or classmates
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              className="w-full px-4 py-2 border rounded-lg mb-4 uppercase"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button
                onClick={joinWithCode}
                disabled={joinCode.length !== 6}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Join
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Study Group Modal (Students only) */}
      {showCreateGroup && user.role === 'student' && (
        <CreateStudyGroupModal
          user={user}
          onClose={() => setShowCreateGroup(false)}
          onCreate={createStudyGroup}
        />
      )}

      {/* Create Custom GPT Modal (Teachers/Admins only) */}
      {showCreateGPT && (user.role === 'teacher' || user.role === 'admin') && (
        <CreateGPTModal
          onClose={() => setShowCreateGPT(false)}
          onCreate={(gptData) => {
            const newGPT: CustomGPT = {
              id: Date.now().toString(),
              name: gptData.name || '',
              description: gptData.description || '',
              instructions: gptData.instructions || '',
              createdBy: user?.id || '',
              creatorName: user?.name || '',
              institution: user?.institution || '',
              passcode: generatePasscode(),
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
          }}
        />
      )}
    </div>
  );
}

// Create Study Group Modal Component
function CreateStudyGroupModal({ user, onClose, onCreate }: {
  user: User;
  onClose: () => void;
  onCreate: (data: Partial<StudyGroup>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    semester: 1,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Create Study Group</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Math Study Group"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              placeholder="What will this group focus on?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Semester</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
          <p className="text-sm text-gray-600">
            This group will be available to all {user.program} Year {user.year} students
          </p>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onCreate(formData)}
            disabled={!formData.name}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Create Group
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

// Keep the existing CreateGPTModal component...
