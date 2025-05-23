import React, { useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentSalesCard from '@/components/dashboard/RecentSalesCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';

// Mock data
const recentSales = [
  {
    id: 1,
    productName: "Premium Chair",
    amount: 129,
    customer: {
      name: "Alice Johnson",
      email: "alice@example.com",
    },
    date: "2023-07-21",
  },
  {
    id: 2,
    productName: "Office Desk",
    amount: 299,
    customer: {
      name: "Bob Smith",
      email: "bob@example.com",
    },
    date: "2023-07-19",
  },
  {
    id: 3,
    productName: "Ergonomic Keyboard",
    amount: 79,
    customer: {
      name: "Charlie Davis",
      email: "charlie@example.com",
    },
    date: "2023-07-18",
  },
  {
    id: 4,
    productName: "Monitor Stand",
    amount: 59,
    customer: {
      name: "Diana Williams",
      email: "diana@example.com",
    },
    date: "2023-07-17",
  },
];

const productData = [
  { name: "Jan", sales: 40 },
  { name: "Feb", sales: 30 },
  { name: "Mar", sales: 45 },
  { name: "Apr", sales: 50 },
  { name: "May", sales: 35 },
  { name: "Jun", sales: 60 },
  { name: "Jul", sales: 65 },
];

const recentProducts = [
  { id: 1, name: "Premium Chair", price: 129, stock: 24, category: "Furniture" },
  { id: 2, name: "Office Desk", price: 299, stock: 18, category: "Furniture" },
  { id: 3, name: "Ergonomic Keyboard", price: 79, stock: 32, category: "Electronics" },
  { id: 4, name: "Monitor Stand", price: 59, stock: 15, category: "Accessories" },
  { id: 5, name: "Wireless Mouse", price: 45, stock: 42, category: "Electronics" },
];

const productColumns = [
  {
    key: "name",
    header: "Name",
    cell: (row: typeof recentProducts[0]) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "category",
    header: "Category",
    cell: (row: typeof recentProducts[0]) => <span>{row.category}</span>,
  },
  {
    key: "stock",
    header: "In Stock",
    cell: (row: typeof recentProducts[0]) => <span>{row.stock}</span>,
  },
  {
    key: "price",
    header: "Price",
    cell: (row: typeof recentProducts[0]) => <span className="font-medium">${row.price}</span>,
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
    key: "description",
    header: "Description",
    cell: (row: typeof expenses[0]) => <span>{row.description}</span>,
  },
  {
    key: "category",
    header: "Category",
    cell: (row: typeof expenses[0]) => <span>{row.category}</span>,
  },
  {
    key: "date",
    header: "Date",
    cell: (row: typeof expenses[0]) => <span>{row.date}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    cell: (row: typeof expenses[0]) => <span className="font-medium">${row.amount}</span>,
  },
];

// Mock product data for stock investment calculation
const inventoryProducts = [
  {
    id: 1,
    name: "Premium Chair",
    packets: 15,
    itemsPerPacket: 1,
    pricePerItem: 129.99
  },
  {
    id: 2,
    name: "Office Desk",
    packets: 8,
    itemsPerPacket: 1,
    pricePerItem: 299.99
  },
  {
    id: 3,
    name: "Ergonomic Keyboard",
    packets: 30,
    itemsPerPacket: 5,
    pricePerItem: 79.99
  },
  {
    id: 4,
    name: "Monitor Stand",
    packets: 22,
    itemsPerPacket: 2,
    pricePerItem: 59.99
  },
  {
    id: 5,
    name: "Wireless Mouse",
    packets: 45,
    itemsPerPacket: 1,
    pricePerItem: 39.99
  }
];

const Index = () => {
  // Calculate total stock investment value
  const totalStockValue = useMemo(() => {
    return inventoryProducts.reduce((total, product) => {
      return total + (product.packets * product.itemsPerPacket * product.pricePerItem);
    }, 0);
  }, []);

  return (
    <MainLayout title="Dashboard">
      <div className="page-container">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatsCard 
            title="Total Revenue" 
            value="$45,231.89"
            description="vs. last month" 
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 20.1, positive: true }}
          />
          <StatsCard 
            title="Products" 
            value="124"
            description="4 new this month" 
            icon={<Package className="h-4 w-4" />}
            trend={{ value: 12, positive: true }}
          />
          <StatsCard 
            title="Employees" 
            value="12"
            description="2 pending invites" 
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard 
            title="Expenses" 
            value="$8,935"
            description="vs. last month"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 3.2, positive: false }}
          />
        </div>

        {/* Stock Investment Card */}
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
              <span className="text-3xl font-bold">${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-sm text-muted-foreground">Based on {inventoryProducts.length} products in inventory</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs with Overview */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Monthly product sales count</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={productData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <RecentSalesCard sales={recentSales} />
            </div>
          </TabsContent>
          <TabsContent value="products">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your products and inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={productColumns} data={recentProducts} />
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
                <DataTable columns={expenseColumns} data={expenses} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Index;
