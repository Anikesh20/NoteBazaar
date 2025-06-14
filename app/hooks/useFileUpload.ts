import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const pickDocument = useCallback(async (
    options: DocumentPicker.DocumentPickerOptions = {
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    }
  ): Promise<DocumentPicker.DocumentResult> => {
    try {
      const result = await DocumentPicker.getDocumentAsync(options);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick document');
      throw err;
    }
  }, []);

  const uploadFile = useCallback(async (
    fileUri: string,
    endpoint: string,
    additionalData?: Record<string, any>
  ): Promise<{ file_url: string }> => {
    if (!user) {
      throw new Error('You must be logged in to upload files');
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'application/octet-stream',
        name: fileUri.split('/').pop(),
      } as any);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.loaded / progressEvent.total;
            setUploadProgress(progress);
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return { file_url: data.file_url };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user]);

  const deleteFile = useCallback(async (
    fileUrl: string
  ): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to delete files');
    }

    try {
      setIsUploading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/files/delete`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ file_url: fileUrl }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const downloadFile = useCallback(async (
    fileUrl: string,
    fileName: string
  ): Promise<string> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        FileSystem.documentDirectory + fileName,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setUploadProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      if (!uri) {
        throw new Error('Failed to download file');
      }

      return uri;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    pickDocument,
    uploadFile,
    deleteFile,
    downloadFile,
  };
}; 