import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import {paymentService} from '../api/services';
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '../api/queryKeys';

const getPaymentData = payload => payload?.data || payload || {};

const BkashCheckout = ({route, navigation}) => {
  const {bookingId, paymentID: prePaymentID, amount: preAmount} =
    route.params || {};
  const queryClient = useQueryClient();
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [webViewHtml, setWebViewHtml] = useState('');
  const webViewRef = useRef(null);
  const paymentIDRef = useRef(prePaymentID || null);
  const bookingIdRef = useRef(bookingId);
  const executingRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    bookingIdRef.current = bookingId;
  }, [bookingId]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (prePaymentID) {
      // Payment already created by BookingDetailsScreen — show WebView directly
      paymentIDRef.current = prePaymentID;
      setWebViewHtml(generateBkashHtml(preAmount || '', prePaymentID));
    } else {
      // Fallback: create payment here (direct navigation without pre-creation)
      handlePayment();
    }
  }, []);

  const handlePayment = async () => {
    if (!bookingId) {
      setStatusMessage('Missing booking information.');
      return;
    }

    try {
      const createPaymentResponse = await paymentService.createBkashPayment(
        bookingId,
      );
      const data = getPaymentData(createPaymentResponse);
      const createdPaymentID = data.paymentID || data.paymentId;

      if (createdPaymentID) {
        paymentIDRef.current = createdPaymentID;
        const amount = String(data.amount ?? '');

        const deeplink = `bkash://checkout?paymentID=${createdPaymentID}`;
        const supported = await Linking.canOpenURL(deeplink);

        if (supported) {
          await Linking.openURL(deeplink);
        } else {
          setWebViewHtml(generateBkashHtml(amount, createdPaymentID));
        }
      } else {
        setStatusMessage(
          createPaymentResponse?.message ||
            'Payment creation failed. Please try again.',
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatusMessage(error?.message || 'Payment failed. Please try again.');
    }
  };

  const generateBkashHtml = (amount, paymentIDValue) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js"></script>
        <style>
          body { margin: 0; background: #FFFFFF; }
        </style>
      </head>
      <body>
        <button id="bKash_button" style="display:none;"></button>
        <script>
          function initBkash() {
            bKash.init({
              paymentMode: 'checkout',
              paymentRequest: { 
                amount: '${amount}', 
                intent: 'sale',
                currency: 'BDT'
              },
              createRequest: function(request) {
                bKash.create().onSuccess({ paymentID: '${paymentIDValue}' });
              },
              executeRequestOnAuthorization: function() {
                window.ReactNativeWebView.postMessage('SUCCESS');
              },
              onClose: function() {
                window.ReactNativeWebView.postMessage('CLOSED');
              }
            });
            setTimeout(function() {
              document.getElementById('bKash_button').click();
            }, 1000);
          }
          
          if (typeof bKash !== 'undefined') {
            initBkash();
          } else {
            var checkCount = 0;
            var interval = setInterval(function() {
              if (typeof bKash !== 'undefined') {
                clearInterval(interval);
                initBkash();
              }
              if (checkCount++ > 10) {
                clearInterval(interval);
                window.ReactNativeWebView.postMessage('LOAD_FAILED');
              }
            }, 500);
          }
          
          window.addEventListener('error', function(e) {
            window.ReactNativeWebView.postMessage('ERROR: ' + e.message);
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = event => {
    const message = event.nativeEvent.data;

    if (message === 'SUCCESS') {
      executePayment();
    } else if (message === 'CLOSED') {
      navigation.replace('PaymentCancelled', {bookingId: bookingIdRef.current || bookingId});
    } else if (message === 'LOAD_FAILED') {
      setStatusMessage('Failed to load payment system. Please try again.');
      setWebViewHtml('');
    } else if (typeof message === 'string' && message.startsWith('ERROR:')) {
      console.error('WebView Error:', message);
      setStatusMessage('An error occurred during payment.');
      setWebViewHtml('');
    }
  };

  const executePayment = async () => {
    if (executingRef.current) {
      return;
    }

    const activePaymentID = paymentIDRef.current;
    const activeBookingId = bookingIdRef.current || bookingId;
    if (!activePaymentID || !activeBookingId) {
      setStatusMessage('Payment verification failed. Please contact support.');
      return;
    }

    executingRef.current = true;

    try {
      setIsExecuting(true);
      const response = await paymentService.executeBkashPayment(
        activePaymentID,
        activeBookingId,
      );
      const data = getPaymentData(response);

      if (data?.paymentID || data?.paymentId || response?.success) {
        queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(activeBookingId),
        });
        navigation.replace('PaymentSuccess');
      } else {
        setWebViewHtml('');
        setStatusMessage(
          response?.message ||
            'Payment verification failed. Please contact support.',
        );
      }
    } catch (error) {
      console.error('Execute payment error:', error);
      setWebViewHtml('');
      setStatusMessage(
        error?.message ||
          'Payment verification failed. Please contact support.',
      );
    } finally {
      executingRef.current = false;
      setIsExecuting(false);
    }
  };

  // Show WebView full-screen when HTML is ready
  if (webViewHtml) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {isExecuting && (
          <View style={styles.executingOverlay}>
            <ActivityIndicator size="large" color="#E2136E" />
            <Text style={styles.executingText}>Verifying payment...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{html: webViewHtml}}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          thirdPartyCookiesEnabled={true}
          injectedJavaScript={`
            window.addEventListener('error', function(e) {
              window.ReactNativeWebView.postMessage('ERROR: ' + e.message);
            });
            true;
          `}
        />
      </SafeAreaView>
    );
  }

  // Fallback: error / status message screen
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.container}>
        {!statusMessage && (
          <ActivityIndicator size="large" color="#E2136E" />
        )}

        {statusMessage ? (
          <Text style={styles.statusMessage}>{statusMessage}</Text>
        ) : null}

        {statusMessage ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate('BookingDetails', {bookingId})
            }>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    marginTop: 16,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  statusMessage: {
    color: 'red',
    marginTop: 12,
    textAlign: 'center',
  },
  webView: {
    flex: 1,
  },
  executingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  executingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#5B6B7C',
    fontWeight: '500',
  },
});

export default BkashCheckout;
