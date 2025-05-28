import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchEmployeeById, updateEmployee, Role, EmployeeUpdateRequest } from '@/store/slices/employeeSlice';
import { Separator } from '@/components/ui/separator';

interface EmployeeFormData {
  name: string;
  email: string;
  salary: number;
  role: Role;
  isDisabled: boolean;
  isCollaborator: boolean;
}

const EmployeeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Get employee from Redux store
  const { selectedEmployee, isLoading, error } = useAppSelector(state => state.employees);
  const { currentBusiness } = useAppSelector(state => state.business);

  // Form state
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    salary: 0,
    role: Role.CASHIER,
    isDisabled: false,
    isCollaborator: false
  });

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

  // Update form data when employee data is loaded
  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        name: selectedEmployee.name,
        email: selectedEmployee.email,
        salary: selectedEmployee.salary,
        role: selectedEmployee.role,
        isDisabled: selectedEmployee.isDisabled,
        isCollaborator: selectedEmployee.isCollaborator
      });
    }
  }, [selectedEmployee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Employee name is required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }

      if (formData.salary <= 0) {
        throw new Error('Salary must be greater than 0');
      }

      // Prepare data for API
      const updateData: EmployeeUpdateRequest = {
        name: formData.name,
        email: formData.email,
        salary: formData.salary,
        role: formData.role,
        isDisabled: formData.isDisabled,
        isCollaborator: formData.isCollaborator
      };

      // Dispatch the updateEmployee action
      if (id) {
        await dispatch(updateEmployee({ id, data: updateData }))
          .unwrap()
          .then((updatedEmployee) => {
            // Show success message
            toast({
              title: "Employee updated",
              description: `${updatedEmployee.name} has been updated successfully.`
            });

            // Navigate back to employee details
            navigate(`/employees/${id}`);
          })
          .catch((error) => {
            throw new Error(error || 'Failed to update employee');
          });
      }
    } catch (error: any) {
      setFormError(error.message || 'Failed to update employee. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to update employee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title={`Edit ${selectedEmployee?.name || 'Employee'}`}>
      <div className="page-container p-4 md:p-6">
        {/* Error Alert */}
        {(error || formError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError || error}</AlertDescription>
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
              <h1 className="text-2xl font-bold tracking-tight">Edit Employee</h1>
              <p className="text-muted-foreground">
                Update employee information
                {currentBusiness && <span className="ml-1">for {currentBusiness.name}</span>}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading employee details...</p>
            </div>
          </div>
        ) : selectedEmployee ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Edit the basic details for this employee
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter employee name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary (RWF)</Label>
                      <Input 
                        id="salary"
                        name="salary"
                        type="number"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="Enter salary amount"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => handleSelectChange('role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Role.OWNER}>Owner</SelectItem>
                          <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                          <SelectItem value={Role.CASHIER}>Cashier</SelectItem>
                          <SelectItem value={Role.SALES_ASSOCIATE}>Sales Associate</SelectItem>
                          <SelectItem value={Role.INVENTORY_CLERK}>Inventory Clerk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage employee account status and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isDisabled">Account Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Disable this account to prevent the employee from logging in
                      </p>
                    </div>
                    <Switch
                      id="isDisabled"
                      checked={formData.isDisabled}
                      onCheckedChange={(checked) => handleSwitchChange('isDisabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isCollaborator">Collaborator Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow this employee to collaborate on business management
                      </p>
                    </div>
                    <Switch
                      id="isCollaborator"
                      checked={formData.isCollaborator}
                      onCheckedChange={(checked) => handleSwitchChange('isCollaborator', checked)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/employees/${id}`)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        ) : (
          <div className="text-center p-10">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-xl font-semibold">Employee not found</p>
            <p className="text-muted-foreground mb-6">
              The employee you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Button onClick={() => navigate('/employees')}>
              Go Back to Employees
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default EmployeeEdit;
