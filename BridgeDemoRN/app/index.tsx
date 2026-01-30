import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DashboardCards } from '@/components/DashboardCards';

const MINT_AMOUNT = 1_000_000;
const LOCK_AMOUNT = 10_000;
const BURN_AMOUNT = 10_000;

export default function BridgeDashboardScreen() {
  const [availableZeth, setAvailableZeth] = useState(0);
  const [lockedZeth, setLockedZeth] = useState(0);
  const [availableWzeth, setAvailableWzeth] = useState(0);
  const [loadingAction, setLoadingAction] = useState<'mint' | 'lock' | 'burn' | 'reset' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'idle'>('idle');

  const loading = loadingAction !== null;

  const setSuccess = (msg: string) => {
    setStatusMessage(msg);
    setStatusType('success');
  };
  const setError = (msg: string) => {
    setStatusMessage(msg);
    setStatusType('error');
  };

  const handleMintZeth = () => {
    setLoadingAction('mint');
    setStatusMessage('');
    setTimeout(() => {
      setAvailableZeth((prev) => prev + MINT_AMOUNT);
      setLoadingAction(null);
      setSuccess('Mint ZETH success!');
    }, 1500);
  };

  const handleLockAndMintWzeth = () => {
    if (availableZeth < LOCK_AMOUNT) {
      setError(`Need at least ${LOCK_AMOUNT.toLocaleString()} ZETH to lock.`);
      return;
    }
    setLoadingAction('lock');
    setStatusMessage('');
    setTimeout(() => {
      setAvailableZeth((prev) => prev - LOCK_AMOUNT);
      setLockedZeth((prev) => prev + LOCK_AMOUNT);
      setAvailableWzeth((prev) => prev + LOCK_AMOUNT);
      setLoadingAction(null);
      setSuccess('Lock ZETH & Mint wZETH success!');
    }, 1500);
  };

  const handleBurnWzeth = () => {
    if (availableWzeth < BURN_AMOUNT) {
      setError(`Need at least ${BURN_AMOUNT.toLocaleString()} wZETH to burn.`);
      return;
    }
    setLoadingAction('burn');
    setStatusMessage('');
    setTimeout(() => {
      setAvailableWzeth((prev) => prev - BURN_AMOUNT);
      setLockedZeth((prev) => prev - BURN_AMOUNT);
      setAvailableZeth((prev) => prev + BURN_AMOUNT);
      setLoadingAction(null);
      setSuccess(`Burn success! Unlocked ${BURN_AMOUNT.toLocaleString()} ZETH.`);
    }, 1500);
  };

  const handleReset = () => {
    setLoadingAction('reset');
    setStatusMessage('');
    setTimeout(() => {
      setAvailableZeth(0);
      setLockedZeth(0);
      setAvailableWzeth(0);
      setLoadingAction(null);
      setSuccess('Contract reset complete.');
    }, 1500);
  };

  const statusColor = statusType === 'success' ? '#22c55e' : statusType === 'error' ? '#ef4444' : '#64748b';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Bridge Dashboard</Text>
          <DashboardCards
            availableZeth={availableZeth}
            lockedZeth={lockedZeth}
            availableWzeth={availableWzeth}
          />

          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.mintButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleMintZeth}
              disabled={loading}
            >
              {loadingAction === 'mint' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Mint ZETH</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.lockButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLockAndMintWzeth}
              disabled={loading}
            >
              {loadingAction === 'lock' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Lock ZETH & Mint wZETH</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.burnButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleBurnWzeth}
              disabled={loading}
            >
              {loadingAction === 'burn' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Burn wZETH</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.resetButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleReset}
              disabled={loading}
            >
              {loadingAction === 'reset' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Reset Contract</Text>
              )}
            </Pressable>
          </View>

          {statusMessage ? (
            <Text style={[styles.statusText, { color: statusColor }]}>{statusMessage}</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  content: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  mintButton: {
    backgroundColor: '#16a34a',
  },
  lockButton: {
    backgroundColor: '#2563eb',
  },
  burnButton: {
    backgroundColor: '#dc2626',
  },
  resetButton: {
    backgroundColor: '#475569',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  statusText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
