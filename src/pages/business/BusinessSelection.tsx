import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Building2, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock business data type
interface Business {
  id: string;
  name: string;
  about: string;
  websiteLink?: string;
  location: {
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
}

const BusinessSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call to fetch the user's businesses
    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data - in a real app, this would come from your backend
        const mockBusinesses: Business[] = [
          {
            id: '1',
            name: 'Kigali Fashion Store',
            about: 'A premium clothing store offering the latest fashion trends in Kigali.',
            websiteLink: 'https://kigalifashion.com',
            location: {
              province: 'Kigali',
              district: 'Nyarugenge',
              sector: 'Nyarugenge',
              cell: 'Kiyovu',
              village: 'Kiyovu',
              latitude: -1.9441,
              longitude: 30.0619
            },
            createdAt: '2023-05-15'
          },
          {
            id: '2',
            name: 'Huye Grocery Market',
            about: 'Local grocery store providing fresh produce and household essentials.',
            location: {
              province: 'Southern',
              district: 'Huye',
              sector: 'Ngoma',
              cell: 'Ngoma',
              village: 'Ngoma',
            },
            createdAt: '2023-08-22'
          }
        ];
        
        setBusinesses(mockBusinesses);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleBusinessSelect = (businessId: string) => {
    // In a real app, you might want to store the selected business in context or localStorage
    localStorage.setItem('selectedBusinessId', businessId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-xl font-bold text-gray-900">BusinessHive</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.fullName || 'User'}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              Account
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Businesses</h1>
              <p className="text-gray-600 mt-1">Select a business to manage or create a new one</p>
            </div>
            <Button onClick={() => navigate('/business/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Business
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{business.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      {business.location.district}, {business.location.province}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {business.about || 'No description provided.'}
                    </p>
                    {business.websiteLink && (
                      <a 
                        href={business.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        {business.websiteLink}
                      </a>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={() => handleBusinessSelect(business.id)}>
                      Select Business
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Building2 className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No businesses found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You don't have any businesses yet. Create your first business to get started.
                </p>
                <Button onClick={() => navigate('/business/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Business
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <p className="text-sm text-center text-gray-500">
            © {new Date().getFullYear()} BusinessHive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessSelection;
