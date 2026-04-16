import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';

const SERVER_URL = 'https://accountability-os-production.up.railway.app';

export default function HomeScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const [reason, setReason] = useState('');
  const [dailyScore, setDailyScore] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const [statusRes, timerRes, scoreRes, activitiesRes] = await Promise.all([
        fetch(`${SERVER_URL}/status`),
        fetch(`${SERVER_URL}/timer`),
        fetch(`${SERVER_URL}/api/score`),
        fetch(`${SERVER_URL}/api/activities`),
      ]);
      const statusData = await statusRes.json();
      const timerData = await timerRes.json();
      const scoreData = await scoreRes.json();
      const activitiesData = await activitiesRes.json();

      setIsUnlocked(statusData.isUnlocked);
      setReason(statusData.reason || '');
      setMinutesRemaining(timerData.minutesRemaining);
      setDailyScore(Number(scoreData.dailyScore) || 0);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error) {
      console.log('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus();
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.gray}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
    >
      {/* Lock / Unlock card */}
      <View style={[styles.card, isUnlocked ? styles.unlockedCard : styles.lockedCard]}>
        <Text style={styles.lockIcon}>{isUnlocked ? '🔓' : '🔒'}</Text>
        <Text style={styles.lockLabel}>{isUnlocked ? 'UNLOCKED' : 'LOCKED'}</Text>
        {reason ? <Text style={styles.lockReason}>Earned by: {reason}</Text> : null}
      </View>

      {/* Timer */}
      <View style={styles.card}>
        <Text style={styles.timerNum}>{minutesRemaining}</Text>
        <Text style={styles.gray}>minutes of screen time remaining</Text>
      </View>

      {/* Score */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.statNum}>{dailyScore}</Text>
          <Text style={styles.gray}>pts today</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.statNum}>{activities.length}</Text>
          <Text style={styles.gray}>activities</Text>
        </View>
      </View>

      {/* Today's activity log */}
      {activities.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Today's Activity</Text>
          {activities.map((a, i) => (
            <View key={i} style={styles.activityRow}>
              <Text style={styles.activityLabel}>{a.label}</Text>
              <Text style={styles.activityPts}>+{a.points} pts</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.hint}>Pull down to refresh · auto-updates every 30s</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  container: { flexGrow: 1, backgroundColor: '#0a0a0a', padding: 16, gap: 12 },
  card: { backgroundColor: '#111', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  unlockedCard: { borderColor: '#1a472a', backgroundColor: '#0d2b1a' },
  lockedCard: { borderColor: '#4a1a1a', backgroundColor: '#2b0d0d' },
  halfCard: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  lockIcon: { fontSize: 48 },
  lockLabel: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  lockReason: { color: '#aaa', fontSize: 13, marginTop: 4 },
  timerNum: { color: '#fff', fontSize: 72, fontWeight: 'bold' },
  statNum: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  sectionLabel: { color: '#aaa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, alignSelf: 'flex-start' },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#222' },
  activityLabel: { color: '#fff', fontSize: 14 },
  activityPts: { color: '#4caf50', fontSize: 14, fontWeight: '600' },
  gray: { color: '#888', fontSize: 14 },
  hint: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 8 },
});
