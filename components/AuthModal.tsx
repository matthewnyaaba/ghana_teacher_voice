"use client";

import { useState } from 'react';
import { GHANA_COLLEGES, GHANA_UNIVERSITIES, User } from '@/app/page';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, replace with actual API call:
      // const endpoint = isLogin ? '/auth/login' : '/auth/register';
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate successful login/register
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: isLogin ? 'Test User' : formData.name,
        email: formData.email,
        role: formData.role,
        institution: formData.institution || GHANA_COLLEGES[0],
        institutionType: formData.institutionType,
        program: formData.program,
        year: parseInt(formData.year)
      };

      // Simulate token storage
      localStorage.setItem('token', 'demo-token-' + Date.now());
      onLogin(userData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const institutions = formData.institutionType === 'college' ? GHANA_COLLEGES : GHANA_UNIVERSITIES;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isLogin ? 'Welcome Back!' : 'Join GenAITEd Ghana'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Institution Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="college"
                        checked={formData.institutionType === 'college'}
                        onChange={(e) => setFormData({...formData, institutionType: e.target.value as any, institution: ''})}
                        className="mr-2"
                      />
                      College of Education
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="university"
                        checked={formData.institutionType === 'university'}
                        onChange={(e) => setFormData({...formData, institutionType: e.target.value as any, institution: ''})}
                        className="mr-2"
                      />
                      University
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Your {formData.institutionType === 'college' ? 'College' : 'University'}
                  </label>
                  <select
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select...</option>
                    {institutions.map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                {formData.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Program</label>
                      <select
                        value={formData.program}
                        onChange={(e) => setFormData({...formData, program: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Program</option>
                        <option value="B.Ed Early Grade">B.Ed Early Grade</option>
                        <option value="B.Ed Upper Primary">B.Ed Upper Primary</option>
                        <option value="B.Ed JHS">B.Ed JHS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Year</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Demo credentials: Use any email/password
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
