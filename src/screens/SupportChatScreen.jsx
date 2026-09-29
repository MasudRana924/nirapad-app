import React, {useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  AppState,
  Linking,
  RefreshControl,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  pick,
  types,
  errorCodes,
  isErrorWithCode,
} from '@react-native-documents/picker';
import WebView from 'react-native-webview';
import Header from '../components/common/Header';
import ChatThemeBackground from '../components/chat/ChatThemeBackground';
import Toast from '../components/common/Toast';
import {conversationService} from '../api/services';
import {createUuid, getApiErrorMessage} from '../api/client';
import {queryKeys} from '../api/queryKeys';
import {requestCameraPermission, requestGalleryPermission} from '../utils/permissions';
import {
  isSupportChatScreenFocused,
  onSupportChatRefresh,
  setSupportChatFocused,
} from '../services/supportChatEvents';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT = 4000;
const PAGE_SIZE = 30;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
const EXT_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

const dayKey = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'unknown';
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const formatClock = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDayLabel = (value, t) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const key = dayKey(date);
  if (key === dayKey(today)) {
    return t('today');
  }
  if (key === dayKey(yesterday)) {
    return t('yesterday');
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
};

const formatBytes = bytes => {
  const size = Number(bytes);
  if (!size || size < 0) {
    return '';
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const isRemoteUrl = url => typeof url === 'string' && /^https?:/i.test(url);

const isNetworkFailure = error => !error?.statusCode;

const sortMessages = list =>
  [...list].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime() || 0;
    const bTime = new Date(b.created_at).getTime() || 0;
    if (aTime !== bTime) {
      return aTime - bTime;
    }
    return String(a.id || '').localeCompare(String(b.id || ''));
  });

const fileFromAsset = (asset, fallbackName) => {
  const name = asset.fileName || asset.name || fallbackName;
  const ext = String(name).split('.').pop().toLowerCase();
  let mime = asset.type || EXT_MIME[ext] || '';
  if (mime === 'image/jpg') {
    mime = 'image/jpeg';
  }
  return {
    uri: asset.uri,
    name,
    mime,
    size: asset.fileSize ?? asset.size ?? 0,
  };
};

const imageHtml = url => {
  const safe = String(url)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=6, user-scalable=yes"><style>html,body{margin:0;height:100%;background:#000;display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100%;object-fit:contain}</style></head><body><img src="${safe}" /></body></html>`;
};

const pdfViewerUri = url =>
  Platform.OS === 'android'
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
    : url;

const SupportChatScreen = () => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const messagesRef = useRef([]);
  const hasMoreRef = useRef(false);
  const hasLoadedOlderRef = useRef(false);
  const loadingOlderRef = useRef(false);
  const userScrolledRef = useRef(false);
  const loadLatestRef = useRef(async () => {});
  const refreshIncomingRef = useRef(async () => {});

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sendingRef = useRef(false);
  const [loadError, setLoadError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'error',
  });

  const showToast = message => {
    setToast({visible: true, message, type: 'error'});
  };

  const updateMessages = updater => {
    setMessages(prev => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  };

  const clearUnread = () => {
    queryClient.setQueryData(queryKeys.supportChat.unread(), current => ({
      success: true,
      ...(current || {}),
      data: {
        ...(current?.data || {}),
        unread_count: 0,
      },
    }));
  };

  const mergeServerMessages = incoming => {
    updateMessages(prev => {
      const locals = prev.filter(item => item.localOnly);
      const byId = new Map();
      prev
        .filter(item => !item.localOnly)
        .forEach(item => {
          byId.set(item.id, item);
        });
      const matchedClientIds = new Set();
      incoming.forEach(item => {
        if (!item?.id) {
          return;
        }
        byId.set(item.id, {...item, status: 'sent', localOnly: false});
        if (item.client_message_id) {
          matchedClientIds.add(item.client_message_id);
        }
      });
      const keptLocals = locals.filter(
        item => !matchedClientIds.has(item.client_message_id),
      );
      return sortMessages([...byId.values(), ...keptLocals]);
    });
  };

  const acceptCreated = (clientId, created) => {
    if (created?.id) {
      mergeServerMessages([
        {
          ...created,
          client_message_id: created.client_message_id || clientId,
        },
      ]);
      return;
    }
    updateMessages(prev =>
      prev.map(item =>
        item.client_message_id === clientId
          ? {...item, status: 'sent'}
          : item,
      ),
    );
  };

  const markFailed = (clientId, error) => {
    updateMessages(prev =>
      prev.map(item =>
        item.client_message_id === clientId
          ? {...item, status: 'failed', progress: 0}
          : item,
      ),
    );
    if (!isNetworkFailure(error)) {
      showToast(getApiErrorMessage(error, t('couldNotSend')));
    }
  };

  const loadLatest = async ({fromPull} = {}) => {
    const showSkeleton = messagesRef.current.length === 0 && !fromPull;
    if (showSkeleton) {
      setInitialLoading(true);
    }
    if (fromPull) {
      setRefreshing(true);
    }
    try {
      const response = await conversationService.getMessages({limit: PAGE_SIZE});
      const incoming = Array.isArray(response?.data) ? response.data : [];
      mergeServerMessages(incoming);
      if (!hasLoadedOlderRef.current) {
        hasMoreRef.current = Boolean(response?.meta?.has_more);
      }
      clearUnread();
      setLoadError('');
    } catch (error) {
      if (error?.statusCode === 404) {
        setLoadError('');
      } else if (messagesRef.current.length === 0) {
        setLoadError(getApiErrorMessage(error, t('couldNotLoadChat')));
      }
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const refreshIncoming = async () => {
    const newest = [...messagesRef.current]
      .reverse()
      .find(item => !item.localOnly && item.id);
    try {
      if (!newest?.id) {
        await loadLatest();
        return;
      }
      const response = await conversationService.getMessages({
        after: newest.id,
      });
      const incoming = Array.isArray(response?.data) ? response.data : [];
      if (incoming.length) {
        mergeServerMessages(incoming);
      }
      if (incoming.some(item => item.sender_role === 'admin')) {
        await conversationService.markAsRead();
        clearUnread();
      }
    } catch (error) {
      console.error('Failed to refresh support messages:', error);
    }
  };

  loadLatestRef.current = loadLatest;
  refreshIncomingRef.current = refreshIncoming;

  useFocusEffect(
    React.useCallback(() => {
      setSupportChatFocused(true);
      loadLatestRef.current();
      const unsubscribeRefresh = onSupportChatRefresh(() => {
        refreshIncomingRef.current();
      });
      const appStateSub = AppState.addEventListener('change', nextState => {
        if (nextState === 'active' && isSupportChatScreenFocused()) {
          loadLatestRef.current();
        }
      });
      return () => {
        setSupportChatFocused(false);
        unsubscribeRefresh();
        appStateSub.remove();
      };
    }, []),
  );

  const loadOlder = async () => {
    if (loadingOlderRef.current || !hasMoreRef.current) {
      return;
    }
    const oldest = messagesRef.current.find(item => !item.localOnly && item.id);
    if (!oldest?.id) {
      return;
    }
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    try {
      const response = await conversationService.getMessages({
        before: oldest.id,
        limit: PAGE_SIZE,
      });
      const incoming = Array.isArray(response?.data) ? response.data : [];
      mergeServerMessages(incoming);
      hasLoadedOlderRef.current = true;
      hasMoreRef.current = Boolean(response?.meta?.has_more);
    } catch (error) {
      console.error('Failed to load older support messages:', error);
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  };

  const validateFile = file => {
    if (!file?.uri || !ALLOWED_MIME.has(file.mime)) {
      showToast(t('unsupportedFile'));
      return false;
    }
    if (file.size > MAX_FILE_BYTES) {
      showToast(t('fileTooLarge'));
      return false;
    }
    return true;
  };

  const runAfterSheet = action => {
    setSheetOpen(false);
    setTimeout(action, Platform.OS === 'ios' ? 350 : 80);
  };

  const pickImage = source => {
    runAfterSheet(async () => {
      try {
        const granted =
          source === 'camera'
            ? await requestCameraPermission()
            : await requestGalleryPermission();
        if (!granted) {
          showToast(
            source === 'camera' ? t('cameraPermission') : t('galleryPermission'),
          );
          return;
        }
        const launcher = source === 'camera' ? launchCamera : launchImageLibrary;
        const result = await launcher({
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
        });
        if (result.didCancel) {
          return;
        }
        if (result.errorCode) {
          showToast(result.errorMessage || t('failedToOpenImagePicker'));
          return;
        }
        const asset = result.assets?.[0];
        if (!asset?.uri) {
          return;
        }
        const file = fileFromAsset(asset, 'photo.jpg');
        if (validateFile(file)) {
          setPendingFile(file);
        }
      } catch (error) {
        console.error('Image picker error:', error);
        showToast(t('failedToOpenImagePicker'));
      }
    });
  };

  const pickPdf = () => {
    runAfterSheet(async () => {
      try {
        const [asset] = await pick({
          mode: 'import',
          type: [types.pdf],
          allowMultiSelection: false,
        });
        if (!asset?.uri) {
          return;
        }
        const file = fileFromAsset(asset, 'document.pdf');
        if (validateFile(file)) {
          setPendingFile(file);
        }
      } catch (error) {
        if (
          isErrorWithCode(error) &&
          error.code === errorCodes.OPERATION_CANCELED
        ) {
          return;
        }
        console.error('Document picker error:', error);
        showToast(t('failedToPickDocument'));
      }
    });
  };

  const sendTextMessage = async (text, existingClientId) => {
    const clientId = existingClientId || createUuid();
    if (!existingClientId) {
      updateMessages(prev =>
        sortMessages([
          ...prev,
          {
            id: `local-${clientId}`,
            client_message_id: clientId,
            sender_role: 'user',
            message_type: 'text',
            message: text,
            attachment_url: null,
            is_read: false,
            created_at: new Date().toISOString(),
            status: 'sending',
            localOnly: true,
            retry: {kind: 'text', message: text},
          },
        ]),
      );
    } else {
      updateMessages(prev =>
        prev.map(item =>
          item.client_message_id === clientId
            ? {...item, status: 'sending'}
            : item,
        ),
      );
    }

    try {
      const response = await conversationService.sendText({
        message: text,
        client_message_id: clientId,
      });
      acceptCreated(clientId, response?.data);
    } catch (error) {
      markFailed(clientId, error);
    }
  };

  const sendFileMessage = async (caption, file, existingClientId) => {
    const clientId = existingClientId || createUuid();
    const messageType = file.mime === 'application/pdf' ? 'document' : 'image';
    if (!existingClientId) {
      updateMessages(prev =>
        sortMessages([
          ...prev,
          {
            id: `local-${clientId}`,
            client_message_id: clientId,
            sender_role: 'user',
            message_type: messageType,
            message: caption || null,
            attachment_url: messageType === 'image' ? file.uri : null,
            attachment_name: file.name,
            attachment_mime: file.mime,
            attachment_size: file.size || null,
            is_read: false,
            created_at: new Date().toISOString(),
            status: 'sending',
            progress: 0,
            localOnly: true,
            retry: {kind: 'file', message: caption, file},
          },
        ]),
      );
    } else {
      updateMessages(prev =>
        prev.map(item =>
          item.client_message_id === clientId
            ? {...item, status: 'sending', progress: 0}
            : item,
        ),
      );
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mime,
      name: file.name || (messageType === 'document' ? 'document.pdf' : 'photo.jpg'),
    });
    if (caption) {
      formData.append('message', caption);
    }
    formData.append('client_message_id', clientId);

    let lastProgress = 0;
    try {
      const response = await conversationService.sendFile(formData, progress => {
        if (progress < 1 && progress - lastProgress < 0.05) {
          return;
        }
        lastProgress = progress;
        updateMessages(prev =>
          prev.map(item =>
            item.client_message_id === clientId ? {...item, progress} : item,
          ),
        );
      });
      acceptCreated(clientId, response?.data);
    } catch (error) {
      markFailed(clientId, error);
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    const file = pendingFile;
    if (sendingRef.current || (!text && !file)) {
      return;
    }
    if (text.length > MAX_TEXT) {
      showToast(t('messageTooLong'));
      return;
    }
    sendingRef.current = true;
    setDraft('');
    setPendingFile(null);
    try {
      if (file) {
        await sendFileMessage(text, file);
      } else {
        await sendTextMessage(text);
      }
    } finally {
      sendingRef.current = false;
    }
  };

  const retryMessage = message => {
    if (!message?.retry || message.status === 'sending') {
      return;
    }
    if (message.retry.kind === 'file' && message.retry.file) {
      sendFileMessage(
        message.retry.message,
        message.retry.file,
        message.client_message_id,
      );
      return;
    }
    if (message.retry.message) {
      sendTextMessage(message.retry.message, message.client_message_id);
    }
  };

  const openAttachment = message => {
    if (message.message_type === 'image' && message.attachment_url) {
      setViewer({
        kind: 'image',
        url: message.attachment_url,
        name: message.attachment_name || '',
      });
      return;
    }
    if (
      message.message_type === 'document' &&
      isRemoteUrl(message.attachment_url)
    ) {
      setViewer({
        kind: 'pdf',
        url: message.attachment_url,
        name: message.attachment_name || 'PDF',
      });
    }
  };

  const listItems = useMemo(() => {
    const items = [];
    let lastDay = '';
    messages.forEach(message => {
      const day = dayKey(message.created_at);
      if (day !== lastDay) {
        items.push({
          kind: 'date',
          id: `date-${day}-${items.length}`,
          label: formatDayLabel(message.created_at, t),
        });
        lastDay = day;
      }
      items.push({
        kind: 'message',
        id: String(message.id || message.client_message_id),
        message,
      });
    });
    return items.reverse();
  }, [messages, t]);

  const canSend = Boolean(draft.trim() || pendingFile);

  const renderMessage = message => {
    const isOwn = message.sender_role === 'user';
    const failed = message.status === 'failed';
    return (
      <View
        style={[
          styles.messageRow,
          isOwn ? styles.messageRowOwn : styles.messageRowOther,
        ]}>
        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
            failed && styles.bubbleFailed,
          ]}>
          {message.message_type === 'image' && message.attachment_url ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openAttachment(message)}>
              <Image
                source={{uri: message.attachment_url}}
                style={styles.thumb}
              />
            </TouchableOpacity>
          ) : null}
          {message.message_type === 'document' ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.docRow}
              onPress={() => openAttachment(message)}>
              <Icon
                name="document-text"
                size={28}
                color={isOwn ? '#FFFFFF' : '#008178'}
              />
              <View style={styles.docText}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.docName,
                    isOwn ? styles.textOwn : styles.textOther,
                  ]}>
                  {message.attachment_name || 'PDF'}
                </Text>
                {!!message.attachment_size && (
                  <Text
                    style={[
                      styles.docSize,
                      isOwn ? styles.docSizeOwn : styles.docSizeOther,
                    ]}>
                    {formatBytes(message.attachment_size)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ) : null}
          {!!message.message && (
            <Text
              style={[
                styles.messageText,
                isOwn ? styles.textOwn : styles.textOther,
                (message.message_type === 'image' ||
                  message.message_type === 'document') &&
                  styles.caption,
              ]}>
              {message.message}
            </Text>
          )}
          {message.status === 'sending' && message.message_type !== 'text' ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      8,
                      Math.min(100, Math.round((message.progress || 0) * 100)),
                    )}%`,
                  },
                ]}
              />
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          activeOpacity={failed ? 0.7 : 1}
          disabled={!failed}
          onPress={() => retryMessage(message)}
          style={[styles.metaRow, isOwn ? styles.metaOwn : styles.metaOther]}>
          <Text style={styles.time}>{formatClock(message.created_at)}</Text>
          {isOwn ? <Receipt message={message} /> : null}
          {failed ? (
            <Text style={styles.retryText}>{t('tapToRetry')}</Text>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ChatThemeBackground />
      <Header title={t('Nirapod Support')} showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        {initialLoading ? (
          <ChatSkeleton />
        ) : loadError && messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="cloud-offline-outline" size={48} color="#008178" />
            <Text style={styles.emptyText}>{loadError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadLatest()}>
              <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="chatbubbles-outline" size={48} color="#008178" />
            <Text style={styles.emptyText}>{t('supportEmpty')}</Text>
          </View>
        ) : (
          <FlatList
            inverted
            data={listItems}
            keyExtractor={item => item.id}
            renderItem={({item}) =>
              item.kind === 'date' ? (
                <View style={styles.dateWrap}>
                  <View style={styles.dateChip}>
                    <Text style={styles.dateText}>{item.label}</Text>
                  </View>
                </View>
              ) : (
                renderMessage(item.message)
              )
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            onEndReachedThreshold={0.2}
            onScrollBeginDrag={() => {
              userScrolledRef.current = true;
            }}
            onEndReached={() => {
              if (userScrolledRef.current) {
                loadOlder();
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadLatest({fromPull: true})}
                colors={['#008178']}
                tintColor="#008178"
              />
            }
            ListFooterComponent={
              loadingOlder ? (
                <ActivityIndicator
                  style={styles.olderSpinner}
                  color="#008178"
                />
              ) : null
            }
          />
        )}

        {pendingFile ? (
          <View style={styles.pendingRow}>
            {pendingFile.mime?.startsWith('image/') ? (
              <Image source={{uri: pendingFile.uri}} style={styles.pendingThumb} />
            ) : (
              <Icon name="document-text" size={28} color="#008178" />
            )}
            <View style={styles.pendingText}>
              <Text numberOfLines={1} style={styles.pendingName}>
                {pendingFile.name}
              </Text>
              {!!pendingFile.size && (
                <Text style={styles.pendingSize}>
                  {formatBytes(pendingFile.size)}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setPendingFile(null)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="close-circle" size={22} color="#8190A7" />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.composer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setSheetOpen(true)}>
            <Icon name="add" size={26} color="#008178" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={t('typeMessage')}
            placeholderTextColor="#8190A7"
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={MAX_TEXT}
          />
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}>
            <Icon
              name="send"
              size={18}
              color={canSend ? '#FFFFFF' : '#A8B3C4'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <SheetAction
              icon="camera-outline"
              label={t('camera')}
              onPress={() => pickImage('camera')}
            />
            <SheetAction
              icon="image-outline"
              label={t('gallery')}
              onPress={() => pickImage('gallery')}
            />
            <SheetAction
              icon="document-text-outline"
              label={t('document')}
              onPress={pickPdf}
            />
            <SheetAction
              icon="close-outline"
              label={t('cancel')}
              onPress={() => setSheetOpen(false)}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={!!viewer}
        animationType="fade"
        onRequestClose={() => setViewer(null)}>
        <View style={[styles.viewer, {paddingTop: insets.top}]}>
          <View style={styles.viewerBar}>
            <TouchableOpacity
              onPress={() => setViewer(null)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.viewerTitle}>
              {viewer?.name || t('NirapodSupport')}
            </Text>
            {viewer && isRemoteUrl(viewer.url) ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(viewer.url)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon name="open-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.viewerSpacer} />
            )}
          </View>
          {viewer?.kind === 'image' && isRemoteUrl(viewer.url) ? (
            <WebView
              originWhitelist={['*']}
              source={{html: imageHtml(viewer.url)}}
              style={styles.viewerBody}
            />
          ) : null}
          {viewer?.kind === 'image' && viewer && !isRemoteUrl(viewer.url) ? (
            <Image
              source={{uri: viewer.url}}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          ) : null}
          {viewer?.kind === 'pdf' ? (
            <WebView
              source={{uri: pdfViewerUri(viewer.url)}}
              style={styles.viewerBody}
              startInLoadingState
            />
          ) : null}
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({...prev, visible: false}))}
      />
    </SafeAreaView>
  );
};

const Receipt = ({message}) => {
  if (message.status === 'sending') {
    return <Icon name="time-outline" size={14} color="#8190A7" />;
  }
  if (message.status === 'failed') {
    return <Icon name="alert-circle" size={14} color="#E34242" />;
  }
  if (message.is_read) {
    return <Icon name="checkmark-done" size={16} color="#34B7F1" />;
  }
  return <Icon name="checkmark" size={16} color="#8190A7" />;
};

const SheetAction = ({icon, label, onPress}) => (
  <TouchableOpacity style={styles.sheetAction} onPress={onPress}>
    <Icon name={icon} size={22} color="#008178" />
    <Text style={styles.sheetLabel}>{label}</Text>
  </TouchableOpacity>
);

const ChatSkeleton = () => (
  <View style={styles.skeleton}>
    {[1, 2, 3, 4].map(index => {
      const isLeft = index % 2 === 1;
      return (
        <View
          key={index}
          style={[
            styles.skeletonRow,
            isLeft ? styles.messageRowOther : styles.messageRowOwn,
          ]}>
          <View
            style={[
              styles.skeletonBubble,
              isLeft ? styles.skeletonLeft : styles.skeletonRight,
            ]}
          />
        </View>
      );
    })}
  </View>
);

export default SupportChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5FAF9',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#5C6B7A',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#008178',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#5C6B7A',
    fontWeight: '600',
  },
  messageRow: {
    marginBottom: 10,
    maxWidth: '82%',
  },
  messageRowOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageRowOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleOwn: {
    backgroundColor: '#008178',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  bubbleFailed: {
    borderWidth: 1,
    borderColor: '#E34242',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textOwn: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#111820',
  },
  caption: {
    marginTop: 6,
  },
  thumb: {
    width: 220,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#D9E2E8',
    marginHorizontal: -4,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
  },
  docText: {
    flex: 1,
    marginLeft: 8,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
  },
  docSize: {
    marginTop: 2,
    fontSize: 12,
  },
  docSizeOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  docSizeOther: {
    color: '#8190A7',
  },
  progressTrack: {
    marginTop: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaOwn: {
    justifyContent: 'flex-end',
  },
  metaOther: {
    justifyContent: 'flex-start',
  },
  time: {
    fontSize: 11,
    color: '#8190A7',
  },
  retryText: {
    fontSize: 11,
    color: '#E34242',
    fontWeight: '600',
  },
  olderSpinner: {
    marginVertical: 12,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 4,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  pendingThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E6EEF2',
  },
  pendingText: {
    flex: 1,
    marginHorizontal: 10,
  },
  pendingName: {
    fontSize: 14,
    color: '#111820',
    fontWeight: '600',
  },
  pendingSize: {
    marginTop: 2,
    fontSize: 12,
    color: '#8190A7',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',

  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#F4F6F8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111820',
  },
  sendButton: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#008178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E3E8F0',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111820',
    fontWeight: '500',
  },
  viewer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  viewerTitle: {
    flex: 1,
    marginHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  viewerSpacer: {
    width: 22,
  },
  viewerBody: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewerImage: {
    flex: 1,
    backgroundColor: '#000000',
  },
  skeleton: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  skeletonRow: {
    marginBottom: 12,
  },
  skeletonBubble: {
    width: 180,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E3E8F0',
  },
  skeletonLeft: {
    borderBottomLeftRadius: 4,
  },
  skeletonRight: {
    borderBottomRightRadius: 4,
  },
});
