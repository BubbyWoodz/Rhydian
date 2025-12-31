import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STORAGE_KEYS = {
  API_KEY: '@rydian_api_key',
  ONBOARDING_COMPLETE: '@rydian_onboarding_complete',
};

export default function ApiKeyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateApiKey = (key: string): boolean => {
    // Placeholder validation - just check if it's not empty and has reasonable length
    return key.trim().length > 10;
  };

  const handleContinue = async () => {
    if (!validateApiKey(apiKey)) {
      Alert.alert(
        'Invalid API Key',
        'Please enter a valid Hardcover API key. It should be at least 10 characters long.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.API_KEY, apiKey.trim()],
        [STORAGE_KEYS.ONBOARDING_COMPLETE, 'true'],
      ]);

      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
      console.error('Error saving API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openHardcoverWebsite = () => {
    Linking.openURL('https://hardcover.app/account/api');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Enter Your API Key
        </ThemedText>

        <ThemedText style={styles.description}>
          To use Rydian, you'll need a Hardcover API key. This key is stored securely on your device.
        </ThemedText>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                borderColor: colorScheme === 'dark' ? '#333' : '#ddd',
              },
            ]}
            placeholder="Enter your Hardcover API key"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </View>

        <Pressable onPress={openHardcoverWebsite}>
          <ThemedText style={styles.link}>
            Don't have an API key? Get one from Hardcover →
          </ThemedText>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint },
          pressed && styles.buttonPressed,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={handleContinue}
        disabled={isLoading}>
        <ThemedText style={styles.buttonText}>
          {isLoading ? 'Saving...' : 'Continue'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
