import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function LoadingOverlay({
  message = 'Carregando...',
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#d71920"
      />

      <Text style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },

  text: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
  },
});
