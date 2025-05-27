
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import MyBusinessesTab from '@/components/settings/MyBusinessesTab';
import BusinessProfileTab from '@/components/settings/BusinessProfileTab';
import { useAppSelector } from '@/store/hooks';

// Types for settings
type ThemeType = 'light' | 'dark' | 'system';
type DefaultDashboardType = 'dashboard' | 'products' | 'employees' | 'expenses' | 'sales' | 'availability';
type TableDensityType = 'compact' | 'default' | 'spacious';

type UserSettings = {
  theme: ThemeType;
  defaultDashboard: DefaultDashboardType;
  enableNotifications: boolean;
  tableDensity: TableDensityType;
  autoSaveEnabled: boolean;
  defaultSortOrder: 'asc' | 'desc';
  activeTab?: 'appearance' | 'dashboard' | 'data' | 'businesses' | 'profile';
};

const Settings = () => {
  // Check if user is authenticated
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    defaultDashboard: 'dashboard',
    enableNotifications: true,
    tableDensity: 'default',
    autoSaveEnabled: true,
    defaultSortOrder: 'asc',
    activeTab: 'appearance',
  });

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Apply theme to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Handle system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings]);

  // Handle setting changes
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    const defaultSettings: UserSettings = {
      theme: 'system',
      defaultDashboard: 'dashboard',
      enableNotifications: true,
      tableDensity: 'default',
      autoSaveEnabled: true,
      defaultSortOrder: 'asc',
    };
    
    setSettings(defaultSettings);
    toast({
      title: "Settings reset",
      description: "All settings have been restored to their default values.",
    });
  };

  return (
    <MainLayout title="Settings">
      <div className="container py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Customize your dashboard experience
          </p>
        </div>
        
        <Tabs value={settings.activeTab || 'appearance'} onValueChange={(value: typeof settings.activeTab) => updateSetting('activeTab', value)} className="w-full">
          {/* For larger screens */}
          <TabsList className="mb-4 hidden md:flex w-full justify-start space-x-2">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="data">Data Display</TabsTrigger>
            {isAuthenticated && <TabsTrigger value="businesses">My Businesses</TabsTrigger>}
            {isAuthenticated && <TabsTrigger value="profile">Business Profile</TabsTrigger>}
          </TabsList>
          
          {/* For mobile screens */}
          <div className="mb-4 md:hidden">
            <Select value={settings.activeTab || 'appearance'} onValueChange={(value: typeof settings.activeTab) => updateSetting('activeTab', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appearance">Appearance</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="data">Data Display</SelectItem>
                {isAuthenticated && <SelectItem value="businesses">My Businesses</SelectItem>}
                {isAuthenticated && <SelectItem value="profile">Business Profile</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Theme</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select the theme for the application
                    </p>
                    <RadioGroup 
                      value={settings.theme}
                      onValueChange={(value: ThemeType) => updateSetting('theme', value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light">Light</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark">Dark</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="theme-system" />
                        <Label htmlFor="theme-system">System</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Preferences</CardTitle>
                <CardDescription>
                  Customize your dashboard experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Default Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose which section to show by default when you open the dashboard
                    </p>
                    <Select 
                      value={settings.defaultDashboard} 
                      onValueChange={(value: DefaultDashboardType) => updateSetting('defaultDashboard', value)}
                    >
                      <SelectTrigger className="w-full md:w-[240px]">
                        <SelectValue placeholder="Select default dashboard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Overview</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                        <SelectItem value="employees">Employees</SelectItem>
                        <SelectItem value="expenses">Expenses</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="availability">Availability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 pt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about important events
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(value) => updateSetting('enableNotifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 pt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="autosave">Auto-save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes as you work
                      </p>
                    </div>
                    <Switch
                      id="autosave"
                      checked={settings.autoSaveEnabled}
                      onCheckedChange={(value) => updateSetting('autoSaveEnabled', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Display</CardTitle>
                <CardDescription>
                  Configure how data is displayed in tables and lists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Table Density</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Control the spacing in tables and data grids
                    </p>
                    <RadioGroup 
                      value={settings.tableDensity}
                      onValueChange={(value: TableDensityType) => updateSetting('tableDensity', value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compact" id="density-compact" />
                        <Label htmlFor="density-compact">Compact</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="density-default" />
                        <Label htmlFor="density-default">Default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spacious" id="density-spacious" />
                        <Label htmlFor="density-spacious">Spacious</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Default Sort Order</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Set the default sort order for tables and lists
                    </p>
                    <RadioGroup 
                      value={settings.defaultSortOrder}
                      onValueChange={(value: 'asc' | 'desc') => updateSetting('defaultSortOrder', value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="asc" id="sort-asc" />
                        <Label htmlFor="sort-asc">Ascending (A-Z, 0-9)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="desc" id="sort-desc" />
                        <Label htmlFor="sort-desc">Descending (Z-A, 9-0)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAuthenticated && (
            <TabsContent value="businesses">
              <MyBusinessesTab />
            </TabsContent>
          )}
          
          {isAuthenticated && (
            <TabsContent value="profile" className="space-y-4">
              <BusinessProfileTab />
              <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
                <Button variant="destructive" className="w-full sm:w-auto" onClick={resetSettings}>
                  Reset to Defaults
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => {
                  toast({
                    title: "Changes saved",
                    description: "Your settings have been updated successfully.",
                  });
                }}>
                  Save Changes
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
