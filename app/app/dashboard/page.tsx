"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CustomGPT, StudyGroup } from '@/lib/constants';
import { CreateGPTModal } from '@/components/CreateGPTModal';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customGPTs, setCustomGPTs] = useState<CustomGPT[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [showCreateGPT, setShowCreateGPT] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    loadData(userData.id);
  }, [router]);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      // Load custom GPTs
      const { data: gpts, error: gptsError } = await supabase
        .from('custom_gpts')
        .select('*')
        .or(`created_by.eq.${userId},is_public.eq.true`);

      if (!gptsError && gpts) {
        setCustomGPTs(gpts);
      }

      // Load study groups
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (!memberError && memberData) {
        const groupIds = memberData.map(m => m.group_id);
        if (groupIds.length > 0) {
          const { data: groups, error: groupsError } = await supabase
            .from('study_groups')
            .select('*')
            .in('id', groupIds);

          if (!groupsError && groups) {
            setStudyGroups(groups);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinWithCode = async () => {
    if (!user) return;

    try {
      // Try to find a Custom GPT with this passcode
      const { data: gpt, error: gptError } = await supabase
        .from('custom_gpts')
        .select('*')
        .eq('passcode', joinCode)
        .single();

      if (gpt && !gptError) {
        alert(`Successfully joined class: ${gpt.name}`);
        setJoinCode('');
        setShowJoinModal(false);
        loadData(user.id);
        return;
      }

      // Try to find a Study Group with this passcode
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('passcode', joinCode)
        .single();

      if (group && !groupError) {
        // Add user to group
        const { error: joinError } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            is_admin: false
          });

        if (!joinError) {
          alert(`Successfully joined group: ${group.name}`);
          setJoinCode('');
          setShowJoinModal(false);
          loadData(user.id);
          return;
        }
      }

      alert('Invalid join code!');
    } catch (error) {
      console.error('Error joining:', error);
      alert('Error joining. Please try again.');
    }
  };

  const createStudyGroup = async (groupData: Partial<StudyGroup>) => {
    if (!user) return;

    try {
      const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create the group
      const { data: newGroup, error: groupError } = await supabase
        .from('study_groups')
        .insert({
          name: groupData.name,
          description: groupData.description,
          institution: user.institution,
          passcode: passcode,
          program: user.program,
          year: user.year,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          is_admin: true
        });

      if (memberError) throw memberError;

      setShowCreateGroup(false);
      loadData(user.id);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const createCustomGPT = async (gptData: Partial<CustomGPT>) => {
    if (!user) return;

    try {
      const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: newGPT, error } = await supabase
        .from('custom_gpts')
        .insert({
          ...gptData,
          created_by: user.id,
          creator_name: user.name,
          institution: user.institution,
          passcode: passcode,
        })
        .select()
        .single();

      if (error) throw error;

      setShowCreateGPT(false);
      loadData(user.id);
    } catch (error) {
      console.error('Error creating GPT:', error);
      alert('Failed to create AI assistant. Please try again.');
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter GPTs based on access
  const myGPTs = customGPTs.filter(gpt => 
    gpt.is_public || 
    gpt.created_by === user.id ||
    gpt.institution === user.institution
  );

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
                  {gpt.passcode && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Code: {gpt.passcode}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-800 mb-1">{gpt.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{gpt.description}</p>
                <p className="text-xs text-gray-500 mb-3">By {gpt.creator_name}</p>
                <button
                  onClick={() => {
                    localStorage.setItem('selectedGPT', JSON.stringify(gpt));
                    router.push('/chat');
                  }}
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
            {studyGroups.map(group => (
              <div key={group.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Code: {group.passcode}
                  </span>
                  <button
                    onClick={() => {
                      localStorage.setItem('selectedGroup', JSON.stringify(group));
                      router.push('/groups');
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Create Study Group Modal */}
      {showCreateGroup && user.role === 'student' && (
        <CreateStudyGroupModal
          user={user}
          onClose={() => setShowCreateGroup(false)}
          onCreate={createStudyGroup}
        />
      )}

      {/* Create Custom GPT Modal */}
      {showCreateGPT && (user.role === 'teacher' || user.role === 'admin') && (
        <CreateGPTModal
          onClose={() => setShowCreateGPT(false)}
          onCreate={createCustomGPT}
          userProfile={{
            id: user.id,
            name: user.name,
            institution: user.institution,
            title: user.role === 'teacher' ? 'Teacher' : 'Administrator'
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
