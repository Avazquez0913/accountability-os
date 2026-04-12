import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SERVER_URL = 'https://accountability-os-production.up.railway.app';

export default function HomeScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [dailyScore, setDailyScore] = useState(0);

  const fetchStatus = async () => {
    try {
      const statusRes = await fetch(`${SERVER_URL}/status`);
      const statusData = await statusRes.json();
      const timerRes = await fetch(`${SERVER_URL}/timer`);
      const timerData = await timerRes.json();
      const scoreRes = await fetch(`${SERVER_URL}/score`);
      const scoreData = await scoreRes.json();

      setIsUnlocked(statusData.isUnlocked);
      setReason(statusData.reason || '');
      setMinutesRemaining(timerData.minutesRemaining);
      setDailyScore(Number(scoreData.dailyScore) || 0);
      setLoading(false);
    } catch (error) {
      console.log('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.white}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AccountabilityOS</Text>
      <View style={[styles.badge, isUnlocked ? styles.unlocked : styles.locked]}>
        <Text style={styles.badgeText}>
          {isUnlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}
        </Text>
      </View>
      <Text style={styles.minutes}>{minutesRemaining}</Text>
      <Text style={styles.gray}>minutes remaining</Text>
      {reason ? <Text style={styles.gray}>Earned by: {reason}</Text> : null}
      <Text style={styles.gray}>──────────</Text>
      <Text style={styles.gray}>Daily Score</Text>
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
    gap: 8,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  badge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 50, marginBottom: 8 },
  unlocked: { backgroundColor: '#1a472a' },
  locked: { backgroundColor: '#4a1a1a' },
  badgeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  minutes: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
  gray: { color: '#888', fontSize: 14 },
  score: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  white: { color: '#fff', fontSize: 18 },
});