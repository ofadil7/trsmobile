// components/Chat.tsx (updated)
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../constants/Styles';
import { useTopBar } from '../contexts/TopBarContext';
import { useChatHub } from '../hooks/useChatHub';
import { useTypingStatus } from '../hooks/useTypingStatus';
import {
  getAllChatMessages,
  sendChatMessage,
} from '../store/features/chatMessages/chatMessagesSlice';
import { MembersResponse } from '../store/features/members/members-schemas';
import { getAllMembers } from '../store/features/members/membersSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Loading from './components/ui/loading';

const RoleMap = {
  1: 'Administrateur',
  2: 'Brancardier',
  3: 'Demandeur',
  4: 'Superviseur',
  5: 'AI',
} as const;

export default function Chat() {
  const dispatch = useAppDispatch();
  const { auth } = useAppSelector((state) => state.auth);
  const currentUserId = auth?.id;
  const { setHideTopBar } = useTopBar();

  // Use the chat hub hook - with error boundary
  const { connection, isConnected, isConnecting } = useChatHub();
  const { sendTyping } = useTypingStatus(connection, currentUserId);

  const { allMembers, loading } = useAppSelector((state) => state.members);
  const { openChatWithUserId, allChatMessages } = useAppSelector((state) => state.chatMessages);

  const [selectedMember, setSelectedMember] = useState<MembersResponse | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // AI member placeholder
  const aiMember = useMemo<MembersResponse>(
    () => ({
      numero: -1,
      firstName: 'AI',
      lastName: 'Assistant',
      lastLogin: new Date().toISOString(),
      noType: 5,
      addUser: 0,
      addDate: '',
      modUser: 0,
      modDate: '',
      username: '',
      password: '',
      email: '',
      address: '',
      tel: '',
      active: null,
      noCountry: 0,
      noProvince: 0,
      noCity: 0,
      groupeId: 0,
      nameCountry: null,
      nameProvince: null,
      nameCity: null,
      role: null,
      groupeName: null,
      lastHit: new Date(),
      nameAddUser: null,
      roleAddUser: null,
      nameModUser: null,
      roleModUser: null,
      name: '',
      isConnected: 0,
      dateDebutAbsence: null,
      dateFinAbsence: null,
    }),
    [],
  );

  const allMembersWithAI = useMemo(() => [aiMember, ...(allMembers || [])], [aiMember, allMembers]);

  const filteredMembers = useMemo(
    () =>
      allMembersWithAI
        .filter((m) => `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()))
        .filter((m) => m.numero !== currentUserId),
    [allMembersWithAI, search, currentUserId],
  );

  const conversationMessages = useMemo(
    () =>
      allChatMessages.filter(
        (msg) =>
          (msg.senderId === currentUserId && msg.receiverId === selectedMember?.numero) ||
          (msg.senderId === selectedMember?.numero && msg.receiverId === currentUserId),
      ),
    [allChatMessages, currentUserId, selectedMember],
  );

  useEffect(() => {
    setHideTopBar(true);
    return () => setHideTopBar(false);
  }, [setHideTopBar]);

  useEffect(() => {
    dispatch(getAllChatMessages());
    dispatch(getAllMembers({}));
  }, [dispatch]);

  useEffect(() => {
    if (openChatWithUserId) {
      const member = allMembersWithAI.find((m) => m.numero === openChatWithUserId);
      if (member) setSelectedMember(member);
    }
  }, [openChatWithUserId, allMembersWithAI]);

  const sendMessage = () => {
    if (newMessage.trim() && selectedMember) {
      dispatch(
        sendChatMessage({
          senderId: auth?.id ?? null,
          receiverId: selectedMember.numero,
          message: newMessage,
        }),
      );
      setNewMessage('');
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [conversationMessages]);

  const isCurrentlyAbsent = (start?: string | null, end?: string | null) => {
    if (!start || !end) return false;
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
  };
  if (isConnecting) {
    return <Loading />;
  }
  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {!selectedMember ? (
        <View style={styles.containerchat}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/')} style={styles.backBtn}>
              <Ionicons name='arrow-back' size={22} color='#111827' />
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <TextInput
                placeholder='Rechercher un admin...'
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                ref={inputRef}
              />
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Image
                source={{
                  uri: 'http://trs.optimizehealthsolutions.ma/assets/trs-logo-CqWuv3a1.png',
                }}
                style={styles.loadingImage}
                resizeMode='contain'
              />
              <ActivityIndicator size='large' color='#3657C3' style={styles.loadingSpinner} />
            </View>
          ) : (
            <ScrollView style={styles.membersList}>
              {filteredMembers.map((member) => (
                <TouchableOpacity
                  key={member.numero}
                  style={styles.memberItem}
                  onPress={() => setSelectedMember(member)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </Text>
                    <View
                      style={[
                        styles.statusDot,
                        isCurrentlyAbsent(member.dateDebutAbsence, member.dateFinAbsence)
                          ? { backgroundColor: 'red' }
                          : member.isConnected === 1 || member.noType === 5
                          ? { backgroundColor: 'green' }
                          : { backgroundColor: 'gray' },
                      ]}
                    />
                  </View>
                  <View>
                    <Text style={styles.memberName}>
                      {member.firstName} {member.lastName}
                    </Text>
                    <Text style={styles.memberRole}>
                      {RoleMap[member.noType as keyof typeof RoleMap]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedMember(null)}>
              <Ionicons name='arrow-back' size={24} color='#111827' />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>
              {selectedMember.firstName} {selectedMember.lastName}
            </Text>
            <TouchableOpacity onPress={() => setSelectedMember(null)}>
              <Feather name='x' size={24} color='#111827' />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messages} ref={scrollRef}>
            {conversationMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.senderId === currentUserId ? styles.messageRight : styles.messageLeft,
                ]}
              >
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Tapez votre message...'
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={sendMessage}
              style={styles.messageInput}
              ref={inputRef}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
              <Feather name='send' size={20} color='white' />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
