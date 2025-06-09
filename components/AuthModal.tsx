"use client";

import { useState } from 'react';
import { GHANA_COLLEGES, GHANA_UNIVERSITIES, User } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    institutionType: 'college' as 'college' | 'university',
    institution: '',
    program: '',
    year: '1'
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create user in Supabase
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          institution: formData.institution || GHANA_COLLEGES[0],
          institution_type: formData.institutionType,
          program: formData.program || null,
          year: formData.year ? parseInt(formData.year) : null
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      // Store in localStorage for session
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginData.email)
        .single();

      if (error || !data) {
        setError('User not found. Please check your email or register.');
        return;
      }

      // Store in localStorage for session
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const institutions = formData.institutionType === 'college' ? GHANA_COLLEGES : GHANA_UNIVERSITIES;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Welcome Back!' : 'Join GenAITEd Ghana'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            
            <input
              type="password"
              placeholder="Password (not required for demo)"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            
            <input
              type="password"
              placeholder="Password (not required for demo)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as any})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, institutionType: 'college'})}
                className={`flex-1 py-2 rounded-lg ${
                  formData.institutionType === 'college' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                College
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, institutionType: 'university'})}
                className={`flex-1 py-2 rounded-lg ${
                  formData.institutionType === 'university' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                University
              </button>
            </div>

            <select
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Select Institution</option>
              {institutions.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>

            {formData.role === 'student' && (
              <>
                <input
                  type="text"
                  placeholder="Program (e.g., B.Ed Early Grade)"
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}
        
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="w-full mt-4 text-blue-600 hover:underline"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
