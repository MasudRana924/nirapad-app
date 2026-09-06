import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = ({title, onBack, showBack = true, rightComponent}) => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#008178"
      />
      <View style={styles.container}>
        <View style={styles.content}>
          {showBack ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={onBack}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
          
          <Text style={styles.title}>{title}</Text>
          
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#008178',
  },
  
  content: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop:20
  },
  
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  placeholder: {
    width: 36,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
});

export default Header;
