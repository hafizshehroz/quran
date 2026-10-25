import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/app-state';
import { isValidPage, pdfConfig } from '../services/quran';
import { AppText, Button, IconButton, serif } from './ui';

export function PageJump({ currentPage, onClose, onJump }: { currentPage: number; onClose: () => void; onJump: (page: number) => void }) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(String(currentPage));
  const [error, setError] = useState('');
  const jump = () => {
    const page = /^[0-9]+$/.test(value.trim()) ? Number(value) : NaN;
    if (!isValidPage(page)) { setError('Enter a whole page number from 1 to ' + pdfConfig.totalPages + '.'); return; }
    onJump(page);
    onClose();
  };
  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, backgroundColor: '#0007' }}>
      <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} accessibilityLabel="Cancel page jump" accessibilityRole="button" />
      <View accessibilityViewIsModal style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 22, width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><AppText style={{ fontFamily: serif, fontSize: 25, lineHeight: 32 }}>Go to a page</AppText><IconButton icon="close" label="Close page jump" onPress={onClose} /></View>
        <AppText muted style={{ fontSize: 13, marginTop: 10, marginBottom: 20 }}>Use the PDF page number, from 1 to {pdfConfig.totalPages}. Printed page numbers may differ.</AppText>
        <TextInput autoFocus selectTextOnFocus value={value} onChangeText={v => { setValue(v); setError(''); }} onSubmitEditing={jump} returnKeyType="go" keyboardType="number-pad" maxLength={6} accessibilityLabel="PDF page number" placeholder="Page number"
          style={{ minHeight: 56, borderWidth: 1, borderColor: error ? colors.danger : colors.border, borderRadius: 12, paddingHorizontal: 16, color: colors.text, backgroundColor: colors.background, fontSize: 22, marginBottom: 12 }} />
        {!!error && <AppText accessibilityRole="alert" style={{ fontSize: 12, color: colors.danger, marginBottom: 14 }}>{error}</AppText>}
        <Button onPress={jump} icon="arrow">Open page</Button>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
