import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

const SERVER_URL = 'https://accountability-os-production.up.railway.app';

const LEVEL_COLORS: Record<number, string> = { 0: '#333', 1: '#4a3a1a', 2: '#1a3a4a', 3: '#1a472a' };
const LEVEL_LABELS: Record<number, string> = { 0: 'Off', 1: 'S1', 2: 'S2', 3: 'S3' };

type DayEntry = { date: string; level: number | null };
type Summary = { weekLevels: DayEntry[]; distribution: Record<string, number>; streak: number };

export default function WeeklyScreen() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/weekly-summary`);
      setSummary(await res.json());
    } catch (error) {
      console.log('Error fetching weekly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  if (loading) return <View style={styles.container}><Text style={styles.white}>Loading...</Text></View>;

  if (!summary) return (
    <View style={styles.container}>
      <Text style={styles.gray}>Could not load summary.</Text>
      <TouchableOpacity onPress={fetchSummary} style={styles.retryBtn}>
        <Text style={styles.white}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const { weekLevels = [], distribution = {}, streak = 0 } = summary;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weekly Summary</Text>

      <View style={styles.streakBox}>
        <Text style={styles.streakNum}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>

      <Text style={styles.sectionLabel}>Last 7 Days</Text>
      <View style={styles.dayRow}>
        {weekLevels.map((day) => {
          const level = day.level;
          const color = level !== null ? LEVEL_COLORS[level] : '#1a1a1a';
          const label = level !== null ? LEVEL_LABELS[level] : '—';
          const dayName = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <View key={day.date} style={styles.dayCell}>
              <View style={[styles.dayBar, { backgroundColor: color }]}>
                <Text style={styles.dayBarLabel}>{label}</Text>
              </View>
              <Text style={styles.dayName}>{dayName}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Distribution</Text>
      <View style={styles.distGrid}>
        {[0, 1, 2, 3].map((lvl) => (
          <View key={lvl} style={[styles.distCard, { backgroundColor: LEVEL_COLORS[lvl] }]}>
            <Text style={styles.distCount}>{distribution[lvl] ?? 0}</Text>
            <Text style={styles.distLabel}>Level {lvl}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0a0a0a', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16, gap: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  white: { color: '#fff', fontSize: 16 },
  gray: { color: '#888', fontSize: 14 },
  sectionLabel: { color: '#aaa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, alignSelf: 'flex-start' },
  streakBox: { alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, paddingVertical: 20, paddingHorizontal: 40, borderWidth: 1, borderColor: '#333' },
  streakNum: { color: '#fff', fontSize: 52, fontWeight: 'bold' },
  streakLabel: { color: '#888', fontSize: 14 },
  dayRow: { flexDirection: 'row', gap: 6, width: '100%', justifyContent: 'center' },
  dayCell: { alignItems: 'center', gap: 4 },
  dayBar: { width: 40, height: 56, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  dayBarLabel: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dayName: { color: '#666', fontSize: 10 },
  distGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' },
  distCard: { minWidth: '44%', padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  distCount: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  distLabel: { color: '#ccc', fontSize: 12 },
  retryBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#222', borderRadius: 8 },
});
