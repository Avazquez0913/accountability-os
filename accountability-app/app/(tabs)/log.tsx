import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';

const SERVER_URL = 'https://accountability-os-production.up.railway.app';

const LEVELS = [
  { level: 0, name: 'Off Day',    description: 'Rest and recover',                              color: '#1a1a1a' },
  { level: 1, name: 'Survival',   description: '1 commit · light movement · 1 career action',   color: '#4a3a1a' },
  { level: 2, name: 'Standard',   description: '1 push · workout · 1 career action',            color: '#1a3a4a' },
  { level: 3, name: 'Relentless', description: '2+ sessions · full workout · 2 career actions', color: '#1a472a' },
];

const ACTIVITIES = [
  { type: 'workout',   label: 'Workout',     pts: 30, icon: '💪' },
  { type: 'leetcode',  label: 'LeetCode',    pts: 30, icon: '💻' },
  { type: 'job_apply', label: 'Job Apply',   pts: 25, icon: '📄' },
  { type: 'reading',   label: 'Reading',     pts: 20, icon: '📖' },
];

export default function LogScreen() {
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [settingLevel, setSettingLevel] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState<string | null>(null);
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const [checkingLeetCode, setCheckingLeetCode] = useState(false);
  const [readingModal, setReadingModal] = useState(false);
  const [readingClaim, setReadingClaim] = useState('');
  const [readingEvidence, setReadingEvidence] = useState('');
  const [readingFeedback, setReadingFeedback] = useState<string | null>(null);

  const selectLevel = async (level: number) => {
    try {
      setSettingLevel(true);
      await fetch(`${SERVER_URL}/api/level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      setCurrentLevel(level);
    } catch {
      Alert.alert('Error', 'Could not set level. Check your connection.');
    } finally {
      setSettingLevel(false);
    }
  };

  const logActivity = async (type: string, label: string) => {
    try {
      setLoggingActivity(type);
      const res = await fetch(`${SERVER_URL}/api/activities/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        setLastLogged(label);
        Alert.alert('Logged!', `${label} logged. Check Home for updated score.`);
      }
    } catch {
      Alert.alert('Error', 'Could not log activity.');
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
        setReadingModal(false);
        setReadingClaim('');
        setReadingEvidence('');
        setLastLogged('Reading');
        Alert.alert('Verified! ✓', `Reading logged. Score: ${data.verification.final_score.toFixed(2)}`);
      } else {
        const score = data.verification?.final_score?.toFixed(2) ?? '?';
        setReadingFeedback(`Not verified (score: ${score}). Be more specific about what you learned.`);
      }
    } catch {
      setReadingFeedback('Server error. Try again.');
    } finally {
      setLoggingActivity(null);
    }
  };

  const checkLeetCode = async () => {
    try {
      setCheckingLeetCode(true);
      const res = await fetch(`${SERVER_URL}/api/check/leetcode`, { method: 'POST' });
      const data = await res.json();
      Alert.alert('LeetCode Check', data.message);
    } catch {
      Alert.alert('Error', 'Could not reach server.');
    } finally {
      setCheckingLeetCode(false);
    }
  };

  const activeLevel = currentLevel !== null ? LEVELS[currentLevel] : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Level section */}
      <Text style={styles.sectionTitle}>Today's Difficulty</Text>
      <Text style={styles.sectionSub}>Set your level each morning to track your week.</Text>

      {activeLevel && (
        <View style={[styles.activeLevelCard, { borderColor: activeLevel.color === '#1a1a1a' ? '#333' : activeLevel.color }]}>
          <Text style={styles.activeLevelName}>Level {activeLevel.level} — {activeLevel.name}</Text>
          <Text style={styles.activeLevelDesc}>{activeLevel.description}</Text>
        </View>
      )}

      <View style={styles.grid}>
        {LEVELS.map((l) => (
          <TouchableOpacity
            key={l.level}
            style={[styles.levelBtn, { backgroundColor: l.color }, currentLevel === l.level && styles.levelBtnActive]}
            onPress={() => selectLevel(l.level)}
            disabled={settingLevel}
          >
            <Text style={styles.levelBtnNum}>L{l.level}</Text>
            <Text style={styles.levelBtnName}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activity section */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Log Activity</Text>
      <Text style={styles.sectionSub}>Each activity earns points and screen time.</Text>
      {lastLogged && <Text style={styles.successMsg}>✓ {lastLogged} logged successfully</Text>}

      <View style={styles.grid}>
        {ACTIVITIES.map(({ type, label, pts, icon }) => (
          <TouchableOpacity
            key={type}
            style={[styles.activityBtn, loggingActivity === type && styles.busy]}
            onPress={() => type === 'reading' ? (setReadingFeedback(null), setReadingModal(true)) : logActivity(type, label)}
            disabled={loggingActivity !== null}
          >
            <Text style={styles.activityIcon}>{icon}</Text>
            <Text style={styles.activityName}>{label}</Text>
            <Text style={styles.activityPts}>+{pts} pts</Text>
            {type === 'reading' && <Text style={styles.activityNote}>NLP verified</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* LeetCode auto-check */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🧠 LeetCode Auto-Detection</Text>
        <Text style={styles.infoText}>Solves are checked every hour automatically. Tap below to check right now.</Text>
        <TouchableOpacity
          style={[styles.checkBtn, checkingLeetCode && styles.busy]}
          onPress={checkLeetCode}
          disabled={checkingLeetCode}
        >
          <Text style={styles.checkBtnText}>{checkingLeetCode ? 'Checking...' : 'Check LeetCode Now'}</Text>
        </TouchableOpacity>
      </View>

      {/* GitHub push info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>⚡ GitHub Push → +40 pts, +45 min</Text>
        <Text style={styles.infoText}>Push any commit to this repo and the webhook awards points automatically.</Text>
      </View>

      {/* Reading modal */}
      <Modal visible={readingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📖 Log Reading</Text>
            <Text style={styles.modalLabel}>What did you study?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. I read about transformer architectures"
              placeholderTextColor="#555"
              value={readingClaim}
              onChangeText={setReadingClaim}
            />
            <Text style={styles.modalLabel}>What did you learn? (be specific)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="e.g. Read chapter 4 on attention mechanisms. Learned how Q, K, V matrices work and why softmax is applied before multiplying by V..."
              placeholderTextColor="#555"
              value={readingEvidence}
              onChangeText={setReadingEvidence}
              multiline
              numberOfLines={5}
            />
            {readingFeedback ? <Text style={styles.feedbackText}>{readingFeedback}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReadingModal(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, loggingActivity === 'reading' && styles.busy]}
                onPress={submitReading}
                disabled={loggingActivity === 'reading'}
              >
                <Text style={styles.btnText}>{loggingActivity === 'reading' ? 'Verifying...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0a0a0a', padding: 16, gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionSub: { color: '#666', fontSize: 13, marginTop: -4 },
  activeLevelCard: { backgroundColor: '#111', borderRadius: 10, padding: 14, borderWidth: 2, alignItems: 'center' },
  activeLevelName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  activeLevelDesc: { color: '#aaa', fontSize: 12, marginTop: 4, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  levelBtn: { width: '47%', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  levelBtnActive: { borderColor: '#fff', borderWidth: 2 },
  levelBtnNum: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  levelBtnName: { color: '#ccc', fontSize: 12, marginTop: 2 },
  activityBtn: { width: '47%', backgroundColor: '#111', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#222', gap: 4 },
  activityIcon: { fontSize: 28 },
  activityName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  activityPts: { color: '#4caf50', fontSize: 13 },
  activityNote: { color: '#555', fontSize: 10 },
  busy: { opacity: 0.4 },
  successMsg: { color: '#4caf50', fontSize: 13 },
  infoCard: { backgroundColor: '#111', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#333', marginTop: 8 },
  infoTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  infoText: { color: '#888', fontSize: 13, marginBottom: 10 },
  checkBtn: { backgroundColor: '#1a3a4a', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  checkBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#111', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#333', gap: 10 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalLabel: { color: '#aaa', fontSize: 12 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 8, color: '#fff', padding: 10, fontSize: 13 },
  inputMulti: { height: 110, textAlignVertical: 'top' },
  feedbackText: { color: '#e57373', fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#333' },
  submitBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#1a472a' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
