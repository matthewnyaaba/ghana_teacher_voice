"use client";

import { useState, useRef } from 'react';
import { CustomGPT } from '@/lib/constants';
import { DEFAULT_VOICES } from '@/lib/voice-avatars';

interface CreateGPTModalProps {
  onClose: () => void;
  onCreate: (data: Partial<CustomGPT>) => void;
  userProfile: any;
}

export function CreateGPTModal({ onClose, onCreate, userProfile }: CreateGPTModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    category: 'general' as const,
    icon: '🤖',
    isPublic: false,
    useCustomVoice: false,
    voiceId: 'default-male',
    avatarUrl: '',
    supportingFiles: [] as File[],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSample, setVoiceSample] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const icons = ['🤖', '📚', '🎓', '👩‍🏫', '🔬', '📝', '💡', '🌟', '🧮', '🎨'];

  // Voice recording functions
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceSample(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record your voice');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      supportingFiles: [...prev.supportingFiles, ...files]
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supportingFiles: prev.supportingFiles.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async () => {
    // In production, upload voice sample and files to storage
    // For now, we'll store references
    
    const gptData: Partial<CustomGPT> = {
      ...formData,
      teacherProfile: {
        id: userProfile.id,
        name: userProfile.name,
        title: userProfile.title || 'Teacher',
        institution: userProfile.institution,
        avatarUrl: formData.avatarUrl || userProfile.avatarUrl,
        voiceId: formData.voiceId,
        voiceSampleUrl: voiceSample ? URL.createObjectURL(voiceSample) : undefined,
      },
      supportingDocuments: formData.supportingFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // In production, upload to storage
      })),
      enhancedInstructions: `
${formData.instructions}

TEACHER CONTEXT:
- Teacher Name: ${userProfile.name}
- Institution: ${userProfile.institution}
- Specialization: ${formData.category}

SUPPORTING MATERIALS:
${formData.supportingFiles.map(f => `- ${f.name}`).join('\n')}

VOICE PERSONALITY:
- Maintain the teaching style and personality of ${userProfile.name}
- Use appropriate examples from Ghanaian context
- Reference the supporting materials when relevant
      `.trim()
    };

    onCreate(gptData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Step 1: Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name your AI Assistant</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., Prof. Kofi's Math Tutor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                rows={2}
                placeholder="Brief description of what this AI assistant does"
              />
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
              <label className="block text-sm font-medium mb-1">Choose an Icon</label>
              <div className="flex gap-2 flex-wrap">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({...formData, icon})}
                    className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                      formData.icon === icon 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Step 2: Instructions & Personality</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Teaching Instructions
                <span className="text-xs text-gray-500 ml-2">
                  (How should your AI assistant teach?)
                </span>
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                rows={6}
                placeholder={`Example:
You are a mathematics teacher specializing in early grade education. 

Your teaching approach:
- Use visual examples and real-world scenarios
- Break down complex problems into simple steps
- Be patient and encouraging with struggling students
- Use Ghanaian contexts (cedis for money problems, local foods for fractions)
- Check understanding frequently
- Provide practice problems with increasing difficulty`}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Good Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Describe your teaching style and methodology</li>
                <li>• Specify the level of students (Year 1, Year 2, etc.)</li>
                <li>• Include any special approaches you use</li>
                <li>• Mention specific topics or areas of focus</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Step 3: Voice & Avatar</h3>
            
            <div>
              <label className="block text-sm font-medium mb-3">Profile Picture</label>
              <div className="flex items-center gap-4">
                {formData.avatarUrl ? (
                  <img 
                    src={formData.avatarUrl} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-3xl">{formData.icon}</span>
                  </div>
                )}
                <div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Upload Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Add your photo or avatar
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Voice Selection</label>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="voiceOption"
                    checked={!formData.useCustomVoice}
                    onChange={() => setFormData({...formData, useCustomVoice: false})}
                  />
                  <div>
                    <p className="font-medium">Use Default Voice</p>
                    <p className="text-sm text-gray-600">
                      Select from professional AI voices
                    </p>
                  </div>
                </label>

                {!formData.useCustomVoice && (
                  <div className="ml-8 space-y-2">
                    {DEFAULT_VOICES.map(voice => (
                      <label key={voice.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="defaultVoice"
                          value={voice.id}
                          checked={formData.voiceId === voice.id}
                          onChange={(e) => setFormData({...formData, voiceId: e.target.value})}
                        />
                        <span>{voice.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="voiceOption"
                    checked={formData.useCustomVoice}
                    onChange={() => setFormData({...formData, useCustomVoice: true})}
                  />
                  <div>
                    <p className="font-medium">Clone My Voice</p>
                    <p className="text-sm text-gray-600">
                      Record a 30-second sample of your voice
                    </p>
                  </div>
                </label>

                {formData.useCustomVoice && (
                  <div className="ml-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">
                      Record yourself reading any text for 30 seconds. Speak clearly and naturally.
                    </p>
                    
                    {!voiceSample ? (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-6 py-3 rounded-lg font-medium ${
                          isRecording 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <audio controls src={URL.createObjectURL(voiceSample)} />
                        <button
                          type="button"
                          onClick={() => setVoiceSample(null)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Record Again
                        </button>
                      </div>
                    )}

                    {isRecording && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-600">Recording...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Step 4: Supporting Materials</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Supporting Documents
                <span className="text-xs text-gray-500 ml-2">
                  (PDFs, slides, notes - max 5 files)
                </span>
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  max={5}
                />
                
                {formData.supportingFiles.length === 0 ? (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Choose Files
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload course materials, notes, or reference documents
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.supportingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {formData.supportingFiles.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        + Add more files
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 bg-amber-50 p-3 rounded-lg">
                <p className="text-sm text-amber-800">
                  📌 These documents will enhance your AI's knowledge about your specific course content
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
              />
              <label htmlFor="isPublic" className="text-sm">
                Make this AI assistant available to all teachers in my institution
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create Custom AI Assistant</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-full h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} style={{ width: '60px' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span>Basic Info</span>
            <span>Instructions</span>
            <span>Voice & Avatar</span>
            <span>Materials</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            ← Previous
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !formData.name) ||
                  (currentStep === 2 && !formData.instructions)
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!formData.name || !formData.instructions}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Create AI Assistant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
