import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { BusinessDiscoveryDto } from "@/types/business";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface BusinessMapProps {
  businesses: BusinessDiscoveryDto[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedBusinessId?: string;
  onBusinessSelect?: (businessId: string) => void;
  height?: string;
  className?: string;
  loading?: boolean;
}

// Geographic coordinate bounds for Rwanda
const RWANDA_BOUNDS = {
  north: -1.0474, // northernmost latitude
  south: -2.8406, // southernmost latitude
  east: 30.899, // easternmost longitude
  west: 28.8617, // westernmost longitude
};

const BusinessMap: React.FC<BusinessMapProps> = ({
  businesses,
  userLocation,
  selectedBusinessId,
  onBusinessSelect,
  height = "400px",
  className = "",
  loading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [mapImageLoaded, setMapImageLoaded] = useState(false);

  // Use bounds that encompass all businesses plus some padding
  const calculateMapBounds = () => {
    let bounds = { ...RWANDA_BOUNDS };

    // If we have business coordinates, adjust bounds to fit all businesses
    if (businesses.length > 0) {
      const validBusinesses = businesses.filter(
        (b) => b.location.latitude && b.location.longitude
      );

      if (validBusinesses.length > 0) {
        // Find min/max coordinates
        bounds = validBusinesses.reduce(
          (acc, business) => {
            const lat = business.location.latitude;
            const lng = business.location.longitude;
            return {
              north: Math.max(acc.north, lat + 0.05),
              south: Math.min(acc.south, lat - 0.05),
              east: Math.max(acc.east, lng + 0.05),
              west: Math.min(acc.west, lng - 0.05),
            };
          },
          {
            north: -90,
            south: 90,
            east: -180,
            west: 180,
          }
        );
      }
    }

    // Include user location in bounds if available
    if (userLocation) {
      bounds.north = Math.max(bounds.north, userLocation.latitude + 0.05);
      bounds.south = Math.min(bounds.south, userLocation.latitude - 0.05);
      bounds.east = Math.max(bounds.east, userLocation.longitude + 0.05);
      bounds.west = Math.min(bounds.west, userLocation.longitude - 0.05);
    }

    return bounds;
  };

  // Get map center coordinates
  const getMapCenter = () => {
    // First priority: selected business
    const selectedBusiness = selectedBusinessId
      ? businesses.find((b) => b.id === selectedBusinessId)
      : null;

    if (
      selectedBusiness?.location.latitude &&
      selectedBusiness?.location.longitude
    ) {
      return {
        lat: selectedBusiness.location.latitude,
        lng: selectedBusiness.location.longitude,
      };
    }

    // Second priority: first business with valid coordinates
    for (const business of businesses) {
      if (business.location.latitude && business.location.longitude) {
        return {
          lat: business.location.latitude,
          lng: business.location.longitude,
        };
      }
    }

    // Third priority: user location
    if (userLocation) {
      return {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
    }

    // Default: Kigali, Rwanda
    return { lat: -1.9441, lng: 30.0619 };
  };

  // Convert geographic coordinates to pixel positions on the map
  const geoToPixel = (
    lat: number,
    lng: number,
    bounds: typeof RWANDA_BOUNDS
  ) => {
    const mapWidth = mapDimensions.width;
    const mapHeight = mapDimensions.height;

    if (mapWidth === 0 || mapHeight === 0) return { x: 0, y: 0 };

    // Calculate percentage across map
    const latRange = bounds.north - bounds.south;
    const lngRange = bounds.east - bounds.west;

    const latPercent = (bounds.north - lat) / latRange;
    const lngPercent = (lng - bounds.west) / lngRange;

    // Convert to pixel coordinates
    return {
      x: lngPercent * mapWidth,
      y: latPercent * mapHeight,
    };
  };

  // Handle business selection and map focus
  const handleBusinessSelect = (business: BusinessDiscoveryDto) => {
    if (!business.location.latitude || !business.location.longitude) return;

    // Update selected pin state
    setSelectedPin(business.id);

    // Call the parent's onBusinessSelect if provided
    if (onBusinessSelect) {
      onBusinessSelect(business.id);
    }

    // Update the map to focus on the selected business
    if (mapContainerRef.current) {
      const iframe = mapContainerRef.current.querySelector("iframe");
      if (iframe) {
        // Center map on the selected business with zoom level 17 (closer view)
        iframe.src = `https://www.google.com/maps?q=${business.location.latitude},${business.location.longitude}&z=17&t=k&output=embed`;
      }
    }
  };

  // Update map dimensions when container resizes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const updateDimensions = () => {
      if (mapContainerRef.current) {
        setMapDimensions({
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight,
        });
      }
    };

    // Set initial dimensions
    updateDimensions();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current);
      }
    };
  }, []);

  // Update selected pin when selectedBusinessId changes
  useEffect(() => {
    setSelectedPin(selectedBusinessId || null);
  }, [selectedBusinessId]);

  // Generate a URL for Google Maps with satellite view
  const getStaticMapUrl = () => {
    const center = getMapCenter();
    // Use Google Maps with satellite view (t=k parameter)
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15900!2d${center.lng}!3d${center.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1655114762605!5m2!1sen!2sus`;
  };

  // Render loading state
  if (loading) {
    return (
      <Card className={`overflow-hidden ${className}`} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </Card>
    );
  }

  // Render empty state
  if (businesses.length === 0 && !userLocation) {
    return (
      <Card className={`overflow-hidden ${className}`} style={{ height }}>
        <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Businesses Found</h3>
          <p className="text-muted-foreground">
            Search for businesses to view them on the map.
          </p>
        </div>
      </Card>
    );
  }

  // Calculate map bounds
  const bounds = calculateMapBounds();

  return (
    <Card
      className={`overflow-hidden relative ${className}`}
      style={{ height }}
    >
      <div
        ref={mapContainerRef}
        className="relative w-full h-full bg-gray-100 overflow-hidden"
      >
        {/* Map background */}
        <iframe
          src={`https://www.google.com/maps?q=${getMapCenter().lat},${
            getMapCenter().lng
          }&z=14&t=k&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          onLoad={() => setMapImageLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          title="Map Background"
          className="absolute inset-0 w-full h-full"
        />

        {/* Business Pins - Only render after map is loaded */}
        {mapImageLoaded &&
          businesses.map((business) => {
            if (!business.location.latitude || !business.location.longitude)
              return null;

            const { x, y } = geoToPixel(
              business.location.latitude,
              business.location.longitude,
              bounds
            );

            const isSelected = business.id === selectedPin;

            return (
              <div
                key={business.id}
                className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
                style={{ left: `${x}px`, top: `${y}px` }}
                onClick={() => handleBusinessSelect(business)}
              >
                {/* Pin */}
                <div className={`flex flex-col items-center group`}>
                  <div
                    className={`
                      p-2 rounded-full shadow-md cursor-pointer
                      ${
                        isSelected
                          ? "bg-primary text-white scale-125 ring-4 ring-primary/20"
                          : "bg-white text-primary hover:bg-primary/10 hover:scale-110"
                      } 
                      transition-all duration-300 ease-in-out
                    `}
                  >
                    <MapPin
                      className={`${isSelected ? "h-6 w-6" : "h-5 w-5"}`}
                    />
                  </div>

                  {/* Pulse effect for selected pin */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-primary/40 h-full w-full" />
                  )}

                  {/* Label - Show on hover or when selected */}
                  <div
                    className={`
                      absolute top-0 transform -translate-y-full 
                      bg-white shadow-md rounded-md px-3 py-2 text-xs font-medium
                      ${
                        isSelected
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                      }
                      transition-all duration-200 min-w-[120px] max-w-[180px] z-10 border border-gray-200
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className="line-clamp-2 font-semibold">
                        {business.name}
                      </span>
                      {isSelected && (
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPin(null);
                          }}
                        />
                      )}
                    </div>
                    {business.formattedDistance && (
                      <span className="block text-muted-foreground text-[10px] mt-1">
                        {business.formattedDistance}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {/* User location pin */}
        {userLocation && mapImageLoaded && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: geoToPixel(
                userLocation.latitude,
                userLocation.longitude,
                bounds
              ).x,
              top: geoToPixel(
                userLocation.latitude,
                userLocation.longitude,
                bounds
              ).y,
            }}
          >
            <div className="h-4 w-4 bg-blue-600 rounded-full border-2 border-white shadow-md animate-pulse" />
          </div>
        )}

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="shadow-md"
            onClick={() => {
              // Reset selected pin and center map on user location
              setSelectedPin(null);
              if (mapContainerRef.current) {
                // Force re-render of the map
                const iframe = mapContainerRef.current.querySelector("iframe");
                if (iframe) {
                  const center = getMapCenter();
                  iframe.src = `https://www.google.com/maps?q=${center.lat},${center.lng}&z=14&t=k&output=embed`;
                }
              }
            }}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Reset View
          </Button>
        </div>
      </div>

      {/* Business list sidebar */}
      {businesses.length > 0 && onBusinessSelect && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-md shadow-md max-w-xs max-h-60 overflow-y-auto border border-gray-200">
          <h4 className="font-medium text-sm mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-1.5 text-primary" />
            Businesses on Map:
          </h4>
          <ul className="space-y-2">
            {businesses.map((business) => (
              <li
                key={business.id}
                className={`
                  p-1.5 px-2 rounded-md cursor-pointer 
                  transition-colors duration-200 
                  hover:bg-gray-100 active:bg-gray-200
                  ${
                    business.id === selectedPin
                      ? "bg-primary/10 border-l-2 border-primary"
                      : ""
                  }
                `}
                onClick={() => handleBusinessSelect(business)}
              >
                <div className="flex items-start">
                  <MapPin
                    className={`h-3.5 w-3.5 mt-0.5 mr-1.5 shrink-0 ${
                      business.id === selectedPin
                        ? "text-primary"
                        : "text-gray-500"
                    }`}
                  />
                  <div>
                    <span
                      className={`line-clamp-1 text-xs ${
                        business.id === selectedPin
                          ? "font-semibold text-primary"
                          : ""
                      }`}
                    >
                      {business.name}
                    </span>
                    {business.formattedDistance && (
                      <span className="block text-muted-foreground text-[10px]">
                        {business.formattedDistance}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default BusinessMap;
