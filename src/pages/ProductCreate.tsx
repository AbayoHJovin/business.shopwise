import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import { createProduct, createProductWithImages, ProductRequest } from '@/store/slices/productSlice';
import { fetchCurrentSelectedBusiness } from '@/store/slices/businessSlice';
import { Image, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  packets: number;
  itemsPerPacket: number;
  pricePerItem: number;
  fulfillmentCost: number;
}

interface ImageFile {
  file: File;
  preview: string;
}

const ProductCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  
  const { isLoading, error } = useSelector((state: RootState) => state.products);
  const { currentBusiness } = useSelector((state: RootState) => state.business);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      packets: 1,
      itemsPerPacket: 1,
      pricePerItem: 0,
      fulfillmentCost: 0
    }
  });
  
  // Check if a business is selected
  useEffect(() => {
    dispatch(fetchCurrentSelectedBusiness())
      .unwrap()
      .catch(() => {
        toast({
          title: "No business selected",
          description: "Please select a business before adding products.",
          variant: "destructive"
        });
        navigate('/businesses');
      });
  }, [dispatch, navigate, toast]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setImageFiles(prev => [...prev, {
            file,
            preview: event.target!.result as string
          }]);
          toast({
            title: "Image added",
            description: "The image has been added to your product."
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Image removed",
      description: "The image has been removed from your product."
    });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (!currentBusiness) {
        toast({
          title: "No business selected",
          description: "Please select a business before adding products.",
          variant: "destructive"
        });
        navigate('/businesses');
        return;
      }
      
      // Prepare product data
      const productData: ProductRequest = {
        name: data.name,
        description: data.description,
        packets: data.packets,
        itemsPerPacket: data.itemsPerPacket,
        pricePerItem: data.pricePerItem,
        fulfillmentCost: data.fulfillmentCost
      };
      
      // Determine if we need to use the with-images endpoint
      if (imageFiles.length > 0) {
        // Extract the actual File objects
        const files = imageFiles.map(img => img.file);
        
        // Dispatch the action to create product with images
        await dispatch(createProductWithImages({ productData, files })).unwrap();
      } else {
        // Create product without images
        await dispatch(createProduct(productData)).unwrap();
      }
      
      // Show success message
      toast({
        title: "Product created",
        description: `${data.name} has been added to your products.`,
      });
      
      // Navigate back to products list
      navigate('/products');
    } catch (err: any) {
      toast({
        title: "Failed to create product",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout title="Add New Product">
      <div className="page-container p-4 md:p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Product Images */}
                <div>
                  <Label className="mb-2 block">Product Images (Max 3)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Existing Images */}
                    {imageFiles.map((image, index) => (
                      <div key={index} className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={image.preview} 
                          alt={`Product image ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 w-6 h-6"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Image Upload Button */}
                    {imageFiles.length < 3 && (
                      <div className="h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-gray-50 cursor-pointer">
                        <Label 
                          htmlFor="image-upload" 
                          className="flex flex-col items-center cursor-pointer p-4 w-full h-full"
                        >
                          <Image className="h-6 w-6 mb-2" />
                          <span className="text-sm font-medium">Upload Image</span>
                          <span className="text-xs mt-1">{3 - imageFiles.length} remaining</span>
                        </Label>
                        <Input 
                          id="image-upload"
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name"
                      placeholder="Enter product name" 
                      {...register("name", { required: "Product name is required" })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description"
                      placeholder="Enter product description" 
                      {...register("description")}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packets">Packets</Label>
                    <Input 
                      id="packets"
                      type="number" 
                      min="0"
                      placeholder="Quantity" 
                      {...register("packets", { 
                        required: "Required",
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Cannot be negative"
                        }
                      })}
                    />
                    {errors.packets && (
                      <p className="text-sm text-destructive">{errors.packets.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="itemsPerPacket">Items per Packet</Label>
                    <Input 
                      id="itemsPerPacket"
                      type="number" 
                      min="1"
                      placeholder="Items per packet" 
                      {...register("itemsPerPacket", { 
                        required: "Required",
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message: "Must be at least 1"
                        }
                      })}
                    />
                    {errors.itemsPerPacket && (
                      <p className="text-sm text-destructive">{errors.itemsPerPacket.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerItem">Price per Item ($)</Label>
                    <Input 
                      id="pricePerItem"
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="0.00" 
                      {...register("pricePerItem", { 
                        required: "Required",
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Price cannot be negative"
                        }
                      })}
                    />
                    {errors.pricePerItem && (
                      <p className="text-sm text-destructive">{errors.pricePerItem.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fulfillmentCost">Fulfillment Cost ($)</Label>
                    <Input 
                      id="fulfillmentCost"
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="0.00" 
                      {...register("fulfillmentCost", { 
                        required: "Required",
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Cost cannot be negative"
                        }
                      })}
                    />
                    {errors.fulfillmentCost && (
                      <p className="text-sm text-destructive">{errors.fulfillmentCost.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate('/products')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProductCreate;
