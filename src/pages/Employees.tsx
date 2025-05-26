
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Users, 
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import EmployeeCard from '@/components/employees/EmployeeCard';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchEmployees, Role } from '@/store/slices/employeeSlice';
import { fetchCurrentSelectedBusiness } from '@/store/slices/businessSlice';

type RoleFilter = 'All' | Role | string;
type CollaboratorFilter = 'All' | 'Collaborator' | 'Non-Collaborator';

const Employees = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');
  const [collaboratorFilter, setCollaboratorFilter] = useState<CollaboratorFilter>('All');
  const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Get employees and business from Redux store
  const { items: employees, isLoading, error } = useAppSelector(state => state.employees);
  const { currentBusiness } = useAppSelector(state => state.business);

  // Fetch employees on component mount
  useEffect(() => {
    // First, check if we have a selected business
    if (!currentBusiness) {
      // Try to fetch the current business
      dispatch(fetchCurrentSelectedBusiness())
        .unwrap()
        .then(() => {
          // After successfully fetching the business, fetch employees
          return dispatch(fetchEmployees()).unwrap();
        })
        .catch((error) => {
          // If we can't get a business, show error and redirect
          if (error.includes('No business selected') || error.includes('select a business')) {
            toast({
              title: "No business selected",
              description: "Please select a business to view employees",
              variant: "destructive"
            });
            navigate('/business/select');
          } else {
            toast({
              title: "Error",
              description: error || "Failed to load employees. Please try again later.",
              variant: "destructive"
            });
          }
        });
    } else {
      // If we already have a business, fetch employees directly
      dispatch(fetchEmployees())
        .unwrap()
        .catch((error) => {
          toast({
            title: "Error",
            description: error || "Failed to load employees. Please try again later.",
            variant: "destructive"
          });
        });
    }
  }, [dispatch, toast, navigate]);

  const filteredEmployees = employees.filter(employee => {
    // Apply role filter
    if (roleFilter !== 'All' && employee.role !== roleFilter) {
      return false;
    }
    
    // Apply collaborator filter
    if (collaboratorFilter === 'Collaborator' && !employee.isCollaborator) {
      return false;
    } else if (collaboratorFilter === 'Non-Collaborator' && employee.isCollaborator) {
      return false;
    }
    
    // Apply salary range filter
    const minSalary = salaryRange.min !== '' ? parseInt(salaryRange.min) : 0;
    const maxSalary = salaryRange.max !== '' ? parseInt(salaryRange.max) : Infinity;
    
    if (employee.salary < minSalary || employee.salary > maxSalary) {
      return false;
    }
    
    return true;
  });

  return (
    <MainLayout title="Employees">
      <div className="page-container p-4 md:p-6">
        {/* Error Alert */}
        {error && !error.includes('No business selected') && !error.includes('select a business') && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your team <span className="font-medium">({filteredEmployees.length} total)</span>
              {currentBusiness && <span className="ml-1">for {currentBusiness.name}</span>}
            </p>
          </div>
          <Button className="self-start sm:self-auto" asChild>
            <Link to="/employees/new">
              <Plus className="mr-2" /> Add Employee
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Filters</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                {isFilterExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isFilterExpanded && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={roleFilter}
                    onValueChange={(value) => setRoleFilter(value as Role)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Roles</SelectItem>
                      <SelectItem value={Role.OWNER}>Owner</SelectItem>
                      <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                      <SelectItem value={Role.CASHIER}>Cashier</SelectItem>
                      <SelectItem value={Role.SALES_ASSOCIATE}>Sales Associate</SelectItem>
                      <SelectItem value={Role.INVENTORY_CLERK}>Inventory Clerk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collaborator Status</label>
                  <Select
                    value={collaboratorFilter}
                    onValueChange={(value) => setCollaboratorFilter(value as CollaboratorFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Collaborator">Collaborator</SelectItem>
                      <SelectItem value="Non-Collaborator">Non-Collaborator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salary Range</label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      placeholder="Min"
                      value={salaryRange.min}
                      onChange={(e) => setSalaryRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input 
                      type="number" 
                      placeholder="Max"
                      value={salaryRange.max}
                      onChange={(e) => setSalaryRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {isLoading && employees.length === 0 ? (
          // Initial loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <Card key={index} className="h-[200px] animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(employee => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
        
        {!isLoading && filteredEmployees.length === 0 && (
          <div className="text-center p-10">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-xl font-semibold">No employees found</p>
            <p className="text-muted-foreground">
              {employees.length > 0 ? "Try adjusting your filters" : "Add your first employee to get started"}
            </p>
          </div>
        )}
        
        {/* Loading indicator for pagination */}
        {isLoading && employees.length > 0 && (
          <div className="w-full py-8 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading employees...</p>
            </div>
          </div>
        )}


      </div>
    </MainLayout>
  );
};

export default Employees;
