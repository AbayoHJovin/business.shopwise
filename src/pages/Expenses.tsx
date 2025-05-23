
import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Mock expenses data - replace with API call
const mockExpenses = [
  {
    id: 1,
    title: "Office Supplies",
    amount: 125.50,
    note: "Purchased notebooks, pens and folders",
    category: "Office",
    createdAt: "2025-05-22T10:30:00Z"
  },
  {
    id: 2,
    title: "Utility Bills",
    amount: 230.75,
    note: "Electricity and water bills for May",
    category: "Utilities",
    createdAt: "2025-05-22T11:45:00Z"
  },
  {
    id: 3,
    title: "Team Lunch",
    amount: 178.25,
    note: "Team lunch at Italian restaurant",
    category: "Food",
    createdAt: "2025-05-22T13:15:00Z"
  },
  {
    id: 4,
    title: "Software Subscription",
    amount: 49.99,
    note: "Monthly subscription for accounting software",
    category: "Software",
    createdAt: "2025-05-22T09:00:00Z"
  },
  {
    id: 5,
    title: "Client Meeting",
    amount: 85.30,
    note: "Coffee and snacks for client meeting",
    category: "Food",
    createdAt: "2025-05-22T14:30:00Z"
  }
];

type CategoryFilter = 'All' | 'Office' | 'Utilities' | 'Food' | 'Software' | 'Other';
type SortOption = 'amount' | 'title' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const Expenses = () => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedExpenses = mockExpenses.filter(expense => {
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

  return (
    <MainLayout title="Expenses">
      <div className="page-container p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Today's expenses <span className="font-medium">({filteredAndSortedExpenses.length} total)</span>
            </p>
          </div>
          <Button className="self-start sm:self-auto">
            <Plus className="mr-2" /> Add Expense
          </Button>
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
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
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
              </div>

              <div className="mt-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          )}
        </Card>

        <div className="space-y-4">
          {filteredAndSortedExpenses.map(expense => (
            <Card key={expense.id}>
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
        
        {filteredAndSortedExpenses.length === 0 && (
          <div className="text-center p-10">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-xl font-semibold">No expenses found</p>
            <p className="text-muted-foreground">
              {mockExpenses.length > 0 ? "Try adjusting your filters" : "Add your first expense to get started"}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Expenses;
