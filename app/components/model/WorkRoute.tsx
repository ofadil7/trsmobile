import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { WorkRouteDto } from '../../../store/features/porters/porters-schemas';
import { getPorterById } from '../../../store/features/porters/portersSlice';
import {
  assignWorkRoute,
  changeWorkRoute,
  getAllWorkRoutes,
} from '../../../store/features/routesDeTravail/routesDeTravailSlice';

export function WorkRoute({
  open,
  onOpenChange,
  update = false,
  currentRoute,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  update?: boolean;
  currentRoute?: WorkRouteDto | null;
}) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { allWorkRoutes } = useAppSelector((state) => state.workRoute);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      dispatch(getAllWorkRoutes({ pageNumber: 1, pageSize: 10 }));
      if (update && currentRoute?.id) {
        setSelectedId(currentRoute.id);
      } else {
        setSelectedId(null);
      }
    }
  }, [open, dispatch, update, currentRoute]);

  function handleValidate() {
    if (selectedId) {
      if (!update) {
        dispatch(assignWorkRoute({ id: selectedId, request: { userId: auth.auth!.id } })).then(
          () => {
            dispatch(getPorterById(auth.auth!.id));
          },
        );
      } else {
        dispatch(changeWorkRoute({ id: selectedId, request: { userId: auth.auth!.id } })).then(
          () => {
            dispatch(getPorterById(auth.auth!.id));
          },
        );
      }
      onOpenChange(false);
    }
  }

  const handleExpand = (routeId: number) => {
    setSelectedId(selectedId === routeId ? null : routeId);
  };
  const formatBreakTime = (startTime: string, endTime: string) => {
    const start = startTime.substring(0, 5);
    const end = endTime.substring(0, 5);
    return `${start}-${end}`;
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType='fade'
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => onOpenChange(false)}
        />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sélection route de travail</Text>
            <TouchableOpacity onPress={() => onOpenChange(false)} style={{ padding: 6 }}>
              <Ionicons name='close' size={20} color='#111827' />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}>
            {allWorkRoutes.map((route) => {
              const isSelected = selectedId === route.id;
              return (
                <View key={route.id} style={[styles.card, isSelected && styles.cardActive]}>
                  <TouchableOpacity style={styles.row} onPress={() => handleExpand(route.id)}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.radio, isSelected && styles.radioActive]} />
                      <Text style={styles.routeName}>{route.name}</Text>
                    </View>
                    <Ionicons
                      name='chevron-forward'
                      size={18}
                      color='#6B7280'
                      style={{ transform: [{ rotate: isSelected ? '90deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>

                  {isSelected && (
                    <View style={styles.detailBox}>
                      <Text style={styles.detailTitle}>Types de demandes:</Text>
                      <View style={styles.badgeWrap}>
                        {route.workRouteType.map((c, index) => (
                          <View key={index} style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {c === 'TRANSPORT_PATIENT' && 'Transport de patient'}
                              {c === 'TRANSPORT_MESSAGING' && 'Transport de messagerie'}
                              {c === 'TRANSPORT_EQUIPMENT' && 'Transport de matériel'}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Début:</Text> {route.startTime}
                      </Text>
                      <Text style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Fin:</Text> {route.endTime}
                      </Text>
                      {route.workRouteBreak.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                          <Text style={styles.detailLabel}>Pauses:</Text>
                          {route.workRouteBreak.map((pause, index) => (
                            <Text key={index} style={styles.detailItem}>
                              {pause.name} ({formatBreakTime(pause.startTime, pause.endTime)})
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={() => onOpenChange(false)}
            >
              <Text style={[styles.btnText, { color: '#111827' }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, !selectedId && styles.btnDisabled]}
              disabled={!selectedId}
              onPress={handleValidate}
            >
              <Text style={styles.btnText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 12,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  scrollView: { maxHeight: '70%' },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    flexShrink: 1,
  },
  cardActive: { backgroundColor: '#F3F4F6', borderColor: '#3657C3' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 10,
  },
  radioActive: { borderColor: '#3657C3', backgroundColor: '#3657C3' },
  routeName: { fontSize: 14, fontWeight: '600', color: '#111827', flexShrink: 1 },
  detailBox: { paddingHorizontal: 12, paddingBottom: 12 },
  detailTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  badge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#111827' },
  detailItem: { fontSize: 12, color: '#111827', marginTop: 2, flexShrink: 1 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0,
    borderTopColor: '#E5E7EB',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  btnPrimary: { backgroundColor: '#16A34A' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontWeight: '600', color: '#FFFFFF' },
});
