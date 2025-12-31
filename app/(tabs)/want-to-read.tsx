import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WantToReadScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Want to Read</ThemedText>
      <ThemedText style={styles.description}>
        Your reading list will appear here.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  description: {
    marginTop: 16,
    textAlign: 'center',
  },
});
