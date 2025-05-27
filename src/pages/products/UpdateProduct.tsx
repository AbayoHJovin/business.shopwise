import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { DEFAULT_REQUEST_OPTIONS } from '@/config/api';
import ProductImageUpload from '@/components/products/ProductImageUpload';

const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500),
  packets: z.number().min(0),
  itemsPerPacket: z.number().min(1),
  pricePerItem: z.number().min(0),
  fulfillmentCost: z.number().min(0),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductImage {
  id: string;
  imageUrl: string;
  publicId: string;
  productId: string;
}

interface Product extends ProductFormData {
  id: string;
  images: ProductImage[];
}

export default function UpdateProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      packets: 0,
      itemsPerPacket: 1,
      pricePerItem: 0,
      fulfillmentCost: 0,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setIsInitialLoading(true);
      setError(null);
      try {
        const response = await fetch(
          API_ENDPOINTS.PRODUCTS.GET_BY_ID(productId!),
          DEFAULT_REQUEST_OPTIONS
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data);
        
        form.reset({
          name: data.name,
          description: data.description,
          packets: data.packets,
          itemsPerPacket: data.itemsPerPacket,
          pricePerItem: data.pricePerItem,
          fulfillmentCost: data.fulfillmentCost,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, navigate, form]);

  const onSubmit = async (data: ProductFormData) => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.PRODUCTS.UPDATE(productId),
        {
          ...DEFAULT_REQUEST_OPTIONS,
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      toast.success('Product updated successfully');
      navigate('/products');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesUploaded = () => {
    // Refresh product data to show new images
    if (productId) {
      fetch(API_ENDPOINTS.PRODUCTS.GET_BY_ID(productId), DEFAULT_REQUEST_OPTIONS)
        .then(res => res.json())
        .then(data => setProduct(data))
        .catch(() => toast.error('Failed to refresh product images'));
    }
  };

  if (isInitialLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate('/products')}>Back to Products</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">The product you're looking for could not be found.</p>
              <Button onClick={() => navigate('/products')}>Back to Products</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Update Product</CardTitle>
          <p className="text-sm text-muted-foreground">Update your product information and manage images</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {product.images.map((image) => (
                <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
            <ProductImageUpload productId={product.id} onImagesUploaded={handleImagesUploaded} />
          </div>
          
          <div className="border-t pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="packets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Packets</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))} 
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="itemsPerPacket"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Items per Packet</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))} 
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pricePerItem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Item</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))} 
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fulfillmentCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fulfillment Cost</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))} 
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/products')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Product
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
