import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../components/common/Header';
import CustomLoader from '../components/common/CustomLoader';
import {usePrivacyPolicy} from '../api/queries';
import {getApiErrorMessage} from '../api/client';

const PrivacyPolicyScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const audience = route?.params?.audience || 'USER';
  const {data, isLoading, isFetching, isError, error, refetch} =
    usePrivacyPolicy(audience);

  const policy = data?.data && typeof data.data === 'object' ? data.data : {};
  const title = policy.title || t('privacyPolicyTitle');
  const content =
    typeof policy.content === 'string' ? policy.content.trim() : '';
  const showLoader = isLoading || (!data && isFetching);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <CustomLoader overlay visible={showLoader} />
      <Header title={title} onBack={() => navigation?.goBack()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={!isLoading && isFetching}
            onRefresh={refetch}
            tintColor="#008178"
            colors={['#008178']}
          />
        }>
        {isError ? (
          <Text style={styles.errorText}>
            {getApiErrorMessage(error, 'Failed to load privacy policy')}
          </Text>
        ) : content ? (
          <Text style={styles.body}>{content}</Text>
        ) : !showLoader ? (
          <Text style={styles.emptyText}>No privacy policy available.</Text>
        ) : null}

        {!!policy.version && (
          <Text style={styles.meta}>Version {policy.version}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#DC2626',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8190A7',
  },
  meta: {
    marginTop: 24,
    fontSize: 12,
    color: '#94A3B8',
  },
});
