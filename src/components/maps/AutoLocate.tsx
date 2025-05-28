import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AutoLocateProps {
  onLocationFound: (lat: number, lng: number) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

/**
 * Component that automatically locates the user with high precision
 * Must be used as a child of MapContainer
 */
const AutoLocate: React.FC<AutoLocateProps> = ({ onLocationFound, onLoadingChange }) => {
  const map = useMap();

  useEffect(() => {
    // Set loading state
    onLoadingChange(true);
    
    // Show toast to inform user
    toast.info('Obtaining your precise location...', {
      description: 'This may take a few moments for maximum accuracy',
      duration: 5000
    });

    // Configure high accuracy options
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 15000,        // Longer timeout for better accuracy
      maximumAge: 0          // Always get fresh position
    };

    // Try to locate with high accuracy
    map.locate({
      setView: true,         // Automatically center map on user location
      maxZoom: 19,           // Zoom in as much as possible
      timeout: 15000,        // Wait longer for better accuracy
      enableHighAccuracy: true,
      watch: false           // Get location once, not continuously
    });

    // Handle successful location
    const handleLocationFound = (e: any) => {
      const { lat, lng } = e.latlng;
      const accuracy = e.accuracy;
      
      // Call the callback with the coordinates
      onLocationFound(lat, lng);
      
      // Set loading state to false
      onLoadingChange(false);
      
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
      
      // Set appropriate zoom level based on accuracy
      const zoomLevel = accuracy < 10 ? 19 : 
                        accuracy < 50 ? 18 : 
                        accuracy < 100 ? 17 : 16;
      map.setView([lat, lng], zoomLevel);
      
      // Log for debugging
      console.log(`Location found with accuracy: ${accuracy} meters`);
    };
    
    // Handle location error
    const handleLocationError = (e: any) => {
      console.error('Error getting location:', e.message);
      
      toast.error('Could not get precise location', {
        description: 'Trying with standard accuracy...'
      });
      
      // Try again with lower accuracy
      map.locate({
        setView: true,
        maxZoom: 16,
        timeout: 10000,
        enableHighAccuracy: false
      });
      
      // If that also fails, show error
      map.once('locationerror', (fallbackError) => {
        console.error('Fallback location also failed:', fallbackError.message);
        toast.error('Unable to determine your location', {
          description: 'Please use the map to manually select your location'
        });
        onLoadingChange(false);
      });
      
      // If the fallback succeeds
      map.once('locationfound', (fallbackLocation) => {
        const { lat, lng } = fallbackLocation.latlng;
        const accuracy = fallbackLocation.accuracy;
        
        onLocationFound(lat, lng);
        onLoadingChange(false);
        
        toast.info(`Location obtained with accuracy of ${accuracy.toFixed(1)} meters`);
      });
    };

    map.once('locationfound', handleLocationFound);
    map.once('locationerror', handleLocationError);

    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
    };
  }, [map, onLocationFound, onLoadingChange]);

  return null; 
};

export default AutoLocate;
