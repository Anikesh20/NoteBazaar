import { useCallback, useState } from 'react';
import { Course } from '../types/course';
import { useAuth } from './useAuth';

export const useCourseService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getPrograms = useCallback(async (): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/courses/programs`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }

      const data = await response.json();
      return data.programs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch programs');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSemesters = useCallback(async (program: string): Promise<number[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/courses/semesters?program=${encodeURIComponent(program)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch semesters');
      }

      const data = await response.json();
      return data.semesters;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch semesters');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubjects = useCallback(async (
    program: string,
    semester: number
  ): Promise<Course[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/courses/subjects?program=${encodeURIComponent(program)}&semester=${semester}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      return data.subjects;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCourseDetails = useCallback(async (courseId: string): Promise<Course> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/courses/${courseId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }

      const data = await response.json();
      return data.course;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchCourses = useCallback(async (query: string): Promise<Course[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/courses/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search courses');
      }

      const data = await response.json();
      return data.courses;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search courses');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getPrograms,
    getSemesters,
    getSubjects,
    getCourseDetails,
    searchCourses,
  };
}; 