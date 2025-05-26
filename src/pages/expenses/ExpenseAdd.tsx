import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, CalendarIcon, Save } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createExpense, ExpenseCategory } from '@/store/slices/expenseSlice';
import { Loader2 } from 'lucide-react';

// Form validation schema
const expenseFormSchema = z.object({
  title: z.string()
    .min(2, { message: 'Title must be at least 2 characters' })
    .max(100, { message: 'Title must not exceed 100 characters' }),
  amount: z.preprocess(
    (value) => (value === '' ? undefined : Number(value)),
    z.number({ invalid_type_error: 'Amount must be a number' })
      .min(0, { message: 'Amount must be at least 0' })
  ),
  category: z.string({ required_error: 'Please select a category' }),
  note: z.string().optional(),
  createdAt: z.date({
    required_error: "Please select a date",
  }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

const ExpenseAdd: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.expenses);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amount: undefined,
      category: '',
      note: '',
      createdAt: new Date(), // Default to today's date
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      setSubmitError(null);
      // Ensure all required fields are present for CreateExpenseRequest
      const expenseData = {
        title: data.title,        // Required field
        amount: data.amount!,    // Required field with non-null assertion
        category: data.category, // Required field
        note: data.note || '',   // Optional field with default value
        createdAt: data.createdAt.toISOString() // Convert Date to ISO string format
      };
      
      await dispatch(createExpense(expenseData)).unwrap();
      navigate('/expenses');
    } catch (err: any) {
      setSubmitError(err.toString());
    }
  };

  return (
    <MainLayout title="Add Expense">
      <div className="page-container p-4 md:p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4 p-0 h-auto" 
            onClick={() => navigate('/expenses')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Expense</h1>
            <p className="text-muted-foreground">
              Create a new expense
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
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Expense title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (RWF)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            placeholder="0.00" 
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ExpenseCategory).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional details about this expense" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="createdAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={"w-full pl-3 text-left font-normal flex justify-between items-center"}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                    onClick={() => navigate('/expenses')}
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
                        Save Expense
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

export default ExpenseAdd;
