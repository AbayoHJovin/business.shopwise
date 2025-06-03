import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Globe,
  Users,
  Package,
  CircleX,
  Building,
  ExternalLink,
  ChevronRight,
  Clock,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BusinessMap from "@/components/businesses/BusinessMap";
import { getPublicBusinessDetails } from "@/services/businessDiscoveryService";
import { BusinessDiscoveryDto } from "@/types/business";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";

// Default business image
const DEFAULT_BUSINESS_IMAGE =
  "https://images.unsplash.com/photo-1606836576983-8b458e75221d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";

const BusinessDetail: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessDiscoveryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Fetch business details and get user location on mount
  useEffect(() => {
    if (businessId) {
      console.log("Business ID from params:", businessId);
      fetchBusinessDetails(businessId);
      getCurrentLocation();
    } else {
      console.error("No business ID found in URL params");
      setError("Business ID not found");
      setLoading(false);
    }
  }, [businessId]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Use default location if needed (Kigali, Rwanda)
          setUserLocation({ latitude: -1.9441, longitude: 30.0619 });
        }
      );
    }
  };

  // Fetch business details from API
  const fetchBusinessDetails = async (businessId: string) => {
    setLoading(true);
    setError(null);
    console.log("Fetching business details for ID:", businessId);

    try {
      // Making direct API call to ensure we hit the correct endpoint
      const apiUrl = `${API_BASE_URL}/api/businesses/discovery/get-by-id/${businessId}`;
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch business: ${response.status} ${response.statusText}`
        );
      }

      const businessData = await response.json();
      console.log("Business data received:", businessData);
      setBusiness(businessData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch business details.";
      setError(errorMessage);
      console.error("Error fetching business details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/businesses");
  };

  // Navigate to products page
  const handleViewProducts = () => {
    if (business && businessId) {
      navigate(`/businesses/${businessId}/products`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-6">
          <Button
            variant="ghost"
            className="pl-0 flex items-center mb-6"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Businesses
          </Button>

          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-8 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-6">
          <Button
            variant="ghost"
            className="pl-0 flex items-center mb-6"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Businesses
          </Button>

          <Card className="p-6 text-center">
            <CircleX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Error Loading Business</h2>
            <p className="text-muted-foreground mb-4">
              {error || "Business not found."}
            </p>
            <Button onClick={handleBack}>Go Back</Button>
          </Card>
        </div>
      </div>
    );
  }

  const formattedLocation = (() => {
    const parts = [
      business.location.village,
      business.location.cell,
      business.location.sector,
      business.location.district,
      business.location.province,
    ].filter(Boolean);
    return parts.join(", ");
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container py-6 space-y-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="pl-0 flex items-center"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Businesses
        </Button>

        {/* Business header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden shadow-md relative">
              <img
                src={DEFAULT_BUSINESS_IMAGE}
                alt={business.name}
                className="w-full h-64 object-cover"
              />
              {/* Business availability status */}
              <div className="absolute top-4 right-4">
                <Badge
                  className={`text-white px-3 py-1 text-sm font-medium ${
                    business.open
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  {business.open ? "Open Now" : "Closed"}
                </Badge>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    {/* Small availability badge next to name */}
                    <Badge
                      variant={business.open ? "default" : "destructive"}
                      className={`h-fit ${
                        business.open
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : ""
                      }`}
                    >
                      {business.open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{formattedLocation}</span>
                  </div>
                  {business.formattedDistance && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 mt-2"
                    >
                      <MapPin className="h-3 w-3" />
                      {business.formattedDistance}
                    </Badge>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={handleViewProducts}
                  className="flex items-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  View Products
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Business about */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {business.about ||
                    "No description available for this business."}
                </p>
              </CardContent>
            </Card>

            {/* Business details cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Store className="h-5 w-5 mr-2 text-primary" />
                    Business Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Status
                    </span>
                    <Badge
                      variant={business.open ? "default" : "destructive"}
                      className={`flex items-center gap-1 ${
                        business.open
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : ""
                      }`}
                    >
                      {business.open ? "Open Now" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                      Products
                    </span>
                    <Badge variant="secondary">
                      {business.productCount || "0"}
                      {business.productCount !== 1 ? " Products" : " Product"}
                    </Badge>
                  </div>
                  {business.employeeCount !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        Employees
                      </span>
                      <Badge variant="secondary">
                        {business.employeeCount || "0"}
                        {business.employeeCount !== 1
                          ? " Employees"
                          : " Employee"}
                      </Badge>
                    </div>
                  )}
                  {business.websiteLink && (
                    <div className="pt-2 border-t">
                      <a
                        href={business.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        <span className="flex-grow truncate">
                          {business.websiteLink.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {business.location.province && (
                      <>
                        <dt className="text-muted-foreground">Province:</dt>
                        <dd>{business.location.province}</dd>
                      </>
                    )}
                    {business.location.district && (
                      <>
                        <dt className="text-muted-foreground">District:</dt>
                        <dd>{business.location.district}</dd>
                      </>
                    )}
                    {business.location.sector && (
                      <>
                        <dt className="text-muted-foreground">Sector:</dt>
                        <dd>{business.location.sector}</dd>
                      </>
                    )}
                    {business.location.cell && (
                      <>
                        <dt className="text-muted-foreground">Cell:</dt>
                        <dd>{business.location.cell}</dd>
                      </>
                    )}
                    {business.location.village && (
                      <>
                        <dt className="text-muted-foreground">Village:</dt>
                        <dd>{business.location.village}</dd>
                      </>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Map Location
                </CardTitle>
                <CardDescription>
                  {business.location.sector}, {business.location.district}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px]">
                  <BusinessMap
                    businesses={[business]}
                    userLocation={userLocation}
                    height="350px"
                    selectedBusinessId={business.id}
                  />
                </div>
              </CardContent>
              {userLocation &&
                business.location.latitude &&
                business.location.longitude && (
                  <CardFooter className="px-6 py-4">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${business.location.latitude},${business.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full" variant="outline">
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </a>
                  </CardFooter>
                )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  Product Catalog
                </CardTitle>
                <CardDescription>
                  Browse all products from {business.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center p-6">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {business.productCount > 0
                    ? `${business.productCount} Products Available`
                    : "No Products Available Yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {business.productCount > 0
                    ? "Browse the complete catalog of products offered by this business."
                    : "This business hasn't added any products to their catalog yet."}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleViewProducts}
                  disabled={business.productCount === 0}
                >
                  View Product Catalog
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
