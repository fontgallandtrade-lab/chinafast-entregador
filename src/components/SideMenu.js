import React, {
  useEffect,
  useRef,
} from 'react';

import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import colors from '../theme/colors';

const SCREEN_WIDTH =
  Dimensions.get('window').width;

const MENU_WIDTH =
  Math.min(SCREEN_WIDTH * 0.82, 340);

const MENU_ITEMS = [
  {
    key: 'profile',
    icon: '👤',
    label: 'Meu perfil',
  },
  {
    key: 'wallet',
    icon: '💰',
    label: 'Carteira',
  },
  {
    key: 'earnings',
    icon: '📈',
    label: 'Ganhos',
  },
  {
    key: 'history',
    icon: '📋',
    label: 'Histórico',
  },
  {
    key: 'vehicle',
    icon: '🏍️',
    label: 'Veículo',
  },
  {
    key: 'pix',
    icon: '◆',
    label: 'Chave Pix',
  },
  {
    key: 'documents',
    icon: '📄',
    label: 'Documentos',
  },
  {
    key: 'operations',
    icon: '🎧',
    label: 'Central Operacional',
  },
  {
    key: 'settings',
    icon: '⚙️',
    label: 'Configurações',
  },
  {
    key: 'help',
    icon: '❓',
    label: 'Ajuda',
  },
];

export default function SideMenu({
  visible,
  driver,
  socketConnected = false,
  onClose,
  onNavigate,
  onLogout,
}) {
  const translateX = useRef(
    new Animated.Value(-MENU_WIDTH)
  ).current;

  const overlayOpacity = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateX.setValue(-MENU_WIDTH);
      overlayOpacity.setValue(0);
    }
  }, [
    visible,
    overlayOpacity,
    translateX,
  ]);

  function handleNavigate(key) {
    onClose?.();

    setTimeout(() => {
      onNavigate?.(key);
    }, 180);
  }

  function handleLogout() {
    onClose?.();

    setTimeout(() => {
      onLogout?.();
    }, 180);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.menu,
            {
              width: MENU_WIDTH,
              transform: [
                {
                  translateX,
                },
              ],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(driver?.name || 'E')
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.name}>
                  {driver?.name ||
                    'Entregador'}
                </Text>

                <Text style={styles.role}>
                  Entregador ChinaFast
                </Text>

                <View style={styles.connectionRow}>
                  <View
                    style={[
                      styles.connectionDot,
                      socketConnected
                        ? styles.connectedDot
                        : styles.disconnectedDot,
                    ]}
                  />

                  <Text style={styles.connectionText}>
                    {socketConnected
                      ? 'Conectado'
                      : 'Desconectado'}
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={
                styles.scrollContent
              }
              showsVerticalScrollIndicator={false}
            >
              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed &&
                      styles.menuItemPressed,
                  ]}
                  onPress={() =>
                    handleNavigate(item.key)
                  }
                >
                  <View
                    style={
                      styles.menuIconContainer
                    }
                  >
                    <Text style={styles.menuIcon}>
                      {item.icon}
                    </Text>
                  </View>

                  <Text style={styles.menuLabel}>
                    {item.label}
                  </Text>

                  <Text style={styles.arrow}>
                    ›
                  </Text>
                </Pressable>
              ))}

              <View style={styles.divider} />

              <Pressable
                style={({ pressed }) => [
                  styles.logoutItem,
                  pressed &&
                    styles.menuItemPressed,
                ]}
                onPress={handleLogout}
              >
                <View
                  style={
                    styles.logoutIconContainer
                  }
                >
                  <Text style={styles.menuIcon}>
                    ⏻
                  </Text>
                </View>

                <Text style={styles.logoutLabel}>
                  Sair da conta
                </Text>
              </Pressable>

              <View style={styles.versionBox}>
                <Text style={styles.versionTitle}>
                  ChinaFast Premium
                </Text>

                <Text style={styles.versionText}>
                  Versão 3.0
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'row',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  menu: {
    height: '100%',
    backgroundColor: colors.surface,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },

  safeArea: {
    flex: 1,
  },

  profileHeader: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 22,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },

  role: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  connectedDot: {
    backgroundColor: colors.success,
  },

  disconnectedDot: {
    backgroundColor: colors.danger,
  },

  connectionText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },

  closeText: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 30,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },

  menuItem: {
    minHeight: 58,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  menuItemPressed: {
    backgroundColor: colors.surfaceLight,
  },

  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  logoutIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(215,25,32,0.18)',
  },

  menuIcon: {
    fontSize: 18,
  },

  menuLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 13,
  },

  arrow: {
    color: colors.textSecondary,
    fontSize: 27,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  logoutItem: {
    minHeight: 58,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  logoutLabel: {
    color: '#ff6268',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 13,
  },

  versionBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginTop: 20,
  },

  versionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  versionText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
