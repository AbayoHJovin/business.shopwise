import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getBusinessProfile, updateBusiness } from '@/store/slices/businessProfileSlice';
import { toast } from 'sonner';
import BusinessLocationMap from '@/components/settings/BusinessLocationMap';

interface Location {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  latitude?: number;
  longitude?: number;
}

const UpdateBusiness = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { name, location, about, websiteLink, isLoading, error } = useAppSelector(state => state.businessProfile);
  const [formData, setFormData] = useState({
    name: '',
    location: {
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      latitude: undefined,
      longitude: undefined
    },
    about: '',
    websiteLink: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Initialize form with current business data
  useEffect(() => {
    if (name && location) {
      setFormData(prev => ({
        ...prev,
        name,
        location: {
          ...prev.location,
          province: location.province || '',
          district: location.district || '',
          sector: location.sector || '',
          cell: location.cell || '',
          village: location.village || '',
          latitude: location.latitude,
          longitude: location.longitude
        },
        about: about || '',
        websiteLink: websiteLink || ''
      }));
    }
  }, [name, location, about, websiteLink]);

  // Fetch business profile on mount
  useEffect(() => {
    dispatch(getBusinessProfile());
  }, [dispatch]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle location field changes
  const handleLocationChange = (field: keyof Location, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  // Handle map location selection
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: lat,
        longitude: lng
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(updateBusiness(formData)).unwrap();
      toast.success('Business updated successfully');
      navigate('/settings/profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update business');
    }
  };

  // Handle location search
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await fetch(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Rwanda&format=json`);
      const data = await results.json();
      setSearchResults(data.slice(0, 5)); // Limit to 5 results
    } catch (err) {
      console.error('Error searching for location:', err);
    }
  };

  // Handle location suggestion selection
  const handleLocationSelect = (result: any) => {
    setSearchQuery(result.display_name);
    setSearchResults([]);
    handleMapLocationSelect(result.lat, result.lon);
  };

  if (!name || !location) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Business Selected</h3>
          <p className="text-muted-foreground">
            Please select a business to update its information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Update Business</h2>
          <p className="text-muted-foreground">
            Update your business information and location
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter business name"
                />
              </div>
              
              <div>
                <Label htmlFor="about">About Business</Label>
                <Textarea
                  id="about"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Describe your business..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="websiteLink"
                  value={formData.websiteLink}
                  onChange={handleChange}
                  placeholder="https://your-website.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="search"
                  placeholder="Search location in Rwanda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLocationSearch();
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleLocationSearch}
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result: any, index: number) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleLocationSelect(result)}
                    >
                      {result.display_name}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Province</Label>
                  <Input
                    value={formData.location.province}
                    onChange={(e) => handleLocationChange('province', e.target.value)}
                  />
                </div>
                <div>
                  <Label>District</Label>
                  <Input
                    value={formData.location.district}
                    onChange={(e) => handleLocationChange('district', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Sector</Label>
                  <Input
                    value={formData.location.sector}
                    onChange={(e) => handleLocationChange('sector', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Cell</Label>
                  <Input
                    value={formData.location.cell}
                    onChange={(e) => handleLocationChange('cell', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Village</Label>
                  <Input
                    value={formData.location.village}
                    onChange={(e) => handleLocationChange('village', e.target.value)}
                  />
                </div>
              </div>

              <div className="h-[400px] rounded-md border">
                <BusinessLocationMap 
                  latitude={formData.location.latitude || 0} 
                  longitude={formData.location.longitude || 0} 
                  name={formData.name}
                  address={`${formData.location.village}, ${formData.location.cell}, ${formData.location.sector}, ${formData.location.district}, ${formData.location.province}`}
                  onLocationSelect={handleMapLocationSelect}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end mt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/settings')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Business'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBusiness;
