import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  id: number | string;
  name: string;
  description: string;
  images: string[] | ProductImage[];
  packets: number;
  itemsPerPacket: number;
  pricePerItem: number;
  fulfillmentCost: number;
  dateAdded: string;
  businessId?: string;
  totalItems?: number;
  totalValue?: number;
}

interface ProductViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({ 
  product, 
  open, 
  onOpenChange 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!product) return null;
  
  // Process images to ensure consistent format
  const images = product.images.map(img => typeof img === 'string' ? { url: img, alt: product.name } : img);
  
  // Calculate derived values
  const totalItems = product.totalItems || (product.packets * product.itemsPerPacket);
  const totalValue = product.totalValue || (totalItems * product.pricePerItem);
  const profit = totalItems * (product.pricePerItem - product.fulfillmentCost);
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  // Format date
  const formattedDate = product.dateAdded ? format(new Date(product.dateAdded), 'PPP') : 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative h-64 bg-gray-100 rounded-md overflow-hidden">
              {images.length > 0 ? (
                <img 
                  src={images[currentImageIndex].url} 
                  alt={images[currentImageIndex].alt || product.name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                      currentImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt || `Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{product.description || 'No description available'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price per Item</h3>
                <p className="mt-1 font-semibold">{formatCurrency(product.pricePerItem, 'RWF')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fulfillment Cost</h3>
                <p className="mt-1">{formatCurrency(product.fulfillmentCost, 'RWF')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Packets</h3>
                <p className="mt-1">{product.packets}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Items per Packet</h3>
                <p className="mt-1">{product.itemsPerPacket}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
                <p className="mt-1">{totalItems}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date Added</h3>
                <p className="mt-1">{formattedDate}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
                <p className="font-semibold">{formatCurrency(totalValue, 'RWF')}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-500">Potential Profit</h3>
                <Badge variant="outline" className="bg-green-50">
                  {formatCurrency(profit, 'RWF')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewModal;
