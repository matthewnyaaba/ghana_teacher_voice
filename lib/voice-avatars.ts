export interface VoiceProfile {
  id: string;
  name: string;
  voiceId?: string; // ElevenLabs voice ID
  voiceUrl?: string; // URL to voice sample
  avatarUrl?: string; // Profile picture URL
  isDefault: boolean;
}

export const DEFAULT_VOICES: VoiceProfile[] = [
  {
    id: 'default-male',
    name: 'Default Male Teacher',
    voiceId: 'default-male',
    avatarUrl: '/avatars/default-male.png',
    isDefault: true
  },
  {
    id: 'default-female',
    name: 'Default Female Teacher',
    voiceId: 'default-female',
    avatarUrl: '/avatars/default-female.png',
    isDefault: true
  }
];

export interface TeacherProfile {
  id: string;
  name: string;
  title: string; // e.g., "Senior Mathematics Lecturer"
  institution: string;
  avatarUrl?: string;
  voiceId?: string;
  voiceSampleUrl?: string;
  bio?: string;
}
