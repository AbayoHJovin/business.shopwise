import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ImagePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductImageUpload from './ProductImageUpload';

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

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: (productId: number | string) => void;
  onImagesUploaded?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onImagesUploaded }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const images = product.images.map(img => typeof img === 'string' ? img : img.url);
  const totalStock = product.packets * product.itemsPerPacket;

  const handleNextImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleImageClick = () => {
    if (images.length === 0) {
      setIsUploadDialogOpen(true);
    }
  };

  const handleDeleteClick = () => {
    setConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(product.id);
    setConfirmDialogOpen(false);
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
        {/* Product Images */}
        <div 
          className="relative w-full h-48 overflow-hidden rounded-t-lg bg-gray-100 cursor-pointer"
          onClick={handleImageClick}
        >
          {images.length > 0 ? (
            <img 
              src={images[currentImageIndex]} 
              alt={`${product.name} - image ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 hover:text-gray-500 transition-colors">
              <ImagePlus className="h-12 w-12 mb-2" />
              <span>Click to add images</span>
            </div>
          )}
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${currentImageIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        <CardContent className="flex-grow p-4">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
            <div>
              <span className="text-muted-foreground">Price:</span> RWF {product.pricePerItem.toFixed(2)}
            </div>
            <div>
              <span className="text-muted-foreground">Stock:</span> {totalStock} items
            </div>
            <div>
              <span className="text-muted-foreground">Packets:</span> {product.packets}
            </div>
            <div>
              <span className="text-muted-foreground">Items per packet:</span> {product.itemsPerPacket}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Fulfillment Cost:</span> RWF {product.fulfillmentCost.toFixed(2)}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-4 flex justify-between">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteClick} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(product.id);
                setConfirmDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Product Images</DialogTitle>
            <DialogDescription>
              Add up to 3 images for your product. Click or drag and drop images below.
            </DialogDescription>
          </DialogHeader>
          <ProductImageUpload
            productId={product.id.toString()}
            onImagesUploaded={() => {
              setIsUploadDialogOpen(false);
              onImagesUploaded?.();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
