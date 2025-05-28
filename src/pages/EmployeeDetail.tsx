import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Mail,
  Calendar,
  DollarSign,
  BadgeCheck,
  BadgeX,
  UserCog
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchEmployeeById, deleteEmployee, Role } from '@/store/slices/employeeSlice';

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get employee from Redux store
  const { selectedEmployee, isLoading, error } = useAppSelector(state => state.employees);
  const { currentBusiness } = useAppSelector(state => state.business);

  // Fetch employee details on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id))
        .unwrap()
        .catch((error) => {
          toast({
            title: "Error",
            description: error || "Failed to load employee details. Please try again later.",
            variant: "destructive"
          });
        });
    }
  }, [dispatch, id, toast]);

  // Get role badge color
  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.OWNER:
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case Role.MANAGER:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case Role.CASHIER:
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case Role.SALES_ASSOCIATE:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case Role.INVENTORY_CLERK:
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (id) {
      dispatch(deleteEmployee(id))
        .unwrap()
        .then(() => {
          toast({
            title: "Employee removed",
            description: `${selectedEmployee?.name} has been removed successfully.`,
          });
          setDeleteDialogOpen(false);
          navigate('/employees');
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error || "Failed to delete employee. Please try again later.",
            variant: "destructive"
          });
          setDeleteDialogOpen(false);
        });
    }
  };

  // Format date
  const formattedDate = selectedEmployee?.joinedDate 
    ? format(new Date(selectedEmployee.joinedDate), 'PPP')
    : 'Unknown';

  return (
    <MainLayout title={selectedEmployee?.name || 'Employee Details'}>
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
              onClick={() => navigate('/employees')} 
              className="p-0 h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Employee Details</h1>
              <p className="text-muted-foreground">
                View and manage employee information
                {currentBusiness && <span className="ml-1">for {currentBusiness.name}</span>}
              </p>
            </div>
          </div>
          
          {selectedEmployee && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href={`/salary-payments/${selectedEmployee.id}`}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Salary
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`/employees/edit/${selectedEmployee.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </a>
              </Button>
              <Button variant="destructive" onClick={handleDeleteClick}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading employee details...</p>
            </div>
          </div>
        ) : selectedEmployee ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedEmployee.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      {selectedEmployee.email}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={getRoleBadgeColor(selectedEmployee.role)}>
                    {selectedEmployee.role.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Joined Date</p>
                      <p className="font-medium">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{formatCurrency(selectedEmployee.salary, 'RWF')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedEmployee.isCollaborator ? (
                      <BadgeCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <BadgeX className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Collaborator Status</p>
                      <p className="font-medium">
                        {selectedEmployee.isCollaborator ? 'Collaborator' : 'Non-Collaborator'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedEmployee.isDisabled ? 'destructive' : 'outline'} className="mt-1">
                          {selectedEmployee.isDisabled ? 'Disabled' : 'Active'}
                        </Badge>
                        <Badge variant={selectedEmployee.emailConfirmed ? 'outline' : 'secondary'} className="mt-1">
                          {selectedEmployee.emailConfirmed ? 'Email Verified' : 'Email Unverified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Right Column - Additional Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <CardDescription>
                  Detailed information about {selectedEmployee.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Role Details</h3>
                    <p className="text-muted-foreground mb-4">
                      This employee is a <span className="font-medium">{selectedEmployee.role.replace('_', ' ')}</span> at {selectedEmployee.businessName}.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Permissions</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {selectedEmployee.role === Role.OWNER && (
                            <>
                              <li>Full access to all business features</li>
                              <li>Manage employees and permissions</li>
                              <li>View and edit financial information</li>
                              <li>Manage business settings</li>
                            </>
                          )}
                          {selectedEmployee.role === Role.MANAGER && (
                            <>
                              <li>Manage inventory and products</li>
                              <li>View financial information</li>
                              <li>Manage employees</li>
                              <li>View business reports</li>
                            </>
                          )}
                          {selectedEmployee.role === Role.CASHIER && (
                            <>
                              <li>Process sales and transactions</li>
                              <li>View product inventory</li>
                              <li>Manage customer interactions</li>
                            </>
                          )}
                          {selectedEmployee.role === Role.SALES_ASSOCIATE && (
                            <>
                              <li>Process sales and transactions</li>
                              <li>View product inventory</li>
                              <li>Manage customer interactions</li>
                            </>
                          )}
                          {selectedEmployee.role === Role.INVENTORY_CLERK && (
                            <>
                              <li>Manage inventory levels</li>
                              <li>Process stock receipts</li>
                              <li>Track product movement</li>
                            </>
                          )}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Employment Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Employee ID:</span>
                            <span className="font-mono">{selectedEmployee.id.substring(0, 8)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Joined:</span>
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span>{selectedEmployee.isDisabled ? 'Inactive' : 'Active'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Collaborator:</span>
                            <span>{selectedEmployee.isCollaborator ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Compensation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm text-muted-foreground">Monthly Salary</h4>
                        <p className="text-2xl font-bold mt-1">{formatCurrency(selectedEmployee.salary, 'RWF')}</p>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm text-muted-foreground">Annual Salary</h4>
                        <p className="text-2xl font-bold mt-1">{formatCurrency(selectedEmployee.salary * 12, 'RWF')}</p>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-sm text-muted-foreground">Employment Duration</h4>
                        <p className="text-2xl font-bold mt-1">
                          {selectedEmployee.joinedDate 
                            ? `${Math.floor((new Date().getTime() - new Date(selectedEmployee.joinedDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months` 
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button variant="outline" asChild>
                  <a href={`/employees/edit/${selectedEmployee.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="text-center p-10">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-xl font-semibold">Employee not found</p>
            <p className="text-muted-foreground mb-6">
              The employee you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/employees')}>
              Go Back to Employees
            </Button>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Employee Removal</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedEmployee?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default EmployeeDetail;
