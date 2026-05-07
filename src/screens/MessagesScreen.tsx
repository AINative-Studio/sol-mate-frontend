import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

interface Match {
  id: string;
  persona_name: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  stake_amount: number;
  expires_at: string;
}

interface MessagesScreenProps {
  onSelectChat: (matchId: string) => void;
}

export default function MessagesScreen({ onSelectChat }: MessagesScreenProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatches();

    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const personaId = await AsyncStorage.getItem('current_persona_id');

      if (!token || !personaId) {
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/v1/matches?status=accepted&persona_id=${personaId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load matches');
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('❌ Load matches failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 0) return 'Expired';
    if (hours < 2) return `${hours}h left`;
    if (hours < 24) return `${hours}h left`;

    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => onSelectChat(item.id)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.persona_name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.persona_name}</Text>
          <Text style={styles.matchTime}>
            {formatTime(item.last_message_time)}
          </Text>
        </View>

        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Start chatting...'}
        </Text>

        <View style={styles.matchFooter}>
          <Text style={styles.stakeText}>
            {item.stake_amount} SOL staked
          </Text>
          <Text style={[
            styles.expiryText,
            item.expires_at && getTimeRemaining(item.expires_at).includes('left') && styles.expiryWarning
          ]}>
            {getTimeRemaining(item.expires_at)}
          </Text>
        </View>
      </View>

      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.pink, Colors.purple]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[Colors.pink, Colors.purple]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Text style={styles.heading}>Messages</Text>
        <Text style={styles.subheading}>
          {matches.length} active {matches.length === 1 ? 'chat' : 'chats'}
        </Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            Start browsing to find your SOLmate!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  heading: {
    fontSize: 32,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
  },
  matchTime: {
    fontSize: 12,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.4)',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.6)',
    marginBottom: 6,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stakeText: {
    fontSize: 12,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.pink,
  },
  expiryText: {
    fontSize: 12,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.4)',
  },
  expiryWarning: {
    color: Colors.orange,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});
