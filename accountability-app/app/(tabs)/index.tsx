import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';

const SERVER_URL = 'https://accountability-os-production.up.railway.app';

const LEVELS = [
  { level: 0, name: 'Off Day', description: 'Rest day', color: '#333' },
  { level: 1, name: 'Survival', description: '1 commit · light movement · 1 career action', color: '#4a3a1a' },
  { level: 2, name: 'Standard', description: '1 push · workout · 1 career action', color: '#1a3a4a' },
  { level: 3, name: 'Relentless', description: '2+ sessions · full workout · 2 career actions', color: '#1a472a' },
];

export default function HomeScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [dailyScore, setDailyScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [settingLevel, setSettingLevel] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState<string | null>(null);
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const [readingModal, setReadingModal] = useState(false);
  const [readingClaim, setReadingClaim] = useState('');
  const [readingEvidence, setReadingEvidence] = useState('');
  const [readingFeedback, setReadingFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const [statusRes, timerRes, scoreRes, levelRes] = await Promise.all([
        fetch(`${SERVER_URL}/status`),
        fetch(`${SERVER_URL}/timer`),
        fetch(`${SERVER_URL}/api/score`),
        fetch(`${SERVER_URL}/api/level`),
      ]);

      const statusData = await statusRes.json();
      const timerData = await timerRes.json();
      const scoreData = await scoreRes.json();
      const levelData = await levelRes.json();

      setIsUnlocked(statusData.isUnlocked);
      setReason(statusData.reason || '');
      setMinutesRemaining(timerData.minutesRemaining);
      setDailyScore(Number(scoreData.dailyScore) || 0);
      setCurrentLevel(levelData.level ?? null);
      setLoading(false);
    } catch (error) {
      console.log('Error:', error);
      setLoading(false);
    }
  };

  const selectLevel = async (level: number) => {
    try {
      setSettingLevel(true);
      await fetch(`${SERVER_URL}/api/level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      setCurrentLevel(level);
    } catch (error) {
      console.log('Error setting level:', error);
    } finally {
      setSettingLevel(false);
    }
  };

  const logActivity = async (type: string, label: string) => {
    try {
      setLoggingActivity(type);
      await fetch(`${SERVER_URL}/api/activities/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      setLastLogged(label);
      await fetchStatus();
    } catch (error) {
      console.log('Error logging activity:', error);
    } finally {
      setLoggingActivity(null);
    }
  };

  const submitReading = async () => {
    if (!readingClaim.trim() || !readingEvidence.trim()) {
      setReadingFeedback('Both fields are required.');
      return;
    }
    try {
      setLoggingActivity('reading');
      setReadingFeedback(null);
      const res = await fetch(`${SERVER_URL}/api/activities/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: readingClaim, evidence: readingEvidence }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setLastLogged('Reading');
        setReadingModal(false);
        setReadingClaim('');
        setReadingEvidence('');
        await fetchStatus();
      } else {
        const score = data.verification?.final_score;
        setReadingFeedback(
          `Not verified (score: ${score ?? '?'}). Add more specific detail about what you read.`
        );
      }
    } catch (error) {
      setReadingFeedback('Server error. Try again.');
    } finally {
      setLoggingActivity(null);
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

  const activeLevelInfo = currentLevel !== null ? LEVELS[currentLevel] : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AccountabilityOS</Text>

      <View style={[styles.badge, isUnlocked ? styles.unlocked : styles.locked]}>
        <Text style={styles.badgeText}>
          {isUnlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}
        </Text>
      </View>
      <Text style={styles.minutes}>{minutesRemaining}</Text>
      <Text style={styles.gray}>minutes remaining</Text>
      {reason ? <Text style={styles.gray}>Earned by: {reason}</Text> : null}

      <Text style={styles.divider}>──────────────</Text>
      <Text style={styles.gray}>Daily Score</Text>
      <Text style={styles.score}>{dailyScore} pts</Text>

      <Text style={styles.divider}>──────────────</Text>
      <Text style={styles.sectionLabel}>Today's Level</Text>

      {activeLevelInfo ? (
        <View style={[styles.activeLevelBadge, { backgroundColor: activeLevelInfo.color }]}>
          <Text style={styles.activeLevelName}>Level {activeLevelInfo.level} — {activeLevelInfo.name}</Text>
          <Text style={styles.activeLevelDesc}>{activeLevelInfo.description}</Text>
        </View>
      ) : (
        <Text style={styles.gray}>No level set yet — pick one below</Text>
      )}

      <View style={styles.grid}>
        {LEVELS.map((l) => (
          <TouchableOpacity
            key={l.level}
            style={[styles.levelButton, { backgroundColor: l.color }, currentLevel === l.level && styles.levelButtonActive]}
            onPress={() => selectLevel(l.level)}
            disabled={settingLevel}
          >
            <Text style={styles.levelButtonTitle}>L{l.level} {l.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.divider}>──────────────</Text>
      <Text style={styles.sectionLabel}>Log Activity</Text>
      {lastLogged ? <Text style={styles.loggedMsg}>✓ Logged: {lastLogged}</Text> : null}

      <View style={styles.grid}>
        {[
          { type: 'workout',   label: 'Workout',   pts: '+30' },
          { type: 'leetcode',  label: 'LeetCode',  pts: '+30' },
          { type: 'job_apply', label: 'Job Apply', pts: '+25' },
        ].map(({ type, label, pts }) => (
          <TouchableOpacity
            key={type}
            style={[styles.activityButton, loggingActivity === type && styles.busy]}
            onPress={() => logActivity(type, label)}
            disabled={loggingActivity !== null}
          >
            <Text style={styles.activityLabel}>{label}</Text>
            <Text style={styles.activityPts}>{pts} pts</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.activityButton, loggingActivity === 'reading' && styles.busy]}
          onPress={() => { setReadingFeedback(null); setReadingModal(true); }}
          disabled={loggingActivity !== null}
        >
          <Text style={styles.activityLabel}>Reading</Text>
          <Text style={styles.activityPts}>+20 pts</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={readingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Log Reading</Text>
            <Text style={styles.modalLabel}>What did you study?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. I read about transformer architectures"
              placeholderTextColor="#555"
              value={readingClaim}
              onChangeText={setReadingClaim}
            />
            <Text style={styles.modalLabel}>Describe what you learned (be specific)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="e.g. Read chapter 4 on attention mechanisms..."
              placeholderTextColor="#555"
              value={readingEvidence}
              onChangeText={setReadingEvidence}
              multiline
              numberOfLines={4}
            />
            {readingFeedback ? <Text style={styles.feedbackText}>{readingFeedback}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReadingModal(false)}>
                <Text style={styles.white}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, loggingActivity === 'reading' && styles.busy]}
                onPress={submitReading}
                disabled={loggingActivity === 'reading'}
              >
                <Text style={styles.white}>{loggingActivity === 'reading' ? 'Verifying...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 40, paddingHorizontal: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  badge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 50, marginBottom: 8 },
  unlocked: { backgroundColor: '#1a472a' },
  locked: { backgroundColor: '#4a1a1a' },
  badgeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  minutes: { color: '#fff', fontSize: 64, fontWeight: 'bold' },
  gray: { color: '#888', fontSize: 14 },
  score: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  white: { color: '#fff', fontSize: 14 },
  divider: { color: '#444', fontSize: 14 },
  sectionLabel: { color: '#aaa', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  activeLevelBadge: { width: '100%', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  activeLevelName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  activeLevelDesc: { color: '#ccc', fontSize: 12, marginTop: 4, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', width: '100%' },
  levelButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333', minWidth: '44%', alignItems: 'center' },
  levelButtonActive: { borderColor: '#fff', borderWidth: 2 },
  levelButtonTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  loggedMsg: { color: '#4caf50', fontSize: 13 },
  activityButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#1a1a1a', minWidth: '44%', alignItems: 'center' },
  busy: { opacity: 0.4 },
  activityLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  activityPts: { color: '#4caf50', fontSize: 11, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#111', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#333', gap: 10 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalLabel: { color: '#aaa', fontSize: 12 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 8, color: '#fff', padding: 10, fontSize: 13 },
  inputMulti: { height: 100, textAlignVertical: 'top' },
  feedbackText: { color: '#e57373', fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#333' },
  submitBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#1a472a' },
});
