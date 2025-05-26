import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BusinessLocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({ 
  latitude, 
  longitude, 
  name, 
  address 
}) => {
  useEffect(() => {
    // Fix for default marker icon in Leaflet
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

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker with popup
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`<strong>${name}</strong><br>${address}`)
      .openPopup();

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
