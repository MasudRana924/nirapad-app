/**
 * Support-chat pushes use the same FCM pipeline as booking pushes.
 * Chat messages are not stored in the inbox.
 */
export const isSupportMessagePush = data => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const type = data.type || data.action;
  return (
    type === 'SUPPORT_MESSAGE' ||
    type === 'conversation_message' ||
    data.screen === 'support_chat'
  );
};
