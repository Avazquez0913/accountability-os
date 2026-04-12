// index.tsx
// Responsibility: Main screen of AccountabilityOS
// Shows current unlock status and minutes remaining
// Polls the server every 30 seconds for updates

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Your Railway server URL
const SERVER_URL = 'https://accountability-os-production.up.railway.app';

export default function HomeScreen() {

  // Track unlock state from the server
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  // ADDED: daily score state
  const [dailyScore, setDailyScore] = useState(0);

  // Fetch current status from server
  const fetchStatus = async () => {
    try {
      const statusRes = await fetch(`${SERVER_URL}/status`);
      const statusData = await statusRes.json();

      const timerRes = await fetch(`${SERVER_URL}/timer`);
      const timerData = await timerRes.json();

      // ADDED: fetch daily score from server
      const scoreRes = await fetch(`${SERVER_URL}/score`);
      const scoreData = await scoreRes.json();
      setDailyScore(scoreData.dailyScore);

      setIsUnlocked(statusData.isUnlocked);
      setReason(statusData.reason || '');
      setMinutesRemaining(timerData.minutesRemaining);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching status:', error);
      setLoading(false);
    }
  };

  // Poll server every 30 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Status indicator */}
      <Text style={styles.title}>AccountabilityOS</Text>
      <View style={[styles.statusBadge, isUnlocked ? styles.unlocked : styles.locked]}>
        <Text style={styles.statusText}>
          {isUnlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}
        </Text>
      </View>

      {/* Minutes remaining */}
      <Text style={styles.minutes}>{minutesRemaining}</Text>
      <Text style={styles.minutesLabel}>minutes remaining</Text>

      {/* Reason */}
      {reason ? <Text style={styles.reason}>Earned by: {reason}</Text> : null}

      {/* ADDED: Daily score display */}
      <Text style={styles.scoreLabel}>Daily Score</Text>
      <Text style={styles.score}>{dailyScore} pts</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    color: '#ffffff',
    fontSize: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    marginBottom: 40,
  },
  unlocked: {
    backgroundColor: '#1a472a',
  },
  locked: {
    backgroundColor: '#4a1a1a',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  minutes: {
    color: '#ffffff',
    fontSize: 80,
    fontWeight: 'bold',
  },
  minutesLabel: {
    color: '#888888',
    fontSize: 16,
    marginTop: 8,
  },
  reason: {
    color: '#888888',
    fontSize: 14,
    marginTop: 30,
  },
  // ADDED: score styles
  scoreLabel: {
    color: '#888888',
    fontSize: 14,
    marginTop: 30,
  },
  score: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 4,
  },
});