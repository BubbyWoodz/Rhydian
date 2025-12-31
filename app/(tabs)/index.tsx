import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCurrentUser, getCurrentlyReading, getBookAuthors, User, UserBook } from '@/src/lib/hardcoverApi';

const STORAGE_KEY_API = '@rydian_api_key';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [currentlyReading, setCurrentlyReading] = useState<UserBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiKey = await AsyncStorage.getItem(STORAGE_KEY_API);
      if (!apiKey) {
        setError('No API key found');
        setIsLoading(false);
        return;
      }

      // Fetch user and currently reading book in parallel
      const [userData, currentlyReadingData] = await Promise.all([
        getCurrentUser(apiKey),
        getCurrentlyReading(apiKey),
      ]);

      setUser(userData);
      setCurrentlyReading(currentlyReadingData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load your reading data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading your reading data...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Error</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  const firstName = user?.name?.split(' ')[0] || user?.username || 'Reader';

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.welcomeText}>
          Welcome, {firstName}
        </ThemedText>

        {currentlyReading ? (
          <View style={styles.currentlyReadingSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Currently Reading
            </ThemedText>
            <View style={styles.bookCard}>
              <ThemedText style={styles.bookTitle}>
                {currentlyReading.book.title}
              </ThemedText>
              <ThemedText style={styles.bookAuthor}>
                by {getBookAuthors(currentlyReading.book)}
              </ThemedText>
              {currentlyReading.progress !== null && currentlyReading.progress !== undefined && (
                <ThemedText style={styles.progressText}>
                  Progress: {currentlyReading.progress}%
                </ThemedText>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.noBookSection}>
            <ThemedText style={styles.noBookText}>
              You're not currently reading any books.
            </ThemedText>
            <ThemedText style={styles.noBookSubtext}>
              Start a book to track your progress here!
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#ff4444',
  },
  currentlyReadingSection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  bookCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noBookSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  noBookText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  noBookSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
});
