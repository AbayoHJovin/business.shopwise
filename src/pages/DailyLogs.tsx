import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { CalendarIcon, Clock, Filter, FileText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyLogs } from '@/hooks/useDailyLogs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DailyLog } from '@/types/DailyLog';

const DailyLogs = () => {
  const { 
    filteredLogs, 
    selectedDate, 
    isLoading, 
    filterByDate 
  } = useDailyLogs();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const dateString = format(newDate, 'yyyy-MM-dd');
      filterByDate(dateString);
    }
  };

  // Filter logs by search query
  const displayedLogs = searchQuery 
    ? filteredLogs.filter(log => 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredLogs;

  // Group logs by hour for better visualization
  const groupedLogs: Record<string, DailyLog[]> = {};
  
  displayedLogs.forEach(log => {
    const hour = format(parseISO(log.timestamp), 'h a'); // e.g., "9 AM"
    if (!groupedLogs[hour]) {
      groupedLogs[hour] = [];
    }
    groupedLogs[hour].push(log);
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

  // Get category color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'product':
      case 'inventory':
      case 'pricing':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
      case 'schedule':
        return 'bg-purple-100 text-purple-800';
      case 'sales':
      case 'report':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'business':
      case 'export':
        return 'bg-amber-100 text-amber-800';
      default:
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

                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setDate(new Date());
                      setSearchQuery('');
                      filterByDate(new Date().toISOString().split('T')[0]);
                    }}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Reset Filters
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
                      {displayedLogs.length} activities recorded
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                ) : displayedLogs.length > 0 ? (
                  <Tabs defaultValue="timeline" className="w-full">
                    <div className="flex justify-end mb-4">
                      <TabsList className="grid w-[250px] grid-cols-2">
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="timeline" className="mt-0">
                      <div className="space-y-8">
                        {Object.entries(groupedLogs).map(([hour, logs]) => (
                          <div key={hour} className="relative">
                            <div className="sticky top-0 bg-card z-10 py-2">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <h3 className="text-sm font-medium">{hour}</h3>
                              </div>
                            </div>
                            <div className="mt-2 space-y-4">
                              {logs.map((log) => (
                                <div 
                                  key={log.id} 
                                  className="ml-4 pl-6 border-l-2 border-border relative animate-fadeIn"
                                >
                                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                                  <div className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium">{log.description}</h4>
                                      <span className="text-xs text-muted-foreground">
                                        {format(parseISO(log.timestamp), 'h:mm a')}
                                      </span>
                                    </div>
                                    {log.category && (
                                      <Badge className={cn("text-xs", getCategoryColor(log.category))}>
                                        {log.category}
                                      </Badge>
                                    )}
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
                        {displayedLogs.map((log) => (
                          <div 
                            key={log.id} 
                            className="p-3 border rounded-md flex justify-between items-center hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{log.description}</p>
                                {log.category && (
                                  <Badge className={cn("text-xs mt-1", getCategoryColor(log.category))}>
                                    {log.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(parseISO(log.timestamp), 'h:mm a')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No activity recorded</h3>
                    <p className="text-muted-foreground max-w-md">
                      There are no logs recorded for this date. Try selecting a different date or clearing your filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DailyLogs;
