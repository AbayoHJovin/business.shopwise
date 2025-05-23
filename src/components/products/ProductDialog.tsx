
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

interface ProductDialogProps {
  product: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ 
  product, 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product ? {
      name: product?.name,
      description: product?.description,
      packets: product?.packets,
      itemsPerPacket: product?.itemsPerPacket,
      pricePerItem: product?.pricePerItem,
      fulfillmentCost: product?.fulfillmentCost
    } : {}
  });

  const onSubmit = (data: any) => {
    // Would call API to update product
    toast({
      title: "Product updated",
      description: "Your changes have been saved successfully."
    });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name"
                placeholder="Enter product name" 
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message as string}</p>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packets">Packets</Label>
                <Input 
                  id="packets"
                  type="number" 
                  placeholder="Quantity" 
                  {...register("packets", { 
                    required: "Required",
                    valueAsNumber: true 
                  })}
                />
                {errors.packets && (
                  <p className="text-sm text-destructive">{errors.packets.message as string}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="itemsPerPacket">Items per Packet</Label>
                <Input 
                  id="itemsPerPacket"
                  type="number" 
                  placeholder="Items per packet" 
                  {...register("itemsPerPacket", { 
                    required: "Required",
                    valueAsNumber: true 
                  })}
                />
                {errors.itemsPerPacket && (
                  <p className="text-sm text-destructive">{errors.itemsPerPacket.message as string}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerItem">Price per Item ($)</Label>
                <Input 
                  id="pricePerItem"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...register("pricePerItem", { 
                    required: "Required",
                    valueAsNumber: true 
                  })}
                />
                {errors.pricePerItem && (
                  <p className="text-sm text-destructive">{errors.pricePerItem.message as string}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fulfillmentCost">Fulfillment Cost ($)</Label>
                <Input 
                  id="fulfillmentCost"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...register("fulfillmentCost", { 
                    required: "Required",
                    valueAsNumber: true 
                  })}
                />
                {errors.fulfillmentCost && (
                  <p className="text-sm text-destructive">{errors.fulfillmentCost.message as string}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
