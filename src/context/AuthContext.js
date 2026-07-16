import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '../services/api';

import {
  clearSession,
  getSession,
  saveSession,
} from '../services/storage';

import {
  connectSocket,
  disconnectSocket,
} from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] =
    useState(true);
  const [socketConnected, setSocketConnected] =
    useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const stored = await getSession();

      if (!stored?.token) {
        return;
      }

      const profileData =
        await api.driverProfile(stored.token);

      const restored = {
        token: stored.token,
        user: stored.user,
        driver: profileData.driver,
      };

      setSession(restored);
      startSocket(profileData.driver.id);
    } catch (error) {
      await clearSession();
      setSession(null);
    } finally {
      setInitializing(false);
    }
  }

  function startSocket(driverId) {
    const socket = connectSocket(driverId);

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });
  }

  async function signIn(email, password) {
    const loginData = await api.login(
      email.trim(),
      password
    );

    if (loginData.user?.role !== 'driver') {
      throw new Error(
        'Este acesso não pertence a um entregador.'
      );
    }

    const profileData =
      await api.driverProfile(loginData.token);

    if (
      profileData.driver?.approval_status !==
      'approved'
    ) {
      throw new Error(
        'O cadastro do entregador ainda não foi aprovado.'
      );
    }

    const newSession = {
      token: loginData.token,
      user: loginData.user,
      driver: profileData.driver,
    };

    await saveSession(newSession);
    setSession(newSession);
    startSocket(profileData.driver.id);

    return newSession;
  }

  async function signOut() {
    disconnectSocket();
    setSocketConnected(false);
    setSession(null);
    await clearSession();
  }

  function updateDriver(values) {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const updated = {
        ...current,
        driver: {
          ...current.driver,
          ...values,
        },
      };

      saveSession(updated).catch(() => {});

      return updated;
    });
  }

  const value = useMemo(
    () => ({
      session,
      token: session?.token || null,
      user: session?.user || null,
      driver: session?.driver || null,
      initializing,
      socketConnected,
      signedIn: Boolean(session?.token),
      signIn,
      signOut,
      updateDriver,
    }),
    [
      session,
      initializing,
      socketConnected,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth precisa estar dentro de AuthProvider.'
    );
  }

  return context;
}
