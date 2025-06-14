import { API_CONFIG } from '../config/api';
import { User } from '../types/notebazaar';

export interface AdminStats {
  totalUsers: number;
  activeNotes: number;
}

export interface UserData extends User {
  created_at: string;
  updated_at: string;
}

const API_URL = `${API_CONFIG.API_BASE_URL}/admin`;

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await fetch(`${API_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
};

export const getAllUsers = async (): Promise<UserData[]> => {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const updateUserStatus = async (userId: number, isActive: boolean): Promise<UserData> => {
  const res = await fetch(`${API_URL}/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!res.ok) throw new Error('Failed to update user status');
  return res.json();
};

export const deleteUser = async (userId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
};

export default {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
}; 