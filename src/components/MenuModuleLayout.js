import React from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import colors from '../theme/colors';

export default function MenuModuleLayout({
  title,
  subtitle,
  navigation,
  children,
}) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
        'bottom',
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              {title}
            </Text>

            {subtitle ? (
              <Text style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  container: {
    flex: 1,
  },

  header: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border,
    backgroundColor:
      colors.surface,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.surfaceLight,
  },

  backText: {
    color: colors.text,
    fontSize: 37,
    lineHeight: 39,
  },

  headerText: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 42,
  },
});
