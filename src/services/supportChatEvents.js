/**
 * Lets the foreground push handler refresh Support Chat without a socket.
 * The screen registers while it is focused.
 */
const refreshListeners = new Set();
let focused = false;

export const setSupportChatFocused = value => {
  focused = Boolean(value);
};

export const isSupportChatScreenFocused = () => focused;

export const onSupportChatRefresh = listener => {
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
};

export const emitSupportChatRefresh = () => {
  refreshListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('Support chat refresh listener failed:', error);
    }
  });
};
