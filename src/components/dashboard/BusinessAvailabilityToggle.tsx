import React, { useEffect } from 'react';
import { Store, ShieldOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getBusinessAvailability, updateBusinessAvailability } from '@/store/slices/businessAvailabilitySlice';
import { toast } from 'sonner';

const BusinessAvailabilityToggle = () => {
  const dispatch = useAppDispatch();
  const { isOpen, isLoading, error, businessName } = useAppSelector(state => state.businessAvailability);

  // Fetch business availability status on component mount
  useEffect(() => {
    dispatch(getBusinessAvailability());
  }, [dispatch]);

  // Handle toggle change
  const handleToggleAvailability = async () => {
    try {
      await dispatch(updateBusinessAvailability(!isOpen)).unwrap();
      toast.success(
        !isOpen ? 'Business is now open' : 'Business is now closed', 
        { description: `You've updated ${businessName}'s availability status.` }
      );
    } catch (error) {
      // Error is already handled in the slice
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6 border-l-4 transition-colors duration-300" 
      style={{ borderLeftColor: isOpen ? '#10b981' : '#ef4444' }}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOpen ? (
              <Store className="h-6 w-6 text-green-500" />
            ) : (
              <ShieldOff className="h-6 w-6 text-red-500" />
            )}
            <div>
              <CardTitle className="text-base mb-1">Business Availability</CardTitle>
              <span className="font-medium text-sm">
                Status: <span className={isOpen ? 'text-green-500' : 'text-red-500'}>
                  {isOpen ? 'Open for Business' : 'Currently Closed'}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">{isOpen ? 'Open' : 'Closed'}</span>
            <Switch 
              checked={isOpen} 
              onCheckedChange={handleToggleAvailability}
              className={isOpen ? 'data-[state=checked]:bg-green-500' : ''}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessAvailabilityToggle;
