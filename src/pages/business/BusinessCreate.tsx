import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Building2, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from '@/components/maps/LocationPicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createBusiness } from '@/store/slices/businessSlice';

// Define the form schema with validation based on the DTO
const businessSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100, { message: 'Name cannot exceed 100 characters' }),
  about: z.string().max(500, { message: 'Description cannot exceed 500 characters' }).optional(),
  websiteLink: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  location: z.object({
    province: z.string().max(100, { message: 'Province cannot exceed 100 characters' }),
    district: z.string().max(100, { message: 'District cannot exceed 100 characters' }),
    sector: z.string().max(100, { message: 'Sector cannot exceed 100 characters' }),
    cell: z.string().max(100, { message: 'Cell cannot exceed 100 characters' }),
    village: z.string().max(100, { message: 'Village cannot exceed 100 characters' }),
    latitude: z.number().min(-90, { message: 'Latitude must be between -90 and 90' }).max(90, { message: 'Latitude must be between -90 and 90' }).optional().or(z.literal('')),
    longitude: z.number().min(-180, { message: 'Longitude must be between -180 and 180' }).max(180, { message: 'Longitude must be between -180 and 180' }).optional().or(z.literal('')),
  }),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

const BusinessCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.business);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      about: '',
      websiteLink: '',
      location: {
        province: '',
        district: '',
        sector: '',
        cell: '',
        village: '',
        latitude: '',
        longitude: '',
      },
    },
  });

  // Show error toast if there's an error in the Redux state
  useEffect(() => {
    if (error) {
      toast.error('Failed to create business', {
        description: error,
      });
    }
  }, [error]);

  // Handle form submission
  const onSubmit = async (values: BusinessFormValues) => {
    try {
      // Convert string latitude/longitude to numbers or undefined
      const formattedValues = {
        ...values,
        location: {
          ...values.location,
          latitude: values.location.latitude ? Number(values.location.latitude) : undefined,
          longitude: values.location.longitude ? Number(values.location.longitude) : undefined,
        },
        ownerId: user?.id, // Add owner ID from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Business data to submit:', formattedValues);
      
      // Dispatch the createBusiness action to Redux
      const resultAction = await dispatch(createBusiness(formattedValues));
      
      // Check if the action was fulfilled (successful)
      if (createBusiness.fulfilled.match(resultAction)) {
        // Show success message
        toast.success('Business created successfully!', {
          description: 'Redirecting to business dashboard...',
        });
        
        // Redirect to business selection page after creation
        setTimeout(() => {
          navigate('/business/select');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating business:', error);
    }
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
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/business/select')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Businesses
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Business</CardTitle>
              <CardDescription>
                Enter your business details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Business Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter business name" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your business (2-100 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your business" 
                              className="resize-none min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description of your business (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="websiteLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your business website (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Location Section */}
                  <div className="space-y-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Location Information <span className="text-destructive">*</span></h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Fill address details and use the map</span>
                      </div>
                    </div>
                    
                    {/* Address Fields */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Address Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location.province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Province" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location.district"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>District <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="District" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="location.sector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sector <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Sector" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location.cell"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cell <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Cell" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location.village"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Village <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Village" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Map Section */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-medium">Interactive Map (Satellite View)</h4>
                      <p className="text-xs text-muted-foreground">Click on the map or drag the marker to set your exact business location</p>
                      
                      <div className="rounded-md border p-4 bg-background">
                        <FormField
                          control={form.control}
                          name="location.latitude"
                          render={({ field: latField }) => (
                            <FormField
                              control={form.control}
                              name="location.longitude"
                              render={({ field: lngField }) => (
                                <LocationPicker
                                  latitude={latField.value}
                                  longitude={lngField.value}
                                  onLocationChange={(lat, lng) => {
                                    latField.onChange(lat);
                                    lngField.onChange(lng);
                                  }}
                                />
                              )}
                            />
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location.latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.000001" 
                                  placeholder="e.g. -1.9441" 
                                  {...field} 
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === '' ? '' : parseFloat(value));
                                  }}
                                  disabled={true}
                                />
                              </FormControl>
                              <FormDescription>
                                Between -90.0 and 90.0 (optional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location.longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.000001" 
                                  placeholder="e.g. 30.0619" 
                                  {...field} 
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value === '' ? '' : parseFloat(value));
                                  }}
                                  disabled={true}
                                />
                              </FormControl>
                              <FormDescription>
                                Between -180.0 and 180.0 (optional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/business/select')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Business'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-white border-t py-4 mt-8">
        <div className="container mx-auto px-4">
          <p className="text-sm text-center text-gray-500">
            © {new Date().getFullYear()} BusinessHive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessCreate;
