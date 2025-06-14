import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNoteService } from '../hooks/useNoteService';
import { colors, shadows } from '../styles/theme';

interface NoteFormData {
  title: string;
  description: string;
  price: string;
  program: string;
  semester: string;
  subject: string;
  thumbnail: string | null;
  file: DocumentPicker.DocumentResult | null;
}

const initialFormData: NoteFormData = {
  title: '',
  description: '',
  price: '',
  program: '',
  semester: '',
  subject: '',
  thumbnail: null,
  file: null,
};

export default function UploadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { uploadNote, getNoteDetails, updateNote } = useNoteService();
  const [formData, setFormData] = useState<NoteFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadNoteDetails();
    }
  }, [id]);

  const loadNoteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const note = await getNoteDetails(id);
      setFormData({
        title: note.title,
        description: note.description,
        price: note.price.toString(),
        program: note.program,
        semester: note.semester,
        subject: note.subject,
        thumbnail: note.thumbnail,
        file: null,
      });
    } catch (err: any) {
      console.error('Error loading note details:', err);
      setError(err.message || 'Failed to load note details');
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setFormData(prev => ({ ...prev, file: result }));
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handlePickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({ ...prev, thumbnail: result.assets[0].uri }));
      }
    } catch (err) {
      console.error('Error picking thumbnail:', err);
      Alert.alert('Error', 'Failed to pick thumbnail. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.description || !formData.price) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (!id && !formData.file) {
        Alert.alert('Error', 'Please select a file to upload');
        return;
      }

      setSaving(true);
      setError(null);

      const noteData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        program: formData.program,
        semester: formData.semester,
        subject: formData.subject,
        thumbnail: formData.thumbnail,
        file: formData.file,
      };

      if (id) {
        await updateNote(id, noteData);
      } else {
        await uploadNote(noteData);
      }

      router.back();
    } catch (err: any) {
      console.error('Error saving note:', err);
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading note details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Thumbnail Upload */}
        <TouchableOpacity
          style={styles.thumbnailContainer}
          onPress={handlePickThumbnail}
        >
          {formData.thumbnail ? (
            <Image
              source={{ uri: formData.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="image-outline" size={32} color={colors.textLight} />
              <Text style={styles.thumbnailPlaceholderText}>
                Add Thumbnail
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* File Upload */}
        <TouchableOpacity
          style={styles.fileUploadButton}
          onPress={handlePickDocument}
        >
          <Ionicons name="document-attach-outline" size={24} color={colors.primary} />
          <Text style={styles.fileUploadText}>
            {formData.file
              ? formData.file.assets[0].name
              : 'Select Note File'}
          </Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter note title"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Enter note description"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (Rs.) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => {
                // Only allow numbers and decimal point
                if (/^\d*\.?\d*$/.test(text)) {
                  setFormData(prev => ({ ...prev, price: text }));
                }
              }}
              placeholder="Enter price"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Program</Text>
            <TextInput
              style={styles.input}
              value={formData.program}
              onChangeText={(text) => setFormData(prev => ({ ...prev, program: text }))}
              placeholder="Enter program (e.g., B.Tech, M.Tech)"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Semester</Text>
            <TextInput
              style={styles.input}
              value={formData.semester}
              onChangeText={(text) => setFormData(prev => ({ ...prev, semester: text }))}
              placeholder="Enter semester"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(text) => setFormData(prev => ({ ...prev, subject: text }))}
              placeholder="Enter subject"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {id ? 'Update Note' : 'Upload Note'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginBottom: 16,
    ...shadows.small,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  thumbnailPlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textLight,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    ...shadows.small,
    gap: 8,
  },
  fileUploadText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
    ...shadows.small,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    backgroundColor: colors.danger + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 