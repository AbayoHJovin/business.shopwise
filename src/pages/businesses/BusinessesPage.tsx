/**
 * Business Discovery Page
 * Allows users to discover nearby businesses using geolocation
 *
 * This component only loads data when explicitly requested by the user
 * to prevent excessive API calls and server strain.
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, MapPin, Grid3X3, Map, Compass } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import BusinessCard from "@/components/businesses/BusinessCard";
import BusinessMap from "@/components/businesses/BusinessMap";
import LocationFilter from "@/components/businesses/LocationFilter";
import LocationPermissionModal from "@/components/businesses/LocationPermissionModal";
import {
  BusinessDto,
  BusinessSearchParams,
  LocationFilters,
} from "@/types/business";
import {
  getNearestBusinesses,
  getBusinessesWithinRadius,
} from "@/services/businessDiscoveryService";

// Throttle helper to prevent function from being called too frequently
const throttle = (func: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

const BusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [initialSearchPerformed, setInitialSearchPerformed] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalItems: 0,
    hasMore: false,
  });
  const [locationPermissionModalOpen, setLocationPermissionModalOpen] =
    useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<
    string | undefined
  >(undefined);
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    radius: 10,
  });

  // Get current user location - wrapped with useCallback and throttled
  const getCurrentLocation = useCallback(
    throttle(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermissionModalOpen(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Use default location (e.g., Kigali center)
          setUserLocation({ latitude: -1.9441, longitude: 30.0619 });
          setError(
            "We couldn't determine your exact location. We'll use Kigali, Rwanda as the default location for your search."
          );
          setLocationPermissionModalOpen(false);
        }
      );
    }, 5000),
    []
  ); // Throttle to once every 5 seconds

  // Check for location permission on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Fetch businesses when user location or filters change
  useEffect(() => {
    if (userLocation) {
      // Don't automatically fetch businesses - let the user initiate the search
      setLoading(false); // Set loading to false since we're not fetching automatically
    }
  }, [userLocation]);

  // Check if user has given location permission
  const checkLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            getCurrentLocation();
          } else if (permissionStatus.state === "prompt") {
            setLocationPermissionModalOpen(true);
          } else {
            // Use default location (e.g., Kigali center)
            setUserLocation({ latitude: -1.9441, longitude: 30.0619 });
            setError(
              "Location permission denied. Showing businesses in default location."
            );
          }
        })
        .catch(() => {
          // Fallback for browsers that don't support the permissions API
          getCurrentLocation();
        });
    } else {
      setError("Geolocation is not supported by your browser.");
      // Use default location
      setUserLocation({ latitude: -1.9441, longitude: 30.0619 });
    }
  };

  // Fetch businesses from API - with a check to prevent duplicate requests
  const fetchBusinesses = async (page = 0) => {
    if (!userLocation || loading) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        skip: page * 10, // 10 items per page
        limit: 10,
        radius: locationFilters.radius,
        // Other filters will be added at the service level if needed
      };

      // If any location filters are applied, add them to the request
      if (locationFilters.province) params.province = locationFilters.province;
      if (locationFilters.district) params.district = locationFilters.district;
      if (locationFilters.sector) params.sector = locationFilters.sector;
      if (locationFilters.cell) params.cell = locationFilters.cell;
      if (locationFilters.village) params.village = locationFilters.village;

      // Add search term if provided
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      // Decide whether to use nearest or within-radius endpoint based on whether radius is explicitly set
      const response =
        params.radius !== undefined && params.radius > 0
          ? await getBusinessesWithinRadius(params)
          : await getNearestBusinesses(params);

      if (page === 0) {
        setBusinesses(response.data);
      } else {
        setBusinesses((prev) => [...prev, ...response.data]);
      }

      setPagination({
        currentPage: page,
        totalItems: response.totalCount,
        hasMore: response.hasMore,
      });

      // Mark that initial search has been performed
      setInitialSearchPerformed(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch businesses. Please try again later.";
      setError(errorMessage);
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses(0); // Reset to first page when searching
  };

  // Handle load more button click
  const handleLoadMore = () => {
    fetchBusinesses(pagination.currentPage + 1);
  };

  // Handle filter changes
  const handleFilterChange = (filters: LocationFilters) => {
    setLocationFilters(filters);
  };

  // Handle business selection from map
  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    const element = document.getElementById(`business-${businessId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <MainLayout title="Discover Businesses">
      <div className="container py-6 space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search businesses by name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="ml-2" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => getCurrentLocation()}
              title="Use my current location"
            >
              <MapPin className="h-4 w-4" />
            </Button>

            <LocationFilter
              onFilterChange={handleFilterChange}
              initialRadius={10}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Card className="p-4 bg-destructive/10 text-destructive">
            {error}
          </Card>
        )}

        {/* Empty state when no search has been performed yet */}
        {!initialSearchPerformed ? (
          <Card className="p-8 text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Compass className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Discover Nearby Businesses
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Use the search bar above to find businesses by name or click the
              button below to see businesses near your location{" "}
              {userLocation && userLocation.latitude === -1.9441
                ? "(using Kigali, Rwanda as default location)"
                : ""}
              .
            </p>
            <Button onClick={() => fetchBusinesses(0)} disabled={loading}>
              {loading ? "Searching..." : "Discover Nearby Businesses"}
            </Button>
          </Card>
        ) : (
          /* Map/Grid view tabs */
          <Tabs
            defaultValue="grid"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {pagination.totalItems > 0
                  ? `${pagination.totalItems} Businesses Found`
                  : "Nearby Businesses"}
              </h2>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  Map
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="h-96 animate-pulse">
                      <div className="bg-muted h-48"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-20 bg-muted rounded"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : businesses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business) => (
                      <div id={`business-${business.id}`} key={business.id}>
                        <BusinessCard
                          business={business}
                          featured={business.id === selectedBusinessId}
                        />
                      </div>
                    ))}
                  </div>

                  {pagination.hasMore && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loading}
                        variant="outline"
                        size="lg"
                      >
                        {loading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-medium mb-2">
                    No businesses found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find businesses.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <div className="rounded-lg overflow-hidden border">
                <BusinessMap
                  businesses={businesses}
                  userLocation={userLocation}
                  selectedBusinessId={selectedBusinessId}
                  onBusinessSelect={handleBusinessSelect}
                  height="600px"
                  loading={loading}
                />
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Businesses on Map</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businesses.slice(0, 4).map((business) => (
                    <div
                      key={business.id}
                      id={`business-list-${business.id}`}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        business.id === selectedBusinessId
                          ? "border-primary bg-accent"
                          : ""
                      }`}
                      onClick={() => handleBusinessSelect(business.id)}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{business.name}</h4>
                        {business.formattedDistance && (
                          <span className="text-sm text-muted-foreground">
                            {business.formattedDistance}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {business.location.sector}, {business.location.district}
                      </p>
                    </div>
                  ))}
                </div>

                {businesses.length > 4 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("grid")}
                  >
                    View All {businesses.length} Businesses
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Location permission modal */}
      <LocationPermissionModal
        isOpen={locationPermissionModalOpen}
        onClose={() => setLocationPermissionModalOpen(false)}
        onAllow={getCurrentLocation}
        onDeny={() => {
          setLocationPermissionModalOpen(false);
          // Use default location (e.g., Kigali center)
          setUserLocation({ latitude: -1.9441, longitude: 30.0619 });
        }}
      />
    </MainLayout>
  );
};

export default BusinessesPage;
