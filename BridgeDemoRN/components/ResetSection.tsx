import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const STATUS = {
  READY: 'ready',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export function ResetSection() {
  const [status, setStatus] = useState<keyof typeof STATUS>('READY');
  const [message, setMessage] = useState('Ready');

  const handleReset = () => {
    setStatus('PROCESSING');
    setMessage('Resetting...');

    setTimeout(() => {
      setStatus('SUCCESS');
      setMessage('Reset success!');
    }, 2000);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'SUCCESS':
        return '#22c55e';
      case 'ERROR':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const isProcessing = status === 'PROCESSING';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Bridge</Text>

      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.buttonPressed,
          isProcessing && styles.buttonDisabled,
        ]}
        onPress={handleReset}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.resetButtonText}>Reset Contract</Text>
        )}
      </Pressable>

      <Text style={[styles.statusText, { color: getStatusColor() }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#ea580c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  statusText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
