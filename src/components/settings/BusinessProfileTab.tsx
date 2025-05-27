import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Globe, Building2, Users, Package, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getBusinessProfile } from '@/store/slices/businessProfileSlice';
import BusinessLocationMap from './BusinessLocationMap';
import 'leaflet/dist/leaflet.css';

const BusinessProfileTab = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { 
    name, 
    location, 
    about, 
    websiteLink, 
    productCount, 
    employeeCount, 
    isLoading, 
    error 
  } = useAppSelector(state => state.businessProfile);

  // Fetch business profile on component mount
  useEffect(() => {
    dispatch(getBusinessProfile());
  }, [dispatch]);

  // Format location string
  const getFormattedLocation = () => {
    if (!location) return 'Location not available';
    
    const parts = [];
    if (location.village) parts.push(location.village);
    if (location.cell) parts.push(location.cell);
    if (location.sector) parts.push(location.sector);
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    
    return parts.length > 0 ? parts.join(', ') : 'Location details not available';
  };

  // Check if map should be displayed
  const hasMapCoordinates = location?.latitude && location?.longitude;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24 mr-2" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary" />
          Business Profile
        </CardTitle>
        <CardDescription>
          View and manage your business information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {name ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{name}</h3>
                <div className="flex items-start mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{getFormattedLocation()}</span>
                </div>
              </div>
              
              {about && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">About</h4>
                  <p className="text-sm text-muted-foreground">{about}</p>
                </div>
              )}
              
              {websiteLink && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Website</h4>
                  <a 
                    href={websiteLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">{websiteLink}</span>
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center text-sm font-medium">
                    <Package className="h-4 w-4 mr-1 text-primary" />
                    Products
                  </div>
                  <p className="text-2xl font-semibold mt-1">{productCount || 0}</p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center text-sm font-medium">
                    <Users className="h-4 w-4 mr-1 text-primary" />
                    Employees
                  </div>
                  <p className="text-2xl font-semibold mt-1">{employeeCount || 0}</p>
                </div>
              </div>
            </div>
            
            {hasMapCoordinates ? (
              <div className="h-[300px] rounded-md overflow-hidden border">
                <BusinessLocationMap 
                  latitude={location!.latitude!} 
                  longitude={location!.longitude!} 
                  name={name || ''} 
                  address={getFormattedLocation()} 
                />
              </div>
            ) : (
              <div className="h-[300px] rounded-md overflow-hidden border flex items-center justify-center bg-muted/50">
                <div className="text-center p-4">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium">No Map Location</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    This business doesn't have geographic coordinates set.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No business selected</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Please select a business to view its profile information.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-t pt-6">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto flex items-center justify-center"
          onClick={() => navigate('/settings/business/update')}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Update Business
        </Button>
        <Button variant="destructive" className="w-full sm:w-auto flex items-center justify-center">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Business
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusinessProfileTab;
