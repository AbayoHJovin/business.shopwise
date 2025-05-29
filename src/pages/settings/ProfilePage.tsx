import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, User as UserType } from '@/store/slices/authSlice';
import { Loader2, Mail, Phone, User as UserIcon, Building, Calendar, Crown, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import SubscriptionStatus from '@/components/premium/SubscriptionStatus';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { user, isLoading, error } = useAppSelector(state => state.auth);
  
  // Fetch user profile on component mount only if not already loaded
  useEffect(() => {
    // Only fetch if we don't have user data or if there was an error
    if (!user || error) {
      dispatch(fetchUserProfile())
        .unwrap()
        .catch(error => {
          toast({
            title: "Error",
            description: typeof error === 'string' ? error : "Failed to load profile",
            variant: "destructive"
          });
        });
    }
  }, [dispatch, toast, user, error]);
  
  // Helper function to get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <MainLayout title="Profile">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <Button asChild variant="outline" disabled>
              <Link to="/settings/edit-profile">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => dispatch(fetchUserProfile())}>Retry</Button>
              </CardFooter>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="businesses">Businesses</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Card */}
                  <Card className="md:col-span-1">
                    <CardHeader className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl">{user?.name}</CardTitle>
                      <CardDescription className="flex items-center justify-center mt-1">
                        <SubscriptionStatus subscription={user?.subscription} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{user?.email}</span>
                      </div>
                      {user?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user?.role && (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="capitalize">{user.role.toLowerCase()}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Joined {formatDate(user?.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Account Details */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Account Details</CardTitle>
                      <CardDescription>Your personal information and account settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Personal Information</h3>
                        <Separator className="mb-4" />
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                            <dd className="mt-1">{user?.name || 'Not provided'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                            <dd className="mt-1">{user?.email || 'Not provided'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Phone Number</dt>
                            <dd className="mt-1">{user?.phone || 'Not provided'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                            <dd className="mt-1 capitalize">{user?.role?.toLowerCase() || 'Not provided'}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Status</h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Subscription Tab */}
              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                      Subscription Details
                    </CardTitle>
                    <CardDescription>Your current subscription plan and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user?.subscription ? (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <h3 className="text-lg font-medium">
                              Current Plan: <span className="font-bold">{user.subscription.plan}</span>
                            </h3>
                            <p className="text-muted-foreground mt-1">
                              {user.subscription.isAllowedPremium || user.subscription.allowedPremium 
                                ? "You have access to premium features" 
                                : "You don't have access to premium features"}
                            </p>
                          </div>
                          <SubscriptionStatus subscription={user.subscription} variant="default" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Subscription Timeline</h3>
                            <Separator className="mb-4" />
                            <dl className="space-y-4">
                              {user.subscription.subscribedAt && (
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Subscribed On</dt>
                                  <dd className="mt-1">{formatDate(user.subscription.subscribedAt)}</dd>
                                </div>
                              )}
                              {user.subscription.expirationDate && (
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Expires On</dt>
                                  <dd className="mt-1">{formatDate(user.subscription.expirationDate)}</dd>
                                </div>
                              )}
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Remaining Days</dt>
                                <dd className="mt-1">{user.subscription.remainingDays} days</dd>
                              </div>
                            </dl>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Free Trial</h3>
                            <Separator className="mb-4" />
                            <dl className="space-y-4">
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Free Trial Status</dt>
                                <dd className="mt-1">
                                  <Badge variant={user.subscription.finishedFreeTrial ? "outline" : "default"} 
                                    className={!user.subscription.finishedFreeTrial && (user.subscription.isInFreeTrial || user.subscription.inFreeTrial) ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                                    {user.subscription.finishedFreeTrial 
                                      ? "Completed" 
                                      : (user.subscription.isInFreeTrial || user.subscription.inFreeTrial)
                                        ? "Active"
                                        : "Not Started"}
                                  </Badge>
                                </dd>
                              </div>
                              {user.subscription.freeTrialStartedAt && (
                                <div>
                                  <dt className="text-sm font-medium text-muted-foreground">Free Trial Started</dt>
                                  <dd className="mt-1">{formatDate(user.subscription.freeTrialStartedAt)}</dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        </div>
                        
                        <div className="flex justify-center mt-6">
                          <Button asChild>
                            <Link to="/payment">
                              {user.subscription.plan === 'FREE' ? 'Upgrade Plan' : 'Manage Subscription'}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                        <p className="text-muted-foreground mb-6">
                          You're currently on the free plan with limited features.
                        </p>
                        <Button asChild>
                          <Link to="/payment">Upgrade Now</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Businesses Tab */}
              <TabsContent value="businesses">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Your Businesses
                    </CardTitle>
                    <CardDescription>Businesses associated with your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user?.businessIds && user.businessIds.length > 0 ? (
                      <div className="space-y-4">
                        <p>You have {user.businessIds.length} business(es) associated with your account.</p>
                        <Button asChild>
                          <Link to="/business/select">Manage Businesses</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Businesses Found</h3>
                        <p className="text-muted-foreground mb-6">
                          You don't have any businesses associated with your account yet.
                        </p>
                        <Button asChild>
                          <Link to="/business/create">Create Business</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
