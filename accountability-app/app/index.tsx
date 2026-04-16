import { Redirect } from 'expo-router';

// Redirect root to the tabs group
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
