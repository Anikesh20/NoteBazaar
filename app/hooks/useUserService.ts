import { useCallback, useState } from 'react';
import { additionalNotes, sampleNotes } from '../data/sampleNotes';
import { useAuth } from './useAuth';

interface PurchasedNote {
  id: string;
  note_title: string;
  price: number;
  purchased_at: string;
  seller_name: string;
}

interface UserStats {
  total_earnings: number;
  recent_earnings: number;
  total_notes: number;
  total_purchases: number;
}

export const useUserService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getPurchasedNotes = useCallback(async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ notes: PurchasedNote[]; total: number }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Combine all notes and map to PurchasedNote format, but only take the first 3
      const allNotes = [...sampleNotes, ...additionalNotes]
        .slice(0, 3) // Only take first 3 notes
        .map(note => ({
          id: note.id,
          note_title: note.title,
          price: note.price,
          purchased_at: note.created_at,
          seller_name: note.seller_name
        }));
      
      return {
        notes: allNotes,
        total: allNotes.length,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch purchased notes';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserStats = useCallback(async (): Promise<UserStats> => {
    if (!user) {
      throw new Error('You must be logged in to view user stats');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/stats`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const data = await response.json();
      return {
        total_earnings: data.total_earnings,
        recent_earnings: data.recent_earnings,
        total_notes: data.total_notes,
        total_purchases: data.total_purchases,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user stats';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (data: {
    name?: string;
    email?: string;
    bio?: string;
  }): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to update profile');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const changePassword = useCallback(async (data: {
    current_password: string;
    new_password: string;
  }): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to change password');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to change password');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const uploadProfilePicture = useCallback(async (uri: string): Promise<string> => {
    if (!user) {
      throw new Error('You must be logged in to upload profile picture');
    }

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('profile_picture', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/profile/picture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const data = await response.json();
      return data.profile_picture_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload profile picture';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    error,
    getPurchasedNotes,
    getUserStats,
    updateProfile,
    changePassword,
    uploadProfilePicture,
  };
}; 