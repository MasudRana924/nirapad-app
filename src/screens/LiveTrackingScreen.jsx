import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import LocationMap from '../components/common/LocationMap';
import {bookingService} from '../api/services';
import {getApiErrorMessage} from '../api/client';
import {
  connectTrackingSocket,
  disconnectTrackingSocket,
  subscribeTracking,
} from '../services/trackingSocket';

const POLL_MS = 10000;
const MAX_TRAIL_POINTS = 80;

const toCoord = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }
  return {latitude, longitude};
};

const formatUpdatedAt = value => {
  if (!value) {
    return null;
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    return null;
  }
};

const LiveTrackingScreen = ({navigation, route}) => {
  const {bookingId} = route.params || {};
  const isFocused = useIsFocused();
  const socketRef = useRef(null);
  const endedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [coordinate, setCoordinate] = useState(null);
  const [trail, setTrail] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [ended, setEnded] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'error',
  });

  const showToast = useCallback((message, type = 'error') => {
    setToast({visible: true, message, type});
  }, []);

  const applyLocation = useCallback(payload => {
    if (!payload || endedRef.current) {
      return;
    }

    if (payload.is_active === false || payload.is_active === 'false') {
      endedRef.current = true;
      setIsActive(false);
      setEnded(true);
      return;
    }

    const next = toCoord(payload.latitude, payload.longitude);
    if (!next) {
      return;
    }

    setCoordinate(next);
    setUpdatedAt(payload.updated_at || new Date().toISOString());
    setIsActive(true);
    setTrail(prev => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.latitude === next.latitude &&
        last.longitude === next.longitude
      ) {
        return prev;
      }
      const merged = [...prev, next];
      return merged.length > MAX_TRAIL_POINTS
        ? merged.slice(merged.length - MAX_TRAIL_POINTS)
        : merged;
    });
  }, []);

  const endTracking = useCallback(
    message => {
      if (endedRef.current) {
        return;
      }
      endedRef.current = true;
      setEnded(true);
      setIsActive(false);
      if (message) {
        showToast(message, 'success');
      }
    },
    [showToast],
  );

  const fetchLiveLocation = useCallback(async () => {
    if (!bookingId || endedRef.current) {
      return null;
    }
    try {
      const response = await bookingService.getLiveLocation(bookingId);
      const data = response?.data ?? response;
      if (!data) {
        return null;
      }
      if (data.is_active === false || data.is_active === 'false') {
        endTracking('Service ended');
        return data;
      }
      applyLocation(data);
      return data;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Could not load caregiver location'),
      );
      return null;
    }
  }, [bookingId, applyLocation, endTracking, showToast]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!bookingId) {
        setLoading(false);
        showToast('Missing booking');
        return;
      }

      setLoading(true);
      await fetchLiveLocation();
      if (cancelled || endedRef.current) {
        setLoading(false);
        return;
      }

      try {
        const socket = await connectTrackingSocket();
        if (cancelled) {
          disconnectTrackingSocket(socket, bookingId);
          return;
        }
        socketRef.current = socket;

        socket.on('connect', () => {
          setSocketConnected(true);
          subscribeTracking(socket, bookingId);
        });

        socket.on('disconnect', () => {
          setSocketConnected(false);
        });

        socket.on('tracking:location', payload => {
          applyLocation(payload?.data ?? payload);
        });

        socket.on('tracking:ended', () => {
          endTracking('Service ended');
        });

        socket.on('tracking:error', payload => {
          const message =
            payload?.message ||
            payload?.error ||
            (typeof payload === 'string' ? payload : null) ||
            'Tracking error';
          showToast(message);
        });

        if (socket.connected) {
          setSocketConnected(true);
          subscribeTracking(socket, bookingId);
        }
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Live connection unavailable'));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      disconnectTrackingSocket(socketRef.current, bookingId);
      socketRef.current = null;
    };
  }, [bookingId, fetchLiveLocation, applyLocation, endTracking, showToast]);

  useEffect(() => {
    if (!isFocused || !bookingId || ended || socketConnected) {
      return undefined;
    }

    const timer = setInterval(() => {
      fetchLiveLocation();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [isFocused, bookingId, ended, socketConnected, fetchLiveLocation]);

  useEffect(() => {
    if (!ended || !socketRef.current) {
      return;
    }
    disconnectTrackingSocket(socketRef.current, bookingId);
    socketRef.current = null;
    setSocketConnected(false);
  }, [ended, bookingId]);

  const updatedLabel = formatUpdatedAt(updatedAt);
  const showWaiting = !ended && !coordinate;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Live Tracking" onBack={() => navigation.goBack()} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({...prev, visible: false}))}
      />

      <View style={styles.mapWrap}>
        <LocationMap
          latitude={coordinate?.latitude}
          longitude={coordinate?.longitude}
          title="Caregiver"
          description={
            updatedLabel ? `Updated ${updatedLabel}` : 'Live location'
          }
          trail={trail}
          showsMarker={!!coordinate}
          style={styles.map}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#008178" />
          </View>
        )}

        {showWaiting && !loading && (
          <View style={styles.emptyCard}>
            <Icon name="navigate-outline" size={22} color="#008178" />
            <Text style={styles.emptyTitle}>Waiting for caregiver location…</Text>
            <Text style={styles.emptySub}>
              Location will appear when the caregiver starts sharing.
            </Text>
          </View>
        )}

        {ended && (
          <View style={styles.endedCard}>
            <Icon name="checkmark-circle" size={22} color="#0F8A7A" />
            <View style={styles.endedCopy}>
              <Text style={styles.endedTitle}>Service ended</Text>
              <Text style={styles.endedSub}>
                Live tracking has stopped for this booking.
              </Text>
            </View>
          </View>
        )}

        {!ended && (coordinate || updatedLabel) && (
          <View style={styles.statusBar}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>
              {isActive ? 'Live' : 'Paused'}
              {updatedLabel ? ` · Updated ${updatedLabel}` : ''}
              {!socketConnected ? ' · Reconnecting…' : ''}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LiveTrackingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapWrap: {
    flex: 1,
    backgroundColor: '#E8EEF4',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  emptyCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111820',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: '#8190A7',
    textAlign: 'center',
    lineHeight: 17,
  },
  endedCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: '#E7F6F1',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  endedCopy: {
    flex: 1,
  },
  endedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F8A7A',
  },
  endedSub: {
    marginTop: 2,
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 16,
  },
  statusBar: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(17,24,32,0.88)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
