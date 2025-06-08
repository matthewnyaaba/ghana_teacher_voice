export const GHANA_COLLEGES = [
  'Accra College of Education', 'Ada College of Education',
  'Agogo Presbyterian College of Education', 'Ahafoman College of Education',
  'Akatsi College of Education', 'Akrokerri College of Education',
  'Al-Faruq College of Education', 'Atebubu College of Education',
  'Bagabaga College of Education', 'Berekum College of Education',
  'Dambai College of Education', 'Enchi College of Education',
  'Foso College of Education', 'Gambaga College of Education',
  'Gbewaa College of Education', 'Holy Child College of Education',
  'Jasikan College of Education', 'Kibi Presbyterian College of Education',
  'Komenda College of Education', 'Mampong Technical College of Education',
  'Nusrat Jahan Ahmadiyya College of Education', 'Offinso College of Education',
  'OLA College of Education', 'Peki College of Education',
  'Presbyterian College of Education, Abetifi', 'Presbyterian College of Education, Akropong',
  'Presbyterian Womens College of Education, Agogo', 'SDA College of Education',
  'Sefwi Wiawso College of Education', 'St. Ambrose College of Education',
  'St. Francis College of Education', 'St. John Boscos College of Education',
  'St. Joseph College of Education', 'St. Louis College of Education',
  'St. Monica College of Education', 'St. Teresa College of Education',
  'St. Vincent College of Education', 'Tumu College of Education',
  'Wesley College of Education', 'Bia Lamplighter College of Education',
  'E.P. College of Education, Bimbilla', 'McCoy College of Education',
  'Mount Mary College of Education', 'St. Peter\'s Catholic College of Education',
  'Seventh Day Adventist College of Education, Agona',
  'Tamale College of Education', 'Kpando College of Education'
];

export const GHANA_UNIVERSITIES = [
  'University of Ghana - Department of Teacher Education',
  'University of Cape Coast - Faculty of Educational Foundations',
  'University of Education, Winneba',
  'Kwame Nkrumah University of Science and Technology - College of Humanities',
  'University for Development Studies - Faculty of Education',
  'Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development',
  'University of Professional Studies - Faculty of Education'
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
