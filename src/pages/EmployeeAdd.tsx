import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Save,
  X,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { addEmployee, CreateEmployeeRequest } from '@/store/slices/employeeSlice';

const EmployeeAdd = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Get state from Redux store
  const { isLoading, error } = useAppSelector(state => state.employees);
  const { currentBusiness } = useAppSelector(state => state.business);

  // Form state
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    name: '',
    email: '',
    salary: 0,
    isCollaborator: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

      // Dispatch action to add employee
      await dispatch(addEmployee(formData)).unwrap();

      // Show success message
      toast({
        title: "Employee added",
        description: `${formData.name} has been added successfully.`
      });

      // Navigate back to employees list
      navigate('/employees');
    } catch (error: any) {
      setFormError(error.message || 'Failed to add employee. Please try again.');
      toast({
        title: "Error",
        description: error.message || 'Failed to add employee. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Add New Employee">
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
              onClick={() => navigate('/employees')} 
              className="p-0 h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Add New Employee</h1>
              <p className="text-muted-foreground">
                Create a new employee account
                {currentBusiness && <span className="ml-1">for {currentBusiness.name}</span>}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Employee Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the basic details for the new employee
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
                      className="focus:ring-2 focus:ring-primary/20"
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
                      className="focus:ring-2 focus:ring-primary/20"
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
                      className="focus:ring-2 focus:ring-primary/20"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/employees')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Employee
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default EmployeeAdd;
