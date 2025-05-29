
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Filter,
  ClipboardList, 
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Search,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
  TrendingUp,
  Brain
} from 'lucide-react';
import { format, parseISO, isValid, parse } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchExpenses, setSelectedDate, ExpenseCategory } from '@/store/slices/expenseSlice';
import { fetchCurrentSelectedBusiness } from '@/store/slices/businessSlice';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useExpenseAnalytics } from '@/hooks/useExpenseAnalytics';
import ExpenseAnalyticsModal from '@/components/expenses/ExpenseAnalyticsModal';

type CategoryFilter = 'All' | ExpenseCategory;
type SortOption = 'amount' | 'title' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const Expenses = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  // Get expenses and business from Redux store
  const { items: expenses, isLoading, error, selectedDate, totalAmount } = useAppSelector((state) => state.expenses);
  const { currentBusiness } = useAppSelector(state => state.business);
  
  // AI Analytics hook
  const {
    analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    isModalOpen,
    fetchAnalytics,
    closeModal
  } = useExpenseAnalytics();
  
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Fetch expenses on component mount and when date changes
  useEffect(() => {
    // First, check if we have a selected business
    if (!currentBusiness) {
      // Try to fetch the current business
      dispatch(fetchCurrentSelectedBusiness())
        .unwrap()
        .then(() => {
          // After successfully fetching the business, fetch expenses for the selected date
          if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            dispatch(setSelectedDate(formattedDate));
            return dispatch(fetchExpenses(formattedDate)).unwrap();
          }
        })
        .catch((error) => {
          // If we can't get a business, show error and redirect
          if (error.includes('No business selected') || error.includes('select a business')) {
            toast({
              title: "No business selected",
              description: "Please select a business to view expenses",
              variant: "destructive"
            });
            // Redirect to business selection page
            navigate('/business/select');
          } else {
            toast({
              title: "Error",
              description: error || "Failed to load expenses. Please try again later.",
              variant: "destructive"
            });
          }
        });
    } else {
      // If we already have a business, fetch expenses directly
      if (date) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        dispatch(setSelectedDate(formattedDate));
        dispatch(fetchExpenses(formattedDate))
          .unwrap()
          .catch((error) => {
            // Check if the error is related to business selection
            if (error.includes('No business selected') || error.includes('select a business')) {
              toast({
                title: "No business selected",
                description: "Please select a business to view expenses",
                variant: "destructive"
              });
              // Redirect to business selection page
              navigate('/business/select');
            } else {
              toast({
                title: "Error",
                description: error || "Failed to load expenses. Please try again later.",
                variant: "destructive"
              });
            }
          });
      }
    }
  }, [dispatch, toast, currentBusiness, date]);
  
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedExpenses = expenses.filter(expense => {
    // Apply category filter
    if (categoryFilter !== 'All' && expense.category !== categoryFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery && !expense.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !expense.note.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    let compareValueA, compareValueB;

    switch (sortOption) {
      case 'amount':
        compareValueA = a.amount;
        compareValueB = b.amount;
        break;
      case 'title':
        compareValueA = a.title.toLowerCase();
        compareValueB = b.title.toLowerCase();
        break;
      case 'createdAt':
        compareValueA = new Date(a.createdAt).getTime();
        compareValueB = new Date(b.createdAt).getTime();
        break;
      default:
        compareValueA = new Date(a.createdAt).getTime();
        compareValueB = new Date(b.createdAt).getTime();
    }

    if (compareValueA < compareValueB) return sortDirection === 'asc' ? -1 : 1;
    if (compareValueA > compareValueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
const navigate = useNavigate()
  return (
    <MainLayout title="Expenses">
      <div className="page-container p-4 md:p-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              {date ? format(date, 'MMMM d, yyyy') : 'Today\'s'} expenses <span className="font-medium">({filteredAndSortedExpenses.length} total)</span>
              {currentBusiness && <span className="ml-1">for {currentBusiness.name}</span>}
            </p>
            <p className="text-lg font-semibold mt-1">
              Total: <span className="text-primary">${totalAmount.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              className="self-start sm:self-auto"
              onClick={fetchAnalytics}
              disabled={isLoadingAnalytics || expenses.length === 0}
            >
              <Brain className="mr-2 h-4 w-4" /> AI Analytics
            </Button>
            <Button 
              className="self-start sm:self-auto"
              onClick={() => navigate('/expenses/add')}
            >
              <Plus className="mr-2" /> Add Expense
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Filters & Sorting</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                {isFilterExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isFilterExpanded && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value={ExpenseCategory.OFFICE}>{ExpenseCategory.OFFICE}</SelectItem>
                      <SelectItem value={ExpenseCategory.UTILITIES}>{ExpenseCategory.UTILITIES}</SelectItem>
                      <SelectItem value={ExpenseCategory.FOOD}>{ExpenseCategory.FOOD}</SelectItem>
                      <SelectItem value={ExpenseCategory.SOFTWARE}>{ExpenseCategory.SOFTWARE}</SelectItem>
                      <SelectItem value={ExpenseCategory.OTHER}>{ExpenseCategory.OTHER}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select
                    value={sortOption}
                    onValueChange={(value) => setSortOption(value as SortOption)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort Direction</label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={toggleSortDirection}
                  >
                    {sortDirection === 'asc' ? (
                      <>
                        Ascending <SortAsc className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Descending <SortDesc className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or note..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading expenses...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredAndSortedExpenses.length > 0 ? (
              <div className="space-y-4">
                {filteredAndSortedExpenses.map(expense => (
                  <Card key={expense.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">{expense.title}</h3>
                          <p className="text-muted-foreground text-sm">{expense.note}</p>
                          <div className="flex flex-wrap gap-2 items-center mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {expense.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(expense.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                          <span className="text-xl font-bold">${expense.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-10">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-2 text-xl font-semibold">No expenses found</p>
                <p className="text-muted-foreground">
                  {expenses.length > 0 ? "Try adjusting your filters" : "Add your first expense to get started"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Expense Analytics Modal */}
      <ExpenseAnalyticsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        analytics={analytics}
        isLoading={isLoadingAnalytics}
        error={analyticsError}
      />
    </MainLayout>
  );
};

export default Expenses;
