import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useConversations} from '../api/queries';
import {useCreateConversation} from '../api/mutations';
import Header from '../components/common/Header';

const ConversationListScreen = ({navigation}) => {
  const {data: conversationsData, isLoading, refetch} = useConversations();
  const createConversationMutation = useCreateConversation();
  const [refreshing, setRefreshing] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const conversations = Array.isArray(conversationsData?.data)
    ? conversationsData.data
    : [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCreateConversation = async () => {
    if (!newMessage.trim()) {
      return;
    }

    try {
      const result = await createConversationMutation.mutateAsync({
        subject: 'Support Request',
        first_message: newMessage,
      });

      if (result?.data?.id) {
        setNewMessage('');
        navigation.navigate('ConversationChat', {conversationId: result.data.id});
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const formatTime = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  };

  const getInitials = name => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header
        title="Messages"
        showBack={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#008178']}
              tintColor="#008178"
            />
          }>
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map(index => (
              <View key={index} style={styles.skeletonCard}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonSubtitle} />
                </View>
              </View>
            ))}
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="chatbubbles-outline" size={32} color="#008178" />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation to get help and support
            </Text>
          </View>
        ) : (
          conversations.map(conversation => {
            const lastMessage =
              conversation.last_message_preview ||
              conversation.subject ||
              'No messages yet';
            const isUnread = conversation.user_unread_count > 0;

            return (
              <TouchableOpacity
                key={conversation.id}
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() =>
                  navigation.navigate('ConversationChat', {
                    conversationId: conversation.id,
                  })
                }>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(conversation.subject || 'Support')}
                  </Text>
                </View>

                <View style={styles.content}>
                  <View style={styles.topRow}>
                    <Text
                      style={[styles.subject, isUnread && styles.subjectUnread]}
                      numberOfLines={1}>
                      {conversation.subject || 'Support Conversation'}
                    </Text>
                    <Text style={styles.time}>
                      {formatTime(conversation.updated_at || conversation.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={2}>
                    {lastMessage}
                  </Text>
                </View>

                {isUnread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {conversation.user_unread_count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.newChatContainer}>
        <TextInput
          style={styles.newChatInput}
          placeholder="Type a message to start a new conversation..."
          placeholderTextColor="#8190A7"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleCreateConversation}
          disabled={!newMessage.trim() || createConversationMutation.isPending}>
          <Icon
            name="send"
            size={20}
            color={newMessage.trim() ? '#FFFFFF' : '#A8B3C4'}
            style={{marginRight: 8}}
          />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConversationListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  newChatButton: {
    padding: 8,
  },
  newChatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  newChatInput: {
    width: '100%',
    backgroundColor: '#F5F7FA',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 15,
    color: '#111820',
    maxHeight: 120,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#008178',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#E3E8F0',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F6F6F6',
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3E8F0',
    marginRight: 14,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    width: '60%',
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    width: '80%',
    backgroundColor: '#D9D9D9',
    borderRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#8190A7',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#8190A7',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F6F6F6',
  },
  cardUnread: {
    backgroundColor: '#E6F4F3',
    borderColor: '#008178',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subject: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#303944',
    marginRight: 8,
  },
  subjectUnread: {
    color: '#111820',
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: '#8190A7',
  },
  lastMessage: {
    fontSize: 13,
    color: '#7D8BA5',
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E34242',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});