import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { createSalaryPayment, resetCreateState } from '@/store/slices/salaryPaymentsSlice';

// Define the form schema with Zod
const formSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be greater than zero')
    .min(1, 'Amount must be at least 1'),
  paymentDate: z.string().min(1, 'Payment date is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface NewSalaryPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  currentSalary: number;
}

const NewSalaryPaymentModal: React.FC<NewSalaryPaymentModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  currentSalary,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isCreating, createError, createSuccess } = useAppSelector(state => state.salaryPayments);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: currentSalary,
      paymentDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    await dispatch(createSalaryPayment({
      employeeId,
      amount: values.amount,
      paymentDate: values.paymentDate,
    }));
  };

  // Handle success and error states
  useEffect(() => {
    if (createSuccess) {
      toast({
        title: 'Success',
        description: `Salary payment for ${employeeName} has been created successfully.`,
      });
      form.reset();
      onClose();
      dispatch(resetCreateState());
    }

    if (createError) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: createError || 'Failed to create salary payment. Please try again.',
      });
    }
  }, [createSuccess, createError, dispatch, onClose, employeeName, toast, form]);

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      form.reset({
        amount: currentSalary,
        paymentDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      });
    }
  }, [isOpen, form, currentSalary]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Salary Payment</DialogTitle>
          <DialogDescription>
            Create a new salary payment for {employeeName}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      onChange={(e) => {
                        // Format the date to match the expected format
                        const date = new Date(e.target.value);
                        field.onChange(format(date, "yyyy-MM-dd'T'HH:mm:ss"));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Payment'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSalaryPaymentModal;
