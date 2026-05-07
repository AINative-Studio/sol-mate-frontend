import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
// import { signAndSendTransaction } from '../services/walletService'; // DISABLED

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  type: 'text' | 'gift';
  gift_amount?: number;
}

interface ChatScreenProps {
  matchId: string;
  partnerName: string;
  onCheckIn: () => void;
  onBack: () => void;
}

export default function ChatScreen({
  matchId,
  partnerName,
  onCheckIn,
  onBack,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(0.1);
  const [isSending, setIsSending] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMatchData();
    loadMessages();
    getCurrentUserId();

    // Poll messages
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (matchData?.expires_at) {
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [matchData]);

  const loadMatchData = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/v1/matches/${matchId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMatchData(data);
      }
    } catch (error) {
      console.error('Failed to load match data:', error);
    }
  };

  const getCurrentUserId = async () => {
    const personaId = await AsyncStorage.getItem('current_persona_id');
    setCurrentUserId(personaId || '');
  };

  const loadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/v1/messages?match_id=${matchId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const updateCountdown = () => {
    if (!matchData?.expires_at) return;

    const expires = new Date(matchData.expires_at);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('Expired');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 24) {
      setTimeRemaining(`${hours}h ${minutes}m left`);
    } else {
      const days = Math.floor(hours / 24);
      setTimeRemaining(`${days}d left`);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    setIsSending(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
          content: inputText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setInputText('');
      loadMessages();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const sendGift = async () => {
    setIsSending(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');

      // Create transfer on backend
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
          amount: giftAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transfer');
      }

      const { transaction } = await response.json();

      // Sign and send transaction with wallet
      // In real app: decode transaction, sign, send
      // For now, just create message
      await fetch(`${API_CONFIG.BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
          content: `🎁 Sent ${giftAmount} SOL`,
          type: 'gift',
          gift_amount: giftAmount,
        }),
      });

      setShowGiftModal(false);
      setGiftAmount(0.1);
      loadMessages();
      Alert.alert('Gift Sent!', `You sent ${giftAmount} SOL`);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send gift');
    } finally {
      setIsSending(false);
    }
  };

  const canCheckIn = () => {
    if (!matchData?.expires_at) return false;

    const expires = new Date(matchData.expires_at);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);

    // Can check in 2 hours before expiry
    return hoursRemaining <= 2 && hoursRemaining > 0;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_id === currentUserId;

    if (item.type === 'gift') {
      return (
        <View style={[styles.messageBubble, styles.giftBubble]}>
          <Text style={styles.giftText}>
            🎁 {isOwn ? 'You' : partnerName} sent {item.gift_amount} SOL
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownMessage : styles.theirMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.theirMessageText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{partnerName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
      </View>

      {/* Stake Banner */}
      <View style={styles.stakeBanner}>
        <View style={styles.stakeInfo}>
          <Text style={styles.stakeLabel}>Stakes locked</Text>
          <Text style={styles.stakeAmount}>
            {matchData?.stake_amount || 0} SOL each
          </Text>
        </View>
        <View style={[
          styles.countdownPill,
          timeRemaining.includes('h') && styles.countdownWarning,
        ]}>
          <Text style={styles.countdownText}>{timeRemaining}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Actions */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.giftButton}
          onPress={() => setShowGiftModal(true)}
        >
          <Text style={styles.giftButtonText}>🎁</Text>
        </TouchableOpacity>

        {canCheckIn() && (
          <TouchableOpacity style={styles.checkInButton} onPress={onCheckIn}>
            <Text style={styles.checkInText}>Check In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="rgba(13,13,13,0.3)"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.sendText}>›</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Gift Modal */}
      <Modal
        visible={showGiftModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.giftModal}>
            <Text style={styles.giftModalTitle}>Send a Gift</Text>
            <Text style={styles.giftModalSub}>
              Send SOL directly to {partnerName}
            </Text>

            <View style={styles.giftAmounts}>
              {[0.1, 0.25, 0.5, 1, 2].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.giftAmountBtn,
                    giftAmount === amount && styles.giftAmountBtnActive,
                  ]}
                  onPress={() => setGiftAmount(amount)}
                >
                  <Text
                    style={[
                      styles.giftAmountText,
                      giftAmount === amount && styles.giftAmountTextActive,
                    ]}
                  >
                    {amount} SOL
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.sendGiftButton}
              onPress={sendGift}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.sendGiftText}>
                  Send {giftAmount} SOL
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowGiftModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(13,13,13,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    color: Colors.black,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headerName: {
    fontSize: 18,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
  },
  headerStatus: {
    fontSize: 13,
    fontFamily: Fonts.nunito.regular,
    color: Colors.purple,
  },
  stakeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(240,64,122,0.08)',
  },
  stakeInfo: {
    flex: 1,
  },
  stakeLabel: {
    fontSize: 12,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
  },
  stakeAmount: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.pink,
  },
  countdownPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(13,13,13,0.08)',
    borderRadius: BorderRadius.round,
  },
  countdownWarning: {
    backgroundColor: Colors.orange,
  },
  countdownText: {
    fontSize: 13,
    fontFamily: Fonts.nunito.bold,
    color: 'rgba(13,13,13,0.7)',
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.pink,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13,13,13,0.06)',
  },
  messageText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.white,
  },
  theirMessageText: {
    color: Colors.black,
  },
  giftBubble: {
    alignSelf: 'center',
    backgroundColor: Colors.purple,
    maxWidth: '80%',
  },
  giftText: {
    fontSize: 14,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  giftButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(176,126,247,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftButtonText: {
    fontSize: 20,
  },
  checkInButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.purple,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13,13,13,0.08)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(13,13,13,0.05)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: Colors.black,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontSize: 24,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  giftModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
  },
  giftModalTitle: {
    fontSize: 24,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  giftModalSub: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
    marginBottom: Spacing.lg,
  },
  giftAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  giftAmountBtn: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 14,
    backgroundColor: 'rgba(13,13,13,0.06)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  giftAmountBtnActive: {
    backgroundColor: Colors.purple,
  },
  giftAmountText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.bold,
    color: 'rgba(13,13,13,0.7)',
  },
  giftAmountTextActive: {
    color: Colors.white,
  },
  sendGiftButton: {
    paddingVertical: 16,
    backgroundColor: Colors.purple,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sendGiftText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  cancelButton: {
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.5)',
    textAlign: 'center',
  },
});
