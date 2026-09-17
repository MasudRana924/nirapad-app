import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const AUTO_HIDE_MS = 2 * 1000;

const NotificationBanner = ({visible, title, body, onPress, onHide}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      hideBanner();
    }, AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [visible, title, body]);

  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished && onHide) {
        onHide();
      }
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          top: Math.max(insets.top, 12) + 8,
          opacity,
          transform: [{translateY}],
        },
      ]}>
      <Pressable
        onPress={() => {
          hideBanner();
          if (onPress) {
            onPress();
          }
        }}
        style={styles.card}>
        <View style={styles.left}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
          />
          <View style={styles.textCol}>
            <View style={styles.topRow}>
              <Text style={styles.appName} numberOfLines={1}>
                Nirapod
              </Text>
              <Text style={styles.time}>now</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Notification'}
            </Text>
            {!!body && (
              <Text style={styles.body} numberOfLines={2}>
                {body}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 20,
  },
  card: {
    minHeight: 64,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  appName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
  },
  title: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: '400',
    color: '#E5E5EA',
  },
  body: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#C7C7CC',
  },
});

export default NotificationBanner;
