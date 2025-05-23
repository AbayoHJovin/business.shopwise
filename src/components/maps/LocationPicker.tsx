import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, MapContainerProps } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { Icon, LatLng } from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Locate, Search } from 'lucide-react';
import AutoLocate from './AutoLocate';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix for Leaflet marker icon issue in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Define the props for our component
interface LocationPickerProps {
  latitude: number | string;
  longitude: number | string;
  onLocationChange: (lat: number, lng: number) => void;
}

// Create a custom marker icon
const customIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center position (Rwanda)
const DEFAULT_CENTER: [number, number] = [-1.9403, 29.8739];
const DEFAULT_ZOOM = 8;
const MAX_ZOOM = 19; // Maximum zoom level for detailed satellite imagery

// Component to handle map events
const MapEvents = ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  latitude, 
  longitude, 
  onLocationChange 
}) => {
  const [position, setPosition] = useState<[number, number]>(
    latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
      ? [Number(latitude), Number(longitude)]
      : DEFAULT_CENTER
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [autoLocateEnabled, setAutoLocateEnabled] = useState(true); // Enable auto-locate by default
  const mapRef = useRef<any>(null);
  const searchControlRef = useRef<any>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    
    // Add search control to the map
    const provider = new OpenStreetMapProvider();
    
    // Using 'as any' to bypass TypeScript error until proper types are installed
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for a location'
    });
    
    mapRef.current.addControl(searchControl);
    searchControlRef.current = searchControl;
    
    // Handle search result
    mapRef.current.on('geosearch/showlocation', (e: any) => {
      if (e && e.location && typeof e.location.lat === 'number' && typeof e.location.lng === 'number') {
        const { lat, lng } = e.location;
        
        // Update position and move map to the selected location
        handlePositionChange(lat, lng);
        
        // Zoom in to the selected location for better visibility
        mapRef.current.setView([lat, lng], 16);
        
        // Show success message
        toast.success('Location updated from search');
      } else {
        console.warn('Invalid location data received from search', e);
        toast.error('Could not set location from search result');
      }
    });
    
    return () => {
      if (mapRef.current && searchControlRef.current) {
        mapRef.current.removeControl(searchControlRef.current);
      }
    };
  }, [mapRef.current, isMapReady]);

  // Auto-detect user location on component mount
  useEffect(() => {
    // Only auto-detect if no coordinates are provided and map is ready
    const hasCoordinates = latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude));
    
    if (isMapReady && !hasCoordinates) {
      // Small delay to ensure map is fully initialized
      const timer = setTimeout(() => {
        getUserLocation();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isMapReady]);

  // Get user's current location with high accuracy
  const getUserLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }
    
    // First try with maximum accuracy
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 15000,        // Longer timeout for better accuracy
      maximumAge: 0          // Always get fresh position
    };
    
    toast.info('Obtaining your precise location...', {
      description: 'This may take a few moments for maximum accuracy',
      duration: 5000
    });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Log accuracy for debugging
        console.log(`Location obtained with accuracy: ${accuracy} meters`);
        
        handlePositionChange(latitude, longitude);
        setIsLoading(false);
        
        // Provide feedback about accuracy
        if (accuracy < 10) {
          toast.success(`Location obtained with high precision (${accuracy.toFixed(1)}m)`);
        } else if (accuracy < 50) {
          toast.success(`Location obtained with good precision (${accuracy.toFixed(1)}m)`);
        } else {
          toast.info(`Location obtained with moderate precision (${accuracy.toFixed(1)}m)`, {
            description: 'For better accuracy, try standing outside or near a window'
          });
        }
        
        // Zoom in to a level appropriate for the accuracy
        if (mapRef.current) {
          const zoomLevel = accuracy < 10 ? 19 : 
                          accuracy < 50 ? 18 : 
                          accuracy < 100 ? 17 : 16;
          mapRef.current.setView([latitude, longitude], zoomLevel);
        }
      },
      (error) => {
        console.error('Error getting high-accuracy location:', error);
        
        // If high accuracy fails, try with lower accuracy as fallback
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          toast.info('Trying with standard accuracy...');
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              handlePositionChange(latitude, longitude);
              setIsLoading(false);
              toast.info(`Location obtained with accuracy of ${accuracy.toFixed(1)} meters`);
            },
            (fallbackError) => {
              console.error('Error getting fallback location:', fallbackError);
              toast.error('Unable to retrieve your location');
              setIsLoading(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        } else {
          toast.error('Unable to retrieve your location');
          setIsLoading(false);
        }
      },
      highAccuracyOptions
    );
  };

  // Handle position change
  const handlePositionChange = (lat: number | undefined, lng: number | undefined) => {
    // Validate coordinates
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates:', lat, lng);
      return;
    }
    
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
    
    // Reverse geocode to get address
    reverseGeocode(lat, lng);
    
    // Center the map on the new position
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    // Validate coordinates before making API call
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates for geocoding:', lat, lng);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Unable to retrieve address');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2 sm:mb-0">
          <h3 className="text-sm font-medium">Interactive Location Map</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={getUserLocation}
            disabled={isLoading}
            className="flex items-center w-full sm:w-auto justify-center sm:justify-start"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Locate className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Locating...' : 'Use My Location'}
          </Button>
        </div>
        
        <div className="relative h-[250px] sm:h-[300px] md:h-[400px] w-full rounded-md border overflow-hidden">
          {!isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          <MapContainer
            center={position}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            whenReady={() => setIsMapReady(true)}
            ref={mapRef}
            maxZoom={MAX_ZOOM}
            zoomControl={true}
            {...{} as any}
          >
            {/* Satellite view from ESRI World Imagery */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {/* Use a ref to access the marker instance */}
            <Marker 
              position={position} 
              ref={(markerRef) => {
                // This is a workaround for TypeScript issues
                // Access the underlying Leaflet marker instance and set draggable
                if (markerRef) {
                  markerRef.dragging?.enable();
                }
              }}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  handlePositionChange(position.lat, position.lng);
                },
              }}
            />
            <MapEvents onLocationChange={handlePositionChange} />
            
            {/* Auto-locate component for precise location detection */}
            {autoLocateEnabled && isMapReady && (
              <AutoLocate 
                onLocationFound={(lat, lng) => {
                  handlePositionChange(lat, lng);
                  setAutoLocateEnabled(false); // Disable after first location is found
                }}
                onLoadingChange={setIsLoading}
              />
            )}
          </MapContainer>
        </div>
        
        {address && (
          <div className="p-2 sm:p-3 bg-muted rounded-md text-xs sm:text-sm">
            <div className="flex items-start break-words">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
              <p className="break-words">{address}</p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default LocationPicker;
