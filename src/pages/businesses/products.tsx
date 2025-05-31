import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Filter,
  Package,
  Grid,
  Grid3X3,
  Check,
  XCircle,
  Search,
  RefreshCw,
  Info,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Box,
  Tag,
  DollarSign,
  ShoppingCart,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { API_ENDPOINTS, PUBLIC_REQUEST_OPTIONS } from "@/config/api";
import {
  getPublicBusinessDetails,
  getBusinessProducts,
} from "@/services/businessDiscoveryService";
import {
  BusinessDiscoveryDto,
  PublicProductDto,
  ProductPageRequestDto,
  ProductPageResponseDto,
} from "@/types/business";

// Default product image
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80";

const BusinessProducts: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessDiscoveryDto | null>(null);
  const [products, setProducts] = useState<PublicProductDto[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState("");
  const [productSort, setProductSort] = useState<{
    by: string;
    direction: "asc" | "desc";
  }>({
    by: "name",
    direction: "asc",
  });
  const [productView, setProductView] = useState("grid");
  const [selectedProduct, setSelectedProduct] =
    useState<PublicProductDto | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Products per page
  const LIMIT = 12;

  // Format currency with commas and RWF
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("en-RW", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(amount) + " RWF"
    );
  };

  // Fetch business details on mount
  useEffect(() => {
    if (businessId) {
      fetchBusinessDetails(businessId);
    }
  }, [businessId]);

  // Fetch business details from API
  const fetchBusinessDetails = async (businessId: string) => {
    setLoading(true);
    setError(null);
    console.log("Fetching business details for ID:", businessId);

    try {
      // Making direct API call to ensure we hit the correct endpoint
      const apiUrl = `${API_ENDPOINTS.BUSINESS.DISCOVERY.GET_BY_ID}/${businessId}`;
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

      // Fetch products after getting business details
      await fetchBusinessProducts(businessId, true);
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
  const fetchBusinessProducts = async (
    businessId: string,
    resetList = false
  ) => {
    setProductsLoading(true);
    console.log("Fetching products for business ID:", businessId);

    try {
      const skip = resetList ? 0 : productPage * LIMIT;

      // Create request payload based on current sort and filter
      const request: ProductPageRequestDto = {
        skip,
        limit: LIMIT,
        sortBy: productSort.by,
        sortDirection: productSort.direction,
        searchTerm: productFilter || undefined,
      };

      const data = await getBusinessProducts(businessId, request);

      // Update product list
      if (resetList) {
        setProducts(data.products || []);
        setProductPage(0);
      } else {
        setProducts((prev) => [...prev, ...(data.products || [])]);
        setProductPage((prev) => prev + 1);
      }

      setProductCount(data.totalCount || 0);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error("Error fetching business products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle sorting change
  const handleSortChange = (value: string) => {
    // Parse the sorting option
    const [by, direction] = value.split(/(?=[A-Z])/);
    const sortDirection = direction.toLowerCase() as "asc" | "desc";

    setProductSort({
      by: by.toLowerCase(),
      direction: sortDirection,
    });

    // Refetch products with new sort
    if (businessId) {
      fetchBusinessProducts(businessId, true);
    }
  };

  // Handle search filter change
  const handleFilterChange = (value: string) => {
    setProductFilter(value);

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (businessId) {
        fetchBusinessProducts(businessId, true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle load more products
  const handleLoadMore = () => {
    if (businessId && hasMore && !productsLoading) {
      fetchBusinessProducts(businessId, false);
    }
  };

  // Open product details dialog
  const handleViewProductDetails = (product: PublicProductDto) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(`/businesses/${businessId}`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setProductFilter("");
    setProductSort({ by: "name", direction: "asc" });

    if (businessId) {
      fetchBusinessProducts(businessId, true);
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
            Back to Business
          </Button>

          <div className="animate-pulse space-y-6">
            <div className="h-8 w-3/4 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-64 bg-muted rounded"></div>
              ))}
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
            Back to Business
          </Button>

          <Card className="p-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
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
          Back to Business
        </Button>

        {/* Business header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Store className="h-6 w-6 mr-2 text-primary" />
              {business.name}
            </h1>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{formattedLocation}</span>
            </div>
          </div>
        </div>

        {/* Products section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Products ({productCount})
          </h2>

          {/* Product filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name..."
                className="pl-10"
                value={productFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={`${productSort.by}${
                  productSort.direction === "asc" ? "Asc" : "Desc"
                }`}
                onValueChange={handleSortChange}
              >
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
                  title="Grid view"
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
                  title="List view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products */}
          {productsLoading && products.length === 0 ? (
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
          ) : products.length > 0 ? (
            <>
              {productView === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden h-full flex flex-col"
                    >
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
                      <CardContent className="p-4 flex-grow">
                        <h3 className="font-medium text-lg line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                          {product.description || "No description available"}
                        </p>
                      </CardContent>
                      <CardFooter className="px-4 py-3 border-t flex flex-col gap-2">
                        <div className="w-full flex justify-between items-center">
                          <p className="font-bold text-primary">
                            {formatCurrency(product.unitPrice)}
                          </p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewProductDetails(product)}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-48 h-48">
                          <img
                            src={
                              product.imageUrls?.[0] || DEFAULT_PRODUCT_IMAGE
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                              <h3 className="font-medium text-lg line-clamp-1">
                                {product.name}
                              </h3>
                              {product.category && (
                                <Badge className="mt-1">
                                  {product.category}
                                </Badge>
                              )}
                            </div>
                            <p className="font-bold text-lg text-primary mt-1 sm:mt-0">
                              {formatCurrency(product.unitPrice)}
                            </p>
                          </div>

                          <p className="text-muted-foreground mt-2 line-clamp-3">
                            {product.description || "No description available"}
                          </p>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Quantity: {product.quantity}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewProductDetails(product)
                                }
                                className="whitespace-nowrap"
                              >
                                <Info className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Load more button */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={productsLoading}
                    className="min-w-[200px]"
                  >
                    {productsLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Load More Products</>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {productFilter
                  ? "No products match your search criteria."
                  : "This business hasn't added any products yet."}
              </p>
              {productFilter && (
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Filters
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="line-clamp-2">{selectedProduct.name}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedProduct.category && (
                    <Badge className="mt-1">{selectedProduct.category}</Badge>
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Product images carousel */}
              {selectedProduct.imageUrls &&
              selectedProduct.imageUrls.length > 0 ? (
                <div className="my-4">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {selectedProduct.imageUrls.map((url, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1 h-[200px] sm:h-[300px]">
                            <img
                              src={url || DEFAULT_PRODUCT_IMAGE}
                              alt={`${selectedProduct.name} - Image ${
                                index + 1
                              }`}
                              className="w-full h-full object-contain rounded-md"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-1 sm:left-2 h-7 w-7 sm:h-8 sm:w-8" />
                    <CarouselNext className="right-1 sm:right-2 h-7 w-7 sm:h-8 sm:w-8" />
                  </Carousel>
                </div>
              ) : (
                <div className="my-4 h-[200px] sm:h-[300px] bg-muted flex items-center justify-center rounded-md">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                </div>
              )}

              {/* Product details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Product Information
                  </h3>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {selectedProduct.description ||
                        "No description available."}
                    </p>

                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Category:</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedProduct.category || "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Quantity:</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedProduct.quantity} units available
                      </span>
                    </div>

                    {selectedProduct.fullPacketsAvailable !== undefined && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Packets:</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedProduct.fullPacketsAvailable} full packets
                          {selectedProduct.additionalUnits
                            ? ` + ${selectedProduct.additionalUnits} units`
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 mt-4 md:mt-0">
                    Pricing Details
                  </h3>
                  <div className="space-y-4 border rounded-md p-3 sm:p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Unit Price:</span>
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        {formatCurrency(selectedProduct.unitPrice)}
                      </span>
                    </div>

                    {selectedProduct.packetPrice !== undefined && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Packet Price:</span>
                        <span>
                          {formatCurrency(selectedProduct.packetPrice)}
                        </span>
                      </div>
                    )}

                    {selectedProduct.fulfillmentCost !== undefined && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Fulfillment Cost:</span>
                        <span>
                          {formatCurrency(selectedProduct.fulfillmentCost)}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Availability:</span>
                        {selectedProduct.quantity > 0 ? (
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
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessProducts;
