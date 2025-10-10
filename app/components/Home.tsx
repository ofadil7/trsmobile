import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../constants/Styles';
import { TicketDto, WorkRouteDto } from '../../store/features/porters/porters-schemas';
import { getPorterById } from '../../store/features/porters/portersSlice';
import { endWorkRoute } from '../../store/features/routesDeTravail/routesDeTravailSlice';
import {
  abandonTicket,
  acceptTicket,
  completeTicket,
  moveToDestination,
  moveToOrigin,
  refuseTicket,
  retrieveItem,
} from '../../store/features/tickets/ticketsSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { isTablet } from '../../utils/platform';
import { ResponsiveLayout } from './ResponsiveLayout';
import StatusChangeModal from './model/StatusChange';
import { WorkRoute } from './model/WorkRoute';

// Add the missing statusMap definition from web version
const mobileStatusMap: { [key: string]: { label: string; colorBg: string; colorText: string } } = {
  WAITING_FOR_ACCEPTANCE: {
    label: "En attente d'acceptation",
    colorBg: '#FEF3C7',
    colorText: '#92400E',
  },
  ACCEPTED: {
    label: 'Accepté',
    colorBg: '#D1FAE5',
    colorText: '#065F46',
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
  MOVING_TO_DESTINATION: {
    label: 'En route vers destination',
    colorBg: '#E0E7FF',
    colorText: '#3730A3',
  },
  ITEM_RETRIEVED: {
    label: 'Objet récupéré',
    colorBg: '#E0E7FF',
    colorText: '#3730A3',
  },
};

function WorkRouteAccordion({
  currentPorter,
  authId,
  onChangeRoute,
  onEndDay,
}: {
  currentPorter: any;
  authId?: number;
  onChangeRoute: () => void;
  onEndDay: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.accordion}>
      <Pressable style={styles.accordionTrigger} onPress={() => setIsOpen(!isOpen)}>
        <View>
          <Text style={styles.accordionTitle}>Route de travail sélectionnée</Text>
          <Text style={styles.routeName}>Route: {currentPorter?.workRoute?.name}</Text>
        </View>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color='#6B7280' />
      </Pressable>

      {isOpen && (
        <View style={styles.accordionContent}>
          <View style={styles.routeDetails}>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Début:</Text> {currentPorter.workRoute.startTime}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Fin:</Text> {currentPorter.workRoute.endTime}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Types:</Text>
            </Text>
            <View style={styles.badgeContainer}>
              {currentPorter.workRoute.workRouteType.map((c: string, index: number) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {c === 'TRANSPORT_PATIENT' && 'Transport de patient'}
                    {c === 'TRANSPORT_MESSAGING' && 'Transport de messagerie'}
                    {c === 'TRANSPORT_EQUIPMENT' && 'Transport de matériel'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.changeRouteButton]}
            onPress={onChangeRoute}
          >
            <Text style={styles.actionButtonText}>Changer la route de travail</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.endDayButton]} onPress={onEndDay}>
            <Text style={styles.actionButtonText}>Terminer la journée</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function TicketCard({
  ticket,
  onAction,
  openStatusModal,
  hideTopBar,
  router,
}: {
  ticket: TicketDto;
  onAction: (type: string, ticketId: number) => void;
  openStatusModal: (type: 'refusal' | 'abandonment', ticket: TicketDto) => void;
  hideTopBar: (h: boolean) => void;
  router: ReturnType<typeof useRouter>;
}) {
  // Use the mobile status map with proper fallback
  const status = mobileStatusMap[ticket.ticketStatus] || {
    label: ticket.ticketStatus,
    colorBg: '#F3F4F6',
    colorText: '#374151',
  };

  return (
    <View style={styles.ticketCard}>
      <Pressable
        onPress={() => {
          hideTopBar(true);
          router.push(`/demande/${ticket.id}`);
        }}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketId}>{`TRS-${ticket.id}`}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.colorBg }]}>
            <Text style={[styles.statusText, { color: status.colorText }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.ticketDetail}>
          <Text style={styles.detailLabel}>Origine:</Text> {ticket.serviceMiniDeparture?.name}
        </Text>
        <Text style={styles.ticketDetail}>
          <Text style={styles.detailLabel}>Destination:</Text> {ticket.serviceMiniArrival?.name}
        </Text>
        <Text style={styles.ticketDetail}>
          <Text style={styles.detailLabel}>Précaution et infection:</Text> {ticket.precaution?.name}
        </Text>
      </Pressable>

      {/* Actions depending on status - FIXED LOGIC */}
      <View style={styles.ticketActions}>
        {ticket.ticketStatus === 'WAITING_FOR_ACCEPTANCE' && (
          <>
            <TouchableOpacity
              style={[styles.ticketButton, styles.refuseButton]}
              onPress={() => openStatusModal('refusal', ticket)}
            >
              <Text style={styles.buttonText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ticketButton, styles.acceptButton]}
              onPress={() => onAction('accept', ticket.id)}
            >
              <Text style={styles.buttonText}>Accepter</Text>
            </TouchableOpacity>
          </>
        )}

        {ticket.ticketStatus === 'WAITING_FOR_PORTERS' && (
          <>
            <TouchableOpacity
              style={[styles.ticketButton, styles.refuseButton]}
              onPress={() => openStatusModal('refusal', ticket)}
            >
              <Text style={styles.buttonText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ticketButton, styles.acceptButton, styles.disabledButton]}
              onPress={() => onAction('accept', ticket.id)}
              disabled
            >
              <Text style={styles.buttonText}>Accepter</Text>
            </TouchableOpacity>
          </>
        )}

        {ticket.ticketStatus === 'ACCEPTED' && (
          <>
            <TouchableOpacity
              style={[styles.ticketButton, styles.primaryButton]}
              onPress={() => onAction('moveToOrigin', ticket.id)}
            >
              <Text style={styles.buttonText}>Déplacement vers l&apos;origine</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ticketButton, styles.refuseButton]}
              onPress={() => openStatusModal('abandonment', ticket)}
            >
              <Text style={styles.buttonText}>Abandonner</Text>
            </TouchableOpacity>
          </>
        )}

        {ticket.ticketStatus === 'MOVING_TO_ORIGIN' && (
          <>
            <TouchableOpacity
              style={[styles.ticketButton, styles.acceptButton]}
              onPress={() => onAction('retrieveItem', ticket.id)}
            >
              <Text style={styles.buttonText}>Récupéré</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ticketButton, styles.refuseButton]}
              onPress={() => openStatusModal('abandonment', ticket)}
            >
              <Text style={styles.buttonText}>Abandonner</Text>
            </TouchableOpacity>
          </>
        )}

        {ticket.ticketStatus === 'ITEM_RETRIEVED' && (
          <>
            <TouchableOpacity
              style={[styles.ticketButton, styles.primaryButton]}
              onPress={() => onAction('moveToDestination', ticket.id)}
            >
              <Text style={styles.buttonText}>Déplacement vers la destination</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ticketButton, styles.refuseButton]}
              onPress={() => openStatusModal('abandonment', ticket)}
            >
              <Text style={styles.buttonText}>Abandonner</Text>
            </TouchableOpacity>
          </>
        )}

        {ticket.ticketStatus === 'MOVING_TO_DESTINATION' && (
          <>
            <TouchableOpacity
              style={[styles.ticketButton, styles.acceptButton]}
              onPress={() => onAction('complete', ticket.id)}
            >
              <Text style={styles.buttonText}>Complété</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ticketButton, styles.refuseButton]}
              onPress={() => openStatusModal('abandonment', ticket)}
            >
              <Text style={styles.buttonText}>Abandonner</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default function Home({ hideTopBar }: { hideTopBar: (h: boolean) => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { auth } = useAppSelector((state) => state.auth);
  const { currentPorter } = useAppSelector((state) => state.porters);
  const [showWorkRouteModal, setShowWorkRouteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDto | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<WorkRouteDto | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState<'refusal' | 'abandonment'>('refusal');

  useEffect(() => {
    if (auth?.id) {
      dispatch(getPorterById(auth.id));
      hideTopBar(false);
    }
  }, [auth, dispatch, hideTopBar]);

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

  const openStatusModal = (type: 'refusal' | 'abandonment', ticket: TicketDto) => {
    setSelectedTicket(ticket);
    setModalType(type);
    setShowStatusModal(true);
  };

  // Filter out null tickets like in the web version
  const validTickets = currentPorter?.ticket?.filter((t) => t != null) || [];

  if (!currentPorter?.workRoute) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ResponsiveLayout
          container
          style={styles.noRouteContainer}
          responsive={{
            web: { style: styles.webNoRouteContainer },
            android: { style: styles.smallNoRouteContainer },
            ios: { style: styles.smallNoRouteContainer },
          }}
        >
          <Text style={[styles.greetingText, isTablet() && styles.tabletGreetingText]}>
            Bonjour {currentPorter?.firstName} {currentPorter?.lastName}
          </Text>
          <Text style={[styles.instructionText, isTablet() && styles.tabletInstructionText]}>
            Sélectionnez votre route de travail pour commencer
          </Text>

          <TouchableOpacity
            style={[styles.selectRouteButton, isTablet() && styles.tabletSelectRouteButton]}
            onPress={() => setShowWorkRouteModal(true)}
          >
            <Text
              style={[
                styles.selectRouteButtonText,
                isTablet() && styles.tabletSelectRouteButtonText,
              ]}
            >
              Sélectionner une route de travail
            </Text>
          </TouchableOpacity>

          {showWorkRouteModal && (
            <WorkRoute open={showWorkRouteModal} onOpenChange={setShowWorkRouteModal} />
          )}

          <TouchableOpacity
            style={[styles.floatingChatButton, isTablet() && styles.tabletFloatingChatButton]}
            onPress={() => {
              hideTopBar(true);
              router.push('/chat');
            }}
          >
            <MaterialIcons name='chat' size={isTablet() ? 28 : 24} color='white' />
          </TouchableOpacity>
        </ResponsiveLayout>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.greetingText}>
          Bonjour {currentPorter?.firstName} {currentPorter?.lastName}
        </Text>

        <WorkRouteAccordion
          currentPorter={currentPorter}
          authId={auth?.id}
          onChangeRoute={() => {
            setSelectedRoute(currentPorter.workRoute!);
            setShowWorkRouteModal(true);
          }}
          onEndDay={() =>
            dispatch(
              endWorkRoute({
                id: currentPorter.workRoute?.id ?? 0,
                request: { userId: auth?.id ?? 0 },
              }),
            ).unwrap()
          }
        />

        <View style={styles.ticketsSection}>
          <Text style={styles.sectionTitle}>Mes Transports</Text>
          {validTickets.map((t, i) => (
            <TicketCard
              key={i}
              ticket={t}
              onAction={handleAction}
              openStatusModal={openStatusModal}
              hideTopBar={hideTopBar}
              router={router}
            />
          ))}
        </View>
      </ScrollView>

      {showWorkRouteModal && (
        <WorkRoute
          open={showWorkRouteModal}
          onOpenChange={setShowWorkRouteModal}
          update
          currentRoute={selectedRoute}
        />
      )}

      {showStatusModal && selectedTicket && (
        <StatusChangeModal
          open={showStatusModal}
          onOpenChange={setShowStatusModal}
          type={modalType}
          onValidate={(reason: string, custom: string) => {
            if (modalType === 'refusal') {
              dispatch(
                refuseTicket({ id: selectedTicket.id, request: { reason, customReason: custom } }),
              ).unwrap();
            } else {
              dispatch(
                abandonTicket({ id: selectedTicket.id, request: { reason, customReason: custom } }),
              ).unwrap();
            }
            setShowStatusModal(false);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.floatingChatButton}
        onPress={() => {
          hideTopBar(true);
          router.push('/chat');
        }}
      >
        <MaterialIcons name='chat' size={24} color='white' />
      </TouchableOpacity>
    </>
  );
}
