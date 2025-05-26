import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Role } from '@/store/slices/employeeSlice';
import { useNavigate } from 'react-router-dom';

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    salary: number;
    joinedDate: string;
    isDisabled: boolean;
    isCollaborator: boolean;
    emailConfirmed: boolean;
    role: Role;
    businessId: string;
    businessName: string;
  };
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const navigate = useNavigate();

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

  const handleViewDetails = () => {
    navigate(`/employees/${employee.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg truncate">{employee.name}</h3>
          <Badge variant="outline" className={getRoleBadgeColor(employee.role)}>
            {employee.role.replace('_', ' ')}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground truncate">{employee.email}</p>
          <p className="text-sm font-medium">{formatCurrency(employee.salary, 'RWF')}</p>
          {employee.isDisabled && (
            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
              Inactive
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleViewDetails}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmployeeCard;
