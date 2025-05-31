/**
 * Business Discovery Page
 * Allows users to discover nearby businesses using geolocation
 *
 * This component only loads data when explicitly requested by the user
 * to prevent excessive API calls and server strain.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Grid3X3,
  Map,
  Compass,
  Info,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
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
  searchBusinessesByName,
  searchBusinessesByProduct,
  advancedSearchBusinesses,
  filterBusinessesByProvince,
  filterBusinessesByDistrict,
  filterBusinessesBySector,
  filterBusinessesByCell,
  filterBusinessesByVillage,
} from "@/services/businessDiscoveryService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, Package } from "lucide-react";

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
  const location = useLocation();
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

  // Add a loading ref to prevent duplicate loading calls
  const loadingRef = useRef(false);
  // Add separate observer refs for each tab
  const gridObserverRef = useRef<HTMLDivElement>(null);
  const mapObserverRef = useRef<HTMLDivElement>(null);

  // Add new state for search options
  const [searchType, setSearchType] = useState<
    "business" | "product" | "advanced"
  >("business");
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [advancedSearchParams, setAdvancedSearchParams] = useState({
    businessName: "",
    productName: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
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

  // Add effect to clear search when search type changes
  useEffect(() => {
    if (searchType !== "advanced") {
      setSearchTerm("");
    }
  }, [searchType]);

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

  // Update the fetchBusinesses function to support different search types
  const fetchBusinesses = async (page = 0) => {
    if (!userLocation || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Base location parameters
      const baseParams = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        skip: page * 10,
        limit: 10,
        radius: locationFilters.radius,
      };

      let response;

      // Check if we should use specific administrative division filter endpoints
      if (
        locationFilters.province &&
        !locationFilters.district &&
        !locationFilters.sector &&
        !locationFilters.cell &&
        !locationFilters.village &&
        searchType !== "advanced" &&
        !searchTerm.trim()
      ) {
        // Filter by province only
        response = await filterBusinessesByProvince(
          locationFilters.province,
          baseParams
        );
      } else if (
        locationFilters.district &&
        !locationFilters.sector &&
        !locationFilters.cell &&
        !locationFilters.village &&
        searchType !== "advanced" &&
        !searchTerm.trim()
      ) {
        // Filter by district only
        response = await filterBusinessesByDistrict(
          locationFilters.district,
          baseParams
        );
      } else if (
        locationFilters.sector &&
        !locationFilters.cell &&
        !locationFilters.village &&
        searchType !== "advanced" &&
        !searchTerm.trim()
      ) {
        // Filter by sector only
        response = await filterBusinessesBySector(
          locationFilters.sector,
          baseParams
        );
      } else if (
        locationFilters.cell &&
        !locationFilters.village &&
        searchType !== "advanced" &&
        !searchTerm.trim()
      ) {
        // Filter by cell only
        response = await filterBusinessesByCell(
          locationFilters.cell,
          baseParams
        );
      } else if (
        locationFilters.village &&
        searchType !== "advanced" &&
        !searchTerm.trim()
      ) {
        // Filter by village only
        response = await filterBusinessesByVillage(
          locationFilters.village,
          baseParams
        );
      } else {
        // If we have mixed filters or search terms, use the regular search methods

        // For multiple location filters, add them to the request parameters
        if (locationFilters.province)
          baseParams.province = locationFilters.province;
        if (locationFilters.district)
          baseParams.district = locationFilters.district;
        if (locationFilters.sector) baseParams.sector = locationFilters.sector;
        if (locationFilters.cell) baseParams.cell = locationFilters.cell;
        if (locationFilters.village)
          baseParams.village = locationFilters.village;

        // Choose the appropriate search method based on search type
        switch (searchType) {
          case "business":
            if (searchTerm.trim()) {
              // Search by business name
              response = await searchBusinessesByName(
                searchTerm.trim(),
                baseParams
              );
            } else {
              // Regular proximity search
              response =
                locationFilters.radius !== undefined &&
                locationFilters.radius > 0
                  ? await getBusinessesWithinRadius(baseParams)
                  : await getNearestBusinesses(baseParams);
            }
            break;

          case "product":
            if (searchTerm.trim()) {
              // Search by product name
              response = await searchBusinessesByProduct(
                searchTerm.trim(),
                baseParams
              );
            } else {
              // Regular proximity search if no product name specified
              response =
                locationFilters.radius !== undefined &&
                locationFilters.radius > 0
                  ? await getBusinessesWithinRadius(baseParams)
                  : await getNearestBusinesses(baseParams);
            }
            break;

          case "advanced":
            // Advanced search
            const advancedParams = {
              ...baseParams,
              businessName:
                advancedSearchParams.businessName.trim() || undefined,
              productName: advancedSearchParams.productName.trim() || undefined,
              province:
                advancedSearchParams.province === "none"
                  ? ""
                  : advancedSearchParams.province || locationFilters.province,
              district:
                advancedSearchParams.district === "none"
                  ? ""
                  : advancedSearchParams.district || locationFilters.district,
              sector:
                advancedSearchParams.sector === "none"
                  ? ""
                  : advancedSearchParams.sector || locationFilters.sector,
              cell: advancedSearchParams.cell || locationFilters.cell,
              village: advancedSearchParams.village || locationFilters.village,
              radius: advancedSearchParams.radius || locationFilters.radius,
            };

            response = await advancedSearchBusinesses(advancedParams);
            break;

          default:
            // Default to nearest businesses
            response = await getNearestBusinesses(baseParams);
        }
      }

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
      loadingRef.current = false;
    }
  };

  // Update the handleObserver function to check both refs
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        pagination.hasMore &&
        !loading &&
        !loadingRef.current &&
        initialSearchPerformed
      ) {
        fetchBusinesses(pagination.currentPage + 1);
      }
    },
    [
      pagination.hasMore,
      pagination.currentPage,
      loading,
      initialSearchPerformed,
    ]
  );

  // Update the intersection observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    });

    // Only observe if there are more items to load
    if (pagination.hasMore && !loading) {
      if (gridObserverRef.current && activeTab === "grid") {
        observer.observe(gridObserverRef.current);
      }

      if (mapObserverRef.current && activeTab === "map") {
        observer.observe(mapObserverRef.current);
      }
    }

    return () => {
      if (gridObserverRef.current) {
        observer.unobserve(gridObserverRef.current);
      }
      if (mapObserverRef.current) {
        observer.unobserve(mapObserverRef.current);
      }
    };
  }, [handleObserver, pagination.hasMore, loading, activeTab]);

  // Add scroll restoration when returning from business detail
  useEffect(() => {
    // Check if we're returning from a business detail page
    const scrollPosition = sessionStorage.getItem("businessesScrollPosition");
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition, 10));
      sessionStorage.removeItem("businessesScrollPosition");
    }
  }, [location]);

  // Save scroll position when navigating to business detail
  const handleViewBusinessDetail = (businessId: string) => {
    // Save current scroll position
    sessionStorage.setItem(
      "businessesScrollPosition",
      window.scrollY.toString()
    );
    // Navigate to business detail
    navigate(`/businesses/${businessId}`);
  };

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses(0); // Reset to first page when searching
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
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Add a function to handle advanced search submission
  const handleAdvancedSearch = () => {
    // Convert any "none" values to empty strings
    const cleanedParams = {
      ...advancedSearchParams,
      province:
        advancedSearchParams.province === "none"
          ? ""
          : advancedSearchParams.province,
      district:
        advancedSearchParams.district === "none"
          ? ""
          : advancedSearchParams.district,
      sector:
        advancedSearchParams.sector === "none"
          ? ""
          : advancedSearchParams.sector,
      cell:
        advancedSearchParams.cell === "none" ? "" : advancedSearchParams.cell,
      village:
        advancedSearchParams.village === "none"
          ? ""
          : advancedSearchParams.village,
    };
    setAdvancedSearchParams(cleanedParams);
    setSearchType("advanced");
    setAdvancedSearchOpen(false);
    fetchBusinesses(0); // Reset to first page when searching
  };

  // Handle search type change
  const handleSearchTypeChange = (
    type: "business" | "product" | "advanced"
  ) => {
    setSearchType(type);
    if (type === "advanced") {
      // Reset advanced search params when switching to advanced search
      setAdvancedSearchParams({
        businessName: "",
        productName: "",
        province: "",
        district: "",
        sector: "",
        cell: "",
        village: "",
        radius: 10,
      });
      setAdvancedSearchOpen(true);
    } else if (searchTerm.trim()) {
      // If there's an existing search term, perform search with the new type
      fetchBusinesses(0);
    }
  };

  // Handle advanced search parameter changes
  const handleAdvancedSearchParamChange = (param: string, value: any) => {
    setAdvancedSearchParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  // Reset advanced search parameters
  const resetAdvancedSearch = () => {
    setAdvancedSearchParams({
      businessName: "",
      productName: "",
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      radius: 10,
    });
  };

  // Reset all search parameters and filters
  const resetAllFilters = () => {
    setSearchTerm("");
    setLocationFilters({ radius: 10 });
    setSearchType("business");
    setAdvancedSearchParams({
      businessName: "",
      productName: "",
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      radius: 10,
    });
    if (userLocation) {
      fetchBusinesses(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container py-6 space-y-6">
        {/* Enhanced search and filters */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={
                        searchType === "business"
                          ? "Search businesses by name..."
                          : searchType === "product"
                          ? "Search businesses by product name..."
                          : "Advanced search mode..."
                      }
                      className="pl-10"
                      value={
                        searchType === "advanced"
                          ? `Advanced Search ${[
                              advancedSearchParams.businessName && "• Business",
                              advancedSearchParams.productName && "• Product",
                              (advancedSearchParams.province ||
                                advancedSearchParams.district ||
                                advancedSearchParams.sector) &&
                                "• Location",
                            ]
                              .filter(Boolean)
                              .join(" ")}`
                          : searchTerm
                      }
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={loading || searchType === "advanced"}
                      readOnly={searchType === "advanced"}
                      onClick={() => {
                        if (searchType === "advanced") {
                          setAdvancedSearchOpen(true);
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="ml-2"
                    disabled={
                      loading ||
                      (searchType !== "advanced" && !searchTerm.trim())
                    }
                  >
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </form>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                      size="sm"
                    >
                      {searchType === "business"
                        ? "Search Businesses"
                        : searchType === "product"
                        ? "Search Products"
                        : "Advanced Search"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Search Type</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={
                              searchType === "business" ? "default" : "outline"
                            }
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleSearchTypeChange("business")}
                          >
                            <Store className="h-4 w-4 mr-2" />
                            Search Businesses
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={
                              searchType === "product" ? "default" : "outline"
                            }
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleSearchTypeChange("product")}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Search Products
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={
                              searchType === "advanced" ? "default" : "outline"
                            }
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleSearchTypeChange("advanced")}
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            Advanced Search
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

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
          </div>

          {/* Search tips */}
          {!initialSearchPerformed && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <p>
                {searchType === "business"
                  ? "Search for businesses by name or explore businesses near your location."
                  : searchType === "product"
                  ? "Find businesses that sell specific products by searching for product names."
                  : "Use advanced search to combine multiple criteria like business name, product, and location."}
              </p>
            </div>
          )}
        </div>

        {/* Advanced Search Dialog */}
        <Dialog open={advancedSearchOpen} onOpenChange={setAdvancedSearchOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Advanced Search</DialogTitle>
              <DialogDescription>
                Combine multiple search criteria to find exactly what you're
                looking for.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Enter business name..."
                  value={advancedSearchParams.businessName}
                  onChange={(e) =>
                    handleAdvancedSearchParamChange(
                      "businessName",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  placeholder="Enter product name..."
                  value={advancedSearchParams.productName}
                  onChange={(e) =>
                    handleAdvancedSearchParamChange(
                      "productName",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select
                    value={advancedSearchParams.province || ""}
                    onValueChange={(value) =>
                      handleAdvancedSearchParamChange("province", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any province</SelectItem>
                      <SelectItem value="Kigali">Kigali</SelectItem>
                      <SelectItem value="Northern">Northern</SelectItem>
                      <SelectItem value="Southern">Southern</SelectItem>
                      <SelectItem value="Eastern">Eastern</SelectItem>
                      <SelectItem value="Western">Western</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select
                    value={advancedSearchParams.district || ""}
                    onValueChange={(value) =>
                      handleAdvancedSearchParamChange(
                        "district",
                        value === "none" ? "" : value
                      )
                    }
                    disabled={!advancedSearchParams.province}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any district</SelectItem>
                      {advancedSearchParams.province === "Kigali" && (
                        <>
                          <SelectItem value="Nyarugenge">Nyarugenge</SelectItem>
                          <SelectItem value="Gasabo">Gasabo</SelectItem>
                          <SelectItem value="Kicukiro">Kicukiro</SelectItem>
                        </>
                      )}
                      {/* Add options for other provinces */}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select
                    value={advancedSearchParams.sector || ""}
                    onValueChange={(value) =>
                      handleAdvancedSearchParamChange(
                        "sector",
                        value === "none" ? "" : value
                      )
                    }
                    disabled={!advancedSearchParams.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any sector</SelectItem>
                      {/* Add sector options based on selected district */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radius">Search Radius (km)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="radius"
                      type="number"
                      min="1"
                      max="100"
                      value={advancedSearchParams.radius}
                      onChange={(e) =>
                        handleAdvancedSearchParamChange(
                          "radius",
                          parseInt(e.target.value) || 10
                        )
                      }
                    />
                    <span className="text-sm text-muted-foreground">km</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cell">Cell</Label>
                  <Select
                    value={advancedSearchParams.cell || ""}
                    onValueChange={(value) =>
                      handleAdvancedSearchParamChange(
                        "cell",
                        value === "none" ? "" : value
                      )
                    }
                    disabled={!advancedSearchParams.sector}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cell" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any cell</SelectItem>
                      {/* Add cell options based on selected sector */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Select
                    value={advancedSearchParams.village || ""}
                    onValueChange={(value) =>
                      handleAdvancedSearchParamChange(
                        "village",
                        value === "none" ? "" : value
                      )
                    }
                    disabled={!advancedSearchParams.cell}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any village</SelectItem>
                      {/* Add village options based on selected cell */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetAdvancedSearch}>
                Reset
              </Button>
              <Button
                onClick={handleAdvancedSearch}
                disabled={
                  !advancedSearchParams.businessName.trim() &&
                  !advancedSearchParams.productName.trim() &&
                  !advancedSearchParams.province &&
                  !advancedSearchParams.district &&
                  !advancedSearchParams.sector &&
                  !advancedSearchParams.cell &&
                  !advancedSearchParams.village &&
                  advancedSearchParams.radius === 10
                }
              >
                Search
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              {searchType === "business"
                ? "Search for businesses by name or explore businesses near your location."
                : searchType === "product"
                ? "Find businesses that sell specific products by searching for product names."
                : "Use the advanced search to find businesses using multiple criteria."}
              {userLocation &&
                userLocation.latitude === -1.9441 &&
                " (using Kigali, Rwanda as default location)"}
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
                {searchType === "product" && searchTerm && (
                  <span className="text-base font-normal ml-2 text-muted-foreground">
                    selling "{searchTerm}"
                  </span>
                )}
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
              {loading && businesses.length === 0 ? (
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
                          onViewDetails={handleViewBusinessDetail}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Infinite scroll loading indicator */}
                  {pagination.hasMore && (
                    <div
                      ref={gridObserverRef}
                      className="mt-8 text-center py-4"
                    >
                      {loading && (
                        <div className="flex justify-center items-center space-x-2">
                          <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-medium mb-2">
                    No businesses found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find businesses.
                  </p>
                  <Button variant="outline" onClick={resetAllFilters}>
                    Reset Filters
                  </Button>
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
                  loading={loading && businesses.length === 0}
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Businesses on Map</h3>
                  {businesses.length > 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("grid")}
                      className="text-sm"
                    >
                      View All ({businesses.length})
                    </Button>
                  )}
                </div>

                {businesses.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Show only first 6 businesses in the map view for better performance */}
                      {businesses.slice(0, 6).map((business) => (
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
                            {[
                              business.location.village,
                              business.location.cell,
                              business.location.sector,
                              business.location.district,
                              business.location.province,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {businesses.length > 6 && (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("grid")}
                        >
                          View All {businesses.length} Businesses
                        </Button>
                      </div>
                    )}

                    {/* Infinite scroll loading indicator for map view */}
                    {pagination.hasMore && (
                      <div ref={mapObserverRef} className="py-4 text-center">
                        {loading && (
                          <div className="flex justify-center items-center space-x-2">
                            <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : !loading ? (
                  <Card className="p-6 text-center">
                    <h3 className="text-xl font-medium mb-2">
                      No businesses found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters to find businesses.
                    </p>
                    <Button variant="outline" onClick={resetAllFilters}>
                      Reset Filters
                    </Button>
                  </Card>
                ) : null}
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
    </div>
  );
};

export default BusinessesPage;
