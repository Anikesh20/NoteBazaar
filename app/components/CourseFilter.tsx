import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCourseService } from '../services/courseService';
import { Course } from '../types/course';

interface CourseFilterProps {
  onFilterChange: (filters: {
    program: string | null;
    semester: number | null;
    subject: string | null;
  }) => void;
  initialFilters?: {
    program: string | null;
    semester: number | null;
    subject: string | null;
  };
}

export const CourseFilter: React.FC<CourseFilterProps> = ({
  onFilterChange,
  initialFilters = { program: null, semester: null, subject: null },
}) => {
  const [programs, setPrograms] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<Course[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(initialFilters.program);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(initialFilters.semester);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialFilters.subject);
  const [isLoading, setIsLoading] = useState(true);

  const courseService = useCourseService();

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadSemesters(selectedProgram);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram && selectedSemester) {
      loadSubjects(selectedProgram, selectedSemester);
    }
  }, [selectedProgram, selectedSemester]);

  useEffect(() => {
    onFilterChange({
      program: selectedProgram,
      semester: selectedSemester,
      subject: selectedSubject,
    });
  }, [selectedProgram, selectedSemester, selectedSubject]);

  const loadPrograms = async () => {
    try {
      const programs = await courseService.getPrograms();
      setPrograms(programs);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSemesters = async (program: string) => {
    try {
      const semesters = await courseService.getSemesters(program);
      setSemesters(semesters);
      if (!semesters.includes(selectedSemester!)) {
        setSelectedSemester(null);
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  };

  const loadSubjects = async (program: string, semester: number) => {
    try {
      const subjects = await courseService.getSubjects(program, semester);
      setSubjects(subjects);
      if (!subjects.find(s => s.id === selectedSubject)) {
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleProgramSelect = (program: string) => {
    setSelectedProgram(program === selectedProgram ? null : program);
    setSelectedSemester(null);
    setSelectedSubject(null);
  };

  const handleSemesterSelect = (semester: number) => {
    setSelectedSemester(semester === selectedSemester ? null : semester);
    setSelectedSubject(null);
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId === selectedSubject ? null : subjectId);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading filters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Program Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Program</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {programs.map((program) => (
              <Pressable
                key={program}
                style={[
                  styles.filterChip,
                  selectedProgram === program && styles.selectedChip,
                ]}
                onPress={() => handleProgramSelect(program)}
              >
                <Text style={[
                  styles.chipText,
                  selectedProgram === program && styles.selectedChipText,
                ]}>
                  {program}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Semester Filter */}
        {selectedProgram && (
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Semester</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {semesters.map((semester) => (
                <Pressable
                  key={semester}
                  style={[
                    styles.filterChip,
                    selectedSemester === semester && styles.selectedChip,
                  ]}
                  onPress={() => handleSemesterSelect(semester)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedSemester === semester && styles.selectedChipText,
                  ]}>
                    Semester {semester}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Subject Filter */}
        {selectedProgram && selectedSemester && (
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Subject</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {subjects.map((subject) => (
                <Pressable
                  key={subject.id}
                  style={[
                    styles.filterChip,
                    selectedSubject === subject.id && styles.selectedChip,
                  ]}
                  onPress={() => handleSubjectSelect(subject.id)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedSubject === subject.id && styles.selectedChipText,
                  ]}>
                    {subject.subject_name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  filterSection: {
    marginRight: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 14,
    color: '#4b5563',
  },
  selectedChipText: {
    color: '#fff',
  },
}); 