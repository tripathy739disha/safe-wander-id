import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle heatmap layers
const HeatmapLayer = ({ heatmaps }) => {
  const map = useMap();
  const heatmapLayersRef = useRef([]);

  useEffect(() => {
    // Clear existing heatmap layers
    heatmapLayersRef.current.forEach(layer => {
      map.removeLayer(layer);
    });
    heatmapLayersRef.current = [];

    if (!heatmaps || heatmaps.length === 0) return;

    // Separate heatmaps by color
    const greenPoints = heatmaps
      .filter(point => point.color === 'green')
      .map(point => [point.lat, point.lng, point.intensity]);
    
    const redPoints = heatmaps
      .filter(point => point.color === 'red')
      .map(point => [point.lat, point.lng, point.intensity]);

    // Create green heatmap
    if (greenPoints.length > 0) {
      const greenHeatmap = L.heatLayer(greenPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: 'transparent',
          0.2: 'lightgreen',
          0.4: 'lime',
          0.6: 'green',
          0.8: 'darkgreen',
          1.0: 'darkgreen'
        }
      });
      greenHeatmap.addTo(map);
      heatmapLayersRef.current.push(greenHeatmap);
    }

    // Create red heatmap
    if (redPoints.length > 0) {
      const redHeatmap = L.heatLayer(redPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: 'transparent',
          0.2: 'pink',
          0.4: 'orange',
          0.6: 'red',
          0.8: 'darkred',
          1.0: 'maroon'
        }
      });
      redHeatmap.addTo(map);
      heatmapLayersRef.current.push(redHeatmap);
    }

    return () => {
      heatmapLayersRef.current.forEach(layer => {
        map.removeLayer(layer);
      });
    };
  }, [map, heatmaps]);

  return null;
};

// Component to handle theme-aware tile layer
const ThemeAwareTileLayer = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  if (isDark) {
    return (
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
    );
  }

  return (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
  );
};

// Component to handle routing
const RoutingControl = ({ routeStart, routeEnd }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!routeStart || !routeEnd) return;

    // Dynamic import of leaflet-routing-machine
    import('leaflet-routing-machine').then((LRM) => {
      // Remove existing routing control
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      // Create new routing control
      routingControlRef.current = LRM.default.control({
        waypoints: [
          L.latLng(routeStart[0], routeStart[1]),
          L.latLng(routeEnd[0], routeEnd[1])
        ],
        routeWhileDragging: true,
        addWaypoints: false,
        createMarker: function() { return null; }, // Hide default markers
        lineOptions: {
          styles: [{ color: '#3388ff', weight: 4, opacity: 0.7 }]
        }
      }).addTo(map);
    });

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, routeStart, routeEnd]);

  return null;
};

const MapComponent = ({ 
  latitude, 
  longitude, 
  heatmaps = [], 
  routeStart, 
  routeEnd,
  showMarkers = true 
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default fallback

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setUserLocation([lat, lng]);
          setMapCenter([lat, lng]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Fallback to props or default
          if (latitude && longitude) {
            setMapCenter([latitude, longitude]);
          }
        }
      );
    } else {
      // Fallback to props or default
      if (latitude && longitude) {
        setMapCenter([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="w-full h-full overflow-hidden" style={{ borderRadius: '16px' }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        zoomControl={true}
        style={{ 
          height: '100%', 
          width: '100%', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
        }}
        className="z-0"
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        boxZoom={true}
>
        {() => (
          <>
            {/* Theme-aware tile layer */}
            <ThemeAwareTileLayer />
            
            {/* Heatmap layers */}
            <HeatmapLayer heatmaps={heatmaps} />
            
            {/* Routing */}
            <RoutingControl routeStart={routeStart} routeEnd={routeEnd} />
            
            {/* Markers for heatmap points */}
            {showMarkers && heatmaps.map((point, index) => (
              <Marker key={index} position={[point.lat, point.lng]}>
                <Popup>
                  <div className="text-sm">
                    <strong>Point {index + 1}</strong><br />
                    Color: <span className={`font-medium ${point.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                      {point.color}
                    </span><br />
                    Intensity: {point.intensity}
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* User location marker */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-sm">
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;