import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchSalaryPaymentsByEmployeeId, resetCreateState, resetDeleteState } from '@/store/slices/salaryPaymentsSlice';
import { fetchEmployeeById } from '@/store/slices/employeeSlice';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NewSalaryPaymentModal from '@/components/employees/NewSalaryPaymentModal';
import DeleteSalaryPaymentDialog from '@/components/employees/DeleteSalaryPaymentDialog';

const EmployeeSalaryPayments = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isNewSalaryModalOpen, setIsNewSalaryModalOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    paymentId: string;
    amount: number;
  }>({ isOpen: false, paymentId: '', amount: 0 });
  
  // Get salary payments from Redux store
  const { payments, isLoading, error } = useAppSelector(state => state.salaryPayments);
  const { selectedEmployee, isLoading: isLoadingEmployee } = useAppSelector(state => state.employees);
  const { currentBusiness } = useAppSelector(state => state.business);

  // Fetch salary payments on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id));
      dispatch(fetchSalaryPaymentsByEmployeeId(id));
    }
    
    // Reset create and delete states when component unmounts
    return () => {
      dispatch(resetCreateState());
      dispatch(resetDeleteState());
    };
  }, [dispatch, id]);
  
  // Open delete confirmation dialog
  const handleDeleteClick = (paymentId: string, amount: number) => {
    setDeleteDialogState({
      isOpen: true,
      paymentId,
      amount,
    });
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogState({
      ...deleteDialogState,
      isOpen: false,
    });
  };

  // Calculate total amount paid
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <MainLayout title={selectedEmployee ? `${selectedEmployee.name}'s Salary Payments` : 'Salary Payments'}>
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
          <div className="mb-4 sm:mb-0 flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/employees/${id}`)} 
              className="p-0 h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Salary Payments</h1>
              <p className="text-muted-foreground">
                {selectedEmployee ? `${selectedEmployee.name}'s salary payment history` : 'Loading employee details...'}
                {currentBusiness && <span className="ml-1">for {currentBusiness.name}</span>}
              </p>
            </div>
          </div>
          
          {/* New Salary Button */}
          {selectedEmployee && (
            <Button 
              onClick={() => setIsNewSalaryModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Salary
            </Button>
          )}
        </div>

        {/* Loading state */}
        {(isLoading || isLoadingEmployee) && (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading salary payments...</span>
          </div>
        )}

        {/* Employee summary card */}
        {!isLoadingEmployee && selectedEmployee && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Employee Summary</CardTitle>
              <CardDescription>Basic information about the employee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Salary</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(selectedEmployee.salary)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Joined Date</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmployee.joinedDate 
                        ? format(new Date(selectedEmployee.joinedDate), 'PPP')
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Salary payments table */}
        {!isLoading && !error && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle>Salary Payment History</CardTitle>
                  <CardDescription>
                    {payments.length} payment{payments.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </div>
                <Badge className="mt-2 sm:mt-0" variant="outline">
                  Total Paid: {formatCurrency(totalPaid)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Salary Payments Found</h3>
                  <p className="text-muted-foreground">
                    There are no recorded salary payments for this employee yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden md:table-cell">Employee Role</TableHead>
                        <TableHead className="hidden md:table-cell">Payment ID</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(parseISO(payment.paymentDate), 'PP')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {payment.employeeRole}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            <span className="text-xs">{payment.id}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(payment.id, payment.amount)}
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={() => navigate(`/employees/${id}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Employee
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* New Salary Payment Modal */}
        {selectedEmployee && (
          <NewSalaryPaymentModal 
            isOpen={isNewSalaryModalOpen}
            onClose={() => setIsNewSalaryModalOpen(false)}
            employeeId={id || ''}
            employeeName={selectedEmployee.name}
            currentSalary={selectedEmployee.salary}
          />
        )}
        
        {/* Delete Salary Payment Dialog */}
        {selectedEmployee && deleteDialogState.isOpen && (
          <DeleteSalaryPaymentDialog
            isOpen={deleteDialogState.isOpen}
            onClose={handleCloseDeleteDialog}
            paymentId={deleteDialogState.paymentId}
            amount={deleteDialogState.amount}
            employeeName={selectedEmployee.name}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default EmployeeSalaryPayments;
