import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Globe,
  Clock,
  Filter,
  Package,
  Grid,
  Grid3X3,
  Check,
  XCircle,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import BusinessMap from "@/components/businesses/BusinessMap";
import {
  getPublicBusinessDetails,
  getBusinessProducts,
} from "@/services/businessDiscoveryService";
import { BusinessDiscoveryDto, ProductDto } from "@/types/business";

// Default business image
const DEFAULT_BUSINESS_IMAGE =
  "https://images.unsplash.com/photo-1606836576983-8b458e75221d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";

// Default product image
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80";

const BusinessDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessDiscoveryDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState("");
  const [productSort, setProductSort] = useState("nameAsc");
  const [productView, setProductView] = useState("grid");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Fetch business details and get user location on mount
  useEffect(() => {
    if (id) {
      fetchBusinessDetails(id);
      getCurrentLocation();
    }
  }, [id]);

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
          // Use default location if needed
          setUserLocation({ latitude: -1.9441, longitude: 30.0619 });
        }
      );
    }
  };

  // Fetch business details from API
  const fetchBusinessDetails = async (businessId: string) => {
    setLoading(true);
    setError(null);

    try {
      const businessData = await getPublicBusinessDetails(businessId);
      setBusiness(businessData);

      // Fetch products after getting business details
      fetchBusinessProducts(businessId);
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

  // Fetch business products from API
  const fetchBusinessProducts = async (businessId: string, skip = 0) => {
    setProductsLoading(true);

    try {
      const response = await getBusinessProducts(businessId, skip, 20);
      setProducts(response.data);
      setProductCount(response.totalCount);
    } catch (err) {
      console.error("Error fetching business products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
        product.description.toLowerCase().includes(productFilter.toLowerCase())
    )
    .sort((a, b) => {
      switch (productSort) {
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  // Handle back navigation
  const handleBack = () => {
    navigate("/businesses");
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout title="Business Details">
        <div className="container py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-8 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !business) {
    return (
      <MainLayout title="Error">
        <div className="container py-6">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-medium mb-2">Error Loading Business</h2>
            <p className="text-muted-foreground mb-4">
              {error || "Business not found."}
            </p>
            <Button onClick={handleBack}>Go Back</Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={business.name}>
      <div className="container py-6 space-y-8">
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
            <div className="rounded-lg overflow-hidden">
              <img
                src={DEFAULT_BUSINESS_IMAGE}
                alt={business.name}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="mt-6">
              <h1 className="text-3xl font-bold">{business.name}</h1>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {business.location.sector}, {business.location.district},{" "}
                  {business.location.province}
                </span>
              </div>
              {business.formattedDistance && (
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {business.formattedDistance}
                  </Badge>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-lg">
                {business.about ||
                  "No description available for this business."}
              </p>
            </div>

            {/* Business details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {business.location.province}, {business.location.district}
                    <br />
                    {business.location.sector}, {business.location.cell}
                    <br />
                    {business.location.village}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    Business Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>Products</span>
                    <Badge variant="secondary">
                      {business.productCount || "No"} Product
                      {business.productCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {business.websiteLink && (
                    <div className="flex items-center mt-2 text-sm">
                      <Globe className="h-4 w-4 mr-2" />
                      <a
                        href={business.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  {business.location.sector}, {business.location.district}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <BusinessMap
                    businesses={[business]}
                    userLocation={userLocation}
                    height="300px"
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

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Badge className="bg-green-500 text-white">Open</Badge>
                    <span className="ml-2">Currently open for business</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Mon - Fri: 8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Sat: 9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Sun: Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Products section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Products ({productCount})</h2>

          {/* Product filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter products..."
                className="pl-10"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={productSort} onValueChange={setProductSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
                  <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                  <SelectItem value="priceAsc">Price (Low to High)</SelectItem>
                  <SelectItem value="priceDesc">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${
                    productView === "grid" ? "bg-accent" : ""
                  }`}
                  onClick={() => setProductView("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${
                    productView === "list" ? "bg-accent" : ""
                  }`}
                  onClick={() => setProductView("list")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products */}
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            productView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="h-48 relative">
                      <img
                        src={product.imageUrls?.[0] || DEFAULT_PRODUCT_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.category && (
                        <Badge className="absolute top-2 right-2">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                        {product.description || "No description available"}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="font-bold">${product.price.toFixed(2)}</p>
                        {product.quantity > 0 ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200"
                          >
                            <Check className="h-3 w-3" />
                            In Stock
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 bg-red-50 text-red-600 border-red-200"
                          >
                            <XCircle className="h-3 w-3" />
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-48">
                        <img
                          src={product.imageUrls?.[0] || DEFAULT_PRODUCT_IMAGE}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">
                              {product.name}
                            </h3>
                            {product.category && (
                              <Badge className="mt-1">{product.category}</Badge>
                            )}
                          </div>
                          <p className="font-bold text-lg">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {product.description || "No description available"}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Quantity: {product.quantity}
                            </span>
                          </div>
                          {product.quantity > 0 ? (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200"
                            >
                              <Check className="h-3 w-3" />
                              In Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-red-50 text-red-600 border-red-200"
                            >
                              <XCircle className="h-3 w-3" />
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Card className="p-6 text-center">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">
                This business hasn't added any products yet or no products match
                your filter.
              </p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BusinessDetail;
