// User type
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone_number: string;
  wallet_balance: number;
  is_admin: boolean;
  created_at: string;
}

// Course type
export interface Course {
  id: number;
  program: string; // BBA, BBA-TT, BCA
  semester: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  description?: string;
}

// Note type
export interface Note {
  id: number;
  course_id: number;
  user_id: number;
  title: string;
  description?: string;
  price: number;
  file_path: string;
  file_size: number;
  file_type: string;
  download_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  course?: Course;
}

// Transaction type
export interface Transaction {
  id: number;
  note_id: number;
  buyer_id: number;
  seller_id: number;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  stripe_payment_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  note?: Note;
  buyer?: User;
  seller?: User;
}

// Review type
export interface Review {
  id: number;
  note_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  note?: Note;
} 