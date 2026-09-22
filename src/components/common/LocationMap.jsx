import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';

/**
 * True OpenStreetMap via Leaflet in a WebView.
 * Does NOT use react-native-maps / Google Maps SDK — no API key needed.
 *
 * @example
 * <LocationMap
 *   latitude={23.81}
 *   longitude={90.41}
 *   title="Caregiver"
 *   description="Live location"
 * />
 */
const LocationMap = ({
  latitude,
  longitude,
  title = 'Location',
  description = '',
  trail = [],
  style,
  showsMarker = true,
  zoom = 15,
  onMapReady,
}) => {
  const webRef = useRef(null);
  const readyRef = useRef(false);

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasCoord =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const html = useMemo(
    () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin:0; padding:0; height:100%; width:100%; background:#E8EEF4; }
    .leaflet-container { background:#E8EEF4; }
    .popup-title { font: 700 13px/1.3 -apple-system, BlinkMacSystemFont, sans-serif; color:#111820; }
    .popup-desc { margin-top:4px; font: 500 12px/1.35 -apple-system, BlinkMacSystemFont, sans-serif; color:#4A5568; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([23.81, 90.41], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var marker = null;
    var polyline = L.polyline([], { color: '#008178', weight: 4 }).addTo(map);

    function setLocation(payload) {
      try {
        var data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        var nextLat = data.latitude;
        var nextLng = data.longitude;
        var title = data.title || 'Location';
        var description = data.description || '';
        var trail = Array.isArray(data.trail) ? data.trail : [];
        var showsMarker = data.showsMarker !== false;
        var zoom = data.zoom || 15;

        if (trail.length > 1) {
          var latlngs = trail.map(function (p) {
            return [p.latitude, p.longitude];
          });
          polyline.setLatLngs(latlngs);
        } else {
          polyline.setLatLngs([]);
        }

        if (typeof nextLat === 'number' && typeof nextLng === 'number' && showsMarker) {
          var html = '<div class="popup-title">' + title + '</div>';
          if (description) {
            html += '<div class="popup-desc">' + description + '</div>';
          }
          if (!marker) {
            marker = L.marker([nextLat, nextLng]).addTo(map);
            marker.bindPopup(html);
          } else {
            marker.setLatLng([nextLat, nextLng]);
            marker.setPopupContent(html);
          }
          map.setView([nextLat, nextLng], zoom, { animate: true });
        } else if (marker) {
          map.removeLayer(marker);
          marker = null;
        }
      } catch (e) {}
    }

    window.setLocation = setLocation;
    document.addEventListener('message', function (e) { setLocation(e.data); });
    window.addEventListener('message', function (e) { setLocation(e.data); });

    setTimeout(function () {
      map.invalidateSize();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
      }
    }, 200);
  </script>
</body>
</html>`,
    [],
  );

  const pushUpdate = () => {
    if (!readyRef.current || !webRef.current) {
      return;
    }
    const payload = JSON.stringify({
      latitude: hasCoord ? lat : null,
      longitude: hasCoord ? lng : null,
      title,
      description,
      trail: Array.isArray(trail) ? trail : [],
      showsMarker,
      zoom,
    });
    webRef.current.injectJavaScript(
      `window.setLocation(${payload}); true;`,
    );
  };

  useEffect(() => {
    pushUpdate();
  }, [hasCoord, lat, lng, title, description, trail, showsMarker, zoom]);

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{html}}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data?.type === 'ready') {
              readyRef.current = true;
              pushUpdate();
              if (typeof onMapReady === 'function') {
                onMapReady();
              }
            }
          } catch (error) {
            // ignore
          }
        }}
      />
      {!hasCoord ? (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <Text style={styles.emptyText}>Waiting for location…</Text>
        </View>
      ) : null}
    </View>
  );
};

export default LocationMap;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#E8EEF4',
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
});
