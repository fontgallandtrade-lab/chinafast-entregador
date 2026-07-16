import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@chinafast:session';

export async function saveSession(session) {
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );
}

export async function getSession() {
  const stored = await AsyncStorage.getItem(SESSION_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
