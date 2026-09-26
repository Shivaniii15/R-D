import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeColors } from '../theme/ThemeContext';

export default function DisclaimerNotice(): React.JSX.Element {
  const [visible, setVisible] = useState(true);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Important Notice</Text>
          <Text style={styles.body}>
            This app is not a replacement for professional mental health support and is purely for keeping track of your mental health.
            If you’re struggling, please reach out to a qualified professional.
          </Text>
             <View style={styles.buttonRow}>
             <TouchableOpacity
             style={[styles.button, styles.exitButton]}
             onPress={() => BackHandler.exitApp()}
            >
            <Text style={styles.exitButtonText}>Exit App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.understandButton]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.buttonText}>I Understand</Text>
            </TouchableOpacity>


          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 12,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 24,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  understandButton: {
    backgroundColor: colors.accent,
  },

  exitButton: {
    backgroundColor: '#e74c3c',
  },

  buttonText: {
    color: colors.accentText,
    fontWeight: '600',
    fontSize: 15,
  },

  exitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  });
}
