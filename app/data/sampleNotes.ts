export interface Note {
  id: string;
  title: string;
  description: string;
  price: number;
  program: string;
  semester: string;
  subject: string;
  thumbnail: string;
  rating: number;
  purchase_count: number;
  seller_name: string;
  created_at: string;
  preview_pages: number;
  total_pages: number;
}

export const sampleNotes: Note[] = [
  // BBA Notes
  {
    id: '1',
    title: 'Business Mathematics - BBA 1st Semester',
    description: 'Comprehensive notes covering all topics of Business Mathematics including Linear Programming, Matrices, and Financial Mathematics. Includes solved examples and practice problems.',
    price: 299,
    program: 'BBA',
    semester: '1st Semester',
    subject: 'Business Mathematics',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop',
    rating: 4.8,
    purchase_count: 156,
    seller_name: 'Prof. Sharma',
    created_at: '2024-01-15',
    preview_pages: 2,
    total_pages: 45
  },
  {
    id: '2',
    title: 'Principles of Management - BBA 2nd Semester',
    description: 'Detailed notes on management principles, functions, and practices. Covers planning, organizing, leading, and controlling with real-world examples.',
    price: 349,
    program: 'BBA',
    semester: '2nd Semester',
    subject: 'Principles of Management',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop',
    rating: 4.7,
    purchase_count: 203,
    seller_name: 'Dr. Karki',
    created_at: '2024-01-20',
    preview_pages: 2,
    total_pages: 52
  },
  {
    id: '3',
    title: 'Business Communication - BBA 3rd Semester',
    description: 'Complete guide to business communication including written, oral, and digital communication skills. Includes email templates and presentation guidelines.',
    price: 249,
    program: 'BBA',
    semester: '3rd Semester',
    subject: 'Business Communication',
    thumbnail: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&auto=format&fit=crop',
    rating: 4.6,
    purchase_count: 178,
    seller_name: 'Ms. Thapa',
    created_at: '2024-02-01',
    preview_pages: 2,
    total_pages: 38
  },

  // BBA-TT Notes
  {
    id: '4',
    title: 'Tourism Management - BBA-TT 1st Semester',
    description: 'Comprehensive notes on tourism management principles, sustainable tourism, and tourism marketing. Includes case studies from Nepal tourism industry.',
    price: 399,
    program: 'BBA-TT',
    semester: '1st Semester',
    subject: 'Tourism Management',
    thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop',
    rating: 4.9,
    purchase_count: 145,
    seller_name: 'Dr. Gurung',
    created_at: '2024-01-18',
    preview_pages: 2,
    total_pages: 48
  },
  {
    id: '5',
    title: 'Tourism Economics - BBA-TT 2nd Semester',
    description: 'Detailed analysis of tourism economics, demand and supply, pricing strategies, and economic impact of tourism. Includes Nepal-specific examples.',
    price: 349,
    program: 'BBA-TT',
    semester: '2nd Semester',
    subject: 'Tourism Economics',
    thumbnail: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
    rating: 4.7,
    purchase_count: 132,
    seller_name: 'Prof. Poudel',
    created_at: '2024-01-25',
    preview_pages: 2,
    total_pages: 42
  },
  {
    id: '6',
    title: 'Tourism Marketing - BBA-TT 3rd Semester',
    description: 'Complete guide to tourism marketing strategies, digital marketing in tourism, and destination marketing. Includes social media marketing guidelines.',
    price: 299,
    program: 'BBA-TT',
    semester: '3rd Semester',
    subject: 'Tourism Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop',
    rating: 4.8,
    purchase_count: 167,
    seller_name: 'Mr. Shrestha',
    created_at: '2024-02-05',
    preview_pages: 2,
    total_pages: 45
  },

  // BCA Notes
  {
    id: '7',
    title: 'Programming Fundamentals - BCA 1st Semester',
    description: 'Comprehensive notes on C programming, data structures, and algorithms. Includes practical examples and coding exercises.',
    price: 399,
    program: 'BCA',
    semester: '1st Semester',
    subject: 'Programming Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    rating: 4.9,
    purchase_count: 245,
    seller_name: 'Prof. Acharya',
    created_at: '2024-01-16',
    preview_pages: 2,
    total_pages: 55
  },
  {
    id: '8',
    title: 'Database Management Systems - BCA 2nd Semester',
    description: 'Complete guide to DBMS, SQL, database design, and normalization. Includes practical database projects and queries.',
    price: 349,
    program: 'BCA',
    semester: '2nd Semester',
    subject: 'Database Management Systems',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop',
    rating: 4.8,
    purchase_count: 198,
    seller_name: 'Dr. Pandey',
    created_at: '2024-01-22',
    preview_pages: 2,
    total_pages: 48
  },
  {
    id: '9',
    title: 'Web Development - BCA 3rd Semester',
    description: 'Comprehensive notes on HTML, CSS, JavaScript, and modern web development frameworks. Includes responsive design and front-end development.',
    price: 299,
    program: 'BCA',
    semester: '3rd Semester',
    subject: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop',
    rating: 4.7,
    purchase_count: 223,
    seller_name: 'Mr. Khanal',
    created_at: '2024-02-03',
    preview_pages: 2,
    total_pages: 42
  }
];

// Additional notes for each program
export const additionalNotes: Note[] = [
  // BBA Additional Notes
  {
    id: '10',
    title: 'Financial Accounting - BBA 4th Semester',
    description: 'Detailed notes on financial accounting principles, journal entries, and financial statements. Includes practical examples and exercises.',
    price: 399,
    program: 'BBA',
    semester: '4th Semester',
    subject: 'Financial Accounting',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    rating: 4.8,
    purchase_count: 167,
    seller_name: 'Prof. Joshi',
    created_at: '2024-02-10',
    preview_pages: 2,
    total_pages: 50
  },
  {
    id: '11',
    title: 'Marketing Management - BBA 5th Semester',
    description: 'Complete guide to marketing principles, strategies, and digital marketing. Includes case studies and marketing plans.',
    price: 349,
    program: 'BBA',
    semester: '5th Semester',
    subject: 'Marketing Management',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
    rating: 4.7,
    purchase_count: 189,
    seller_name: 'Dr. Rana',
    created_at: '2024-02-15',
    preview_pages: 2,
    total_pages: 45
  },

  // BBA-TT Additional Notes
  {
    id: '12',
    title: 'Tourism Planning - BBA-TT 4th Semester',
    description: 'Comprehensive notes on tourism planning, development, and policy. Includes sustainable tourism practices and case studies.',
    price: 399,
    program: 'BBA-TT',
    semester: '4th Semester',
    subject: 'Tourism Planning',
    thumbnail: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop',
    rating: 4.9,
    purchase_count: 134,
    seller_name: 'Prof. Tamang',
    created_at: '2024-02-12',
    preview_pages: 2,
    total_pages: 48
  },
  {
    id: '13',
    title: 'Tourism Law - BBA-TT 5th Semester',
    description: 'Detailed notes on tourism laws, regulations, and legal aspects of tourism business. Includes Nepal tourism laws and international tourism regulations.',
    price: 349,
    program: 'BBA-TT',
    semester: '5th Semester',
    subject: 'Tourism Law',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop',
    rating: 4.6,
    purchase_count: 112,
    seller_name: 'Adv. Bhandari',
    created_at: '2024-02-18',
    preview_pages: 2,
    total_pages: 42
  },

  // BCA Additional Notes
  {
    id: '14',
    title: 'Data Structures and Algorithms - BCA 4th Semester',
    description: 'Complete guide to data structures, algorithms, and their implementation. Includes sorting, searching, and graph algorithms.',
    price: 399,
    program: 'BCA',
    semester: '4th Semester',
    subject: 'Data Structures and Algorithms',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop',
    rating: 4.9,
    purchase_count: 212,
    seller_name: 'Dr. Bhattarai',
    created_at: '2024-02-14',
    preview_pages: 2,
    total_pages: 55
  },
  {
    id: '15',
    title: 'Software Engineering - BCA 5th Semester',
    description: 'Comprehensive notes on software development lifecycle, methodologies, and best practices. Includes project management and quality assurance.',
    price: 349,
    program: 'BCA',
    semester: '5th Semester',
    subject: 'Software Engineering',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-bf19f8fd8865?w=800&auto=format&fit=crop',
    rating: 4.8,
    purchase_count: 178,
    seller_name: 'Prof. Dahal',
    created_at: '2024-02-20',
    preview_pages: 2,
    total_pages: 48
  }
]; 