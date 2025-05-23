
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

type Sale = {
  id: number | string;
  productName: string;
  amount: number;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: string;
};

type RecentSalesCardProps = {
  sales: Sale[];
};

const RecentSalesCard = ({ sales }: RecentSalesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>You made {sales.length} sales this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {sales.map((sale) => (
            <div key={sale.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                {sale.customer.avatar ? (
                  <img src={sale.customer.avatar} alt={sale.customer.name} />
                ) : (
                  <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary font-medium">
                    {sale.customer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
                <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
              </div>
              <div className="ml-auto font-medium">+${sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSalesCard;
