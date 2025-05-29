import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { AlertCircle, CalendarIcon, Clock, Filter, FileText, Search, Brain, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDailySummaries } from '@/hooks/useDailySummaries';
import { useAiAnalytics } from '@/hooks/useAiAnalytics';
import AiAnalyticsModal from '@/components/daily-logs/AiAnalyticsModal';
import { DailySummary } from '@/store/slices/dailySummariesSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchCurrentSelectedBusiness } from '@/store/slices/businessSlice';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PremiumFeatureModal from '@/components/premium/PremiumFeatureModal';
import { hasPremiumAccess } from '@/utils/subscriptionUtils';

const DailyLogs = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { 
    filteredSummaries, 
    selectedDate, 
    isLoading, 
    error,
    fetchSummariesByDate,
    searchQuery,
    setSearchQuery
  } = useDailySummaries();
  
  const { currentBusiness } = useAppSelector(state => state.business);
  const { user } = useAppSelector(state => state.auth);
  
  // Premium feature modal state
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  // Fetch daily summaries on component mount
  useEffect(() => {
    if (selectedDate) {
      fetchSummariesByDate(selectedDate);
    }
  }, [selectedDate]);

  // Check for selected business and handle redirect
  useEffect(() => {
    // Try to fetch the current business if not already loaded
    if (!currentBusiness) {
      dispatch(fetchCurrentSelectedBusiness())
        .unwrap()
        .catch(() => {
          // Business fetch will fail if no business is selected
        });
    }
  }, [dispatch, currentBusiness]);

  // Handle errors - redirect to business selection if no business is selected
  useEffect(() => {
    if (error) {
      // Check if the error indicates no business is selected
      if (error.includes('No business selected') || error.includes('select a business')) {
        toast({
          title: "No business selected",
          description: "Please select a business to view daily logs",
          variant: "destructive"
        });
        // Redirect to business selection page
        navigate('/business/select');
      }
    }
  }, [error, navigate, toast]);

  // AI Analytics hook
  const {
    dailySummary,
    isLoading: isLoadingAi,
    error: aiError,
    isModalOpen,
    fetchDailySummary,
    closeModal
  } = useAiAnalytics();
  
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const dateString = format(newDate, 'yyyy-MM-dd');
      fetchSummariesByDate(dateString);
    }
  };

  // Group summaries by hour for better visualization
  const groupedSummaries: Record<string, DailySummary[]> = {};
  
  filteredSummaries.forEach(summary => {
    const hour = format(parseISO(summary.timestamp), 'h a'); // e.g., "9 AM"
    if (!groupedSummaries[hour]) {
      groupedSummaries[hour] = [];
    }
    groupedSummaries[hour].push(summary);
  });

  // Format the selected date for display
  const formatSelectedDate = () => {
    if (!date) return 'Select a date';
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  // Get business activity color based on description keywords
  const getActivityColor = (description: string) => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('product') || lowerDesc.includes('inventory') || lowerDesc.includes('pricing')) {
      return 'bg-blue-100 text-blue-800';
    } else if (lowerDesc.includes('employee') || lowerDesc.includes('staff')) {
      return 'bg-purple-100 text-purple-800';
    } else if (lowerDesc.includes('sale') || lowerDesc.includes('revenue') || lowerDesc.includes('report')) {
      return 'bg-green-100 text-green-800';
    } else if (lowerDesc.includes('expense') || lowerDesc.includes('cost')) {
      return 'bg-red-100 text-red-800';
    } else if (lowerDesc.includes('business') || lowerDesc.includes('setting')) {
      return 'bg-amber-100 text-amber-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout title="Daily Logs">
      <div className="container py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Daily Logs</h2>
          <p className="text-muted-foreground">
            Track your daily activities and actions
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar/Filters */}
          <div className="w-full md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter logs by date and criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? formatSelectedDate() : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setDate(new Date());
                      setSearchQuery('');
                      fetchSummariesByDate(format(new Date(), 'yyyy-MM-dd'));
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Reset to Today
                  </Button>
                  
                  <Button 
                    variant="default" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 relative group"
                    onClick={() => {
                      // Check if user has premium access based on backend's isAllowedPremium flag
                      if (hasPremiumAccess(user?.subscription)) {
                        fetchDailySummary();
                      } else {
                        // Show premium feature modal
                        setIsPremiumModalOpen(true);
                      }
                    }}
                    disabled={isLoadingAi || filteredSummaries.length === 0}
                  >
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                    <Brain className="mr-2 h-4 w-4" />
                    AI Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{formatSelectedDate()}</CardTitle>
                    <CardDescription>
                      {filteredSummaries.length} activities recorded
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[400px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredSummaries.length > 0 ? (
                  <Tabs defaultValue="timeline" className="w-full">
                    <div className="flex justify-end mb-4">
                      <TabsList className="grid w-[250px] grid-cols-2">
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="timeline" className="mt-0">
                      <div className="space-y-8">
                        {Object.entries(groupedSummaries).map(([hour, summaries]) => (
                          <div key={hour} className="relative">
                            <div className="sticky top-0 bg-card z-10 py-2">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{hour}</h3>
                              </div>
                            </div>
                            <div className="mt-2 space-y-4">
                              {summaries.map((summary) => (
                                <div 
                                  key={summary.id} 
                                  className="ml-4 pl-6 border-l-2 border-border relative animate-fadeIn"
                                >
                                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                                  <div className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium">{summary.description}</h4>
                                      <span className="text-xs text-muted-foreground">
                                        {format(parseISO(summary.timestamp), 'h:mm a')}
                                      </span>
                                    </div>
                                    <Badge className={cn("text-xs", getActivityColor(summary.description))}>
                                      {summary.businessName}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="list" className="mt-0">
                      <div className="space-y-2">
                        {filteredSummaries.map((summary) => (
                          <div 
                            key={summary.id} 
                            className="p-3 border rounded-md flex justify-between items-center hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{summary.description}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {format(parseISO(summary.timestamp), 'h:mm a')}
                                  </span>
                                  <Badge className={cn("text-xs", getActivityColor(summary.description))}>
                                    {summary.businessName}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No activities found</h3>
                    <p className="text-muted-foreground mt-2">
                      {searchQuery ? (
                        <>No activities match your search criteria "{searchQuery}". Try a different search term.</>
                      ) : (
                        <>No activities recorded for {formatSelectedDate()}. Try selecting a different date.</>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* AI Analytics Modal */}
      <AiAnalyticsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        dailySummary={dailySummary}
        isLoading={isLoadingAi}
        error={aiError}
      />
      
      {/* Premium Feature Modal */}
      <PremiumFeatureModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        featureName="AI Analytics"
      />
    </MainLayout>
  );
};

export default DailyLogs;
