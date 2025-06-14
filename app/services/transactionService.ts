import { API_CONFIG } from '../config/api';
import { Transaction } from '../types/notebazaar';

const API_URL = `${API_CONFIG.API_BASE_URL}/transactions`;

export const purchaseNote = async (noteId: number, token: string): Promise<Transaction> => {
  const res = await fetch(`${API_URL}/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ note_id: noteId }),
  });
  if (!res.ok) throw new Error('Failed to purchase note');
  return res.json();
};

export const fetchTransactions = async (token: string): Promise<Transaction[]> => {
  const res = await fetch(`${API_URL}/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}; 