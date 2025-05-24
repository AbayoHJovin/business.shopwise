
import React, { useState, useMemo, useEffect } from 'react';
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
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define product interface
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

// Mock product data - replace with API call
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Chair",
    description: "High quality ergonomic office chair with lumbar support",
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475", "https://images.unsplash.com/photo-1460925895917-afdab827c52f"],
    packets: 15,
    itemsPerPacket: 1,
    pricePerItem: 129.99,
    fulfillmentCost: 25,
    dateAdded: "2023-10-15"
  },
  {
    id: 2,
    name: "Office Desk",
    description: "Spacious wooden desk with cable management system",
    images: ["https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"],
    packets: 8,
    itemsPerPacket: 1,
    pricePerItem: 299.99,
    fulfillmentCost: 45,
    dateAdded: "2023-09-22"
  },
  {
    id: 3,
    name: "Ergonomic Keyboard",
    description: "Split design keyboard with mechanical switches",
    images: ["https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"],
    packets: 30,
    itemsPerPacket: 5,
    pricePerItem: 79.99,
    fulfillmentCost: 12,
    dateAdded: "2023-11-05"
  },
  {
    id: 4,
    name: "Monitor Stand",
    description: "Adjustable aluminum monitor stand with cable management",
    images: ["https://images.unsplash.com/photo-1531297484001-80022131f5a1"],
    packets: 22,
    itemsPerPacket: 2,
    pricePerItem: 59.99,
    fulfillmentCost: 8,
    dateAdded: "2023-10-30"
  }
];

type SortOption = 'name' | 'dateAdded' | 'price' | 'stock';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'table';

const Products = () => {
  const { toast } = useToast();
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products - this would be replaced with an API call
  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // This would be an API call in a real application
        // const response = await api.get('/products');
        // setProducts(response.data);
        
        // For now, use mock data with calculated properties
        const productsWithCalculatedFields = mockProducts.map(product => ({
          ...product,
          totalItems: product.packets * product.itemsPerPacket,
          totalValue: product.packets * product.itemsPerPacket * product.pricePerItem
        }));
        
        setProducts(productsWithCalculatedFields);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load products. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleDeleteConfirm = (productId: number | string) => {
    // Would call API to delete product
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;
    
    // In a real app, you would make an API call here
    // api.delete(`/products/${productId}`);
    
    // Update local state
    setProducts(products.filter(p => p.id !== productId));
    
    toast({
      title: "Product deleted",
      description: `${productToDelete.name} has been removed successfully.`,
    });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };
  
  const handleViewProduct = (product: Product) => {
    // This would navigate to a product detail page in a real app
    toast({
      title: "View Product",
      description: `Viewing details for ${product.name}.`,
    });
  };

  const sortedProducts = useMemo(() => {
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
  const totalProducts = products.length;

  return (
    <MainLayout title="Products">
      <div className="page-container p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product inventory <span className="font-medium">({totalProducts} total)</span>
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
              <Link to="/products/create">
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
        
        {isLoading ? (
          // Loading state
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
            
            {sortedProducts.length === 0 && (
              <div className="text-center p-10">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">Add your first product to get started with inventory management.</p>
                <Button asChild>
                  <Link to="/products/create">Add Your First Product</Link>
                </Button>
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
      </div>
    </MainLayout>
  );
};

export default Products;
