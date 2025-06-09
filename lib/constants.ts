export const GHANA_COLLEGES = [
  'Abetifi Presbyterian College of Education',
  'Aburi Presbyterian Women\'s College of Education',
  'Ada College of Education',
  'Agogo Presbyterian Women\'s College of Education',
  'Akrokerri College of Education',
  'Akropong Wesley College of Education',
  'Al-Faruq College of Education',
  'Amedzofe E.P. College of Education',
  'Atebubu College of Education',
  'Bagabaga College of Education',
  'Berekum College of Education',
  'Bia Lamplighter College of Education',
  'Dambai College of Education',
  'E.P. College of Education, Bimbilla',
  'Enchi College of Education',
  'Evangelical Presbyterian College of Education',
  'Foso College of Education',
  'Gambaga College of Education',
  'Gbewaa College of Education',
  'Holy Child College of Education',
  'Jasikan College of Education',
  'Kibi Presbyterian College of Education',
  'Komenda College of Education',
  'Mampong Technical College of Education',
  'McCoy College of Education',
  'Mount Mary College of Education',
  'Nusrat Jahan Ahmadiyya College of Education',
  'OLA College of Education',
  'Peki College of Education',
  'Presbyterian College of Education, Akropong',
  'Presbyterian Women\'s College of Education',
  'SDA College of Education',
  'St. Ambrose College of Education',
  'St. Francis College of Education',
  'St. John Bosco\'s College of Education',
  'St. Joseph\'s College of Education',
  'St. Louis College of Education',
  'St. Monica\'s College of Education',
  'St. Teresa\'s College of Education',
  'St. Vincent College of Education',
  'Tamale College of Education',
  'Tumu College of Education',
  'Wesley College of Education',
  'Wiawso College of Education',
  'Sefwi Wiawso College of Education',
  'Offinso College of Education',
  'Akatsi College of Education',
  'Other_University,
];

export const GHANA_UNIVERSITIES = [
  'University of Cape Coast',
  'University of Education, Winneba',
  'University of Ghana',
  'Kwame Nkrumah University of Science and Technology',
  'University for Development Studies',
  'Valley View University',
  'Catholic University of Ghana'
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  institution: string;
  institutionType: 'college' | 'university';
  program?: string;
  year?: number;
}

export interface CustomGPT {
  id: string;
  name: string;
  description: string;
  instructions: string;
  createdBy: string;
  creatorName: string;
  institution: string;
  passcode?: string;
  isPublic: boolean;
  category: 'curriculum' | 'teaching' | 'research' | 'general';
  icon: string;
  sharedWith: string[];
  createdAt: Date;
  
  // New fields for enhanced GPTs
  teacherProfile?: {
    id: string;
    name: string;
    title: string;
    institution: string;
    avatarUrl?: string;
    voiceId?: string;
    voiceSampleUrl?: string;
  };
  supportingDocuments?: {
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  enhancedInstructions?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  institution: string;
  members: string[];
  admins: string[];
  customGPTs: string[];
  passcode: string;
  createdAt: Date;
  program?: string;
  year?: number;
  semester?: number;
}
