import React, { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { deleteSalaryPayment, resetDeleteState } from '@/store/slices/salaryPaymentsSlice';
import { formatCurrency } from '@/lib/utils';

interface DeleteSalaryPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  amount: number;
  employeeName: string;
}

const DeleteSalaryPaymentDialog: React.FC<DeleteSalaryPaymentDialogProps> = ({
  isOpen,
  onClose,
  paymentId,
  amount,
  employeeName,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isDeleting, deleteError, deleteSuccess } = useAppSelector(state => state.salaryPayments);

  // Handle delete action
  const handleDelete = () => {
    dispatch(deleteSalaryPayment(paymentId));
  };

  // Handle success and error states
  useEffect(() => {
    if (deleteSuccess) {
      toast({
        title: 'Success',
        description: `Salary payment of ${formatCurrency(amount)} for ${employeeName} has been deleted.`,
      });
      onClose();
      dispatch(resetDeleteState());
    }

    if (deleteError) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: deleteError || 'Failed to delete salary payment. Please try again.',
      });
      dispatch(resetDeleteState());
    }
  }, [deleteSuccess, deleteError, dispatch, onClose, amount, employeeName, toast]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Salary Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this salary payment of {formatCurrency(amount)} for {employeeName}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSalaryPaymentDialog;
