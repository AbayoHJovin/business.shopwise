import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';

const MyBusinessesTab = () => {
  const navigate = useNavigate();
  const { userBusinesses, isLoading, selectBusiness } = useBusinesses();
  
  const handleBusinessSelect = (businessId: string) => {
    selectBusiness(businessId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Businesses</CardTitle>
        <CardDescription>
          Manage and switch between your businesses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Select a business to manage or create a new one
          </p>
          <Button 
            onClick={() => navigate('/business/create')} 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Business
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map((_, index) => (
              <Card key={index} className="overflow-hidden border border-muted">
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-12 w-full" />
                  <div className="flex justify-end mt-4">
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : userBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {userBusinesses.map((business) => (
              <Card 
                key={business.id} 
                className="overflow-hidden border hover:border-primary/50 transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{business.name}</h3>
                      {business.location && (
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {business.location.address || `Lat: ${business.location.latitude}, Long: ${business.location.longitude}`}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleBusinessSelect(business.id)} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      Select
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {business.description || 'No description provided.'}
                  </p>
                  
                  {business.website && (
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center hover:underline mt-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      {business.website}
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-6 border border-dashed">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-base font-medium">No businesses found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You don't have any businesses yet. Create your first business to get started.
              </p>
              <Button 
                onClick={() => navigate('/business/create')} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Business
              </Button>
            </div>
          </Card>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-xs text-muted-foreground">
          Need to manage multiple businesses? You can switch between them anytime.
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/business/select')}
        >
          View All Businesses
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyBusinessesTab;
