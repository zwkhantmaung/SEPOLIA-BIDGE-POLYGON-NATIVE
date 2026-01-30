import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DashboardCards } from '@/components/DashboardCards';
import { mintAmount, lockAmount, burnAmount } from '@/constants/env';

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
      setAvailableZeth((prev) => prev + mintAmount);
      setLoadingAction(null);
      setSuccess(`${mintAmount.toLocaleString()} ZETH minted.`);
    }, 1500);
  };

  const handleLockAndMintWzeth = () => {
    if (availableZeth < lockAmount) {
      setError(`Need at least ${lockAmount.toLocaleString()} ZETH to lock.`);
      return;
    }
    setLoadingAction('lock');
    setStatusMessage('');
    setTimeout(() => {
      setAvailableZeth((prev) => prev - lockAmount);
      setLockedZeth((prev) => prev + lockAmount);
      setAvailableWzeth((prev) => prev + lockAmount);
      setLoadingAction(null);
      setSuccess(`${lockAmount.toLocaleString()} ZETH was locked. ${lockAmount.toLocaleString()} wZETH was minted.`);
    }, 1000);
  };

  const handleBurnWzeth = () => {
    if (availableWzeth < burnAmount) {
      setError(`Need at least ${burnAmount.toLocaleString()} wZETH to burn.`);
      return;
    }
    setLoadingAction('burn');
    setStatusMessage('');
    setTimeout(() => {
      setAvailableWzeth((prev) => prev - burnAmount);
      setLockedZeth((prev) => prev - burnAmount);
      setAvailableZeth((prev) => prev + burnAmount);
      setLoadingAction(null);
      setSuccess(`Burned ${burnAmount.toLocaleString()} wZETH. Unlocked ${burnAmount.toLocaleString()} ZETH.`);
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
      setSuccess('Bridge contract was reset.');
    }, 1500);
  };

  const dismissModal = () => {
    setStatusMessage('');
    setStatusType('idle');
  };

  const isSuccess = statusType === 'success';
  const showModal = statusMessage.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Bridge Dashboard</Text>
          <DashboardCards availableZeth={availableZeth} availableWzeth={availableWzeth} />

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

        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={dismissModal}
      >
        <Pressable style={styles.modalOverlay} onPress={dismissModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle
                ]}
              >
                {isSuccess ? 'Success' : 'Error'}
              </Text>
            </View>
            <Text style={styles.modalMessage}>{statusMessage}</Text>
            <Pressable style={styles.modalButton} onPress={dismissModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#1e293b',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#475569',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
