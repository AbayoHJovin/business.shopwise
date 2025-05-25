import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, DollarSign, AlertCircle, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Redux imports
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';

const productData = [
  { name: "Jan", sales: 40 },
  { name: "Feb", sales: 30 },
  { name: "Mar", sales: 45 },
  { name: "Apr", sales: 50 },
  { name: "May", sales: 35 },
  { name: "Jun", sales: 60 },
  { name: "Jul", sales: 65 },
];

const productColumns = [
  {
    key: "name",
    header: "Name",
    cell: (row: any) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "totalItems",
    header: "In Stock",
    cell: (row: any) => <span>{row.totalItems}</span>,
  },
  {
    key: "pricePerItem",
    header: "Price",
    cell: (row: any) => <span className="font-medium">RWF {row.pricePerItem.toFixed(2)}</span>,
  },
  {
    key: "totalValue",
    header: "Total Value",
    cell: (row: any) => <span className="font-medium">RWF {row.totalValue.toFixed(2)}</span>,
  },
];

const expenses = [
  { id: 1, description: "Office Rent", amount: 1500, date: "2023-07-01", category: "Rent" },
  { id: 2, description: "Utilities", amount: 250, date: "2023-07-05", category: "Utilities" },
  { id: 3, description: "Internet Service", amount: 80, date: "2023-07-08", category: "Utilities" },
  { id: 4, description: "Employee Salaries", amount: 6500, date: "2023-07-15", category: "Salary" },
  { id: 5, description: "Marketing Campaign", amount: 500, date: "2023-07-20", category: "Marketing" },
];

const expenseColumns = [
  {
    key: "title",
    header: "Title",
    cell: (row: any) => <span>{row.title}</span>,
  },
  {
    key: "category",
    header: "Category",
    cell: (row: any) => <span>{row.category}</span>,
  },
  {
    key: "createdAt",
    header: "Date",
    cell: (row: any) => <span>{new Date(row.createdAt).toLocaleDateString()}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    cell: (row: any) => <span className="font-medium">RWF {row.amount.toFixed(2)}</span>,
  },
  {
    key: "note",
    header: "Note",
    cell: (row: any) => <span className="truncate max-w-[150px]">{row.note || '-'}</span>,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: dashboardData, isLoading, error } = useAppSelector(state => state.dashboard);

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Handle errors - redirect to business selection if no business is selected
  useEffect(() => {
    if (error) {
      // Check if the error indicates no business is selected
      if (error.includes('No business selected') || error.includes('select a business')) {
        toast.error('No business selected', {
          description: 'Please select a business to view the dashboard',
        });
        // Redirect to business selection page
        navigate('/business/select');
      }
    }
  }, [error, navigate]);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Transform monthly sales data for the chart
  const chartData = useMemo(() => {
    if (!dashboardData?.monthlySales) return productData; // Use mock data as fallback
    
    return dashboardData.monthlySales.map(sale => ({
      name: sale.month,
      sales: sale.salesCount,
      revenue: sale.revenue
    }));
  }, [dashboardData]);

  return (
    <MainLayout title="Dashboard">
      <div className="page-container">
        {/* Error Alert */}
        {error && !error.includes('No business selected') && !error.includes('select a business') && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty Dashboard State */}
        {!isLoading && !error && !dashboardData && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No dashboard data available</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              It looks like your business is new or hasn't recorded any transactions yet.
              Start adding products, employees, or sales to see your business metrics here.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/products/new')}>Add Products</Button>
              <Button variant="outline" onClick={() => navigate('/employees/create')}>Add Employees</Button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {dashboardData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard 
              title="Total Revenue" 
              value={formatCurrency(dashboardData.totalRevenue)}
              description="vs. last month" 
              icon={<DollarSign className="h-4 w-4" />}
              trend={dashboardData.revenueChangePercentage !== 0 ? { 
                value: Math.abs(dashboardData.revenueChangePercentage), 
                positive: dashboardData.revenueChangePercentage > 0 
              } : undefined}
            />
            <StatsCard 
              title="Products" 
              value={dashboardData.totalProducts.toString()}
              description={`${dashboardData.businessName}`} 
              icon={<Package className="h-4 w-4" />}
            />
            <StatsCard 
              title="Team Members" 
              value={(dashboardData.totalEmployees + dashboardData.totalCollaborators).toString()}
              description={`${dashboardData.totalEmployees} employees, ${dashboardData.totalCollaborators} collaborators`} 
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard 
              title="Expenses" 
              value={formatCurrency(dashboardData.totalExpenses)}
              description="vs. last month"
              icon={<DollarSign className="h-4 w-4" />}
              trend={dashboardData.expenseChangePercentage !== 0 ? { 
                value: Math.abs(dashboardData.expenseChangePercentage), 
                positive: dashboardData.expenseChangePercentage < 0 
              } : undefined}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stock Investment Card */}
        {dashboardData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> 
                Total Stock Investment
              </CardTitle>
              <CardDescription>Current value of all inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{formatCurrency(dashboardData.totalStockInvestment)}</span>
                <span className="text-sm text-muted-foreground">Based on {dashboardData.totalProducts} products in inventory</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Stock Investment Card - Loading State */}
        {isLoading && (
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        )}

        {/* Tabs with Overview */}
        {dashboardData && (
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="w-full flex justify-start overflow-auto sm:justify-start md:w-auto">
              <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
              <TabsTrigger value="products" className="flex-1 sm:flex-none">Products</TabsTrigger>
              <TabsTrigger value="expenses" className="flex-1 sm:flex-none">Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>
                      Monthly sales data for {dashboardData.businessName}
                      {dashboardData.highestSalesMonth && (
                        <span className="block mt-1 text-sm">
                          Highest sales in <span className="font-medium">{dashboardData.highestSalesMonth}</span>
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'revenue') return formatCurrency(Number(value));
                            return value;
                          }}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Bar dataKey="sales" name="Sales Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="products">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Your best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.topSellingProducts && dashboardData.topSellingProducts.length > 0 ? (
                    <DataTable columns={productColumns} data={dashboardData.topSellingProducts} />
                  ) : (
                    <div className="py-8 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No products found</h3>
                      <p className="text-muted-foreground mb-4">You don't have any products in your shop yet.</p>
                      <Button onClick={() => navigate('/products/new')}>Add Your First Product</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="expenses">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Overview of your recent business expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.latestExpenses && dashboardData.latestExpenses.length > 0 ? (
                    <DataTable columns={expenseColumns} data={dashboardData.latestExpenses} />
                  ) : (
                    <div className="py-8 text-center">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No expenses recorded</h3>
                      <p className="text-muted-foreground mb-4">You haven't recorded any expenses for this business yet.</p>
                      <Button onClick={() => navigate('/expenses/create')}>Record an Expense</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Tabs - Loading State */}
        {isLoading && (
          <div className="mb-8">
            <Skeleton className="h-10 w-full sm:w-1/3 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <Card className="col-span-4">
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[350px] w-full" />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
