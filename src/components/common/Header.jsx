import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const HEADER_HEIGHT = 56;

const Header = ({
  title,
  onBack,
  showBack = true,
  rightComponent,
  backgroundColor = '#FFFFFF',
  applyTopInset = true,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View
        style={[
          styles.container,
          {backgroundColor, paddingTop: applyTopInset ? insets.top : 0},
        ]}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1} pointerEvents="none">
            {title}
          </Text>

          {showBack ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              onPress={handleBack}>
              <Icon name="arrow-back" size={24} color="#172333" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}

          <View style={styles.right}>{rightComponent}</View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },

  content: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholder: {
    width: 40,
  },

  right: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
  },

  title: {
    position: 'absolute',
    left: 64,
    right: 64,
    fontSize: 16,
    fontWeight: '600',
    color: '#172333',
    textAlign: 'center',
  },
});

export default Header;
