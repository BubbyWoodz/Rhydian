import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { validateApiKey } from '@/src/lib/hardcoverApi';

const STORAGE_KEYS = {
  API_KEY: '@rydian_api_key',
  ONBOARDING_COMPLETE: '@rydian_onboarding_complete',
};

export default function ApiKeyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      Alert.alert(
        'Invalid API Key',
        'Please enter your Hardcover API key.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Validate the API key by making a real API call to Hardcover
      const validationResult = await validateApiKey(trimmedKey);

      if (!validationResult.isValid) {
        // Show the actual error message from the API
        Alert.alert(
          'Invalid API Key',
          validationResult.errorMessage || 'The API key you entered is not valid. Please check and try again.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Save the API key and mark onboarding as complete
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.API_KEY, trimmedKey],
        [STORAGE_KEYS.ONBOARDING_COMPLETE, 'true'],
      ]);

      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to validate API key. Please check your internet connection and try again.'
      );
      console.error('Error validating API key:', error);
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
          {isLoading ? 'Validating...' : 'Continue'}
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
