import { API_CONFIG } from '../config/api';
import { Note } from '../types/notebazaar';

const API_URL = `${API_CONFIG.API_BASE_URL}/notes`;

export const fetchNotes = async (params?: any): Promise<Note[]> => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_URL}${query}`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
};

export const fetchNoteById = async (id: number): Promise<Note> => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch note');
  return res.json();
};

export const uploadNote = async (noteData: FormData, token: string): Promise<Note> => {
  const res = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: noteData,
  });
  if (!res.ok) throw new Error('Failed to upload note');
  return res.json();
};

export const updateNote = async (id: number, noteData: Partial<Note>, token: string): Promise<Note> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
};

export const deleteNote = async (id: number, token: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete note');
}; 