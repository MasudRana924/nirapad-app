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
  ActivityIndicator,
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
        rightComponent={
          <View style={styles.headerRight}>
            <View style={styles.onlineIndicator} />
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          {messagesLoading && localMessages.length === 0 ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3, 4].map(index => {
                const isLeft = index % 2 === 1; // Left (admin) for odd indices
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.skeletonMessageRow,
                      isLeft ? styles.skeletonRowLeft : styles.skeletonRowRight
                    ]}>
                    {isLeft && <View style={styles.skeletonAvatar} />}
                    <View 
                      style={[
                        styles.skeletonBubble,
                        isLeft ? styles.skeletonBubbleLeft : styles.skeletonBubbleRight
                      ]} 
                    />
                    {!isLeft && <View style={styles.skeletonAvatar} />}
                  </View>
                );
              })}
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
    paddingHorizontal: 12,
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
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarSpacer: {
    width: 36,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBubbleOwn: {
    backgroundColor: '#008178',
    borderBottomRightRadius: 4,
    marginRight: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    marginLeft: 4,
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
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 12,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#008178',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E3E8F0',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  headerRight: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  skeletonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  skeletonMessageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  skeletonRowLeft: {
    justifyContent: 'flex-start',
  },
  skeletonRowRight: {
    justifyContent: 'flex-end',
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3E8F0',
    marginRight: 10,
  },
  skeletonBubble: {
    width: 160,
    height: 50,
    backgroundColor: '#E3E8F0',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  skeletonBubbleRight: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  skeletonBubbleLeft: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
});