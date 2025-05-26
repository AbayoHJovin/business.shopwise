import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, CalendarIcon, ClockIcon, Loader2, Save, Search } from 'lucide-react';
import debounce from 'lodash/debounce';

import MainLayout from '@/components/layout/MainLayout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';
import { logSale, SaleRecordRequest } from '@/store/slices/salesSlice';

// Define product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  itemsPerPacket: number;
  imageUrl?: string;
}

// Form validation schema
const saleFormSchema = z.object({
  productId: z.string({
    required_error: "Please select a product",
  }),
  packetsSold: z.preprocess(
    (value) => (value === '' ? 0 : Number(value)),
    z.number({ invalid_type_error: 'Packets sold must be a number' })
      .min(0, { message: 'Packets sold must be at least 0' })
  ),
  piecesSold: z.preprocess(
    (value) => (value === '' ? 0 : Number(value)),
    z.number({ invalid_type_error: 'Pieces sold must be a number' })
      .min(0, { message: 'Pieces sold must be at least 0' })
  ),
  saleTime: z.date({
    required_error: "Please select a date and time",
  }),
  manuallyAdjusted: z.boolean().default(false),
  loggedLater: z.boolean().default(false),
  notes: z.string().optional(),
  actualSaleTime: z.date().optional(),
}).refine((data) => {
  // At least one of packetsSold or piecesSold must be greater than 0
  return data.packetsSold > 0 || data.piecesSold > 0;
}, {
  message: "At least one of packets sold or pieces sold must be greater than 0",
  path: ["packetsSold"],
}).refine((data) => {
  // If loggedLater is true, actualSaleTime must be provided
  return !data.loggedLater || (data.loggedLater && data.actualSaleTime !== undefined);
}, {
  message: "Actual sale time is required when 'Logged Later' is selected",
  path: ["actualSaleTime"],
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

const SaleAdd: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.sales);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement | null>(null);

  // Initialize form with default values
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      productId: '',
      packetsSold: 0,
      piecesSold: 0,
      saleTime: new Date(),
      manuallyAdjusted: false,
      loggedLater: false,
      notes: '',
      actualSaleTime: new Date(),
    },
  });

  // Watch for loggedLater to conditionally show actualSaleTime field
  const loggedLater = form.watch('loggedLater');

  // Fetch products with pagination
  const fetchProducts = useCallback(async (pageNumber: number, query: string = '') => {
    if (!hasMore && pageNumber > 0) return;
    
    setIsLoadingProducts(true);
    try {
      const size = 10; // Number of products per page
      let url = `${API_ENDPOINTS.PRODUCTS.GET_ALL(pageNumber, size)}`;
      
      if (query) {
        url += `&query=${encodeURIComponent(query)}`;
      }
      
      const response = await fetch(url, {
        ...DEFAULT_REQUEST_OPTIONS,
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      if (pageNumber === 0) {
        setProducts(data.content);
      } else {
        setProducts(prev => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
      setPage(pageNumber);
    } catch (err: any) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [hasMore]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(0);
      setHasMore(true);
      fetchProducts(0, query);
    }, 300),
    [fetchProducts]
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (isLoadingProducts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchProducts(page + 1, searchQuery);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    if (lastProductRef.current) {
      observer.observe(lastProductRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchProducts, hasMore, isLoadingProducts, page, searchQuery]);

  // Initial fetch of products
  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    form.setValue('productId', product.id);
    setIsProductDropdownOpen(false);
  };

  // Handle form submission
  const onSubmit = async (data: SaleFormValues) => {
    try {
      setSubmitError(null);
      
      // Format dates for API
      const formattedData: SaleRecordRequest = {
        productId: data.productId, // Explicitly include productId as required
        packetsSold: data.packetsSold,
        piecesSold: data.piecesSold,
        saleTime: data.saleTime.toISOString(),
        manuallyAdjusted: data.manuallyAdjusted,
        loggedLater: data.loggedLater,
        notes: data.notes,
        actualSaleTime: data.loggedLater && data.actualSaleTime 
          ? data.actualSaleTime.toISOString() 
          : undefined,
      };
      
      await dispatch(logSale(formattedData)).unwrap();
      navigate('/sales');
    } catch (err: any) {
      setSubmitError(err.toString());
    }
  };

  return (
    <MainLayout title="Add Sale">
      <div className="page-container p-4 md:p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4 p-0 h-auto" 
            onClick={() => navigate('/sales')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Sale</h1>
            <p className="text-muted-foreground">
              Record a new product sale
            </p>
          </div>
        </div>

        {(submitError || error) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError || error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sale Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Product Selection */}
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Product</FormLabel>
                        <Popover open={isProductDropdownOpen} onOpenChange={setIsProductDropdownOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between text-left font-normal"
                              >
                                {selectedProduct ? selectedProduct.name : "Select a product"}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onValueChange={handleSearchChange}
                              />
                              <CommandList className="max-h-[300px] overflow-auto">
                                <CommandEmpty>No products found.</CommandEmpty>
                                <CommandGroup>
                                  {products.map((product, index) => {
                                    if (index === products.length - 1) {
                                      return (
                                        <div key={product.id} ref={lastProductRef}>
                                          <CommandItem
                                            value={product.id}
                                            onSelect={() => handleProductSelect(product)}
                                            className="flex items-center gap-2 py-3"
                                          >
                                            {product.imageUrl && (
                                              <div className="h-10 w-10 overflow-hidden rounded-md">
                                                <img 
                                                  src={product.imageUrl} 
                                                  alt={product.name} 
                                                  className="h-full w-full object-cover"
                                                />
                                              </div>
                                            )}
                                            <div className="flex flex-col">
                                              <span className="font-medium">{product.name}</span>
                                              <span className="text-sm text-muted-foreground">
                                                ${product.price.toFixed(2)} | {product.itemsPerPacket} items per packet
                                              </span>
                                            </div>
                                          </CommandItem>
                                        </div>
                                      );
                                    }
                                    return (
                                      <CommandItem
                                        key={product.id}
                                        value={product.id}
                                        onSelect={() => handleProductSelect(product)}
                                        className="flex items-center gap-2 py-3"
                                      >
                                        {product.imageUrl && (
                                          <div className="h-10 w-10 overflow-hidden rounded-md">
                                            <img 
                                              src={product.imageUrl} 
                                              alt={product.name} 
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="flex flex-col">
                                          <span className="font-medium">{product.name}</span>
                                          <span className="text-sm text-muted-foreground">
                                            ${product.price.toFixed(2)} | {product.itemsPerPacket} items per packet
                                          </span>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                  {isLoadingProducts && (
                                    <div className="p-4 flex justify-center">
                                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="packetsSold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Packets Sold</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="piecesSold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Individual Pieces Sold</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sale Time */}
                  <FormField
                    control={form.control}
                    name="saleTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Sale Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal flex justify-between items-center"
                              >
                                {field.value ? (
                                  format(field.value, "PPP p")
                                ) : (
                                  <span>Pick date and time</span>
                                )}
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  // Preserve the time from the current value
                                  const currentTime = field.value;
                                  date.setHours(
                                    currentTime.getHours(),
                                    currentTime.getMinutes(),
                                    currentTime.getSeconds()
                                  );
                                  field.onChange(date);
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              <Input
                                type="time"
                                value={format(field.value, "HH:mm")}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(':').map(Number);
                                  const newDate = new Date(field.value);
                                  newDate.setHours(hours);
                                  newDate.setMinutes(minutes);
                                  field.onChange(newDate);
                                }}
                                className="w-full"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Logged Later Checkbox */}
                  <FormField
                    control={form.control}
                    name="loggedLater"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Logged Later</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Check this if you're recording a sale that happened earlier
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Actual Sale Time (only shown if loggedLater is true) */}
                  {loggedLater && (
                    <FormField
                      control={form.control}
                      name="actualSaleTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Actual Sale Time</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full pl-3 text-left font-normal flex justify-between items-center"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP p")
                                  ) : (
                                    <span>Pick actual date and time</span>
                                  )}
                                  <ClockIcon className="h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    // Preserve the time from the current value or use current time
                                    const currentTime = field.value || new Date();
                                    date.setHours(
                                      currentTime.getHours(),
                                      currentTime.getMinutes(),
                                      currentTime.getSeconds()
                                    );
                                    field.onChange(date);
                                  }
                                }}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                              <div className="p-3 border-t border-border">
                                <Input
                                  type="time"
                                  value={field.value ? format(field.value, "HH:mm") : ""}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                    const newDate = new Date(field.value || new Date());
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    field.onChange(newDate);
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Manually Adjusted Checkbox */}
                  <FormField
                    control={form.control}
                    name="manuallyAdjusted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Manually Adjusted</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Check this if you've manually adjusted the sale details
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional details about this sale" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => navigate('/sales')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Record Sale
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SaleAdd;
