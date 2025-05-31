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
  getPublicBusinessDetails,
  getBusinessProducts,
} from "@/services/businessDiscoveryService";
import { BusinessDiscoveryDto, ProductDto } from "@/types/business";

// Default product image
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80";

const BusinessProducts: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
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
      const apiUrl = `http://localhost:5000/api/businesses/discovery/get-by-id/${businessId}`;
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch business: ${response.status} ${response.statusText}`);
      }

      const businessData = await response.json();
      console.log("Business data received:", businessData);
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
    console.log("Fetching products for business ID:", businessId);

    try {
      const apiUrl = `http://localhost:5000/api/businesses/discovery/${businessId}/products`;
      console.log("Products API URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skip, limit: 50 }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Products data received:", data);
      setProducts(data.data || []);
      setProductCount(data.totalCount || 0);
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
        product.description
          ?.toLowerCase()
          .includes(productFilter.toLowerCase()) ||
        product.category?.toLowerCase().includes(productFilter.toLowerCase())
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
    navigate(`/businesses/${businessId}`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setProductFilter("");
    setProductSort("nameAsc");
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
                placeholder="Search products by name, description, or category..."
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
                    <CardFooter className="px-4 py-3 border-t flex justify-between items-center">
                      <p className="font-bold text-primary">
                        ${product.price.toFixed(2)}
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
                    </CardFooter>
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
                          <p className="font-bold text-lg text-primary">
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
    </div>
  );
};

export default BusinessProducts;
