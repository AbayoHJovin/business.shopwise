import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExpenseAnalytics } from '@/store/slices/expenseAnalyticsSlice';
import { format } from 'date-fns';

interface ExpenseAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: ExpenseAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const ExpenseAnalyticsModal: React.FC<ExpenseAnalyticsModalProps> = ({
  isOpen,
  onClose,
  analytics,
  isLoading,
  error,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <DialogTitle>AI Expense Analytics</DialogTitle>
          </div>
          <DialogDescription>
            {analytics && 
              `AI analysis of your expense data as of ${format(new Date(analytics.timestamp), 'MMMM d, yyyy')}`
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Analyzing your expense data...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : analytics ? (
          <ScrollArea className="flex-1 pr-4 max-h-[50vh] overflow-auto">
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold mb-2">Expense Analysis</h3>
                <div className="text-sm whitespace-pre-wrap">
                  {analytics.analytics.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : null}

        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseAnalyticsModal;
