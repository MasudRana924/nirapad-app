import React, {useRef} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';

const BkashCheckout = ({route, navigation}) => {
  const {paymentUrl, bookingId} = route.params || {};
  const webViewRef = useRef(null);

  const handleNavigationStateChange = navState => {
    // Check if payment was successful or cancelled
    // You'll need to adjust this based on your actual bKash callback URL
    if (navState.url.includes('payment-success')) {
      navigation.navigate('BookingDetails', {bookingId});
    } else if (navState.url.includes('payment-failed')) {
      navigation.goBack();
    } else if (navState.url.includes('payment-cancelled')) {
      navigation.goBack();
    }
  };

  if (!paymentUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#008178" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <WebView
        ref={webViewRef}
        source={{uri: paymentUrl}}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008178" />
          </View>
        )}
        style={styles.webView}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BkashCheckout;
