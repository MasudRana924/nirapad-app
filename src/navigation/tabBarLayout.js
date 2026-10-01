import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_GAP = 6;
const CONTENT_GAP = 20;

/** Distance from the screen bottom to the floating tab bar. */
export const useTabBarBottom = () => {
  const insets = useSafeAreaInsets();
  // Fallback for older Android devices where the inset hasn't loaded yet.
  const safeBottom = insets.bottom > 0 ? insets.bottom : 16;
  return safeBottom + TAB_BAR_GAP;
};

/** Bottom padding a tab screen's scroll content needs to clear the floating tab bar. */
export const useTabBarInset = () => useTabBarBottom() + TAB_BAR_HEIGHT + CONTENT_GAP;
