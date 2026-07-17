import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, SafeAreaView } from 'react-native';

const MENU_ITEMS = [
  { key: 'profile', label: '👤 Perfil' },
  { key: 'wallet', label: '💰 Carteira' },
  { key: 'history', label: '📋 Histórico' },
  { key: 'vehicle', label: '🏍️ Veículo' },
  { key: 'pix', label: '💳 Chave Pix' },
  { key: 'documents', label: '📄 Documentos' },
  { key: 'operations', label: '📞 Central Operacional' },
  { key: 'settings', label: '⚙️ Configurações' },
  { key: 'help', label: '❓ Ajuda' },
];

export default function SideMenu({ visible, onClose, driver, onNavigate, onLogout, darkMode }) {
  const styles = getStyles(darkMode);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView style={[styles.menu, darkMode && styles.menuDark]}>
          <View style={styles.header}>
            <Text style={[styles.driverName, darkMode && styles.textLight]}>
              {driver?.name || 'Entregador Teste'}
            </Text>
            <Text style={[styles.driverEmail, darkMode && styles.textSecondary]}>
              {driver?.email || 'entregador@chinafast.com'}
            </Text>
            <View style={[styles.divider, darkMode && styles.dividerDark]} />
          </View>

          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onNavigate(item.key);
              }}
            >
              <Text style={[styles.menuItemText, darkMode && styles.textLight]}>
                {item.label}
              </Text>
            </Pressable>
          ))}

          <View style={[styles.divider, darkMode && styles.dividerDark]} />
          <Pressable style={styles.menuItem} onPress={onLogout}>
            <Text style={styles.logoutText}>🚪 Sair da conta</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function getStyles(darkMode) {
  const bgSecondary = darkMode ? '#1a2740' : '#ffffff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';
  const borderColor = darkMode ? '#2a3a5a' : '#eef4fa';

  return StyleSheet.create({
    overlay: { flex: 1, flexDirection: 'row' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    menu: { width: 280, backgroundColor: bgSecondary, padding: 20 },
    menuDark: { backgroundColor: '#1a2740' },
    header: { marginBottom: 20 },
    driverName: { fontSize: 20, fontWeight: '700', color: textPrimary },
    driverEmail: { fontSize: 14, color: textSecondary, marginTop: 2 },
    divider: { height: 1, backgroundColor: borderColor, marginVertical: 12 },
    dividerDark: { backgroundColor: '#2a3a5a' },
    menuItem: { paddingVertical: 12, paddingHorizontal: 4 },
    menuItemText: { fontSize: 16, color: textPrimary, fontWeight: '500' },
    logoutText: { fontSize: 16, color: '#f44336', fontWeight: '600' },
    textLight: { color: textPrimary },
    textSecondary: { color: textSecondary },
  });
}
