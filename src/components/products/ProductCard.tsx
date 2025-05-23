
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  images: string[] | ProductImage[];
  packets: number;
  itemsPerPacket: number;
  pricePerItem: number;
  fulfillmentCost: number;
  dateAdded: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const images = product.images.map(img => typeof img === 'string' ? img : img.url);
  const totalStock = product.packets * product.itemsPerPacket;
  
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
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {images.length > 0 ? (
            <img 
              src={images[currentImageIndex]} 
              alt={`${product.name} - image ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-primary' : 'bg-gray-300'}`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Left/Right Navigation */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white"
                aria-label="Previous image"
              >
                ←
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white"
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
        </div>
        
        <CardContent className="flex-grow p-4">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
            <div>
              <span className="text-muted-foreground">Price:</span> ${product.pricePerItem.toFixed(2)}
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
              <span className="text-muted-foreground">Fulfillment Cost:</span> ${product.fulfillmentCost.toFixed(2)}
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
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product "{product.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
