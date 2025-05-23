
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Users, 
  ChevronDown,
  ChevronUp,
  SquareUser
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

// Mock employee data - replace with API call
const mockEmployees = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Manager",
    salary: 4500,
    isCollaborator: true,
    dateAdded: "2023-08-15"
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Cashier",
    salary: 2800,
    isCollaborator: false,
    dateAdded: "2023-09-10"
  },
  {
    id: 3,
    name: "Charlie Davis",
    email: "charlie@example.com",
    role: "Stock Keeper",
    salary: 3200,
    isCollaborator: true,
    dateAdded: "2023-07-22"
  },
  {
    id: 4,
    name: "Diana Williams",
    email: "diana@example.com",
    role: "Cashier",
    salary: 2800,
    isCollaborator: false,
    dateAdded: "2023-10-05"
  }
];

type Role = 'All' | 'Manager' | 'Cashier' | 'Stock Keeper';
type CollaboratorFilter = 'All' | 'Collaborator' | 'Non-Collaborator';

const Employees = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role>('All');
  const [collaboratorFilter, setCollaboratorFilter] = useState<CollaboratorFilter>('All');
  const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleDeleteClick = (employee: any) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Would call API to delete employee
    toast({
      title: "Employee removed",
      description: `${employeeToDelete?.name} has been removed successfully.`,
    });
    setDeleteDialogOpen(false);
  };

  const filteredEmployees = mockEmployees.filter(employee => {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your team <span className="font-medium">({filteredEmployees.length} total)</span>
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
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Stock Keeper">Stock Keeper</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(employee => (
            <Card key={employee.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <SquareUser className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <CardDescription>{employee.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-muted-foreground">Role:</div>
                    <div>{employee.role}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-muted-foreground">Salary:</div>
                    <div>${employee.salary.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="text-muted-foreground">Collaborator:</div>
                    <div>
                      {employee.isCollaborator ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/employees/edit/${employee.id}`}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteClick(employee)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center p-10">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-xl font-semibold">No employees found</p>
            <p className="text-muted-foreground">
              {mockEmployees.length > 0 ? "Try adjusting your filters" : "Add your first employee to get started"}
            </p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Employee Removal</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {employeeToDelete?.name}? This action cannot be undone.
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

export default Employees;
