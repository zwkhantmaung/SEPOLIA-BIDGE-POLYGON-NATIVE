import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

const STATUS = {
  READY: 'ready',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

const FAKE_TX_HASH = '0x1234abcd5678ef90abcdef1234567890abcdef12';

export function BurnSection() {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<keyof typeof STATUS>(STATUS.READY);
  const [message, setMessage] = useState('Ready');

  const handleAmountChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9.]/g, '');
    setAmount(numericOnly);
  };

  const handleBurn = () => {
    Keyboard.dismiss();
    const trimmed = amount.trim();
    if (!trimmed) {
      setStatus('ERROR');
      setMessage('Error: Please enter an amount.');
      return;
    }
    const num = parseFloat(trimmed);
    if (isNaN(num) || num <= 0) {
      setStatus('ERROR');
      setMessage('Error: Enter a valid positive amount.');
      return;
    }

    setStatus('PROCESSING');
    setMessage('Processing...');

    setTimeout(() => {
      setStatus('SUCCESS');
      setMessage(`Burn success! Hash: ${FAKE_TX_HASH}`);
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
      <Text style={styles.title}>Burn wZETH</Text>

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={handleAmountChange}
        placeholder="Amount to burn (e.g. 1000)"
        placeholderTextColor="#94a3b8"
        keyboardType="decimal-pad"
        editable={!isProcessing}
      />

      <Pressable
        style={({ pressed }) => [
          styles.burnButton,
          pressed && styles.buttonPressed,
          isProcessing && styles.buttonDisabled,
        ]}
        onPress={handleBurn}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.burnButtonText}>Burn wZETH</Text>
        )}
      </Pressable>

      <Text style={[styles.statusText, { color: getStatusColor() }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  burnButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  burnButtonText: {
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
