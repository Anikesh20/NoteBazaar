import { useCallback, useState } from 'react';
import { additionalNotes, sampleNotes } from '../data/sampleNotes';
import { Note } from '../types/note';
import { useAuth } from './useAuth';

interface NoteFilters {
  search?: string;
  program?: string;
  semester?: string;
  subject?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const useNoteService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  const getNotes = async (filters: NoteFilters = {}): Promise<Note[]> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Combine all notes
      let notes = [...sampleNotes, ...additionalNotes];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        notes = notes.filter(note => 
          note.title.toLowerCase().includes(searchLower) ||
          note.description.toLowerCase().includes(searchLower) ||
          note.subject.toLowerCase().includes(searchLower)
        );
      }

      if (filters.program) {
        notes = notes.filter(note => note.program === filters.program);
      }

      if (filters.semester) {
        notes = notes.filter(note => note.semester === filters.semester);
      }

      if (filters.subject) {
        notes = notes.filter(note => note.subject === filters.subject);
      }

      if (filters.minPrice !== undefined) {
        notes = notes.filter(note => note.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        notes = notes.filter(note => note.price <= filters.maxPrice!);
      }

      return notes;
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getNoteDetails = async (noteId: string): Promise<Note | null> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const allNotes = [...sampleNotes, ...additionalNotes];
      const note = allNotes.find(n => n.id === noteId);

      if (!note) {
        throw new Error('Note not found');
      }

      return note;
    } catch (err) {
      console.error('Error fetching note details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch note details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTrendingNotes = async (): Promise<Note[]> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const allNotes = [...sampleNotes, ...additionalNotes];
      
      // Sort by purchase count and rating
      return allNotes
        .sort((a, b) => (b.purchase_count * b.rating) - (a.purchase_count * a.rating))
        .slice(0, 5);
    } catch (err) {
      console.error('Error fetching trending notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending notes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecentPurchases = async (): Promise<Note[]> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use static sample data for now
      const samplePurchases = [
        {
          id: "1",
          title: "Business Mathematics - BBA 1st Semester",
          description: "Comprehensive notes covering all topics of Business Mathematics for BBA 1st semester students.",
          price: 299,
          rating: 4.5,
          purchase_count: 120,
          seller_name: "Prof. Sharma",
          created_at: new Date().toISOString(),
          program: "BBA",
          semester: "1st Semester",
          subject: "Business Mathematics",
          file_url: "https://example.com/notes/business-math.pdf",
          preview_url: "https://example.com/preview/business-math.pdf",
          status: "published",
          category: "academic"
        },
        {
          id: "2",
          title: "Principles of Management - BBA 2nd Semester",
          description: "Detailed notes on management principles, theories, and practices for BBA students.",
          price: 349,
          rating: 4.8,
          purchase_count: 85,
          seller_name: "Dr. Gupta",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          program: "BBA",
          semester: "2nd Semester",
          subject: "Principles of Management",
          file_url: "https://example.com/notes/management.pdf",
          preview_url: "https://example.com/preview/management.pdf",
          status: "published",
          category: "academic"
        },
        {
          id: "3",
          title: "Business Communication - BBA 3rd Semester",
          description: "Complete guide to business communication skills, presentations, and professional writing.",
          price: 399,
          rating: 4.7,
          purchase_count: 95,
          seller_name: "Prof. Patel",
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          program: "BBA",
          semester: "3rd Semester",
          subject: "Business Communication",
          file_url: "https://example.com/notes/communication.pdf",
          preview_url: "https://example.com/preview/communication.pdf",
          status: "published",
          category: "academic"
        }
      ];

      return samplePurchases;
    } catch (err) {
      console.error('Error fetching recent purchases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent purchases');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecentEarnings = async (): Promise<{ total: number; recent: number }> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return static data with zeros
      return {
        total: 0,
        recent: 0
      };
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
      return { total: 0, recent: 0 };
    } finally {
      setLoading(false);
    }
  };

  const downloadNote = async (noteId: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const note = await getNoteDetails(noteId);
      if (!note) {
        throw new Error('Note not found');
      }

      // In a real app, this would handle the actual download
      // For now, we'll just simulate a successful download
      return {
        success: true,
        message: 'Note downloaded successfully'
      };
    } catch (err) {
      console.error('Error downloading note:', err);
      setError(err instanceof Error ? err.message : 'Failed to download note');
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to download note'
      };
    } finally {
      setLoading(false);
    }
  };

  const uploadNote = useCallback(async (
    noteData: {
    title: string;
    description: string;
      program: string;
      semester: string;
      subject: string;
    price: number;
    file: any;
    }
  ): Promise<Note> => {
    if (!user || !token) {
      throw new Error('You must be logged in to upload notes');
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      Object.entries(noteData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notes/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload note');
      }

      const data = await response.json();
      return data.note;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload note');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const updateNote = useCallback(async (
    noteId: string,
    updates: {
      title?: string;
      description?: string;
      program?: string;
      semester?: string;
      subject?: string;
      price?: number;
      file?: any;
    }
  ): Promise<Note> => {
    if (!user || !token) {
      throw new Error('You must be logged in to update notes');
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notes/${noteId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const data = await response.json();
      return data.note;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    if (!user || !token) {
      throw new Error('You must be logged in to delete notes');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notes/${noteId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const getMyNotes = useCallback(async (): Promise<Note[]> => {
    if (!user || !token) {
      throw new Error('You must be logged in to view your notes');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/notes/seller/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch your notes');
      }

      const data = await response.json();
      return data.notes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch your notes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  return {
    loading,
    error,
    getNotes,
    getNoteDetails,
    uploadNote,
    updateNote,
    deleteNote,
    downloadNote,
    getMyNotes,
    getRecentPurchases,
    getRecentEarnings,
    getTrendingNotes,
  };
}; 