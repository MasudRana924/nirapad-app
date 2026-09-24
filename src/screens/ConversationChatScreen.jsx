import React, {useCallback, useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {useMessages, useConversationDetails} from '../api/queries';
import {useSendMessage, useMarkMessagesAsRead} from '../api/mutations';
import {
  initializeSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  onNewMessage,
  onMessagesRead,
  sendSocketMessage,
  isSocketConnected,
} from '../services/websocket';
import Header from '../components/common/Header';

const ConversationChatScreen = ({route, navigation}) => {
  const {conversationId} = route.params;
  const {user} = useAuth();
  const scrollViewRef = useRef(null);

  const [messageText, setMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const {data: conversation, isLoading: conversationLoading} =
    useConversationDetails(conversationId);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useMessages(conversationId, {page: 1, limit: 50});

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  const messages = Array.isArray(messagesData?.data)
    ? messagesData.data
    : localMessages;

  // Initialize WebSocket and join conversation
  useEffect(() => {
    const token = user?.token;
    if (token) {
      initializeSocket(token);
    }

    return () => {
      leaveConversation(conversationId);
    };
  }, [user?.token, conversationId]);

  // Join conversation room when socket is ready
  useEffect(() => {
    if (isSocketConnected() && conversationId) {
      joinConversation(conversationId).catch(err => {
        console.error('Failed to join conversation:', err);
      });
    }
  }, [conversationId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = message => {
      if (message.conversation_id === conversationId) {
        setLocalMessages(prev => [...prev, message]);
        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }, 100);
      }
    };

    onNewMessage(handleNewMessage);

    return () => {
      // Cleanup would happen in disconnectSocket
    };
  }, [conversationId]);

  // Mark messages as read when screen is focused
  useFocusEffect(
    useCallback(() => {
      const markAsRead = async () => {
        try {
          await markAsReadMutation.mutateAsync(conversationId);
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
      };

      markAsRead();
    }, [conversationId, markAsReadMutation]),
  );

  // Scroll to bottom when messages load
  useEffect(() => {
    if (!messagesLoading && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messagesLoading, messages.length]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) {
      return;
    }

    setIsSending(true);
    const messageToSend = messageText.trim();
    setMessageText('');

    try {
      // Try WebSocket first for real-time
      if (isSocketConnected()) {
        await sendSocketMessage(conversationId, messageToSend, 'text');
      } else {
        // Fallback to HTTP
        await sendMessageMutation.mutateAsync({
          conversation_id: conversationId,
          message: messageToSend,
          message_type: 'text',
        });
      }

      // Refresh messages after sending
      refetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageText(messageToSend); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCurrentUser = message => {
    return message.sender_id === user?.id || message.sender === 'user';
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
        title={conversation?.subject || 'Conversation'}
        showBack={true}
        subtitle={conversation?.unread_count > 0 ? `${conversation.unread_count} unread` : undefined}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          {messagesLoading && localMessages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="chatbubbles-outline" size={48} color="#008178" />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Start the conversation by sending a message
              </Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const isOwn = isCurrentUser(message);
              const showAvatar = !isOwn || (index > 0 && !isCurrentUser(messages[index - 1]));

              return (
                <View
                  key={message.id || index}
                  style={[
                    styles.messageRow,
                    isOwn ? styles.messageRowOwn : styles.messageRowOther,
                  ]}>
                  {!isOwn && showAvatar && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(message.sender_name || 'Admin')}
                      </Text>
                    </View>
                  )}
                  {!isOwn && !showAvatar && <View style={styles.avatarSpacer} />}

                  <View
                    style={[
                      styles.messageBubble,
                      isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                    ]}>
                    <Text
                      style={[
                        styles.messageText,
                        isOwn ? styles.messageTextOwn : styles.messageTextOther,
                      ]}>
                      {message.message}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isOwn ? styles.messageTimeOwn : styles.messageTimeOther,
                      ]}>
                      {formatTime(message.created_at)}
                    </Text>
                  </View>

                  {isOwn && <View style={styles.avatarSpacer} />}
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#8190A7"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}>
            {isSending ? (
              <Icon name="hourglass-outline" size={20} color="#A8B3C4" />
            ) : (
              <Icon
                name="send"
                size={20}
                color={messageText.trim() ? '#FFFFFF' : '#A8B3C4'}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConversationChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
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
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111820',
    marginTop: 16,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#8190A7',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarSpacer: {
    width: 32,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleOwn: {
    backgroundColor: '#008178',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#111820',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeOther: {
    color: '#8190A7',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 14,
    color: '#111820',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E3E8F0',
  },
});