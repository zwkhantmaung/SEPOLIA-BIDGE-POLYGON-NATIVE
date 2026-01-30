import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function formatNumber(n: number): string {
  return n.toLocaleString();
}

interface DashboardCardsProps {
  availableZeth: number;
  availableWzeth: number;
}

export function DashboardCards({ availableZeth, availableWzeth }: DashboardCardsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Available ZETH</Text>
        <Text style={styles.value}>{formatNumber(availableZeth)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>
          Available <Text style={styles.labelNoUppercase}>wZETH</Text>
        </Text>
        <Text style={styles.value}>{formatNumber(availableWzeth)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelNoUppercase: {
    textTransform: 'none',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
});
