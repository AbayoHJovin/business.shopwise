
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import AddSaleForm from '@/components/sales/AddSaleForm';

// Mock data for sales
const mockSales = [
  {
    id: '1',
    productName: 'Premium Chair',
    quantitySold: 2,
    saleTime: new Date('2025-05-22T10:30:00'),
    pricePerItem: 129.99,
    totalSaleValue: 259.98,
    notes: 'Customer requested delivery',
    manuallyAdjusted: false,
    loggedLater: true,
    actualSaleTime: new Date('2025-05-22T11:15:00'),
  },
  {
    id: '2',
    productName: 'Office Desk',
    quantitySold: 1,
    saleTime: new Date('2025-05-22T14:45:00'),
    pricePerItem: 299.99,
    totalSaleValue: 299.99,
    notes: '',
    manuallyAdjusted: false,
    loggedLater: false,
    actualSaleTime: undefined,
  },
  {
    id: '3',
    productName: 'Ergonomic Keyboard',
    quantitySold: 3,
    saleTime: new Date('2025-05-22T16:20:00'),
    pricePerItem: 79.99,
    totalSaleValue: 239.97,
    notes: 'Bulk purchase discount applied',
    manuallyAdjusted: true,
    loggedLater: false,
    actualSaleTime: undefined,
  }
];

const salesColumns = [
  {
    key: "productName",
    header: "Product",
    cell: (row: typeof mockSales[0]) => <span className="font-medium">{row.productName}</span>,
  },
  {
    key: "quantitySold",
    header: "Quantity",
    cell: (row: typeof mockSales[0]) => <span>{row.quantitySold}</span>,
  },
  {
    key: "saleTime",
    header: "Sale Time",
    cell: (row: typeof mockSales[0]) => <span>{format(row.saleTime, 'PPp')}</span>,
  },
  {
    key: "actualSaleTime",
    header: "Actual Sale Time",
    cell: (row: typeof mockSales[0]) => 
      row.loggedLater && row.actualSaleTime ? 
        <span>{format(row.actualSaleTime, 'PPp')}</span> : 
        <span className="text-muted-foreground">-</span>,
  },
  {
    key: "pricePerItem",
    header: "Price Per Item",
    cell: (row: typeof mockSales[0]) => <span>${row.pricePerItem.toFixed(2)}</span>,
  },
  {
    key: "totalSaleValue",
    header: "Total Value",
    cell: (row: typeof mockSales[0]) => <span className="font-medium">${row.totalSaleValue.toFixed(2)}</span>,
  },
  {
    key: "notes",
    header: "Notes",
    cell: (row: typeof mockSales[0]) => 
      row.notes ? <span>{row.notes}</span> : <span className="text-muted-foreground">-</span>,
  },
];

const Sales = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);

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
                  <Calendar className="h-4 w-4" />
                  <span>{format(selectedDate, 'PPP')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <Dialog open={isAddSaleOpen} onOpenChange={setIsAddSaleOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Record New Sale</DialogTitle>
                </DialogHeader>
                <AddSaleForm onSuccess={() => setIsAddSaleOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sales for {format(selectedDate, 'PPP')}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={salesColumns} 
              data={mockSales} 
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Sales;
