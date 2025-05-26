
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar as CalendarIcon, Plus, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSalesByDate, setSelectedDate as setReduxSelectedDate } from '@/store/slices/salesSlice';

// Define the column types for the sales data table
type SaleRecord = {
  id: string;
  packetsSold: number;
  piecesSold: number;
  totalPiecesSold: number;
  saleTime: string;
  manuallyAdjusted: boolean;
  loggedLater: boolean;
  notes: string;
  actualSaleTime: string;
  productId: string;
  productName: string;
  pricePerItem: number;
  totalSaleValue: number;
  businessId: string;
  businessName: string;
};

const salesColumns = [
  {
    key: "productName",
    header: "Product",
    cell: (row: SaleRecord) => <span className="font-medium">{row.productName}</span>,
  },
  {
    key: "packetsSold",
    header: "Packets",
    cell: (row: SaleRecord) => <span>{row.packetsSold}</span>,
  },
  {
    key: "piecesSold",
    header: "Pieces",
    cell: (row: SaleRecord) => <span>{row.piecesSold}</span>,
  },
  {
    key: "totalPiecesSold",
    header: "Total Pieces",
    cell: (row: SaleRecord) => <span>{row.totalPiecesSold}</span>,
  },
  {
    key: "saleTime",
    header: "Sale Time",
    cell: (row: SaleRecord) => <span>{format(new Date(row.saleTime), 'PPp')}</span>,
  },
  {
    key: "actualSaleTime",
    header: "Actual Sale Time",
    cell: (row: SaleRecord) => 
      row.loggedLater && row.actualSaleTime ? 
        <span>{format(new Date(row.actualSaleTime), 'PPp')}</span> : 
        <span className="text-muted-foreground">-</span>,
  },
  {
    key: "pricePerItem",
    header: "Price Per Item",
    cell: (row: SaleRecord) => <span>${row.pricePerItem.toFixed(2)}</span>,
  },
  {
    key: "totalSaleValue",
    header: "Total Value",
    cell: (row: SaleRecord) => <span className="font-medium">${row.totalSaleValue.toFixed(2)}</span>,
  },
  {
    key: "notes",
    header: "Notes",
    cell: (row: SaleRecord) => 
      row.notes ? <span>{row.notes}</span> : <span className="text-muted-foreground">-</span>,
  },
];

const Sales = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: sales, isLoading, error, selectedDate: reduxSelectedDate, totalAmount } = useAppSelector(state => state.sales);
  const [localDate, setLocalDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Filter sales based on search term
  const filteredSales = sales.filter(sale => 
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.notes && sale.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setLocalDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      dispatch(setReduxSelectedDate(formattedDate));
      dispatch(fetchSalesByDate(formattedDate));
    }
  };

  // Fetch sales data when component mounts or date changes
  useEffect(() => {
    const formattedDate = localDate.toISOString().split('T')[0];
    dispatch(fetchSalesByDate(formattedDate));
  }, [dispatch]);

  return (
    <MainLayout title="Sales Dashboard">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sales Overview</h2>
            <p className="text-muted-foreground">
              Manage and track your business sales
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(localDate, 'PPP')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localDate}
                  onSelect={handleDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              className="flex items-center gap-2"
              onClick={() => navigate('/sales/add')}
            >
              <Plus className="h-4 w-4" />
              Add Sale
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <CardTitle>Sales for {format(localDate, 'PPP')}</CardTitle>
              <CardDescription>
                Total sales amount: ${totalAmount.toFixed(2)}
              </CardDescription>
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or notes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : filteredSales.length > 0 ? (
              <DataTable 
                columns={salesColumns} 
                data={filteredSales} 
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No sales found for this date.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/sales/add')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Sale
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Sales;
