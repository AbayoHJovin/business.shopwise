
import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  ArrowUpDown, 
  ArrowDownAZ, 
  ArrowDown10 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import ProductDialog from '@/components/products/ProductDialog';
import { Link } from 'react-router-dom';

// Mock product data - replace with API call
const mockProducts = [
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

const Products = () => {
  const { toast } = useToast();
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeleteConfirm = (product: any) => {
    // Would call API to delete product
    toast({
      title: "Product deleted",
      description: `${product.name} has been removed successfully.`,
    });
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const sortedProducts = useMemo(() => {
    return [...mockProducts].sort((a, b) => {
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
          compareValueA = a.packets * a.itemsPerPacket;
          compareValueB = b.packets * b.itemsPerPacket;
          break;
        default:
          compareValueA = a.name.toLowerCase();
          compareValueB = b.name.toLowerCase();
      }

      if (compareValueA < compareValueB) return sortDirection === 'asc' ? -1 : 1;
      if (compareValueA > compareValueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [mockProducts, sortOption, sortDirection]);

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
  const totalProducts = mockProducts.length;

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
          <Button className="self-start sm:self-auto" asChild>
            <Link to="/products/new">
              <Plus className="mr-2" /> Add Product
            </Link>
          </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onEdit={() => handleEditProduct(product)}
              onDelete={() => handleDeleteConfirm(product)}
            />
          ))}
        </div>
        
        {sortedProducts.length === 0 && (
          <div className="text-center p-10">
            <p className="text-muted-foreground">No products found. Add your first product to get started.</p>
          </div>
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
