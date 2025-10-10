import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from '../../constants/Styles';
import { useTopBar } from '../../contexts/TopBarContext';
import {
  abandonTicket,
  acceptTicket,
  completeTicket,
  getTicketById,
  moveToDestination,
  moveToOrigin,
  refuseTicket,
  retrieveItem,
} from '../../store/features/tickets/ticketsSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import StatusChangeModal from '../components/model/StatusChange';
import Loading from '../components/ui/loading';

// Add the missing statusMap with all statuses from web version
const detailedStatusMap: { [key: string]: { label: string; colorBg: string; colorText: string } } =
  {
    NEW: { label: 'Nouveau', colorBg: '#DBEAFE', colorText: '#1E40AF' },
    SENT: { label: 'Envoyé', colorBg: '#CFFAFE', colorText: '#0E7490' },
    WAITING_FOR_ACCEPTANCE: {
      label: "En attente d'acceptation",
      colorBg: '#FEF3C7',
      colorText: '#92400E',
    },
    ACCEPTED: { label: 'Accepté', colorBg: '#D1FAE5', colorText: '#065F46' },
    REFUSED: { label: 'Refusé', colorBg: '#FEE2E2', colorText: '#DC2626' },
    ITEM_RETRIEVED: { label: 'Objet récupéré', colorBg: '#E0E7FF', colorText: '#3730A3' },
    MOVING_TO_DESTINATION: {
      label: 'En route vers destination',
      colorBg: '#E0E7FF',
      colorText: '#3730A3',
    },
    MOVING_TO_ORIGIN: {
      label: 'En route vers origine',
      colorBg: '#E0E7FF',
      colorText: '#3730A3',
    },
    WAITING_FOR_PORTERS: {
      label: 'En attente de brancardiers',
      colorBg: '#FFEDD5',
      colorText: '#9A3412',
    },
    COMPLETED: { label: 'Terminé', colorBg: '#D1FAE5', colorText: '#065F46' },
    ABANDONED: { label: 'Abandonné', colorBg: '#F3F4F6', colorText: '#374151' },
    CANCELLED: { label: 'Annulé', colorBg: '#F3F4F6', colorText: '#374151' },
    DELETED: { label: 'Supprimé', colorBg: '#F3F4F6', colorText: '#374151' },
  };

// Add the missing formatDateTime function from web version
const formatDateTime = (timestamp: number | string | null): string => {
  if (!timestamp) return '-';
  const unixSeconds = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper function to get event label like web version
const getEventLabel = (fromStatus: string | null, toStatus: string): string => {
  if (fromStatus == null && toStatus === 'NEW') return 'Demande créée';
  if (toStatus === 'NEW') return 'Demande créée';
  if (toStatus === 'SENT') return 'Demande envoyée';
  if (toStatus === 'WAITING_FOR_ACCEPTANCE') return "En attente d'acceptation";
  if (toStatus === 'ACCEPTED') return 'Demande acceptée';
  if (toStatus === 'REFUSED') return 'Demande refusée';
  if (toStatus === 'ITEM_RETRIEVED') return 'Objet récupéré';
  if (toStatus === 'MOVING_TO_DESTINATION') return 'En route vers destination';
  if (toStatus === 'MOVING_TO_ORIGIN') return 'En route vers origine';
  if (toStatus === 'WAITING_FOR_PORTERS') return 'En attente de brancardiers';
  if (toStatus === 'COMPLETED') return 'Demande terminée';
  if (toStatus === 'ABANDONED') return 'Demande abandonnée';
  if (toStatus === 'CANCELLED') return 'Demande annulée';
  if (toStatus === 'DELETED') return 'Demande supprimée';
  return toStatus;
};

export default function TicketDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setHideTopBar } = useTopBar();
  const ticketId = id ? Number(id) : undefined;
  const dispatch = useAppDispatch();
  const { singleTicket, loading } = useAppSelector((state) => state.tickets);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState<'refusal' | 'abandonment'>('refusal');

  useEffect(() => {
    if (ticketId) dispatch(getTicketById(ticketId));
  }, [ticketId, dispatch]);

  useEffect(() => {
    setHideTopBar(true);
    return () => setHideTopBar(false);
  }, [setHideTopBar]);

  const handleAction = (type: string, ticketId: number) => {
    switch (type) {
      case 'accept':
        dispatch(acceptTicket(ticketId)).unwrap();
        break;
      case 'moveToOrigin':
        dispatch(moveToOrigin(ticketId)).unwrap();
        break;
      case 'retrieveItem':
        dispatch(retrieveItem(ticketId)).unwrap();
        break;
      case 'moveToDestination':
        dispatch(moveToDestination(ticketId)).unwrap();
        break;
      case 'complete':
        dispatch(completeTicket(ticketId)).unwrap();
        break;
    }
  };

  const openStatusModal = (type: 'refusal' | 'abandonment') => {
    setModalType(type);
    setShowStatusModal(true);
  };

  const ticketTypeLabelMap: Record<string, string> = {
    TRANSPORT_PATIENT: 'Transport de patient',
    TRANSPORT_MESSAGING: 'Transport de messagerie',
    TRANSPORT_EQUIPMENT: 'Transport de matériel',
  };

  const splitDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return { date: '-', horaire: '-' };
    const [date = '', horaire = ''] = dateTimeString.split('T');
    return { date, horaire };
  };

  if (loading || !singleTicket.data) return <Loading />;

  const ticket = singleTicket.data;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={22} color='#111827' />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Détails de la demande</Text>
          <Text style={styles.headerSubtitle}>{`DEM-${ticket.id}`}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 4 }}>
          {/* Ticket Status */}
          <View style={styles.badgeRow}>
            {ticket.isStat ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: '#FFEDD5', flexDirection: 'row', alignItems: 'center' },
                ]}
              >
                <Ionicons name='warning' size={14} color='#9A3412' />
                <Text style={[styles.badgeText, { color: '#9A3412', marginLeft: 6 }]}>
                  Priorité STAT
                </Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: '#E5E7EB' }]}>
                <Text style={styles.badgeText}>Priorité P{ticket.priority}</Text>
              </View>
            )}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: detailedStatusMap[ticket.ticketStatus]?.colorBg || '#E5E7EB',
                  marginLeft: 'auto',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: detailedStatusMap[ticket.ticketStatus]?.colorText || '#374151' },
                ]}
              >
                {detailedStatusMap[ticket.ticketStatus]?.label || ticket.ticketStatus}
              </Text>
            </View>
          </View>

          {/* General Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations générales</Text>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>ID demande</Text>
                <Text style={styles.value}>TRS-{ticket.id}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>Type de demande</Text>
                <Text style={styles.value}>{ticketTypeLabelMap[ticket.ticketType]}</Text>
              </View>
            </View>

            {/* Locations */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.muted}>Localisation</Text>
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.smallLabel}>Origine</Text>
                  <View style={[styles.badge, { backgroundColor: '#F3F4F6', marginTop: 4 }]}>
                    <Text style={styles.badgeTextDark}>{ticket.serviceDeparture?.name}</Text>
                  </View>
                  <Text style={styles.note}>{ticket.serviceDeparture?.locationName}</Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.smallLabel}>Destination</Text>
                  <View style={[styles.badge, { backgroundColor: '#F3F4F6', marginTop: 4 }]}>
                    <Text style={styles.badgeTextDark}>{ticket.serviceArrival?.name}</Text>
                  </View>
                  <Text style={styles.note}>{ticket.serviceArrival?.locationName}</Text>
                </View>
              </View>
            </View>

            {/* Priority & Status */}
            <View style={[styles.gridRow, { marginTop: 8 }]}>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>Statut</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: detailedStatusMap[ticket.ticketStatus]?.colorBg || '#F3F4F6',
                    },
                  ]}
                >
                  <Text style={styles.badgeTextDark}>
                    {detailedStatusMap[ticket.ticketStatus]?.label || ticket.ticketStatus}
                  </Text>
                </View>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>Priorité</Text>
                <View
                  style={[styles.badge, { backgroundColor: ticket.isStat ? '#FFEDD5' : '#E5E7EB' }]}
                >
                  <Text style={styles.badgeTextDark}>
                    {ticket.isStat ? 'STAT' : `P${ticket.priority}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Patient & Equipment */}
            <View style={[styles.gridRow, { marginTop: 8 }]}>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>No Dossier</Text>
                <Text style={styles.value}>{ticket.patientFileNumber}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>Retour d&apos;équipement</Text>
                <Text style={styles.value}>{ticket.returnEquipment ? 'Oui' : 'Non'}</Text>
              </View>
            </View>

            {/* Notes */}
            <View style={{ marginTop: 8 }}>
              <Text style={styles.muted}>Notes</Text>
              <Text style={styles.value}>{ticket.notes}</Text>
            </View>
          </View>

          {/* Planning */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Planification</Text>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>Date</Text>
                <Text style={styles.value}>{splitDateTime(ticket.scheduledAt).date}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.muted}>Horaire</Text>
                <Text style={styles.value}>{splitDateTime(ticket.scheduledAt).horaire}</Text>
              </View>
            </View>
          </View>

          {/* Précautions et infections - MISSING SECTION ADDED */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Précautions et infections</Text>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.muted}>Type d&apos;infection</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: ticket.precautionStatus?.backgroundColor || '#F3F4F6',
                      alignSelf: 'flex-start',
                      marginTop: 4,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: ticket.precautionStatus?.foregroundColor || '#374151' },
                    ]}
                  >
                    {ticket.precautionStatus?.name || '-'}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.muted}>Équipement requis par le brancardier</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {ticket.precautionStatusEvents?.flatMap((precaution) =>
                    precaution.equipments.map((equipement) => (
                      <View
                        key={`${precaution.id}-${equipement}`}
                        style={[
                          styles.badge,
                          {
                            backgroundColor: precaution.backgroundColor || '#F3F4F6',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: precaution.foregroundColor || '#374151' },
                          ]}
                        >
                          {equipement}
                        </Text>
                      </View>
                    )),
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Porters */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Brancardiers assignés</Text>
            <View style={{ gap: 8 }}>
              {ticket.porters.map((porter) => {
                const porterEvent = ticket.ticketStatusEvents?.find(
                  (t) => t.idPorter === porter.id,
                );
                const status = porterEvent
                  ? detailedStatusMap[porterEvent.toStatus]
                  : detailedStatusMap[ticket.ticketStatus];

                return (
                  <View key={porter.id} style={styles.porterRow}>
                    <Text style={styles.value}>{porter.firstName + ' ' + porter.lastName}</Text>
                    <View style={[styles.badge, { backgroundColor: status?.colorBg || '#F3F4F6' }]}>
                      <Text style={[styles.badgeText, { color: status?.colorText || '#374151' }]}>
                        {status?.label || ''}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Historique des événements - MISSING SECTION ADDED */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Historique des événements</Text>
            <View style={{ gap: 8 }}>
              {ticket.ticketStatusEvents?.map((event, index) => (
                <View key={index} style={styles.porterRow}>
                  <Text style={[styles.value, { fontSize: 14 }]}>
                    {getEventLabel(event.fromStatus, event.toStatus)}
                  </Text>
                  <Text style={[styles.badge, { fontSize: 12 }]}>
                    {formatDateTime(event.timestamp)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.ticketActions}>
          {ticket.ticketStatus === 'WAITING_FOR_ACCEPTANCE' && (
            <>
              <TouchableOpacity
                style={[styles.ticketButton, styles.refuseButton]}
                onPress={() => openStatusModal('refusal')}
              >
                <Text style={styles.buttonText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, styles.acceptButton]}
                onPress={() => handleAction('accept', ticket.id)}
              >
                <Text style={styles.buttonText}>Accepter</Text>
              </TouchableOpacity>
            </>
          )}

          {ticket.ticketStatus === 'WAITING_FOR_PORTERS' && (
            <>
              <TouchableOpacity
                style={[styles.ticketButton, styles.refuseButton]}
                onPress={() => openStatusModal('refusal')}
              >
                <Text style={styles.buttonText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, styles.acceptButton]}
                onPress={() => handleAction('accept', ticket.id)}
              >
                <Text style={styles.buttonText}>Accepter</Text>
              </TouchableOpacity>
            </>
          )}

          {ticket.ticketStatus === 'ACCEPTED' && (
            <>
              <TouchableOpacity
                style={[styles.ticketButton, styles.primaryButton]}
                onPress={() => handleAction('moveToOrigin', ticket.id)}
              >
                <Text style={styles.buttonText}>Déplacement vers l&apos;origine</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, styles.refuseButton]}
                onPress={() => openStatusModal('abandonment')}
              >
                <Text style={styles.buttonText}>Abandonner</Text>
              </TouchableOpacity>
            </>
          )}

          {ticket.ticketStatus === 'MOVING_TO_ORIGIN' && (
            <>
              <TouchableOpacity
                style={[styles.ticketButton, styles.acceptButton]}
                onPress={() => handleAction('retrieveItem', ticket.id)}
              >
                <Text style={styles.buttonText}>Récupéré</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, styles.refuseButton]}
                onPress={() => openStatusModal('abandonment')}
              >
                <Text style={styles.buttonText}>Abandonner</Text>
              </TouchableOpacity>
            </>
          )}

          {ticket.ticketStatus === 'ITEM_RETRIEVED' && (
            <>
              <TouchableOpacity
                style={[styles.ticketButton, styles.primaryButton]}
                onPress={() => handleAction('moveToDestination', ticket.id)}
              >
                <Text style={styles.buttonText}>Déplacement vers la destination</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, styles.refuseButton]}
                onPress={() => openStatusModal('abandonment')}
              >
                <Text style={styles.buttonText}>Abandonner</Text>
              </TouchableOpacity>
            </>
          )}

          {ticket.ticketStatus === 'MOVING_TO_DESTINATION' && (
            <>
              <TouchableOpacity
                style={[styles.ticketButton, styles.acceptButton]}
                onPress={() => handleAction('complete', ticket.id)}
              >
                <Text style={styles.buttonText}>Complété</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, styles.refuseButton]}
                onPress={() => openStatusModal('abandonment')}
              >
                <Text style={styles.buttonText}>Abandonner</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Modal */}
      {showStatusModal && singleTicket && (
        <StatusChangeModal
          open={showStatusModal}
          onOpenChange={setShowStatusModal}
          type={modalType}
          onValidate={(reason: string, custom: string) => {
            if (modalType === 'refusal') {
              dispatch(
                refuseTicket({
                  id: singleTicket.data?.id ?? 0,
                  request: { reason, customReason: custom },
                }),
              ).unwrap();
            } else {
              dispatch(
                abandonTicket({
                  id: singleTicket.data?.id ?? 0,
                  request: { reason, customReason: custom },
                }),
              ).unwrap();
            }
            setShowStatusModal(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}
