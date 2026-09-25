import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

const LanguageSwitch = ({style}) => {
  const {i18n} = useTranslation();
  const language = i18n.language || 'en';

  const handleLanguageChange = next => {
    if (next === language) {
      return;
    }
    i18n.changeLanguage(next);
  };

  return (
    <View style={[styles.langSwitch, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.langOption,
          language === 'en' && styles.langOptionActive,
        ]}
        onPress={() => handleLanguageChange('en')}>
        <Text
          style={[
            styles.langText,
            language === 'en' && styles.langTextActive,
          ]}>
          EN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.langOption,
          language === 'bn' && styles.langOptionActive,
        ]}
        onPress={() => handleLanguageChange('bn')}>
        <Text
          style={[
            styles.langText,
            language === 'bn' && styles.langTextActive,
          ]}>
          বাং
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSwitch;

const styles = StyleSheet.create({
  langSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    borderRadius: 22,
    padding: 3,
  },
  langOption: {
    minWidth: 48,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langOptionActive: {
    backgroundColor: '#008178',
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8190A7',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
});
