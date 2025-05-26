
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ArrowUpDown, 
  ArrowDownAZ, 
  ArrowDown10,
  LayoutGrid,
  List,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import ProductTable from '@/components/products/ProductTable';
import ProductDialog from '@/components/products/ProductDialog';
import ProductViewModal from '@/components/products/ProductViewModal';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchPaginatedProducts, resetPagination, ProductImage, Product as StoreProduct } from '@/store/slices/productSlice';
import { fetchCurrentSelectedBusiness } from '@/store/slices/businessSlice';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

// Define product interface for UI components
interface Product {
  id: number | string;
  name: string;
  description: string;
  images: string[] | { url: string; alt?: string }[];
  packets: number;
  itemsPerPacket: number;
  pricePerItem: number;
  fulfillmentCost: number;
  dateAdded: string;
  businessId?: string;
  totalItems?: number;
  totalValue?: number;
}

// Helper function to convert store products to UI products
const convertStoreProductToUIProduct = (product: StoreProduct): Product => {
  return {
    ...product,
    // Convert ProductImage[] to the format expected by UI components
    images: product.images.map(img => ({
      url: img.imageUrl,
      alt: product.name
    })),
    // Ensure dateAdded is always provided
    dateAdded: product.dateAdded || new Date().toISOString()
  };
};

// No mock data - using real data from the API

type SortOption = 'name' | 'dateAdded' | 'price' | 'stock';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'table';

const Products = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Get products and pagination state from Redux store
  const { 
    items: storeProducts, 
    isLoading, 
    error, 
    pagination 
  } = useAppSelector(state => state.products);
  
  // Convert store products to UI products
  const products = useMemo(() => {
    return storeProducts.map(convertStoreProductToUIProduct);
  }, [storeProducts]);
  
  // Get current business from Redux store
  const { currentBusiness } = useAppSelector(state => state.business);
  
  // Reference to the observer for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Fetch products on component mount
  useEffect(() => {
    // Reset pagination state when component mounts
    dispatch(resetPagination());
    
    // First, check if we have a selected business
    if (!currentBusiness) {
      // Try to fetch the current business
      dispatch(fetchCurrentSelectedBusiness())
        .unwrap()
        .then(() => {
          // After successfully fetching the business, fetch products
          return dispatch(fetchPaginatedProducts({ page: 0, size: 10 })).unwrap();
        })
        .catch((error) => {
          // If we can't get a business, show error and redirect
          if (error.includes('No business selected') || error.includes('select a business')) {
            toast({
              title: "No business selected",
              description: "Please select a business to view products",
              variant: "destructive"
            });
            navigate('/business/select');
          } else {
            toast({
              title: "Error",
              description: error || "Failed to load products. Please try again later.",
              variant: "destructive"
            });
          }
        });
    } else {
      // If we already have a business, fetch products directly
      dispatch(fetchPaginatedProducts({ page: 0, size: 10 }))
        .unwrap()
        .catch((error) => {
          toast({
            title: "Error",
            description: error || "Failed to load products. Please try again later.",
            variant: "destructive"
          });
        });
    }
    
    // Cleanup: reset pagination when component unmounts
    return () => {
      dispatch(resetPagination());
    };
  }, [dispatch, toast, navigate]); // Remove currentBusiness from dependencies to ensure it runs on mount
  
  // Handle infinite scroll using Intersection Observer
  const loadMoreProducts = useCallback(() => {
    if (!pagination.hasMore || pagination.isFetchingNextPage) return;
    
    const nextPage = pagination.currentPage + 1;
    dispatch(fetchPaginatedProducts({ 
      page: nextPage, 
      size: pagination.pageSize 
    }));
  }, [dispatch, pagination.currentPage, pagination.hasMore, pagination.isFetchingNextPage, pagination.pageSize]);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !pagination.isFetchingNextPage && !isLoading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.5 }
    );
    
    // Observe the loading element if it exists
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreProducts, pagination.hasMore, pagination.isFetchingNextPage, isLoading]);
  
  // Handle errors and redirect if no business is selected
  useEffect(() => {
    if (error) {
      // Check if the error indicates no business is selected
      if (error.includes('No business selected') || error.includes('select a business')) {
        toast({
          title: "No business selected",
          description: "Please select a business to view products",
          variant: "destructive"
        });
        // Redirect to business selection page
        navigate('/business/select');
      } else {
        toast({
          title: "Error",
          description: error || "Failed to load products. Please try again later.",
          variant: "destructive"
        });
      }
    }
  }, [error, toast, navigate]);

  const handleDeleteConfirm = (productId: number | string) => {
    // Would call API to delete product
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;
    
    // In a real app, you would make an API call here using the deleteProduct thunk
    // dispatch(deleteProduct(productId.toString()));
    
    // For now, just show a toast message
    toast({
      title: "Product deleted",
      description: `${productToDelete.name} has been removed successfully.`,
    });
    
    // After successful deletion, you might want to refresh the product list
    // dispatch(fetchPaginatedProducts({ page: 0, size: pagination.pageSize, resetList: true }));
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };
  
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const sortedProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products].sort((a, b) => {
      let compareValueA, compareValueB;

      switch (sortOption) {
        case 'name':
          compareValueA = a.name.toLowerCase();
          compareValueB = b.name.toLowerCase();
          break;
        case 'dateAdded':
          compareValueA = new Date(a.dateAdded).getTime();
          compareValueB = new Date(b.dateAdded).getTime();
          break;
        case 'price':
          compareValueA = a.pricePerItem;
          compareValueB = b.pricePerItem;
          break;
        case 'stock':
          compareValueA = a.totalItems || (a.packets * a.itemsPerPacket);
          compareValueB = b.totalItems || (b.packets * b.itemsPerPacket);
          break;
        default:
          compareValueA = a.name.toLowerCase();
          compareValueB = b.name.toLowerCase();
      }

      if (compareValueA < compareValueB) return sortDirection === 'asc' ? -1 : 1;
      if (compareValueA > compareValueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortOption, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const setSorting = (option: SortOption) => {
    if (sortOption === option) {
      toggleSortDirection();
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  };

  // Calculate total product count
  const totalProducts = pagination.totalCount || products.length;

  return (
    <MainLayout title="Products">
      <div className="page-container p-4 md:p-6">
        {/* Error Alert */}
        {error && !error.includes('No business selected') && !error.includes('select a business') && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product inventory <span className="font-medium">({totalProducts} total)</span>
              {currentBusiness && <span className="ml-1">for {currentBusiness.name}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tabs 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as ViewMode)}
              className="mr-2"
            >
              <TabsList className="grid w-[120px] grid-cols-2">
                <TabsTrigger value="grid" className="flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center justify-center">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="self-start sm:self-auto" asChild>
              <Link to="/products/new">
                <Plus className="mr-2" /> Add Product
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 flex flex-wrap gap-2">
            <div className="text-sm text-muted-foreground mr-2 flex items-center">Sort by:</div>
            <Button 
              variant={sortOption === 'name' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSorting('name')}
              className="flex items-center"
            >
              Name {sortOption === 'name' && <ArrowDownAZ className="ml-1 h-4 w-4" />}
            </Button>
            <Button 
              variant={sortOption === 'dateAdded' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSorting('dateAdded')}
              className="flex items-center"
            >
              Date Added {sortOption === 'dateAdded' && <ArrowUpDown className="ml-1 h-4 w-4" />}
            </Button>
            <Button 
              variant={sortOption === 'price' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSorting('price')}
              className="flex items-center"
            >
              Price {sortOption === 'price' && <ArrowDown10 className="ml-1 h-4 w-4" />}
            </Button>
            <Button 
              variant={sortOption === 'stock' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSorting('stock')}
              className="flex items-center"
            >
              Stock {sortOption === 'stock' && <ArrowUpDown className="ml-1 h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleSortDirection}
              className="ml-auto"
            >
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </CardContent>
        </Card>
        
        {isLoading && products.length === 0 ? (
          // Initial loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <Card key={index} className="h-[300px] animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (

          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onEdit={() => handleEditProduct(product)}
                    onDelete={() => handleDeleteConfirm(product.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <ProductTable 
                    products={sortedProducts}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteConfirm}
                    onView={handleViewProduct}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* No products state */}
            {sortedProducts.length === 0 && !isLoading && (
              <div className="text-center p-10">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">Add your first product to get started with inventory management.</p>
                <Button asChild>
                  <Link to="/products/new">Add Your First Product</Link>
                </Button>
              </div>
            )}
            
            {/* Infinite scroll loading indicator */}
            {(products.length > 0 || pagination.isFetchingNextPage) && (
              <div 
                ref={loadingRef} 
                className="w-full py-8 flex justify-center items-center"
              >
                {pagination.isFetchingNextPage && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading more products...</p>
                  </div>
                )}
                
                {!pagination.hasMore && products.length > 0 && !pagination.isFetchingNextPage && (
                  <p className="text-sm text-muted-foreground">No more products to load</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Product Edit Dialog */}
        <ProductDialog
          product={selectedProduct}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
        
        {/* Product View Modal */}
        <ProductViewModal
          product={selectedProduct}
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
        />
      </div>
    </MainLayout>
  );
};

export default Products;
