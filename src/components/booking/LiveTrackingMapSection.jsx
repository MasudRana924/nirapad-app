import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import LocationMap from '../common/LocationMap';
import Toast from '../common/Toast';
import {bookingService} from '../../api/services';
import {getApiErrorMessage} from '../../api/client';
import {
  connectTrackingSocket,
  disconnectTrackingSocket,
  subscribeTracking,
} from '../../services/trackingSocket';

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

/**
 * Inline live caregiver map for Booking Details (map on top, details below).
 */
const LiveTrackingMapSection = ({bookingId, enabled = true}) => {
  const isFocused = useIsFocused();
  const socketRef = useRef(null);
  const handlersRef = useRef({});
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
      setIsActive(false);
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
      applyLocation(data);
      return data;
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not load caregiver location'));
      return null;
    }
  }, [bookingId, applyLocation, showToast]);

  useEffect(() => {
    if (!enabled || !bookingId) {
      return undefined;
    }

    let cancelled = false;
    endedRef.current = false;
    setEnded(false);
    setCoordinate(null);
    setTrail([]);

    const start = async () => {
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

        const handlers = {
          connect: () => {
            setSocketConnected(true);
            subscribeTracking(socket, bookingId);
          },
          disconnect: () => setSocketConnected(false),
          'tracking:location': payload => {
            applyLocation(payload?.data ?? payload);
          },
          'tracking:ended': () => endTracking(),
          'tracking:error': payload => {
            showToast(
              payload?.message ||
                payload?.error ||
                (typeof payload === 'string' ? payload : null) ||
                'Tracking error',
            );
          },
        };
        handlersRef.current = handlers;
        Object.entries(handlers).forEach(([event, listener]) => {
          socket.on(event, listener);
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
      disconnectTrackingSocket(socketRef.current, bookingId, handlersRef.current);
      socketRef.current = null;
      handlersRef.current = {};
    };
  }, [enabled, bookingId, fetchLiveLocation, applyLocation, endTracking, showToast]);

  useEffect(() => {
    if (!enabled || !isFocused || !bookingId || ended || socketConnected) {
      return undefined;
    }
    const timer = setInterval(() => fetchLiveLocation(), POLL_MS);
    return () => clearInterval(timer);
  }, [
    enabled,
    isFocused,
    bookingId,
    ended,
    socketConnected,
    fetchLiveLocation,
  ]);

  useEffect(() => {
    if (!ended || !socketRef.current) {
      return;
    }
    disconnectTrackingSocket(socketRef.current, bookingId, handlersRef.current);
    socketRef.current = null;
    handlersRef.current = {};
    setSocketConnected(false);
  }, [ended, bookingId]);

  if (!enabled) {
    return null;
  }

  const updatedLabel = formatUpdatedAt(updatedAt);
  const showWaiting = !ended && !coordinate;

  return (
    <View style={styles.card}>
      <View style={styles.mapBox}>
        <LocationMap
          latitude={coordinate?.latitude}
          longitude={coordinate?.longitude}
          title="Caregiver"
          description={
            updatedLabel ? `Updated ${updatedLabel}` : 'Live location'
          }
          trail={trail}
          showsMarker={!!coordinate}
          zoom={15}
          theme="voyager"
          style={styles.map}
        />

        {!ended && (
          <View style={styles.livePill} pointerEvents="none">
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>
              {isActive ? 'Live' : 'Paused'}
              {!socketConnected ? ' · …' : ''}
            </Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#008178" />
          </View>
        )}

        {showWaiting && !loading && (
          <View style={styles.waitingBanner} pointerEvents="none">
            <Text style={styles.waitingText}>
              Waiting for caregiver location…
            </Text>
          </View>
        )}
      </View>

      {!!updatedLabel && !ended && (
        <Text style={styles.updatedAt}>Updated {updatedLabel}</Text>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default LiveTrackingMapSection;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: -16,
    marginBottom: 12,
  },
  livePill: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E6F4F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  livePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#008178',
  },
  mapBox: {
    height: 300,
    overflow: 'hidden',
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
  waitingBanner: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  waitingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
  },
  updatedAt: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 11,
    color: '#8190A7',
    fontWeight: '500',
  },
});
