import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const REFUSAL_REASONS = {
  REFUSED_BREAK: 'Pause',
  REFUSED_MEAL_TIME: 'Heure de repas',
  REFUSED_END_OF_SHIFT: 'Fin de quart',
  REFUSED_MESSAGING: 'Messagerie',
  REFUSED_OTHER: 'Autre',
} as const;

const ABANDONMENT_REASONS = {
  ABANDONED_OTHER: 'Autre',
} as const;

interface StatusChangeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidate: (reason: string, customReason: string) => void;
  type: 'refusal' | 'abandonment';
  loading?: boolean;
}

export default function StatusChange({
  open,
  onOpenChange,
  onValidate,
  type,
  loading = false,
}: StatusChangeProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  const isRefusal = type === 'refusal';
  const reasons = isRefusal ? REFUSAL_REASONS : ABANDONMENT_REASONS;

  const title = isRefusal ? 'Motif de refus' : "Motif d'abandon";
  const description = isRefusal
    ? 'Sélectionnez un motif de refus pour cette demande.'
    : "Sélectionnez un motif d'abandon pour cette demande.";

  const handleSubmit = () => {
    const finalReason =
      selectedReason === 'REFUSED_OTHER' || selectedReason === 'ABANDONED_OTHER'
        ? customReason
        : selectedReason;
    onValidate(selectedReason, finalReason);
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onOpenChange(false);
  };

  return (
    <Modal visible={open} transparent animationType='fade' onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Form */}
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Motif {!selectedReason ? '*' : '✅'}</Text>
            <View style={styles.selectBox}>
              {Object.entries(reasons).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.option, selectedReason === key && styles.optionActive]}
                  onPress={() => setSelectedReason(key)}
                  disabled={loading}
                >
                  <Text
                    style={[styles.optionText, selectedReason === key && styles.optionTextActive]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(selectedReason === 'REFUSED_OTHER' || selectedReason === 'ABANDONED_OTHER') && (
              <>
                <Text style={[styles.label, { marginTop: 16 }]}>
                  Précisez le motif {!customReason ? '*' : '✅'}
                </Text>
                <TextInput
                  placeholder='Entrez le motif...'
                  value={customReason}
                  onChangeText={setCustomReason}
                  editable={!loading}
                  multiline
                  numberOfLines={3}
                  style={styles.textarea}
                />
              </>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.btnText, styles.btnTextOutline]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnDestructive,
                (loading ||
                  !selectedReason ||
                  ((selectedReason === 'REFUSED_OTHER' || selectedReason === 'ABANDONED_OTHER') &&
                    !customReason.trim())) &&
                  styles.btnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={
                loading ||
                !selectedReason ||
                ((selectedReason === 'REFUSED_OTHER' || selectedReason === 'ABANDONED_OTHER') &&
                  !customReason.trim())
              }
            >
              <Text style={styles.btnText}>{loading ? 'Validation...' : 'Valider'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  description: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  selectBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  optionActive: { backgroundColor: '#3657C3' },
  optionText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  optionTextActive: { color: '#FFFFFF' },
  textarea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  btnDestructive: { backgroundColor: '#EF4444' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  btnTextOutline: { color: '#111827' },
});
