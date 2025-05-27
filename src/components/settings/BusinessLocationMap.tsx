import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BusinessLocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({ 
  latitude, 
  longitude, 
  name, 
  address,
  onLocationSelect
}) => {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Create map instance
    const mapContainer = document.getElementById('business-location-map');
    if (!mapContainer) return;

    // Clear any existing map
    mapContainer.innerHTML = '';
    
    // Initialize map
    const map = L.map(mapContainer).setView([latitude, longitude], 13);

    // Add satellite tile layer (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community',
      maxZoom: 19
    }).addTo(map);

    // Add marker with popup
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`<strong>${name}</strong><br>${address}`)
      .openPopup();

    // Add click handler if onLocationSelect is provided
    if (onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationSelect(lat, lng);
      });
    }

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [latitude, longitude, name, address]);

  return (
    <div id="business-location-map" style={{ height: '100%', width: '100%' }}></div>
  );
};

export default BusinessLocationMap;
