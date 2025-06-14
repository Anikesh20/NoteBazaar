import { API_CONFIG } from '../config/api';
import { Course } from '../types/notebazaar';

const API_URL = `${API_CONFIG.API_BASE_URL}/courses`;

export const fetchCourses = async (params?: any): Promise<Course[]> => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_URL}${query}`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
};

export const fetchCourseById = async (id: number): Promise<Course> => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch course');
  return res.json();
}; 