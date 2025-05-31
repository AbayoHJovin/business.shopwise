import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { BusinessDiscoveryDto } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Load Google Maps API script dynamically
const loadGoogleMapsScript = (callback: () => void) => {
  // Check if the script is already loaded
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  // Create the script element
  const googleMapsScript = document.createElement("script");
  googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
  googleMapsScript.async = true;
  googleMapsScript.defer = true;

  // Set callback for when script loads
  googleMapsScript.addEventListener("load", callback);

  // Add the script to the document
  document.head.appendChild(googleMapsScript);
};

interface BusinessMapProps {
  businesses: BusinessDiscoveryDto[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedBusinessId?: string;
  onBusinessSelect?: (businessId: string) => void;
  height?: string;
  className?: string;
  loading?: boolean;
}

const BusinessMap: React.FC<BusinessMapProps> = ({
  businesses,
  userLocation,
  selectedBusinessId,
  onBusinessSelect,
  height = "400px",
  className = "",
  loading = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    try {
      loadGoogleMapsScript(() => {
        setScriptLoaded(true);
      });
    } catch (error) {
      console.error("Error loading Google Maps script:", error);
      setMapError("Failed to load map. Please try again later.");
    }
  }, []);

  // Initialize map when script is loaded and user location is available
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    try {
      // Default center (Rwanda)
      const defaultCenter = { lat: -1.9403, lng: 29.8739 };

      // Use user location if available
      const center = userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : defaultCenter;

      const mapOptions: google.maps.MapOptions = {
        center,
        zoom: userLocation ? 14 : 8,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      };

      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // Add user location marker if available
      if (userLocation) {
        new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map: newMap,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#4338CA",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 8,
          },
          title: "Your Location",
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please try again later.");
    }
  }, [scriptLoaded, userLocation]);

  // Add business markers when map is initialized and businesses change
  useEffect(() => {
    if (!map || !businesses.length) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    // Create new markers
    const newMarkers = businesses
      .map((business) => {
        if (!business.location.latitude || !business.location.longitude)
          return null;

        const isSelected = business.id === selectedBusinessId;

        const marker = new google.maps.Marker({
          position: {
            lat: business.location.latitude,
            lng: business.location.longitude,
          },
          map,
          title: business.name,
          animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
          icon: {
            url: isSelected
              ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          },
        });

        // Add click event to marker
        marker.addListener("click", () => {
          if (onBusinessSelect) {
            onBusinessSelect(business.id);
          }
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${
              business.name
            }</h3>
            <p style="margin: 0 0 8px; font-size: 14px;">
              ${business.location.sector}, ${business.location.district}
            </p>
            ${
              business.formattedDistance
                ? `<p style="margin: 0; font-size: 12px; color: #666;">
                ${business.formattedDistance}
              </p>`
                : business.distanceKm !== undefined
                ? `<p style="margin: 0; font-size: 12px; color: #666;">
                ${
                  business.distanceKm < 1
                    ? `${Math.round(business.distanceKm * 1000)}m away`
                    : `${business.distanceKm.toFixed(1)}km away`
                }
              </p>`
                : ""
            }
          </div>
        `,
        });

        marker.addListener("mouseover", () => {
          infoWindow.open(map, marker);
        });

        marker.addListener("mouseout", () => {
          infoWindow.close();
        });

        return marker;
      })
      .filter(Boolean) as google.maps.Marker[];

    setMarkers(newMarkers);

    // Fit bounds to include all markers if there are multiple businesses
    if (newMarkers.length > 1) {
      const bounds = new google.maps.LatLngBounds();

      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
      }

      // Add all business locations to bounds
      newMarkers.forEach((marker) => {
        if (marker.getPosition()) {
          bounds.extend(marker.getPosition()!);
        }
      });

      map.fitBounds(bounds);

      // Don't zoom in too far
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 16) map.setZoom(16);
        google.maps.event.removeListener(listener);
      });
    }

    // If only one business is selected, center on it
    if (newMarkers.length === 1 && selectedBusinessId) {
      const selectedBusiness = businesses.find(
        (b) => b.id === selectedBusinessId
      );
      if (selectedBusiness) {
        map.setCenter({
          lat: selectedBusiness.location.latitude,
          lng: selectedBusiness.location.longitude,
        });
        map.setZoom(16);
      }
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, businesses, selectedBusinessId, onBusinessSelect, userLocation]);

  // Center map on selected business when it changes
  useEffect(() => {
    if (!map || !selectedBusinessId) return;

    const selectedBusiness = businesses.find(
      (b) => b.id === selectedBusinessId
    );
    if (selectedBusiness) {
      map.setCenter({
        lat: selectedBusiness.location.latitude,
        lng: selectedBusiness.location.longitude,
      });
      map.setZoom(16);
    }
  }, [map, selectedBusinessId, businesses]);

  if (loading) {
    return (
      <Card className={`overflow-hidden ${className}`} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card className={`overflow-hidden ${className}`} style={{ height }}>
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Map Unavailable</h3>
          <p className="text-muted-foreground mb-4">{mapError}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden relative ${className}`}
      style={{ height }}
    >
      <div ref={mapRef} className="h-full w-full" />

      {userLocation && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-md"
            onClick={() => {
              if (map) {
                map.setCenter({
                  lat: userLocation.latitude,
                  lng: userLocation.longitude,
                });
                map.setZoom(14);
              }
            }}
          >
            <Navigation className="h-4 w-4 mr-2" />
            My Location
          </Button>
        </div>
      )}
    </Card>
  );
};

export default BusinessMap;
